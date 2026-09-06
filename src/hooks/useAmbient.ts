import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ambientFromSrc, type Ambient } from '../lib/color'

type AmbientApi = {
  /** tiñe todo el sitio con el color dominante de esa foto */
  paint: (src: string) => void
  /** vuelve a la paleta base de la marca */
  reset: () => void
  active: boolean
}

export const AmbientContext = createContext<AmbientApi>({
  paint: () => {},
  reset: () => {},
  active: false,
})

export const useAmbientApi = () => useContext(AmbientContext)

const VARS: Array<[keyof Ambient, string]> = [
  ['bg', '--amb-bg'],
  ['bg2', '--amb-bg2'],
  ['accent', '--amb-accent'],
  ['glow', '--amb-glow'],
  ['ink', '--amb-ink'],
]

/**
 * Estado global del color ambiente. Al pulsar una foto, el sitio entero
 * (fondo, halo, acentos, bordes, foco) adopta el color que domina esa imagen.
 */
export function useAmbientProvider(): AmbientApi {
  const [active, setActive] = useState(false)
  const token = useRef(0)

  const apply = useCallback((amb: Ambient | null) => {
    const root = document.documentElement
    if (!amb) {
      VARS.forEach(([, cssVar]) => root.style.removeProperty(cssVar))
      root.dataset.ambient = 'off'
      return
    }
    VARS.forEach(([key, cssVar]) => root.style.setProperty(cssVar, String(amb[key])))
    root.dataset.ambient = 'on'
  }, [])

  const paint = useCallback(
    (src: string) => {
      const id = ++token.current
      ambientFromSrc(src).then((amb) => {
        // si mientras tanto se pidió otra foto (o el reset), esta ya no vale
        if (id !== token.current) return
        apply(amb)
        setActive(true)
      })
    },
    [apply],
  )

  const reset = useCallback(() => {
    token.current++
    apply(null)
    setActive(false)
  }, [apply])

  useEffect(() => () => apply(null), [apply])

  return { paint, reset, active }
}
