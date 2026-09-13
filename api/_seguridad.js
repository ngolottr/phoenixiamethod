/* ============================================================================
   PUERTA DE ENTRADA DE LAS FUNCIONES
   ----------------------------------------------------------------------------
   Todo lo que hay acá existe por una razón concreta: las funciones de esta web
   están abiertas a internet y hacen cosas que cuestan plata o reputación —
   mandan correo con el remitente de Nicolás y escriben en su calendario real.
   Sin límites, cualquiera con una línea de comandos podía dispararlas en bucle.

   Las defensas son cuatro, en capas, porque ninguna sola alcanza:

     1. Límite de frecuencia: cuántas veces por IP, por correo y en total.
     2. Origen: la petición tiene que venir de esta web, no de un script suelto.
     3. Forma del contenido: nada de saltos de línea en un asunto, nada de
        mensajes que son un muro de enlaces.
     4. Errores mudos: el detalle queda en el registro del servidor, nunca en la
        respuesta, para no ir contando por dentro cómo está armado esto.

   Sobre el punto 1: esto vive en memoria, y una función sin servidor puede
   arrancar en varias máquinas a la vez o reiniciarse. O sea que frena de golpe
   el abuso normal — un bot repitiendo el mismo formulario — pero no es una
   muralla. La muralla de verdad se activa en el panel de Vercel (Firewall →
   Rate Limiting), y está anotada en el README.
   ========================================================================== */

/* --- Límite de frecuencia -------------------------------------------------- */

/** clave → lista de instantes en que se aceptó una petición. */
const marcas = new Map()

/** Si el mapa crece demasiado se vacía lo viejo: nadie va a llenar la memoria. */
function podar(ahora) {
  if (marcas.size < 5000) return
  for (const [clave, lista] of marcas) {
    if (!lista.length || ahora - lista[lista.length - 1] > 86400000) marcas.delete(clave)
  }
}

/**
 * ¿Esta clave ya gastó su cupo?
 * Devuelve true si la petición se puede atender, false si hay que rechazarla.
 */
export function dentroDelCupo(clave, maximo, ventanaMs, ahora = Date.now()) {
  podar(ahora)
  const lista = (marcas.get(clave) || []).filter((t) => ahora - t < ventanaMs)
  if (lista.length >= maximo) {
    marcas.set(clave, lista)
    return false
  }
  lista.push(ahora)
  marcas.set(clave, lista)
  return true
}

/** La IP de quien pide, según lo que pone Vercel delante de la función. */
export function ipDe(req) {
  const real = req.headers['x-real-ip']
  if (real) return String(real).trim()
  const cadena = String(req.headers['x-forwarded-for'] || '')
  return cadena.split(',')[0].trim() || 'desconocida'
}

/**
 * Aplica varios cupos de una vez. `reglas` es una lista de
 * [clave, máximo, ventana en ms]. Basta que uno se pase para cerrar la puerta.
 */
export function pasaLosCupos(reglas) {
  for (const [clave, maximo, ventana] of reglas) {
    if (!dentroDelCupo(clave, maximo, ventana)) return false
  }
  return true
}

/* --- Origen ---------------------------------------------------------------- */

/**
 * Los dominios desde los que se acepta un envío.
 *
 * Vercel le da una URL distinta a cada despliegue, así que además del dominio
 * propio hay que admitir los del proyecto. Antes eso se resolvía aceptando
 * cualquier host terminado en `.vercel.app`, y eso no filtraba nada: Vercel
 * regala subdominios, así que bastaba con crear un proyecto gratis para pasar
 * el control y gastarle a Nicolás el cupo de correos o llenarle el calendario.
 *
 * Ahora la lista es explícita. Vercel publica el host de cada despliegue en
 * estas variables, y no hay comodín que valga.
 */
function anfitrionesPermitidos() {
  const desdeEntorno = [
    process.env.SITIO_URL || 'https://phoenixiamethod.vercel.app',
    process.env.VERCEL_URL,                       // este despliegue
    process.env.VERCEL_BRANCH_URL,                // el de la rama
    process.env.VERCEL_PROJECT_PRODUCTION_URL,    // el de producción
  ]
  return desdeEntorno
    .filter(Boolean)
    .map((u) => {
      const con = String(u).startsWith('http') ? String(u) : `https://${u}`
      try {
        return new URL(con).host
      } catch {
        return ''
      }
    })
    .filter(Boolean)
}

