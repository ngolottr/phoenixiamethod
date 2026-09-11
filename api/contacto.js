/* ============================================================================
   SOLICITUDES DESDE LA WEB  →  CORREO AUTOMÁTICO
   ----------------------------------------------------------------------------
   Sin n8n y sin servidor propio. Esta función vive en Vercel y hace tres cosas
   cuando alguien envía el formulario:

     1. Valida los datos (otra vez, porque nadie garantiza que vengan del form).
     2. Le manda a la persona un correo que retoma lo que escribió y le propone
        agendar 30 minutos por Zoom, con el enlace de Cal.com.
     3. Te manda a ti una copia con los datos del contacto, para que quede
        registrado en tu Gmail sin necesidad de una planilla aparte.

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

export const config = { maxDuration: 20 }

const LIMITES = { nombre: 80, email: 160, mensaje: 2000, presupuesto: 80 }

/* Cuánto se puede usar esta función. Cada solicitud gasta dos correos del cupo
   diario de Brevo, que son 300: el tope global deja margen de sobra para las
   personas reales y corta en seco a quien quiera vaciarlo. */
const CUPO_IP = [3, 15 * 60000] // 3 envíos cada cuarto de hora desde una IP
const CUPO_CORREO = [2, 24 * 3600000] // 2 al día por dirección
const CUPO_TOTAL = [40, 24 * 3600000] // 40 al día en toda la web

/** Lo que tarda una persona en llenar el formulario, como mínimo. */
const SEGUNDOS_MINIMOS = 3

/* Brevo dejó de reescribir el remitente cuando es una dirección gratuita: desde
   el 10/09 todo lo que sale con @gmail.com queda "Bloqueado" en su registro y no
   llega a nadie —ni al visitante ni a Nicolás—, y la API igual responde que sí.
   Por eso el remitente es ahora el subdominio que Brevo firma por su cuenta. Las
   respuestas siguen llegando al Gmail de siempre: van por el replyTo. */
const CORREO_NICOLAS = process.env.CONTACTO_EMAIL || 'contacto.nicolaspk@gmail.com'
const REMITENTE = {
  name: 'Nicolás Golott',
  email: process.env.REMITENTE_EMAIL || 'contacto.nicolaspk@12068809.brevosend.com',
}
const SITIO = process.env.SITIO_URL || 'https://elgolott.vercel.app'
const HORARIO =
  'lunes a viernes desde las 20:30, sábados desde las 16:00 y domingos todo el día (hora de Chile)'

/** Enlace a la página de reserva, con los datos ya rellenados. */
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
}

const primerNombre = (nombre) => nombre.split(/\s+/)[0]

/* --- El correo que recibe la persona ------------------------------------- */

