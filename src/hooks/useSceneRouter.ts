import { useCallback, useEffect, useRef, useState } from 'react'

export type SceneId =
  | 'inicio'
  | 'sobre-mi'
  | 'galeria'
  | 'destacados'
  | 'trabajo'
  | 'manifiesto'
  | 'contacto'
  | 'redes'

export type SceneDef = {
  id: SceneId
  label: string
  num: string
}

export const SCENES: SceneDef[] = [
  { id: 'inicio', label: 'Inicio', num: '01' },
  { id: 'sobre-mi', label: 'Sobre mí', num: '02' },
  { id: 'galeria', label: 'Galería', num: '03' },
  { id: 'destacados', label: 'Destacados', num: '04' },
  { id: 'trabajo', label: 'Trabajo', num: '05' },
  { id: 'manifiesto', label: 'Manifiesto', num: '06' },
  { id: 'contacto', label: 'Contacto', num: '07' },
  { id: 'redes', label: 'Redes', num: '08' },
]

function indexFromHash(): number {
  const hash = window.location.hash.replace('#', '')
  const found = SCENES.findIndex((s) => s.id === hash)
  return found >= 0 ? found : 0
}

/**
 * Navegación por escenas basada en estado, sin scroll y sin router externo.
 * La cortina de transición ocupa la mitad del tiempo antes del cambio real,
 * de manera que el corte de escena queda oculto tras el barrido.
 */
export function useSceneRouter(reduced: boolean) {
  const [index, setIndex] = useState<number>(() => indexFromHash())
  const [direction, setDirection] = useState<1 | -1>(1)
  const [wiping, setWiping] = useState(false)
  const pending = useRef<number | null>(null)
  const timers = useRef<number[]>([])

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const go = useCallback(
    (target: number) => {
      const next = Math.max(0, Math.min(SCENES.length - 1, target))
      if (next === index || pending.current !== null) return

      setDirection(next > index ? 1 : -1)

      if (reduced) {
        setIndex(next)
        return
      }

      pending.current = next
      setWiping(true)
      timers.current.push(
        window.setTimeout(() => setIndex(next), 230),
        window.setTimeout(() => {
          setWiping(false)
          pending.current = null
        }, 480),
      )
    },
    [index, reduced],
  )

  const goTo = useCallback(
    (id: SceneId) => {
      const target = SCENES.findIndex((s) => s.id === id)
      if (target >= 0) go(target)
    },
    [go],
  )

  const next = useCallback(() => go(index + 1), [go, index])
  const prev = useCallback(() => go(index - 1), [go, index])
  const home = useCallback(() => go(0), [go])

  // Sincroniza la URL (permite compartir y volver con el botón atrás del navegador)
  useEffect(() => {
    const id = SCENES[index].id
    if (window.location.hash.replace('#', '') !== id) {
      window.history.replaceState(null, '', `#${id}`)
    }
    document.title = index === 0 ? 'ELGOLOTT — Dirección creativa' : `${SCENES[index].label} · ELGOLOTT`
  }, [index])

  useEffect(() => {
    const onHash = () => setIndex(indexFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => clearTimers, [])

  return { index, scene: SCENES[index], direction, wiping, go, goTo, next, prev, home }
}
