/* ============================================================================
   RESERVAR UN HORARIO
   El cliente elige una hora en la página y esto la convierte en un evento real
   del calendario, con la invitación enviada a su correo.

   Se vuelve a comprobar que el hueco siga libre: entre que la página cargó y
   la persona eligió pueden haber pasado minutos, y alguien más pudo tomarlo.
   ========================================================================== */

import { tramosOcupados, crearEvento } from './_google.js'
import { esHuecoValido, DURACION_MIN, partesEnChile } from './_agenda.js'

export const config = { maxDuration: 20 }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const limpiar = (v, max) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max)

const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function enPalabras(inicio) {
  const p = partesEnChile(new Date(inicio))
  const hora = `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`
  return `${DIAS_LARGO[p.diaSemana]} ${p.dia} de ${MESES[p.mes - 1]}, ${hora} h`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

  const nombre = limpiar(cuerpo.nombre, 80)
  const email = limpiar(cuerpo.email, 160)
  const tema = limpiar(cuerpo.tema, 1000)
  const inicioISO = limpiar(cuerpo.inicio, 40)

  if (nombre.length < 2) return res.status(400).json({ ok: false, error: 'Falta tu nombre.' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Ese correo no es válido.' })
  if (limpiar(cuerpo.web, 10)) return res.status(200).json({ ok: true })

  try {
    const margen = 3 * 3600000
    const ocupados = await tramosOcupados({
      desde: new Date(new Date(inicioISO).getTime() - margen).toISOString(),
      hasta: new Date(new Date(inicioISO).getTime() + margen).toISOString(),
    })

    const revision = esHuecoValido({ inicioISO, ocupados })
    if (!revision.ok) return res.status(409).json({ ok: false, error: revision.motivo })

    const evento = await crearEvento({
      resumen: `NeuraIA · ${nombre}`,
      descripcion: [
        `Reunión de ${DURACION_MIN} minutos agendada desde elgolott.vercel.app`,
        '',
        `Contacto: ${email}`,
        tema ? `\nQué quiere resolver:\n${tema}` : '',
      ].join('\n'),
      inicioISO: new Date(revision.inicio).toISOString(),
      finISO: new Date(revision.termino).toISOString(),
      invitado: { email, nombre },
    })

    return res.status(200).json({
      ok: true,
      cuando: enPalabras(revision.inicio),
      enlace: evento.hangoutLink || evento.location || '',
    })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}
