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

   Sobre el punto 1: hay dos pisos. El primero vive en memoria y es gratis,
   pero una función sin servidor puede arrancar en varias máquinas a la vez o
   reiniciarse, así que solo frena el abuso torpe. El segundo vive en la base
   (Redis) y vale para todas las máquinas a la vez: ese es el que no se esquiva
   repartiendo las peticiones. Ver `pasaLosCuposCompartidos`.
   ========================================================================== */

import crypto from 'node:crypto'
import { hayAlmacen, redis } from './_estadisticas.js'

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

/**
 * Los mismos cupos, pero contados en la base: valen para todas las copias de
 * la función a la vez. Ventana fija (se reinicia al terminar cada ventana),
 * que cuesta dos comandos por regla y alcanza de sobra para esto.
 *
 * Las claves van pasadas por un hash: en la base no queda escrita ninguna IP
 * ni ningún correo, solo un resumen que no se puede revertir.
 *
 * Si la base no responde, deja pasar: el piso en memoria ya se aplicó, y un
 * formulario caído por culpa de Redis es peor que un cupo menos estricto.
 */
export async function pasaLosCuposCompartidos(reglas, ahora = Date.now()) {
  if (!pasaLosCupos(reglas)) return false
  if (!hayAlmacen() || !reglas.length) return true
  const comandos = []
  for (const [clave, , ventana] of reglas) {
    const tramo = Math.floor(ahora / ventana)
    const k = `rl:${crypto.createHash('sha256').update(clave).digest('hex').slice(0, 24)}:${tramo}`
    comandos.push(['INCR', k], ['EXPIRE', k, Math.ceil(ventana / 1000)])
  }
  try {
    const salida = await redis(comandos)
    return reglas.every(([, maximo], i) => Number(salida[i * 2]) <= maximo)
  } catch (e) {
    console.error('[seguridad] cupo compartido sin base →', e.message)
    return true
  }
}

/* --- CORS ------------------------------------------------------------------ */

/**
 * Quién puede llamar a estas funciones desde JavaScript en un navegador: solo
 * esta web. El formulario y el sitio viven en el mismo dominio que las
 * funciones, así que para ellos CORS ni siquiera entra en juego; lo que hace
 * esto es cerrarle la puerta explícitamente a cualquier otra página.
 *
 *   - Nunca se contesta `Access-Control-Allow-Origin: *`.
 *   - Si el origen está en la lista, se le devuelve ese mismo origen.
 *   - Si no está, no se pone ninguna cabecera: el navegador bloquea la
 *     respuesta y la otra página no puede leer nada.
 *   - La consulta previa (OPTIONS) de un origen ajeno recibe 403.
 *
 * Devuelve true si ya contestó (fue una consulta previa) y el handler debe
 * terminar ahí.
 */
