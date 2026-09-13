import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ambientFromSrc, ambientFromVideo, type Ambient } from '../lib/color'

type AmbientApi = {
  /** tiñe todo el sitio con el color dominante de esa foto */
  paint: (src: string) => void
  /** lo mismo, pero leyendo el cuadro actual de un video */
  paintFromVideo: (video: HTMLVideoElement) => void
  /** vuelve a la paleta base de la marca */
  reset: () => void
  active: boolean
}

export const AmbientContext = createContext<AmbientApi>({
  paint: () => {},
  paintFromVideo: () => {},
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
/**
 * En modo claro solo se adopta el acento, y oscurecido para que contraste
 * contra el papel. Los colores salen de fotos oscuras: dejarlos pintar el
 * fondo apagaría el modo claro en cuanto alguien abre la galería.
 */
function varsParaTema(): Array<[keyof Ambient, string]> {
  const claro = document.documentElement.dataset.theme === 'light'
  return claro ? VARS.filter(([key]) => key === 'accent') : VARS
}

function valorParaTema(key: keyof Ambient, valor: string): string {
  if (key === 'accent' && document.documentElement.dataset.theme === 'light') {
    /* Con qué se oscurece lo pone el bloque, no esta función: en Phoenix el
       acento se apaga hacia el ladrillo y en ElGolott hacia el verde profundo.
       Un valor fijo aquí teñía de marrón las fotos del bloque personal. */
    return `color-mix(in srgb, ${valor} 55%, var(--mezcla-claro))`
  }
  return valor
}

export function useAmbientProvider(): AmbientApi {
  const [active, setActive] = useState(false)
  const token = useRef(0)
  /** el último ambiente aplicado, para poder repintarlo si cambia el tema */
  const ultimo = useRef<Ambient | null>(null)

  const apply = useCallback((amb: Ambient | null) => {
    const root = document.documentElement
    ultimo.current = amb
    // Siempre se limpian TODAS: al pasar de oscuro a claro hay que soltar las
    // que el tema anterior había fijado y este ya no usa.
    VARS.forEach(([, cssVar]) => root.style.removeProperty(cssVar))
    if (!amb) {
      root.dataset.ambient = 'off'
      return
    }
    varsParaTema().forEach(([key, cssVar]) =>
      root.style.setProperty(cssVar, valorParaTema(key, String(amb[key]))),
    )
    root.dataset.ambient = 'on'
  }, [])

  // Si el visitante cambia de tema con una foto pintando, se repinta con las
  // reglas del tema nuevo en vez de quedarse con las del anterior.
  useEffect(() => {
    const root = document.documentElement
    const obs = new MutationObserver(() => {
      if (ultimo.current) apply(ultimo.current)
    })
    obs.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [apply])

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

  const paintFromVideo = useCallback(
    (video: HTMLVideoElement) => {
      const amb = ambientFromVideo(video)
      if (!amb) return
      token.current++
      apply(amb)
      setActive(true)
    },
    [apply],
  )

  const reset = useCallback(() => {
    token.current++
    apply(null)
    setActive(false)
  }, [apply])

  useEffect(() => () => apply(null), [apply])

  return { paint, paintFromVideo, reset, active }
}
