/* ============================================================================
   RECIBIR UNA VISITA O UNA ACCIÓN
   ----------------------------------------------------------------------------
   El navegador manda acá, con sendBeacon, cada escena vista, cada acción
   (llamar, abrir la agenda, ver un caso…) y la salida con el tiempo en el sitio.
   Ver api/_estadisticas.js para qué se guarda y qué no.

   Siempre contesta 204 y nunca dice por qué descartó algo: a un robot no hay
   que explicarle cómo pasar el filtro, y a una persona no le importa.
   ========================================================================== */

import {
  RE_BOT,
  diaDe,
  equipoDe,
  fuenteDe,
  hayAlmacen,
  huella,
  lugar,
  navegadorDe,
  registrar,
  sistemaDe,
} from './_estadisticas.js'
import { cuerpoDemasiadoGrande, ipDe, pasaLosCupos, sinCache, vieneDeLaWeb } from './_seguridad.js'

const RE_NOMBRE = /^[a-z0-9_:.\-]{1,60}$/
const RE_SESION = /^[A-Za-z0-9_-]{8,40}$/

export default async function handler(req, res) {
  sinCache(res)
  const listo = () => res.status(204).end()

  if (req.method !== 'POST') return res.status(405).end()
  if (!hayAlmacen()) return listo()
  if (!vieneDeLaWeb(req) || cuerpoDemasiadoGrande(req)) return listo()

  const ua = String(req.headers['user-agent'] || '')
  if (!ua || RE_BOT.test(ua)) return listo()

  let b
  try {
    b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return listo()
  }

  const tipo = ['vista', 'evento', 'salida'].includes(b.tipo) ? b.tipo : null
  const nombre = String(b.nombre || '').toLowerCase()
  if (!tipo || (tipo !== 'salida' && !RE_NOMBRE.test(nombre))) return listo()

  const ip = ipDe(req)
  // Una persona real no genera más de esto; un bucle sí.
  if (!pasaLosCupos([[`evento:ip:${ip}`, 120, 10 * 60000], ['evento:total', 6000, 60000]])) return listo()

  const sesion = RE_SESION.test(String(b.sesion || '')) ? String(b.sesion) : ''
  let hostRef = ''
  try {
    hostRef = b.ref ? new URL(String(b.ref)).host : ''
  } catch {
    hostRef = ''
  }
  const propio = String(req.headers.host || '')
  if (hostRef === propio) hostRef = ''

  try {
    await registrar({
      tipo,
      nombre,
      visitante: huella(ip, ua, diaDe()),
      sesion,
      nueva: tipo === 'vista' && b.nueva === true,
      fuente: fuenteDe(hostRef, b.utm),
      ...lugar(req),
      equipo: equipoDe(ua),
      navegador: navegadorDe(ua),
      sistema: sistemaDe(ua),
      segundos: Number(b.segundos) || 0,
      escenas: Number(b.escenas) || 0,
      primera: b.primera === true,
    })
  } catch (e) {
    console.error('[evento] no se pudo registrar →', e.message)
  }
  return listo()
}
