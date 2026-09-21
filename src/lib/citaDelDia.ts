import type { Cita } from '../data/citas'

/* ============================================================================
   LA FRASE DE HOY
   ----------------------------------------------------------------------------
   No hay servidor, ni base de datos, ni tarea programada que "publique" la
   frase de cada día. La frase sale de una cuenta: cuántos días pasaron desde
   el lanzamiento, y ese número elige una posición de la lista. Como la cuenta
   es la misma para todos, todo el mundo ve la misma frase el mismo día, y como
   la lista se recorre en orden, ninguna se repite hasta que se acaba.

   EL DÍA SE CUENTA EN HORA DE CHILE. Si se contara con el reloj de cada
   visitante, alguien en México vería la frase de mañana y alguien en España la
   de ayer. Con una zona fija, la frase cambia a la medianoche de Santiago para
   todos por igual.

   LA LISTA SOLO CRECE POR EL FINAL. Cada frase ya publicada mantiene su día:
   si se agregaran al principio o en medio, correrían todas las de después y se
   repetiría una que ya salió. Por eso `data/citas.ts` se agrega siempre abajo.

   ESTE ARCHIVO NO IMPORTA LOS DATOS, los recibe. Así el banco de frases (que
   pesa bastante más que el resto de la escena) puede cargarse aparte, solo
   cuando alguien llega al Método, en vez de viajar dentro del código de todas
   las visitas. También lo usa `scripts/citas-revisar.mjs` desde Node.
   ========================================================================== */

const ZONA = 'America/Santiago'

/** Lo que necesita la cuenta del banco de frases. */
export type BancoDeCitas = { citas: Cita[]; LANZAMIENTO: string }

/** Hoy en Chile como `2026-09-21`. El formato en-CA ya viene ordenado año-mes-día. */
export function fechaEnChile(ahora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora)
}

/**
 * "21 de septiembre", para el rótulo de la pantalla.
 *
 * Sale de la MISMA fecha que elige la frase, no de un reloj aparte: si una
 * mostrara "21" y la otra ya hubiera pasado al 22, el rótulo y la cita se
 * contradirían durante los minutos que dura el cambio. Se fija al mediodía UTC
 * para que ninguna zona horaria pueda correr el día.
 */
export function fechaLarga(fecha: string = fechaEnChile()): string {
  return new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(`${fecha}T12:00:00Z`))
}

/** Días transcurridos entre dos fechas `AAAA-MM-DD`, contados en días enteros. */
export function diasEntre(desde: string, hasta: string): number {
  const dia = (iso: string) => {
    const [a, m, d] = iso.split('-').map(Number)
    return Date.UTC(a, m - 1, d) / 86_400_000
  }
  return Math.round(dia(hasta) - dia(desde))
}

export type FraseDelDia = {
  cita: Cita
  /** Cuántos días lleva la serie: 1 el día del lanzamiento. */
  numero: number
  /** 1 mientras no se haya repetido ninguna; 2 en cuanto se acabó la lista y volvió a empezar. */
  vuelta: number
  /** Cuántos días quedan antes de que empiece a repetirse. */
  restantes: number
}

export function fraseDelDia(banco: BancoDeCitas, fecha: string = fechaEnChile()): FraseDelDia {
  const n = banco.citas.length
  // Antes del lanzamiento (un reloj adelantado, una prueba) se muestra la primera.
  const dia = Math.max(0, diasEntre(banco.LANZAMIENTO, fecha))
  return {
    cita: banco.citas[dia % n],
    numero: dia + 1,
    vuelta: Math.floor(dia / n) + 1,
    restantes: Math.max(0, n - dia - 1),
  }
}
