import { useEffect, useState } from 'react'
import { brand } from '../data/site'

/** Telón de apertura: 2,5 segundos y desaparece. No se muestra si se redujo el movimiento. */
export function Intro({ reduced }: { reduced: boolean }) {
  const [done, setDone] = useState(reduced)

  useEffect(() => {
    if (reduced) return
    const t = window.setTimeout(() => setDone(true), 2500)
    return () => window.clearTimeout(t)
  }, [reduced])

  if (done) return null

  return (
    <div className="intro" aria-hidden="true">
      <div>
        <div className="intro-mark">
          {brand.nameLine1}
          <em>{brand.nameLine2}</em>
        </div>
        <div className="intro-bar" />
      </div>
    </div>
  )
}