function correoParaElCliente({ nombre, email, mensaje }) {
  const nom = primerNombre(nombre)
  const agenda = enlaceAgenda({ nombre, email })

  const texto = `Hola, ${nom},

Gracias por escribir. Leí tu solicitud y esto fue lo que me llegó:

"${mensaje}"

Para dimensionarlo bien necesito conversarlo contigo en vivo: por correo se pierde justo lo que importa, que es entender cómo funciona hoy tu operación antes de proponer nada.

El siguiente paso es una reunión de 30 minutos por videollamada.

Elige tú mismo la hora que te acomode acá:

${agenda}

Ahí ves solo los horarios que tengo realmente libres. Eliges uno, confirmas, y te llega la invitación al calendario con el enlace de la reunión.

Atiendo ${HORARIO}.

Nos vemos,

Nicolás Golott
NeuraIA`

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:0;background:#040D0A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#040D0A;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#071711;border:1px solid rgba(239,231,213,.14);">
  <tr><td style="padding:30px 32px 0;">
    <p style="margin:0;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.42em;color:#2BE58F;text-transform:uppercase;">ELGOLOTT</p>
  </td></tr>
  <tr><td style="padding:22px 32px 0;">
    <p style="margin:0;font:400 26px/1.2 Georgia,'Times New Roman',serif;color:#EFE7D5;">Hola, ${escapar(nom)}.</p>
  </td></tr>
  <tr><td style="padding:18px 32px 0;">
    <p style="margin:0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#B9C9C0;">Gracias por escribir. Leí tu solicitud y esto fue lo que me llegó:</p>
  </td></tr>
  <tr><td style="padding:16px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="border-left:2px solid #2BE58F;padding:4px 0 4px 16px;">
        <p style="margin:0;font:italic 400 15px/1.6 Georgia,serif;color:#EFE7D5;">${escapar(mensaje).replace(/\n/g, '<br>')}</p>
      </td></tr></table>
  </td></tr>
  <tr><td style="padding:20px 32px 0;">
    <p style="margin:0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#B9C9C0;">Para dimensionarlo bien necesito conversarlo contigo en vivo: por correo se pierde justo lo que importa, que es entender cómo funciona hoy tu operación antes de proponer nada.</p>
    <p style="margin:14px 0 0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#B9C9C0;">El siguiente paso es una reunión de <strong style="color:#EFE7D5;">30 minutos por videollamada</strong>.</p>
  </td></tr>
  <tr><td style="padding:24px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #2BE58F;">
      <tr><td style="padding:20px 22px;">
        <p style="margin:0;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;color:#2BE58F;text-transform:uppercase;">Cómo seguimos</p>
        <p style="margin:12px 0 0;font:400 16px/1.55 Helvetica,Arial,sans-serif;color:#EFE7D5;">Elige tú mismo la hora que te acomode. Verás solo los horarios que tengo <strong>realmente libres</strong>.</p>
        <p style="margin:20px 0 6px;">
          <a href="${escapar(agenda)}" style="display:inline-block;background:#2BE58F;color:#040D0A;text-decoration:none;padding:16px 30px;font:400 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;">Elegir mi horario</a>
        </p>
        <p style="margin:14px 0 0;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#8FA79B;">Atiendo ${HORARIO}.</p>
      </td></tr>
    </table>
  </td></tr>
  <tr><td style="padding:26px 32px 32px;">
    <p style="margin:0;padding-top:20px;border-top:1px solid rgba(239,231,213,.12);font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#8FA79B;">
      Nicolás Golott<br><span style="color:#C8A05A;">NeuraIA</span>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`

  return { texto, html }
}

/* --- La copia que te llega a ti ------------------------------------------ */

function correoParaNicolas({ nombre, email, mensaje, presupuesto }, sospechas = []) {
  const marcada = sospechas.length > 0
  const encabezado = marcada
    ? `SOLICITUD FILTRADA COMO POSIBLE ROBOT
Motivo: ${sospechas.join(' · ')}
NO se le envió el correo automático. Si es una persona real, respóndele tú
desde este mensaje.

`
    : ''
  const siguiente = marcada
    ? 'No se le envió el enlace para agendar.'
    : `Ya se le envió el enlace para que elija su horario.
Cuando reserve, el evento aparece solo en tu calendario NeuraIA · Clientes.`

  const texto = `${encabezado}Nueva solicitud desde elgolott.vercel.app

Nombre:       ${nombre}
Correo:       ${email}
Presupuesto:  ${presupuesto || 'No indicado'}

Qué necesita:
${mensaje}

${siguiente}

Si prefieres agendarlo tú, dile a Claude:
"agenda con ${nombre} el <dia> a las <hora>, correo ${email}"

Responde directo a este mensaje para contestarle.`

  return { texto, html: `<pre style="font:14px/1.6 monospace;color:#111;">${escapar(texto)}</pre>` }
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

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return fallo(res, 500, 'El correo no está disponible ahora.', 'Falta BREVO_API_KEY')
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

  /* --- Filtros de abuso --------------------------------------------------- */

  /* Este correo le repite al visitante lo que escribió. Sin este filtro, la web
     sirve para mandarle a cualquiera un mensaje lleno de enlaces desde una
     dirección con buena reputación: phishing con la cara de Nicolás. */
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

  /* Señales de robot. Antes bastaba una para descartar la solicitud en
     silencio, y el 11/09 eso se comió la de una persona real: el
     autocompletado del teléfono llenó la trampa, el visitante vio "revisa tu
     correo" y no salió ningún mensaje, ni para él ni para Nicolás.

     Ahora una solicitud marcada no recibe el correo automático —no se le puede
     mandar contenido a ciegas a una dirección que quizá no pidió nada— pero
     llega igual a Nicolás con el motivo escrito, y queda en el registro de
     Vercel. Los cupos ya se aplicaron más arriba, así que esta vía tampoco
     sirve para inundar la bandeja. */
  const abierto = Number(cuerpo.desde)
  const sospechas = []
  if (limpiarTexto(cuerpo.web, 10)) sospechas.push('campo trampa lleno')
  if (Number.isFinite(abierto) && abierto < SEGUNDOS_MINIMOS * 1000) {
    sospechas.push(`enviado en ${(abierto / 1000).toFixed(1)} s`)
  }

  const cliente = correoParaElCliente(datos)
  const aviso = correoParaNicolas(datos, sospechas)
  const miCorreo = CORREO_NICOLAS

  if (sospechas.length) {
    console.warn('[contacto] filtrada como robot:', sospechas.join(' · '), '→', datos.email)
    try {
      await enviar({
        apiKey,
        para: miCorreo,
        nombrePara: 'Nicolás',
        asunto: `Solicitud filtrada (posible robot) — ${datos.nombre}`,
        texto: aviso.texto,
        html: aviso.html,
        responderA: { email: datos.email, name: datos.nombre },
      })
    } catch (e) {
      console.error('[contacto] no pude avisar de la solicitud filtrada →', e.message)
    }
    return res.status(200).json({ ok: true })
  }

  try {
    // Primero el de la persona: es el que no puede fallar.
    await enviar({
      apiKey,
      para: datos.email,
      nombrePara: datos.nombre,
      asunto: `Agendemos 30 minutos, ${primerNombre(datos.nombre)}`,
      texto: cliente.texto,
      html: cliente.html,
      // El remitente es el subdominio de Brevo: si el visitante responde, la
      // respuesta tiene que caer en el Gmail de Nicolás, no en el vacío.
      responderA: { email: CORREO_NICOLAS, name: 'Nicolás Golott' },
    })
  } catch (e) {
    // El detalle va al registro de Vercel. Al visitante, nada: la respuesta de
    // Brevo trae pistas del remitente, del plan y de la clave.
    return fallo(res, 502, 'No pude enviar el correo. Intenta de nuevo en unos minutos.', e.message)
  }

  // La copia interna es deseable, pero si falla no arruina la solicitud.
  try {
    await enviar({
      apiKey,
      para: miCorreo,
      nombrePara: 'Nicolás',
      asunto: `Nueva solicitud — ${datos.nombre}`,
      texto: aviso.texto,
      html: aviso.html,
      responderA: { email: datos.email, name: datos.nombre },
    })
  } catch {
    /* el visitante ya recibió su correo; la copia se puede perder sin drama */
  }

  return res.status(200).json({ ok: true })
}
