/* ============================================================================
   LAS REGLAS DE LA AGENDA
   ----------------------------------------------------------------------------
   Un solo lugar donde vive cuándo atiende Nicolás. Si mañana cambia el horario,
   se toca acá y cambian a la vez la página de reserva y la validación del
   servidor: nunca pueden quedar diciendo cosas distintas.

   Los bloques de lunes a sábado cruzan la medianoche (20:30 a 03:00), así que
   la madrugada se anota en el día siguiente. Léelo así: la ventana del lunes a
   las 20:30 continúa en el tramo 00:00-03:00 del martes.
   ========================================================================== */

export const DURACION_MIN = 30
export const COLCHON_MIN = 15
export const ZONA = 'America/Santiago'

/** Índices: 0 domingo, 1 lunes … 6 sábado. Minutos desde la medianoche. */
export const VENTANAS = {
  0: [[0, 1440]], // domingo entero
  1: [[0, 180], [1230, 1440]], // 00:00-03:00 y 20:30-24:00
  2: [[0, 180], [1230, 1440]],
  3: [[0, 180], [1230, 1440]],
  4: [[0, 180], [1230, 1440]],
  5: [[0, 180], [1230, 1440]],
  6: [[0, 180], [960, 1440]], // sábado: 00:00-03:00 y 16:00-24:00
}

/** Cuántos días hacia adelante se ofrecen y desde cuándo. */
export const DIAS_A_MOSTRAR = 14
export const AVISO_MINIMO_HORAS = 12

/* ---------------------------------------------------------------------------
   Trabajar con la hora de Chile sin librerías: se pregunta al propio motor de
   fechas del navegador/Node qué hora local corresponde a un instante dado.
   --------------------------------------------------------------------------- */

const fmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  weekday: 'short',
})

const DIAS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** Descompone un instante en sus partes tal como se ven en Santiago. */
export function partesEnChile(fecha) {
  const p = Object.fromEntries(fmt.formatToParts(fecha).map((x) => [x.type, x.value]))
  return {
    anio: +p.year,
    mes: +p.month,
    dia: +p.day,
    hora: +p.hour % 24,
    minuto: +p.minute,
    diaSemana: DIAS[p.weekday],
    fechaISO: `${p.year}-${p.month}-${p.day}`,
  }
}

/**
 * Convierte una fecha y hora de Chile en el instante universal que le
 * corresponde. Se resuelve por tanteo porque el desfase cambia con el horario
 * de verano, y Chile lo mueve todos los años.
 */
export function instanteEnChile(fechaISO, minutosDelDia) {
  const [a, m, d] = fechaISO.split('-').map(Number)
  const hora = Math.floor(minutosDelDia / 60)
  const min = minutosDelDia % 60

  let intento = Date.UTC(a, m - 1, d, hora, min)
  for (let i = 0; i < 3; i++) {
    const p = partesEnChile(new Date(intento))
    const deberia = hora * 60 + min
    const es = p.hora * 60 + p.minuto
    let dif = deberia - es
    if (dif > 720) dif -= 1440
    if (dif < -720) dif += 1440
    if (dif === 0 && p.dia === d) break
    intento += dif * 60000
  }
  return intento
}

const solapa = (aIni, aFin, bIni, bFin) => aIni < bFin && bIni < aFin

/**
 * Arma la lista de horarios ofrecibles.
 * Un hueco se descarta si el bloque de la reunión, ensanchado con el colchón a
 * ambos lados, pisa cualquier tramo ocupado.
 */
export function calcularHuecos({ ocupados = [], desde = Date.now() } = {}) {
  const dias = []
  const minimo = desde + AVISO_MINIMO_HORAS * 3600000
  const colchonMs = COLCHON_MIN * 60000
  const duracionMs = DURACION_MIN * 60000

  for (let i = 0; i < DIAS_A_MOSTRAR; i++) {
    const refe = new Date(desde + i * 86400000)
    const { fechaISO, diaSemana } = partesEnChile(refe)
    const horas = []

    for (const [ini, fin] of VENTANAS[diaSemana] || []) {
      for (let m = ini; m + DURACION_MIN <= fin; m += DURACION_MIN) {
        const inicio = instanteEnChile(fechaISO, m)
        const termino = inicio + duracionMs
        if (inicio < minimo) continue

        const chocado = ocupados.some((o) =>
          solapa(inicio - colchonMs, termino + colchonMs, o.inicio, o.fin),
        )
        if (chocado) continue

        const p = partesEnChile(new Date(inicio))
        horas.push({
          inicio: new Date(inicio).toISOString(),
          fin: new Date(termino).toISOString(),
          etiqueta: `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`,
        })
      }
    }

    if (horas.length) dias.push({ fecha: fechaISO, diaSemana, horas })
  }

  return dias
}

/** Comprueba que un horario pedido siga siendo válido antes de reservarlo. */
export function esHuecoValido({ inicioISO, ocupados = [], ahora = Date.now() }) {
  const inicio = new Date(inicioISO).getTime()
  if (!Number.isFinite(inicio)) return { ok: false, motivo: 'Ese horario no se entiende.' }
  if (inicio < ahora + AVISO_MINIMO_HORAS * 3600000) {
    return { ok: false, motivo: 'Ese horario ya es muy pronto. Elige uno más adelante.' }
  }

  const p = partesEnChile(new Date(inicio))
  const minutos = p.hora * 60 + p.minuto
  const dentro = (VENTANAS[p.diaSemana] || []).some(
    ([ini, fin]) => minutos >= ini && minutos + DURACION_MIN <= fin,
  )
  if (!dentro) return { ok: false, motivo: 'Ese horario queda fuera del horario de atención.' }

  const termino = inicio + DURACION_MIN * 60000
  const colchonMs = COLCHON_MIN * 60000
  const chocado = ocupados.some((o) =>
    solapa(inicio - colchonMs, termino + colchonMs, o.inicio, o.fin),
  )
  if (chocado) return { ok: false, motivo: 'Alguien tomó ese horario recién. Elige otro.' }

  return { ok: true, inicio, termino }
}
