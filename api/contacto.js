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
   ========================================================================== */

export const config = { maxDuration: 20 }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const LIMITES = { nombre: 80, email: 160, mensaje: 2000, presupuesto: 80 }

const REMITENTE = { name: 'Nicolás Golott', email: 'contacto.nicolaspk@gmail.com' }
const AGENDA = 'https://cal.com/nicolas-golott-rojas-cnierq/30min?overlayCalendar=true'
const HORARIO =
  'lunes a viernes desde las 20:30, sábados desde las 16:00 y domingos todo el día (hora de Chile)'

function limpiar(valor, max) {
  return String(valor ?? '')
    .replace(/\r/g, '')
    .trim()
    .slice(0, max)
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

function correoParaElCliente({ nombre, mensaje }) {
  const nom = primerNombre(nombre)

  const texto = `Hola, ${nom},

Gracias por escribir. Leí tu solicitud y esto fue lo que me llegó:

"${mensaje}"

Para dimensionarlo bien necesito conversarlo contigo en vivo: por correo se pierde justo lo que importa, que es entender cómo funciona hoy tu operación antes de proponer nada.

El siguiente paso es una reunión de 30 minutos por Zoom. Puedes elegir el horario que te acomode acá:

${AGENDA}

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
    <p style="margin:14px 0 0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#B9C9C0;">El siguiente paso es una reunión de <strong style="color:#EFE7D5;">30 minutos por Zoom</strong>. Elige el horario que te acomode:</p>
  </td></tr>
  <tr><td style="padding:26px 32px 0;">
    <a href="${AGENDA}" style="display:inline-block;background:#2BE58F;color:#040D0A;text-decoration:none;padding:16px 30px;font:400 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;">Agendar los 30 minutos</a>
  </td></tr>
  <tr><td style="padding:22px 32px 0;">
    <p style="margin:0;font:400 12px/1.7 Helvetica,Arial,sans-serif;color:#8FA79B;">Atiendo ${HORARIO}.</p>
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

function correoParaNicolas({ nombre, email, mensaje, presupuesto }) {
  const texto = `Nueva solicitud desde elgolott.vercel.app

Nombre:       ${nombre}
Correo:       ${email}
Presupuesto:  ${presupuesto || 'No indicado'}

Qué necesita:
${mensaje}

Ya se le envió el correo con el enlace de agenda.
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
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Falta BREVO_API_KEY en Vercel.' })
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

  const datos = {
    nombre: limpiar(cuerpo.nombre, LIMITES.nombre),
    email: limpiar(cuerpo.email, LIMITES.email),
    mensaje: limpiar(cuerpo.mensaje, LIMITES.mensaje),
    presupuesto: limpiar(cuerpo.presupuesto, LIMITES.presupuesto),
  }

  const errores = []
  if (datos.nombre.length < 2) errores.push('nombre')
  if (!EMAIL_RE.test(datos.email)) errores.push('email')
  if (datos.mensaje.length < 12) errores.push('mensaje')
  if (errores.length) {
    return res.status(400).json({ ok: false, error: `Datos incompletos: ${errores.join(', ')}` })
  }

  // Trampa para robots: un campo que ninguna persona ve ni llena.
  if (limpiar(cuerpo.web, 10)) return res.status(200).json({ ok: true })

  const cliente = correoParaElCliente(datos)
  const aviso = correoParaNicolas(datos)
  const miCorreo = process.env.CONTACTO_EMAIL || REMITENTE.email

  try {
    // Primero el de la persona: es el que no puede fallar.
    await enviar({
      apiKey,
      para: datos.email,
      nombrePara: datos.nombre,
      asunto: `Agendemos 30 minutos, ${primerNombre(datos.nombre)}`,
      texto: cliente.texto,
      html: cliente.html,
    })
  } catch (e) {
    return res.status(502).json({ ok: false, error: `No se pudo enviar: ${e.message}` })
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
