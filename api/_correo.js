/* ============================================================================
   ENVÍO DE CORREOS (Brevo)
   Un solo lugar para hablar con Brevo, usado por el formulario de contacto y
   por la confirmación de reserva.
   ========================================================================== */

export const REMITENTE = { name: 'Nicolás Golott', email: 'contacto.nicolaspk@gmail.com' }

export function escapar(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function enviarCorreo({ para, nombrePara, asunto, texto, html, responderA }) {
  const apiKey = process.env.BREVO_API_KEY
  if (!apiKey) throw new Error('Falta BREVO_API_KEY')

  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
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

/**
 * Enlace para que el cliente agregue la reunión a su propio calendario.
 * Sirve en Google Calendar y, en la práctica, en cualquier cliente moderno.
 */
export function enlaceAgregarACalendario({ titulo, inicio, fin, detalle, lugar }) {
  const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: titulo,
    dates: `${fmt(inicio)}/${fmt(fin)}`,
    details: detalle || '',
    location: lugar || '',
  })
  return `https://calendar.google.com/calendar/render?${q.toString()}`
}
