/* ============================================================================
   SOLICITUDES DESDE LA WEB  →  AVISO A NICOLÁS
   ----------------------------------------------------------------------------
   El formulario ya no manda un correo con un enlace para que la persona vuelva
   más tarde a elegir su hora: el navegador la lleva derecho a /agendar.html en
   cuanto envía el formulario (ver ContactForm.tsx), con su nombre, correo y
   mensaje ya puestos ahí. Esta función corre en paralelo, sin que la persona
   espere por ella, y hace dos cosas:

     1. Valida los datos (otra vez, porque nadie garantiza que vengan del form)
        y te manda a ti una copia con los datos del contacto, para que quede
        registrado en tu Gmail sin necesidad de una planilla aparte.
     2. Deja el registro en el panel de estadísticas (`registrarCliente`), con
        lo que escribió y el recorrido que hizo por el sitio.

   Si la persona no llega a reservar una hora, este es el único aviso que te
   llega de que existió — por eso sigue corriendo aunque el navegador ya se
   haya ido a otra página. El correo de la reunión (con el enlace y lo que
   escribió acá) lo manda `api/reservar.js` cuando de verdad reserva.

   El correo sale por Brevo, que regala 300 envíos diarios. Se habla por HTTP,
   así que no hay ninguna librería instalada.

   Variables de entorno (panel de Vercel):
     BREVO_API_KEY     la clave de Brevo (Settings → SMTP & API → API Keys)
     CONTACTO_EMAIL    a dónde te llega la copia. Si falta, usa el de abajo.
     REMITENTE_EMAIL   desde qué dirección sale el correo. Tiene que ser una que
                       Brevo firme: su subdominio brevosend o un dominio propio
                       verificado. Con una dirección gratuita (@gmail.com) Brevo
                       acepta el envío y después lo marca "Bloqueado".
   ========================================================================== */

import { contarDesdeServidor, equipoDe, lugar, navegadorDe, registrarCliente, sistemaDe } from './_estadisticas.js'
import {
  MAX_ENLACES,
  RE_EMAIL,
  cuentaEnlaces,
  cuerpoDemasiadoGrande,
  fallo,
  ipDe,
  limpiarLinea,
  limpiarTexto,
  pasaLosCupos,
  sinCache,
  vieneDeLaWeb,
} from './_seguridad.js'

/** Igual que en api/evento.js: el identificador de sesión que arma el navegador. */
const RE_SESION = /^[A-Za-z0-9_-]{8,40}$/

export const config = { maxDuration: 20 }

const LIMITES = { nombre: 80, email: 160, mensaje: 2000, presupuesto: 80 }

/* Cuánto se puede usar esta función. Ya no gasta dos correos del cupo diario de
   Brevo por solicitud, solo uno (el tuyo), así que el tope global deja mucho
   más margen del que necesita una persona real y corta en seco a quien quiera
   vaciarlo. */
const CUPO_IP = [3, 15 * 60000] // 3 envíos cada cuarto de hora desde una IP
const CUPO_CORREO = [2, 24 * 3600000] // 2 al día por dirección
const CUPO_TOTAL = [40, 24 * 3600000] // 40 al día en toda la web

/** Lo que tarda una persona en llenar el formulario, como mínimo. */
const SEGUNDOS_MINIMOS = 3

/* Brevo dejó de reescribir el remitente cuando es una dirección gratuita: desde
   el 10/09 todo lo que sale con @gmail.com queda "Bloqueado" en su registro y no
   llega a nadie, y la API igual responde que sí. Por eso el remitente es ahora
   el subdominio que Brevo firma por su cuenta. Las respuestas siguen llegando
   al Gmail de siempre: van por el replyTo. */
const CORREO_NICOLAS = process.env.CONTACTO_EMAIL || 'contacto.nicolaspk@gmail.com'
const REMITENTE = {
  name: 'Nicolás Golott',
  email: process.env.REMITENTE_EMAIL || 'contacto.nicolaspk@12068809.brevosend.com',
}
// trim: al cargar la variable desde una terminal se puede colar un salto de línea
const SITIO = (process.env.SITIO_URL || 'https://phoenixiamethod.cl').trim().replace(/\/$/, '')

/** Enlace a la página de reserva, con los datos ya rellenados — por si hay que
 *  mandárselo a mano a alguien que no llegó a reservar. */
function enlaceAgenda({ nombre, email }) {
  const q = new URLSearchParams({ nombre, email })
  return `${SITIO}/agendar.html?${q.toString()}`
}

