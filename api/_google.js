/* ============================================================================
   ACCESO A GOOGLE CALENDAR DESDE EL SERVIDOR
   ----------------------------------------------------------------------------
   La web necesita leer tu agenda y crear eventos por su cuenta, sin ti delante.
   Para eso Google usa una "cuenta de servicio": un usuario robot que tú
   autorizas una vez compartiéndole el calendario.

   Acá se firma a mano el token que Google pide, usando el módulo de criptografía
   que ya trae Node. Así no hace falta instalar ninguna librería de Google.

   Variables de entorno (panel de Vercel):
     GOOGLE_SA_EMAIL        el correo de la cuenta de servicio
                            (termina en .iam.gserviceaccount.com)
     GOOGLE_SA_PRIVATE_KEY  la clave privada del archivo JSON, entera,
                            incluyendo las líneas BEGIN y END
     CALENDAR_ID            el calendario donde se agenda
     CALENDARIOS_OCUPACION  (opcional) otros calendarios a revisar para no
                            pisar compromisos, separados por coma
   ========================================================================== */

import crypto from 'node:crypto'

const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/calendar'
const API = 'https://www.googleapis.com/calendar/v3'

const base64url = (buf) =>
  Buffer.from(buf).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

/**
 * Las claves privadas se pegan en Vercel con los saltos de línea escapados.
 * Esto las devuelve a su forma original para que crypto las acepte.
 */
function normalizarClave(clave) {
  return String(clave || '')
    .replace(/\\n/g, '\n')
    .trim()
}

let cache = { token: null, expira: 0 }

/** Pide (o reutiliza) el token de acceso de la cuenta de servicio. */
export async function tokenDeGoogle() {
  const ahora = Math.floor(Date.now() / 1000)
  if (cache.token && cache.expira > ahora + 60) return cache.token

  const email = process.env.GOOGLE_SA_EMAIL
  const clave = normalizarClave(process.env.GOOGLE_SA_PRIVATE_KEY)
  if (!email || !clave) throw new Error('Faltan GOOGLE_SA_EMAIL o GOOGLE_SA_PRIVATE_KEY')

  const cabecera = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const cuerpo = base64url(
    JSON.stringify({
      iss: email,
      scope: SCOPE,
      aud: TOKEN_URL,
      iat: ahora,
      exp: ahora + 3600,
    }),
  )

  const firma = base64url(
    crypto.createSign('RSA-SHA256').update(`${cabecera}.${cuerpo}`).sign(clave),
  )
  const jwt = `${cabecera}.${cuerpo}.${firma}`

  const r = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const datos = await r.json()
  if (!r.ok) throw new Error(`Google no entregó el token: ${datos.error_description || r.status}`)

  cache = { token: datos.access_token, expira: ahora + (datos.expires_in || 3600) }
  return cache.token
}

/** Devuelve los tramos ocupados de todos los calendarios que hay que respetar. */
export async function tramosOcupados({ desde, hasta }) {
  const token = await tokenDeGoogle()
  const principal = process.env.CALENDAR_ID
  const otros = (process.env.CALENDARIOS_OCUPACION || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

  const ids = [...new Set([principal, ...otros].filter(Boolean))]

  const r = await fetch(`${API}/freeBusy`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      timeMin: desde,
      timeMax: hasta,
      timeZone: 'America/Santiago',
      items: ids.map((id) => ({ id })),
    }),
  })

  const datos = await r.json()
  if (!r.ok) throw new Error(`freeBusy falló: ${datos.error?.message || r.status}`)

  const ocupados = []
  for (const id of Object.keys(datos.calendars || {})) {
    // Un calendario sin permisos devuelve errores; se ignora en vez de romper todo
    for (const t of datos.calendars[id].busy || []) {
      ocupados.push({ inicio: new Date(t.start).getTime(), fin: new Date(t.end).getTime() })
    }
  }
  return ocupados.sort((a, b) => a.inicio - b.inicio)
}

/** Crea el evento y envía la invitación al cliente. */
export async function crearEvento({ resumen, descripcion, inicioISO, finISO, invitado }) {
  const token = await tokenDeGoogle()
  const calendario = encodeURIComponent(process.env.CALENDAR_ID)
  const enlaceFijo = process.env.ENLACE_REUNION || ''

  const cuerpo = {
    summary: resumen,
    description: descripcion,
    start: { dateTime: inicioISO, timeZone: 'America/Santiago' },
    end: { dateTime: finISO, timeZone: 'America/Santiago' },
    attendees: invitado ? [{ email: invitado.email, displayName: invitado.nombre }] : [],
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 60 },
        { method: 'popup', minutes: 15 },
      ],
    },
  }

  // Si hay un enlace fijo de reunión configurado, va como ubicación del evento.
  if (enlaceFijo) cuerpo.location = enlaceFijo

  const r = await fetch(
    `${API}/calendars/${calendario}/events?sendUpdates=all&conferenceDataVersion=1`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(cuerpo),
    },
  )

  const datos = await r.json()
  if (!r.ok) throw new Error(`No se pudo crear el evento: ${datos.error?.message || r.status}`)
  return datos
}
