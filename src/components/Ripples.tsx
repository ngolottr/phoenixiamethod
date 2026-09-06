import { useEffect, useRef, useState } from 'react'

type Drop = { id: number; x: number; y: number }

/** Cuántas gotas pueden convivir en pantalla antes de descartar las más viejas. */
const MAX_DROPS = 6
/** Debe cubrir la onda más lenta: retardo del último anillo + su duración. */
const LIFETIME = 1500

/**
 * Ondas de agua al pulsar: tres anillos concéntricos que nacen del punto exacto
 * del clic con retardo creciente, más un núcleo que marca el impacto de la gota.
 * Se dispara con pointerdown para que la respuesta sea inmediata al tacto,
 * y desaparece por completo en modo "reducir movimiento".
 */
export function Ripples({ enabled }: { enabled: boolean }) {
  const [drops, setDrops] = useState<Drop[]>([])
  const seq = useRef(0)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (!enabled) {
      setDrops([])
      return
    }

    const onDown = (e: PointerEvent) => {
      // Solo el botón principal (o cualquier toque): el clic derecho no salpica.
      if (e.pointerType === 'mouse' && e.button !== 0) return

      const drop: Drop = { id: seq.current++, x: e.clientX, y: e.clientY }
      setDrops((prev) => [...prev, drop].slice(-MAX_DROPS))

      const t = window.setTimeout(() => {
        setDrops((prev) => prev.filter((d) => d.id !== drop.id))
        timers.current = timers.current.filter((x) => x !== t)
      }, LIFETIME)
      timers.current.push(t)
    }

    window.addEventListener('pointerdown', onDown, { passive: true })
    return () => window.removeEventListener('pointerdown', onDown)
  }, [enabled])

  useEffect(
    () => () => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
    },
    [],
  )

  if (!enabled || drops.length === 0) return null

  return (
    <div className="ripples" aria-hidden="true">
      {drops.map((d) => (
        <span className="ripple" key={d.id} style={{ left: d.x, top: d.y }}>
          <i className="ring r1" />
          <i className="ring r2" />
          <i className="ring r3" />
          <i className="core" />
        </span>
      ))}
    </div>
  )
}
