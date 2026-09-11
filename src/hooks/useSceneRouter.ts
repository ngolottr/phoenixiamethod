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

/**
 * El sitio va en dos tiempos.
 *
 * `negocio` es lo que un cliente viene a buscar: qué hago, cómo contratarme y
 * bajo qué criterio trabajo. `marca` es quién está detrás, y solo tiene sentido
 * después de lo anterior — a nadie le importa tu biografía antes de saber si le
 * sirves. Por eso el orden no es decorativo: el recorrido vende primero y se
 * presenta después.
 */
export type Bloque = 'negocio' | 'marca'

export type SceneDef = {
  id: SceneId
  label: string
  num: string
  bloque: Bloque
}

export const SCENES: SceneDef[] = [
  { id: 'inicio', label: 'Inicio', num: '01', bloque: 'negocio' },
  { id: 'trabajo', label: 'Trabajo', num: '02', bloque: 'negocio' },
  { id: 'contacto', label: 'Contacto', num: '03', bloque: 'negocio' },
  { id: 'manifiesto', label: 'Manifiesto', num: '04', bloque: 'negocio' },
  { id: 'sobre-mi', label: 'Sobre mí', num: '05', bloque: 'marca' },
  { id: 'redes', label: 'Redes', num: '06', bloque: 'marca' },
  { id: 'galeria', label: 'Galería', num: '07', bloque: 'marca' },
  { id: 'destacados', label: 'Destacados', num: '08', bloque: 'marca' },
]

export const BLOQUES: Record<Bloque, { titulo: string; pie: string }> = {
  negocio: { titulo: 'Negocio', pie: 'Qué hago y cómo contratarme' },
  marca: { titulo: 'Quién soy', pie: 'Con quién estás trabajando' },
}

/** Primera escena de cada bloque: a dónde salta "Entrar" y el paso entre bloques. */
export const INICIO_DE_BLOQUE: Record<Bloque, SceneId> = {
  negocio: 'trabajo',
  marca: 'sobre-mi',
}

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
