import { useCallback, useEffect, useRef } from 'react'

/* ============================================================================
   AUDIO DEL SITIO
   ----------------------------------------------------------------------------
   Dos piezas: la cama lofi que acompaña todo el recorrido y el portal que suena
   al pasar de verso en el manifiesto. Las dos son archivos sintetizados que se
   rindieron una sola vez —sin copyright que reclamar— y que el navegador se
   limita a decodificar.

   La regla que manda acá es el equipo modesto. Mientras el efecto está apagado
   NO se descarga nada, no hay elemento en el documento y no queda nada
   escuchando: `preload="none"` y el elemento se crea recién al encender. Un
   efecto apagado no debe costar ni un byte.

   Y todo arranca apagado, que además resuelve el otro problema: los navegadores
   bloquean el sonido automático. Como encender es un clic del visitante, la
   reproducción nace de un gesto suyo y ninguna política la frena.
   ========================================================================== */

const RUTA_MUSICA = 'audio/lofi.mp3'
const RUTA_PORTAL = ['audio/portal-1.mp3', 'audio/portal-2.mp3', 'audio/portal-3.mp3']

/** Bajo, para que acompañe sin taparle la voz a nada. */
const VOL_MUSICA = 0.28
const VOL_PORTAL = 0.42
/** Subida y bajada suaves: cortar en seco un loop se oye como un tropiezo. */
const FUNDIDO_MS = 900

function fundir(el: HTMLAudioElement, hasta: number, ms: number, alTerminar?: () => void) {
  const desde = el.volume
  const t0 = performance.now()
  const paso = () => {
    const p = Math.min(1, (performance.now() - t0) / ms)
    el.volume = Math.max(0, Math.min(1, desde + (hasta - desde) * p))
    if (p < 1) requestAnimationFrame(paso)
    else alTerminar?.()
  }
  requestAnimationFrame(paso)
}

/**
 * La cama lofi. Vive fuera de React —un solo elemento, creado a mano— para que
 * ningún cambio de escena la reinicie: el recorrido cambia, la música no.
 */
export function useMusica(activa: boolean) {
  const ref = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    if (activa) {
      let el = ref.current
      if (!el) {
        el = new Audio(RUTA_MUSICA)
        el.loop = true
        el.preload = 'auto'
        el.volume = 0
        ref.current = el
      }
      // Nace de un clic en Ajustes, así que la política de reproducción la deja
      // pasar. Si aun así se bloquea, se ignora en silencio y el interruptor
      // queda encendido para el próximo intento.
      el.play().then(
        () => fundir(el!, VOL_MUSICA, FUNDIDO_MS),
        () => {},
      )
      return
    }

    const el = ref.current
    if (!el) return
    fundir(el, 0, 420, () => {
      el.pause()
      el.removeAttribute('src')
      el.load()               // suelta el búfer en vez de dejarlo en memoria
      ref.current = null
    })
  }, [activa])

  // Al salir de la página no queda nada sonando ni reservado
  useEffect(
    () => () => {
      const el = ref.current
      if (!el) return
      el.pause()
      el.removeAttribute('src')
      el.load()
      ref.current = null
    },
    [],
  )
}

/**
 * El portal del manifiesto.
 *
 * Devuelve una función para llamar DENTRO del manejador del clic, no desde un
 * efecto: así el sonido cuelga del gesto del visitante y el navegador nunca lo
 * bloquea. Los tres archivos se precargan solo cuando el efecto está encendido,
 * y se sueltan al apagarlo.
 */
export function usePortal(activo: boolean) {
  const pool = useRef<HTMLAudioElement[]>([])
  const turno = useRef(0)

  useEffect(() => {
    if (activo) {
      if (pool.current.length === 0) {
        pool.current = RUTA_PORTAL.map((src) => {
          const a = new Audio(src)
          a.preload = 'auto'
          a.volume = VOL_PORTAL
          return a
        })
      }
      return
    }
    pool.current.forEach((a) => {
      a.pause()
      a.removeAttribute('src')
      a.load()
    })
    pool.current = []
  }, [activo])

  useEffect(
    () => () => {
      pool.current.forEach((a) => {
        a.pause()
        a.removeAttribute('src')
        a.load()
      })
      pool.current = []
    },
    [],
  )

  return useCallback(() => {
    const lista = pool.current
    if (lista.length === 0) return
    // Uno distinto cada vez: tres versos seguidos no suenan idénticos.
    const a = lista[turno.current % lista.length]
    turno.current += 1
    try {
      a.currentTime = 0
      void a.play().catch(() => {})
    } catch {
      /* el archivo aún no está listo: el verso cambia igual, sin sonido */
    }
  }, [])
}
