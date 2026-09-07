/* ============================================================================
   PUBLICACIÓN AUTOMÁTICA EN INSTAGRAM
   ----------------------------------------------------------------------------
   Esta función vive en el servidor de Vercel. No es parte de la web: nadie la
   ve. Se dispara sola el día y la hora que diga el cron de vercel.json, o a
   mano entrando a la URL con la llave correcta.

   Cómo funciona, en simple:
     1. Le decimos a Instagram "prepara esto" y le pasamos la URL del video.
        Instagram descarga el video de nuestra web con sus propios servidores.
     2. Instagram se demora un rato procesándolo. Preguntamos cada 3 segundos
        si ya terminó.
     3. Cuando está listo, le decimos "publícalo".

   Las llaves NO viven en este archivo. Se configuran como variables de entorno
   en el panel de Vercel, así no quedan escritas en el código ni en GitHub.
   ========================================================================== */

import crypto from 'node:crypto'

const GRAPH = 'https://graph.instagram.com/v23.0'

/**
 * Compara dos secretos sin delatar en cuánto se parecen.
 *
 * Un `===` corriente se detiene en el primer carácter distinto, así que el
 * tiempo que tarda cuenta cuántos acertó quien está probando. Se comparan los
 * resúmenes y no los textos, porque así ambos lados miden siempre lo mismo y la
 * diferencia de largo tampoco dice nada.
 */
function mismoSecreto(a, b) {
  if (!a || !b) return false
  const ha = crypto.createHash('sha256').update(String(a)).digest()
  const hb = crypto.createHash('sha256').update(String(b)).digest()
  return crypto.timingSafeEqual(ha, hb)
}

/** Vercel permite hasta 60 segundos por ejecución; procesar el video usa varios. */
export const config = { maxDuration: 60 }

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function graph(path, options = {}) {
  const res = await fetch(`${GRAPH}${path}`, options)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = body?.error?.message || `HTTP ${res.status}`
    throw new Error(`Instagram: ${msg}`)
  }
  return body
}

/** Paso 1: dejamos el contenido preparado y obtenemos un identificador. */
async function crearContenedor({ userId, token, videoUrl, caption, tipo }) {
  const params = new URLSearchParams({ access_token: token, video_url: videoUrl })

  if (tipo === 'STORIES') {
    params.set('media_type', 'STORIES')
    // Las historias no llevan pie de publicación
  } else {
    params.set('media_type', 'REELS')
    params.set('caption', caption)
  }

  const { id } = await graph(`/${userId}/media`, { method: 'POST', body: params })
  return id
}

/**
 * Paso 2: Instagram tarda en procesar el video. Preguntamos cada 3 segundos
 * hasta que diga FINISHED, o nos rendimos a los 45 segundos.
 */
async function esperarProcesado({ contenedorId, token, limiteMs = 45000 }) {
  const inicio = Date.now()
  let ultimo = 'IN_PROGRESS'

  while (Date.now() - inicio < limiteMs) {
    const r = await graph(
      `/${contenedorId}?fields=status_code,status&access_token=${encodeURIComponent(token)}`,
    )
    ultimo = r.status_code

    if (ultimo === 'FINISHED') return true
    if (ultimo === 'ERROR' || ultimo === 'EXPIRED') {
      throw new Error(`Instagram no pudo procesar el video (${ultimo}): ${r.status || 'sin detalle'}`)
    }
    await sleep(3000)
  }

  throw new Error(`El video sigue procesándose (${ultimo}). Reintenta en un minuto.`)
}

/** Paso 3: publicar de verdad. */
async function publicar({ userId, token, contenedorId }) {
  const params = new URLSearchParams({ access_token: token, creation_id: contenedorId })
  const { id } = await graph(`/${userId}/media_publish`, { method: 'POST', body: params })
  return id
}

async function publicarUno({ userId, token, videoUrl, caption, tipo }) {
  const contenedorId = await crearContenedor({ userId, token, videoUrl, caption, tipo })
  await esperarProcesado({ contenedorId, token })
  const mediaId = await publicar({ userId, token, contenedorId })
  return { tipo, mediaId, ok: true }
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, max-age=0')

  /* --- Puerta -------------------------------------------------------------
     La llave va SOLO en la cabecera. Antes también se aceptaba como ?key= en la
     dirección, y eso la dejaba escrita en el registro de accesos de Vercel, en
     el historial del navegador y en la cabecera Referer de cualquier enlace que
     saliera de esa página. Una llave que queda anotada en cuatro lugares deja
     de ser una llave.

     Para dispararla a mano:
       curl -X POST -H "Authorization: Bearer TU_CRON_SECRET" \
            https://elgolott.vercel.app/api/publicar                         */
  const secreto = process.env.CRON_SECRET
  const auth = String(req.headers.authorization || '')
  const presentada = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''

  if (!mismoSecreto(secreto, presentada)) {
    return res.status(401).json({ ok: false, error: 'No autorizado' })
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  // --- Las llaves y el contenido ---
  const userId = process.env.IG_USER_ID
  const token = process.env.IG_TOKEN
  const videoUrl = process.env.LANZAMIENTO_VIDEO_URL
  const caption = process.env.LANZAMIENTO_CAPTION || 'welcome to my web...'

  const faltan = Object.entries({ IG_USER_ID: userId, IG_TOKEN: token, LANZAMIENTO_VIDEO_URL: videoUrl })
    .filter(([, v]) => !v)
    .map(([k]) => k)

  if (faltan.length) {
    return res.status(500).json({ ok: false, error: `Faltan variables de entorno: ${faltan.join(', ')}` })
  }

  // --- Qué se publica: por defecto el reel y la historia ---
  const soloEsto = (req.query?.solo || '').toUpperCase()
  const destinos = soloEsto === 'REELS' || soloEsto === 'STORIES' ? [soloEsto] : ['REELS', 'STORIES']

  const resultados = []
  for (const tipo of destinos) {
    try {
      resultados.push(await publicarUno({ userId, token, videoUrl, caption, tipo }))
    } catch (e) {
      resultados.push({ tipo, ok: false, error: String(e.message || e) })
    }
  }

  const todoBien = resultados.every((r) => r.ok)
  return res.status(todoBien ? 200 : 207).json({
    ok: todoBien,
    cuando: new Date().toISOString(),
    resultados,
  })
}
