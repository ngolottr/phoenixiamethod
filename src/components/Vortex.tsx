import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Capas del túnel. Más capas = más profundidad, pero más trabajo para el navegador. */
const CAPAS = 10
export const VORTICE_MS = 1250

/**
 * El vórtice de panal: diez planos hexagonales que vienen desde el fondo hacia
 * el espectador girando, como si uno fuera atravesando el interior de un panal.
 * Sirve de puente entre la escena de trabajo y el formulario: la sensación es
 * que entras, no que cambias de página.
 *
 * Es CSS con perspectiva; no hay canvas ni librería 3D de por medio.
 */
export function Vortex({ activo, onDone }: { activo: boolean; onDone: () => void }) {
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (!activo) return
    const reducido = document.documentElement.dataset.motion === 'reduced'
    timer.current = window.setTimeout(onDone, reducido ? 60 : VORTICE_MS)
    return () => {
      if (timer.current) window.clearTimeout(timer.current)
    }
  }, [activo, onDone])

  if (!activo) return null

  return createPortal(
    <div className="vortex" aria-hidden="true">
      <div className="vortex-tunnel">
        {Array.from({ length: CAPAS }, (_, i) => (
          <span
            key={i}
            className="vortex-layer"
            style={
              {
                '--i': i,
                '--delay': `${i * 70}ms`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
      <span className="vortex-core" />
    </div>,
    document.body,
  )
}
