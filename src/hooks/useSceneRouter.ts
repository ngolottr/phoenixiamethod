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
 * El sitio va en dos tiempos, y cada uno tiene su propia marca.
 *
 * `negocio` es PHOENIX IA METHOD: lo que un cliente viene a buscar —qué
 * problema se le resuelve, con qué método y cómo empezar—. Es el frente del
 * sitio y manda en la portada, en la barra y en la paleta.
 *
 * `marca` es MARKETING: Nicolás Golott y su marca personal ElGolott. Quién
 * está detrás, qué publica y dónde encontrarlo. Va después a propósito — a
 * nadie le importa tu biografía antes de saber si le sirves— y cambia de piel
 * al entrar, porque es una marca distinta, no una sección más.
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
  { id: 'trabajo', label: 'Soluciones', num: '02', bloque: 'negocio' },
  { id: 'contacto', label: 'Contacto', num: '03', bloque: 'negocio' },
  { id: 'manifiesto', label: 'Método', num: '04', bloque: 'negocio' },
  { id: 'sobre-mi', label: 'Sobre mí', num: '05', bloque: 'marca' },
  { id: 'redes', label: 'Redes', num: '06', bloque: 'marca' },
  { id: 'galeria', label: 'Galería', num: '07', bloque: 'marca' },
  { id: 'destacados', label: 'Destacados', num: '08', bloque: 'marca' },
]

/* Los identificadores de escena NO cambian aunque cambien las etiquetas: son
   lo que va en la URL y lo que ya está compartido por ahí. Un enlace a
   #trabajo tiene que seguir abriendo la escena de soluciones. */

export const BLOQUES: Record<Bloque, { titulo: string; marca: string; pie: string }> = {
  negocio: {
    titulo: 'Phoenix IA Method',
    marca: 'Phoenix IA Method',
    pie: 'Qué problema resuelvo y cómo empezamos',
  },
  marca: {
    titulo: 'Marketing',
    marca: 'ElGolott',
    pie: 'Quién está detrás: Nicolás Golott',
  },
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
    /* El título sigue al bloque: en la parte comercial la pestaña dice
       Phoenix, y en la personal dice ElGolott. Quien deje diez pestañas
       abiertas tiene que poder distinguir de cuál de las dos marcas es cada
       una sin abrirlas. */
    const s = SCENES[index]
    document.title =
      index === 0
        ? 'Phoenix IA Method — IA y automatización aplicadas'
        : `${s.label} · ${BLOQUES[s.bloque].marca}`
  }, [index])

  useEffect(() => {
    const onHash = () => setIndex(indexFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => clearTimers, [])

  return { index, scene: SCENES[index], direction, wiping, go, goTo, next, prev, home }
}