/** Evita que un texto del visitante se cuele como etiquetas dentro del correo. */
function escapar(texto) {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/* --- La copia que te llega a ti ------------------------------------------ */

function correoParaNicolas({ nombre, email, mensaje, presupuesto }, sospechas = []) {
  const marcada = sospechas.length > 0
  const encabezado = marcada
    ? `SOLICITUD FILTRADA COMO POSIBLE ROBOT
Motivo: ${sospechas.join(' · ')}
Si es una persona real, respóndele tú desde este mensaje.

`
    : ''
  const siguiente = marcada
    ? `Si de verdad quiere agendar, mándale este enlace:\n${enlaceAgenda({ nombre, email })}`
    : `Ya está en camino a elegir su horario (la llevé directo ahí desde el formulario).
Si no alcanza a reservar, mándale este enlace:
${enlaceAgenda({ nombre, email })}
Cuando reserve, el evento aparece solo en tu calendario de clientes.`

  const texto = `${encabezado}Nueva solicitud desde phoenixiamethod.cl

Nombre:       ${nombre}
Correo:       ${email}
Presupuesto:  ${presupuesto || 'No indicado'}

Qué necesita:
${mensaje}

${siguiente}

Si prefieres agendarlo tú, dile a Claude:
"agenda con ${nombre} el <dia> a las <hora>, correo ${email}"

Responde directo a este mensaje para contestarle.`

  /* Maquetado de verdad, no un <pre> suelto. El 11/09 esta copia salió como un
     bloque monoespaciado sin estructura: Brevo la dio por entregada y Gmail la
     aceptó y la descartó en silencio, sin dejarla ni en spam ni en la papelera. */
  const fila = (etiqueta, valor) => `
    <tr>
      <td style="padding:2px 0;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#6b6b66;width:120px;">${escapar(etiqueta)}</td>
      <td style="padding:2px 0;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#111;">${escapar(valor)}</td>
    </tr>`

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#f4f4f2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f2;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3e3df;">
  <tr><td style="padding:24px 26px 0;">
    <p style="margin:0;font:700 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;color:${marcada ? '#b4531f' : '#1f7a4d'};text-transform:uppercase;">${marcada ? 'Solicitud filtrada' : 'Nueva solicitud'}</p>
    <p style="margin:10px 0 0;font:400 22px/1.3 Helvetica,Arial,sans-serif;color:#111;">${escapar(nombre)}</p>
  </td></tr>
  ${
    marcada
      ? `<tr><td style="padding:16px 26px 0;">
    <p style="margin:0;padding:12px 14px;background:#fdf1e7;border-left:3px solid #b4531f;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#5c3a22;">
      Filtrada como posible robot (${escapar(sospechas.join(' · '))}). Si es una persona real, respóndele tú desde este mensaje.
    </p>
  </td></tr>`
      : ''
  }
  <tr><td style="padding:18px 26px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${fila('Correo', email)}
      ${fila('Presupuesto', presupuesto || 'No indicado')}
    </table>
  </td></tr>
  <tr><td style="padding:18px 26px 0;">
    <p style="margin:0;font:400 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.14em;color:#6b6b66;text-transform:uppercase;">Qué necesita</p>
    <p style="margin:8px 0 0;font:400 15px/1.65 Helvetica,Arial,sans-serif;color:#111;">${escapar(mensaje).replace(/\n/g, '<br>')}</p>
  </td></tr>
  <tr><td style="padding:20px 26px 26px;">
    <p style="margin:0;padding-top:16px;border-top:1px solid #ececE8;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#6b6b66;white-space:pre-line;">${escapar(siguiente)}</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  return { texto, html }
}

/* --- Envío por Brevo ------------------------------------------------------ */

async function enviar({ apiKey, para, nombrePara, asunto, texto, html, responderA }) {
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: REMITENTE,
      to: [{ email: para, name: nombrePara }],
      subject: asunto,
      textContent: texto,
      htmlContent: html,
      ...(responderA ? { replyTo: responderA } : {}),
    }),
  })

  if (!r.ok) {
    const detalle = await r.text().catch(() => '')
    throw new Error(`Brevo ${r.status}: ${detalle.slice(0, 200)}`)
  }
}

/* ------------------------------------------------------------------------- */

