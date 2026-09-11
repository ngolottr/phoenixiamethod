import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/** Capas del túnel. Más capas = más profundidad, pero más trabajo para el navegador. */
const CAPAS = 10
/**
 * En teléfono van menos.
 *
 * Cada capa es una superficie que el navegador tiene que pintar y guardar
 * aparte, y diez a la vez fue lo que tumbó el sitio en el navegador interno de
 * Instagram. Cuatro alcanzan de sobra para que se lea como un túnel: lo que da
 * la sensación de profundidad es el desfase entre una y otra, no la cantidad.
 */
const CAPAS_TELEFONO = 4
export const VORTICE_MS = 1250

function cuantasCapas() {
  if (typeof window === 'undefined') return CAPAS
  return window.matchMedia('(max-width: 760px), (pointer: coarse)').matches
    ? CAPAS_TELEFONO
    : CAPAS
}

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
        {Array.from({ length: cuantasCapas() }, (_, i) => (
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