/**
 * El formulario real siempre viaja con cabecera Origin: el navegador la pone y
 * la página no puede mentir. Un script suelto sí puede falsificarla, así que
 * esto no es una identificación — es un filtro que descarta de entrada a los
 * robots que disparan a ciegas y a cualquier otra web que quiera usar estas
 * funciones como si fueran suyas.
 */
export function vieneDeLaWeb(req) {
  const permitidos = anfitrionesPermitidos()
  const bruto = req.headers.origin || req.headers.referer || ''
  if (!bruto) return false
  try {
    return permitidos.includes(new URL(bruto).host)
  } catch {
    return false
  }
}

/* --- Tamaño del envío ------------------------------------------------------ */

/**
 * Ningún formulario de esta web llega ni a 4 KB. Lo que venga por encima de
 * esto no es una persona escribiendo: es alguien probando cuánto aguanta.
 *
 * Se corta ANTES de convertir el texto a objeto. Da igual que después los
 * campos se recorten a su largo máximo — para llegar a recortarlos hay que
 * haber leído y convertido el envío entero, y eso con megabytes es trabajo
 * regalado que se paga en tiempo de ejecución.
 */
export const MAX_CUERPO = 32 * 1024

export function cuerpoDemasiadoGrande(req) {
  const largo = Number(req.headers['content-length'])
  if (Number.isFinite(largo) && largo > MAX_CUERPO) return true
  const crudo = typeof req.body === 'string' ? req.body : null
  return crudo !== null && crudo.length > MAX_CUERPO
}

/* --- Forma del contenido --------------------------------------------------- */

/* Caracteres de control. Se construyen con el constructor RegExp a partir de
   texto plano, no como literales: si se escribieran como los caracteres en sí
   serian invisibles, cualquier editor podria comerselos, y un salto de linea
   dentro de una expresion regular literal ni siquiera compila.
   CONTROL deja pasar el salto de linea, que en un mensaje si significa algo.
   RENGLON los caza todos, incluidos los separadores de linea de Unicode que
   casi nadie recuerda. */
const CONTROL = new RegExp('[\u0000-\u0009\u000B-\u001F\u007F]', 'g')
const RENGLON = new RegExp('[\u000A\u000D\u0085\u2028\u2029]', 'g')

/**
 * Limpia un texto libre: recorta, saca los caracteres de control y deja los
 * saltos de línea, que en un mensaje sí tienen sentido.
 */
export function limpiarTexto(valor, max) {
  return String(valor ?? '')
    .replace(/\r/g, '')
    .replace(CONTROL, '')
    .trim()
    .slice(0, max)
}

/**
 * Igual, pero para lo que va a terminar en una cabecera de correo: nombre,
 * asunto, destinatario. Ahí un salto de línea no es un salto de línea: es la
 * forma clásica de inyectar cabeceras y colar destinatarios ocultos.
 */
export function limpiarLinea(valor, max) {
  return limpiarTexto(valor, max).replace(RENGLON, ' ').replace(/\s{2,}/g, ' ').trim()
}

const RE_ENLACE =
  /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|net|org|io|ru|cn|xyz|top|info|link|click|shop)\b/gi

/** Cuántos enlaces trae un texto. */
export function cuentaEnlaces(texto) {
  return (String(texto).match(RE_ENLACE) || []).length
}

/**
 * El correo que se le manda al visitante repite lo que escribió. Eso, sin
 * control, convierte esta web en un repartidor de phishing gratis: escribo un
 * mensaje lleno de enlaces, pongo el correo de la víctima, y le llega desde una
 * dirección con buena reputación. Un mensaje legítimo no necesita tres enlaces.
 */
export const MAX_ENLACES = 2

/** Un correo válido, sin adornos. */
export const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

/** Que una dirección quepa en un enlace de correo sin sorpresas. */
export function esEnlaceSeguro(url) {
  try {
    return ['https:', 'http:'].includes(new URL(String(url)).protocol)
  } catch {
    return false
  }
}

/* --- Respuestas ------------------------------------------------------------ */

/**
 * Contesta con un mensaje que no dice nada y deja el detalle en el registro.
 * Un error de Google devuelto tal cual regala el identificador del calendario,
 * el correo de la cuenta de servicio y la forma interna del sistema.
 */
export function fallo(res, estado, publico, real) {
  if (real) console.error('[api]', publico, '→', real)
  return res.status(estado).json({ ok: false, error: publico })
}

/** Ninguna respuesta de estas funciones debe quedar guardada en una caché. */
export function sinCache(res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')
}