export default async function handler(req, res) {
  sinCache(res)

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  // Esta función solo trabaja para el formulario de esta web.
  if (!vieneDeLaWeb(req)) {
    return fallo(res, 403, 'Envío no permitido desde aquí.')
  }

  // Se descarta por tamaño antes de convertir nada: un envío de megabytes se
  // recorta igual campo a campo, pero para llegar a recortarlo hay que haberlo
  // leído entero, y eso es trabajo regalado.
  if (cuerpoDemasiadoGrande(req)) {
    return fallo(res, 413, 'El mensaje es demasiado largo.')
  }

  let cuerpo
  try {
    cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return fallo(res, 400, 'No pude leer el formulario.')
  }

  const datos = {
    // Nombre y presupuesto viajan al asunto y al remitente de respuesta: ahí un
    // salto de línea es una inyección de cabeceras, no un salto de línea.
    nombre: limpiarLinea(cuerpo.nombre, LIMITES.nombre),
    email: limpiarLinea(cuerpo.email, LIMITES.email),
    presupuesto: limpiarLinea(cuerpo.presupuesto, LIMITES.presupuesto),
    mensaje: limpiarTexto(cuerpo.mensaje, LIMITES.mensaje),
  }

  const errores = []
  if (datos.nombre.length < 2) errores.push('nombre')
  if (!RE_EMAIL.test(datos.email)) errores.push('email')
  if (datos.mensaje.length < 12) errores.push('mensaje')
  if (errores.length) {
    return res.status(400).json({ ok: false, error: `Datos incompletos: ${errores.join(', ')}` })
  }

  // Para adjuntar el recorrido que hizo por el sitio antes de escribir.
  const sesion = RE_SESION.test(String(cuerpo.sesion || '')) ? String(cuerpo.sesion) : ''
  const ua = String(req.headers['user-agent'] || '')
  const guardarComoCliente = (sospechas) =>
    registrarCliente({
      tipo: 'contacto',
      nombre: datos.nombre,
      email: datos.email,
      detalle: datos.mensaje,
      presupuesto: datos.presupuesto,
      sesion,
      ...lugar(req),
      equipo: equipoDe(ua),
      navegador: navegadorDe(ua),
      sistema: sistemaDe(ua),
      sospechas,
    })

  /* --- Filtros de abuso --------------------------------------------------- */

  /* La copia interna repite lo que escribió el visitante. Sin este filtro, la
     web sirve para mandarle a Nicolás un correo lleno de enlaces desde una
     dirección con buena reputación. */
  if (cuentaEnlaces(datos.mensaje) > MAX_ENLACES) {
    return res
      .status(400)
      .json({ ok: false, error: 'Deja los enlaces para la reunión y cuéntamelo con palabras.' })
  }

  const ip = ipDe(req)
  const permitido = pasaLosCupos([
    [`contacto:ip:${ip}`, ...CUPO_IP],
    [`contacto:mail:${datos.email.toLowerCase()}`, ...CUPO_CORREO],
    ['contacto:total', ...CUPO_TOTAL],
  ])
  if (!permitido) {
    res.setHeader('Retry-After', '900')
    return res
      .status(429)
      .json({ ok: false, error: 'Ya recibí tu mensaje. Dame un rato antes de mandar otro.' })
  }

  /* Señales de robot. Ya no deciden si se manda o no un correo a la persona
     (esta función no le manda ninguno), solo cómo se marca el aviso que te
     llega a ti: igual llega, con el motivo escrito, y queda en el registro de
     Vercel. Los cupos ya se aplicaron más arriba, así que esta vía tampoco
     sirve para inundar la bandeja. */
  const abierto = Number(cuerpo.desde)
  const sospechas = []
  if (limpiarTexto(cuerpo.web, 10)) sospechas.push('campo trampa lleno')
  if (Number.isFinite(abierto) && abierto < SEGUNDOS_MINIMOS * 1000) {
    sospechas.push(`enviado en ${(abierto / 1000).toFixed(1)} s`)
  }

  // Se registra siempre, pase lo que pase con el correo: es el dato duro del
  // panel, y no depende de que Brevo esté disponible.
  await guardarComoCliente(sospechas)

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    console.error('[contacto] no pude avisar → falta BREVO_API_KEY')
    return res.status(200).json({ ok: true })
  }

  const aviso = correoParaNicolas(datos, sospechas)
  const miCorreo = CORREO_NICOLAS

  /* Responder al visitante, salvo cuando el visitante es uno mismo: un correo
     cuyo replyTo repite al destinatario es una de las señales que Gmail mira
     para descartar sin avisar. */
  const responderAlVisitante =
    datos.email.toLowerCase() === miCorreo.toLowerCase()
      ? undefined
      : { email: datos.email, name: datos.nombre }

  // El único correo que manda esta función ahora es el tuyo. Si falla, no hay
  // nadie más a quien avisarle — pero la solicitud ya quedó registrada arriba,
  // así que no se pierde.
  try {
    await enviar({
      apiKey,
      para: miCorreo,
      nombrePara: 'Nicolás',
      asunto: sospechas.length
        ? `Solicitud filtrada (posible robot) — ${datos.nombre}`
        : `Nueva solicitud — ${datos.nombre}`,
      texto: aviso.texto,
      html: aviso.html,
      responderA: responderAlVisitante,
    })
  } catch (e) {
    console.error('[contacto] no pude avisar de la solicitud →', e.message)
  }

  if (!sospechas.length) await contarDesdeServidor(req, 'contacto_enviado')
  return res.status(200).json({ ok: true })
}