export function aplicarCors(req, res, metodos = 'GET, POST') {
  res.setHeader('Vary', 'Origin')
  const origen = String(req.headers.origin || '')
  let permitido = false
  if (origen) {
    try {
      permitido = anfitrionesPermitidos().includes(new URL(origen).host)
    } catch {
      permitido = false
    }
  }
  if (permitido) {
    res.setHeader('Access-Control-Allow-Origin', origen)
    res.setHeader('Access-Control-Allow-Methods', metodos)
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Max-Age', '600')
  }
  if (req.method === 'OPTIONS') {
    res.status(permitido ? 204 : 403).end()
    return true
  }
  return false
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
    (process.env.SITIO_URL || 'https://phoenixiamethod.cl').trim(),
    // El dominio propio y sus dos alias. Las visitas a www y a .vercel.app se
    // redirigen al .cl, pero una pestaña que quedó abierta antes del cambio
    // sigue enviando desde el host viejo y no hay por qué rechazarla.
    'https://phoenixiamethod.cl',
    'https://www.phoenixiamethod.cl',
    'https://phoenixiamethod.vercel.app',
    process.env.VERCEL_URL,                       // este despliegue
    process.env.VERCEL_BRANCH_URL,                // el de la rama
    process.env.VERCEL_PROJECT_PRODUCTION_URL,    // el de producción
    // Solo en el computador de trabajo (`vercel dev`): el sitio corre en Vite
    // y le pasa las llamadas a las funciones. En Vercel, VERCEL vale "1"
    // siempre, así que en internet no abre nada.
    ...(process.env.VERCEL !== '1' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
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

/* Caracteres invisibles: los de ancho cero y los que invierten el sentido de
   la escritura. Con ellos un nombre o un enlace se ve distinto de lo que es
   —la vieja treta de "factura[U+202E]fdp.exe"— y en un correo o en el panel
   eso es un engaño servido. Nadie los escribe a propósito en un formulario. */
const INVISIBLES = new RegExp('[\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFEFF]', 'g')
/* Etiquetas de HTML. Todo lo que se muestra se escapa igual al pintarlo (en el
   panel, en los correos), así que esto es un segundo cinturón: lo que entra a
   la base ya viene sin etiquetas, por si algún día otro programa lo lee sin
   escapar. Solo caza etiquetas de verdad: "<3" o "x < 5" quedan intactos. */
const ETIQUETA = /<\/?[a-z!][^<>]*>/gi

/**
 * Limpia un texto libre antes de guardarlo o reenviarlo: normaliza el Unicode,
 * saca caracteres de control, invisibles y etiquetas de HTML, recorta y deja
 * los saltos de línea, que en un mensaje sí tienen sentido.
 */
export function limpiarTexto(valor, max) {
  return String(valor ?? '')
    .normalize('NFC')
    .replace(/\r/g, '')
    .replace(CONTROL, '')
    .replace(INVISIBLES, '')
    .replace(ETIQUETA, '')
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

/**
 * Un correo válido, sin adornos: solo los caracteres que la norma permite
 * antes de la arroba, y un dominio hecho de etiquetas normales. Deja fuera
 * comillas, espacios, <, >, paréntesis y cualquier cosa que sirva para romper
 * un encabezado o un enlace. El largo se controla aparte (`validarCampos`).
 */
export const RE_EMAIL =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]{1,64}@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*\.[a-z]{2,24}$/i

/* --- Validación en el servidor --------------------------------------------- */

/**
 * El navegador valida para ayudar a la persona; el servidor valida porque a él
 * le puede llegar cualquier cosa, escrita a mano con una línea de comandos.
 *
 * `esquema` es { campo: largoMáximo }. Cada campo que venga tiene que ser
 * texto (o número) y no pasarse del largo. Un objeto, una lista o un texto
 * gigante no se recortan en silencio: se rechazan, porque nadie los manda
 * llenando el formulario. Devuelve la lista de campos que no pasaron.
 */
export function validarCampos(cuerpo, esquema) {
  if (!cuerpo || typeof cuerpo !== 'object' || Array.isArray(cuerpo)) return ['cuerpo']
  const malos = []
  for (const [campo, max] of Object.entries(esquema)) {
    const v = cuerpo[campo]
    if (v === undefined || v === null || v === '') continue
    if (typeof v === 'number' && Number.isFinite(v)) continue
    if (typeof v !== 'string' || v.length > max) malos.push(campo)
  }
  return malos
}

/**
 * Un correo se valida tal como llegó, no después de limpiarlo: limpiar primero
 * convertiría "a<b>@x.cl" en "a@x.cl" y lo daría por bueno. Devuelve el correo
 * si pasa, o '' si no.
 */
export function correoValido(valor) {
  const crudo = typeof valor === 'string' ? valor.trim() : ''
  return crudo.length <= 254 && RE_EMAIL.test(crudo) ? crudo : ''
}

/** Las opciones del desplegable de presupuesto. Cualquier otra cosa se rechaza. */
export const PRESUPUESTOS = new Set([
  '',
  'Prefiero conversarlo',
  'Menos de $300.000',
  'Entre $300.000 y $1.000.000',
  'Más de $1.000.000',
])

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
