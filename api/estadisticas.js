/* ============================================================================
   EL PANEL DE ESTADÍSTICAS — solo para Nicolás
   ----------------------------------------------------------------------------
   POST { clave }            → { ok, pase }  (válido 30 días)
   GET  ?vista=periodo&dias=N → todo el periodo (1, 7, 30 o 90 días)
   GET  ?vista=vivo           → quién está ahora y lo último que pasó
   GET  ?vista=clientes&tipo=T → quiénes dejaron nombre y correo (T: contacto | reserva | vacío = todos)
   Las lecturas piden la cabecera  Authorization: Bearer <pase>.

   La contraseña vive en la variable ESTADISTICAS_CLAVE de Vercel, nunca en el
   código. Cinco intentos fallidos por IP cada quince minutos y se cierra.
   ========================================================================== */

import crypto from 'node:crypto'
import {
  redis,
  claveCorrecta,
  emitirPase,
  enVercel,
  hayAlmacen,
  leerClientes,
  leerEnVivo,
  leerPeriodo,
  paseValido,
} from './_estadisticas.js'
import { cuerpoDemasiadoGrande, dentroDelCupo, fallo, ipDe, sinCache, vieneDeLaWeb } from './_seguridad.js'

const RANGOS = [1, 7, 30, 90]

export default async function handler(req, res) {
  sinCache(res)
  res.setHeader('X-Robots-Tag', 'noindex')

  if (req.method === 'POST') {
    if (!vieneDeLaWeb(req) || cuerpoDemasiadoGrande(req)) return fallo(res, 403, 'No permitido.')
    if (!process.env.ESTADISTICAS_CLAVE && enVercel()) {
      return fallo(res, 503, 'Falta configurar la contraseña del panel.')
    }
    let b
    try {
      b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
    } catch {
      return fallo(res, 400, 'No pude leer la contraseña.')
    }
    const ip = ipDe(req)
    const bloqueo = () => {
      res.setHeader('Retry-After', '900')
      return fallo(res, 429, 'Demasiados intentos. Espera 15 minutos.')
    }
    // Primera barrera, en la memoria de esta instancia.
    if (!dentroDelCupo(`panel:ip:${ip}`, 6, 15 * 60000)) return bloqueo()

    /* Segunda barrera, en la base: vale para todas las instancias a la vez.
       Diez fallos por IP cada 15 minutos. No hay un bloqueo global a
       propósito: bastaría con fallar desde cualquier lado para dejar a Nicolás
       sin poder entrar. Contra muchas IP protege el largo de la contraseña
       (12 caracteres al azar: probarlas todas tomaría millones de años). */
    const kIp = `st:login:ip:${crypto.createHash('sha256').update(ip).digest('hex').slice(0, 24)}`
    try {
      const [fallosIp] = await redis([['GET', kIp]])
      if (Number(fallosIp) >= 10) return bloqueo()
    } catch {
      /* sin base igual queda la primera barrera */
    }

    if (!claveCorrecta(String(b.clave || '').slice(0, 200))) {
      try {
        await redis([['INCR', kIp], ['EXPIRE', kIp, 900]])
      } catch {
        /* idem */
      }
      await new Promise((r) => setTimeout(r, 600))
      return fallo(res, 401, 'Contraseña incorrecta.')
    }
    return res.status(200).json({ ok: true, pase: emitirPase(30) })
  }

  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Método no permitido' })

  const pase = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  if (!paseValido(pase)) return fallo(res, 401, 'La sesión venció. Vuelve a entrar.')

  if (!hayAlmacen()) {
    return res.status(200).json({ ok: false, sinAlmacen: true, error: 'Falta conectar la base de datos.' })
  }

  const vista = String(req.query?.vista || 'periodo')
  try {
    if (vista === 'vivo') return res.status(200).json({ ok: true, ...(await leerEnVivo()) })
    if (vista === 'clientes') {
      const tipo = String(req.query?.tipo || '')
      const clientes = await leerClientes({ limite: 300 })
      return res.status(200).json({
        ok: true,
        clientes: tipo ? clientes.filter((c) => c.tipo === tipo) : clientes,
      })
    }
    const dias = Number(req.query?.dias)
    const n = RANGOS.includes(dias) ? dias : 7
    return res.status(200).json({ ok: true, ...(await leerPeriodo(n)) })
  } catch (e) {
    return fallo(res, 502, 'No pude leer las estadísticas.', e.message)
  }
}
