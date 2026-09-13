import { useEffect, useState } from 'react'
import { Isotipo } from './Isotipo'
import { phoenix } from '../data/site'

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
        {/* Lo primero de lo primero es la marca del negocio, entera: el
            emblema y el nombre. Dos segundos y medio es todo lo que hay para
            que alguien sepa a dónde llegó. */}
        <Isotipo className="intro-isotipo" />
        <div className="intro-mark">
          {phoenix.nameLine1} <em>{phoenix.nameLine2}</em>
        </div>
        <div className="intro-bar" />
      </div>
    </div>
  )
}
