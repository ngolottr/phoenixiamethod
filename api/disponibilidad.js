/* ============================================================================
   HORARIOS DISPONIBLES
   Los consulta la página de reserva. Cruza el horario de atención con lo que
   ya está tomado en los calendarios de Nicolás y devuelve solo lo ofrecible.
   ========================================================================== */

import { tramosOcupados } from './_google.js'
import { calcularHuecos, DIAS_A_MOSTRAR, DURACION_MIN, ZONA } from './_agenda.js'

export const config = { maxDuration: 15 }

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const desde = Date.now()
  const hasta = desde + (DIAS_A_MOSTRAR + 1) * 86400000

  try {
    const ocupados = await tramosOcupados({
      desde: new Date(desde).toISOString(),
      hasta: new Date(hasta).toISOString(),
    })

    const dias = calcularHuecos({ ocupados, desde })

    // Un minuto de caché: alcanza para que dos visitantes seguidos no
    // disparen dos consultas, y no tanto como para mostrar horas ya tomadas.
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=60')
    return res.status(200).json({ ok: true, zona: ZONA, duracion: DURACION_MIN, dias })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}
