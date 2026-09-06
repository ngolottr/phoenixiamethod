import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

export type SpellPoint = { id: number; x: number; y: number }

const CHISPAS = 22
const DURACION = 1100

/**
 * El conjuro: al pulsar una fotografía, del punto exacto del dedo salen chispas
 * que se dispersan, un anillo de energía que se abre y un destello que colapsa.
 * Es lo que antecede a que la imagen se materialice en el visor.
 *
 * Cada chispa recibe su ángulo, distancia y retardo como variables CSS, así la
 * animación completa la resuelve el navegador y no JavaScript.
 */
export function Spell({ point, onDone }: { point: SpellPoint | null; onDone: () => void }) {
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!point) return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(onDone, DURACION)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [point, onDone])

  if (!point) return null

  const chispas = Array.from({ length: CHISPAS }, (_, i) => {
    // reparto parejo con una pizca de azar, para que no parezca un reloj
    const angulo = (360 / CHISPAS) * i + (Math.random() * 18 - 9)
    const distancia = 90 + Math.random() * 190
    return {
      i,
      style: {
        '--a': `${angulo}deg`,
        '--d': `${distancia}px`,
        '--s': `${2 + Math.random() * 3.5}px`,
        '--delay': `${Math.random() * 90}ms`,
        '--dur': `${620 + Math.random() * 380}ms`,
      } as React.CSSProperties,
    }
  })

  return createPortal(
    <div className="spell" style={{ left: point.x, top: point.y }} aria-hidden="true" key={point.id}>
      <span className="spell-flash" />
      <span className="spell-ring" />
      <span className="spell-ring two" />
      {chispas.map((c) => (
        <span key={c.i} className="spell-spark" style={c.style} />
      ))}
    </div>,
    document.body,
  )
}

/** Guarda el punto del último conjuro y lo limpia cuando termina. */
export function useSpell() {
  const [point, setPoint] = useState<SpellPoint | null>(null)
  const seq = useRef(0)

  const cast = (e: { clientX: number; clientY: number }) => {
    if (document.documentElement.dataset.motion === 'reduced') return
    setPoint({ id: seq.current++, x: e.clientX, y: e.clientY })
  }

  const clear = () => setPoint(null)

  return { point, cast, clear }
}
