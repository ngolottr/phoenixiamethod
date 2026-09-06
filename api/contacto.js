/* ============================================================================
   PUENTE ENTRE EL FORMULARIO DE LA WEB Y n8n
   ----------------------------------------------------------------------------
   El navegador nunca habla directo con n8n: si la dirección del webhook
   estuviera en el código de la página, cualquiera podría verla y llenarla de
   basura. En vez de eso el formulario le habla a esta función, que vive en el
   servidor, valida lo que llega y recién ahí se lo pasa a n8n.

   Variable de entorno necesaria (panel de Vercel):
     N8N_WEBHOOK_URL   la URL de producción del nodo Webhook del flujo
                       "WEB A AGENDA", termina en /webhook/solicitud-web
   ========================================================================== */

export const config = { maxDuration: 15 }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const LIMITES = { nombre: 80, email: 160, mensaje: 2000, presupuesto: 80 }

/** Recorta, limpia saltos raros y evita que nos manden una novela. */
function limpiar(valor, max) {
  return String(valor ?? '')
    .replace(/\r/g, '')
    .trim()
    .slice(0, max)
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const destino = process.env.N8N_WEBHOOK_URL
  if (!destino) {
    return res.status(500).json({
      ok: false,
      error: 'Falta configurar N8N_WEBHOOK_URL en las variables de entorno.',
    })
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

  const datos = {
    nombre: limpiar(cuerpo.nombre, LIMITES.nombre),
    email: limpiar(cuerpo.email, LIMITES.email),
    mensaje: limpiar(cuerpo.mensaje, LIMITES.mensaje),
    presupuesto: limpiar(cuerpo.presupuesto, LIMITES.presupuesto),
  }

  // Las mismas reglas que ya valida el navegador, repetidas acá: nadie
  // garantiza que la petición venga del formulario.
  const errores = []
  if (datos.nombre.length < 2) errores.push('nombre')
  if (!EMAIL_RE.test(datos.email)) errores.push('email')
  if (datos.mensaje.length < 12) errores.push('mensaje')

  if (errores.length) {
    return res.status(400).json({ ok: false, error: `Datos incompletos: ${errores.join(', ')}` })
  }

  // Trampa para robots: un campo que ninguna persona ve ni llena.
  if (limpiar(cuerpo.web, 10)) {
    return res.status(200).json({ ok: true })
  }

  try {
    const r = await fetch(destino, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...datos, origen: 'elgolott.vercel.app' }),
    })

    if (!r.ok) {
      return res.status(502).json({ ok: false, error: `n8n respondió ${r.status}` })
    }

    return res.status(200).json({ ok: true })
  } catch (e) {
    return res.status(502).json({ ok: false, error: `No se pudo contactar a n8n: ${e.message}` })
  }
}
