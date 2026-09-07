import { useCallback, useEffect, useState } from 'react'

const MOTION_KEY = 'elgolott:motion'
const CURSOR_KEY = 'elgolott:cursor'
const DRAG_KEY = 'elgolott:drag'
const THEME_KEY = 'elgolott:theme'

export type Theme = 'dark' | 'light'

function readStored(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* modo privado o almacenamiento bloqueado: se ignora sin romper nada */
  }
}

function media(query: string): boolean {
  return typeof window !== 'undefined' && window.matchMedia(query).matches
}

/**
 * Preferencias de experiencia.
 *
 * REGLA DE ARRANQUE: los efectos vienen APAGADOS. No todos los visitantes
 * tienen un equipo potente, y el sitio tiene que abrir rápido y verse bien
 * en cualquier máquina antes que lucirse. Cada efecto lo enciende el visitante
 * desde la barra superior, y su elección queda guardada para la próxima visita.
 *
 * El tema sí respeta al sistema la primera vez: alguien que navega en claro a
 * pleno día no debería recibir una pantalla negra por defecto.
 */
export function usePreferences() {
  // Movimiento: animaciones de entrada, cortinas, halos, grano.
  const [reduced, setReduced] = useState<boolean>(() => {
    const saved = readStored(MOTION_KEY)
    if (saved === 'reduced') return true
    if (saved === 'full') return false
    return true
  })

  // Cursor propio (el punto y el anillo que persiguen al puntero).
  const [customCursor, setCustomCursor] = useState<boolean>(() => {
    return readStored(CURSOR_KEY) === 'on'
  })

  // Arrastre: la estela de ondas que deja el puntero al pulsar y arrastrar.
  const [drag, setDrag] = useState<boolean>(() => {
    return readStored(DRAG_KEY) === 'on'
  })

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = readStored(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return media('(prefers-color-scheme: light)') ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
    store(MOTION_KEY, reduced ? 'reduced' : 'full')
  }, [reduced])

  useEffect(() => {
    document.documentElement.dataset.cursor = customCursor ? 'on' : 'off'
    store(CURSOR_KEY, customCursor ? 'on' : 'off')
  }, [customCursor])

  useEffect(() => {
    document.documentElement.dataset.drag = drag ? 'on' : 'off'
    store(DRAG_KEY, drag ? 'on' : 'off')
  }, [drag])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    store(THEME_KEY, theme)
    // La barra del navegador en el teléfono se pinta con esto.
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', theme === 'light' ? '#F1F5F1' : '#040D0A')
  }, [theme])

  const toggleMotion = useCallback(() => setReduced((v) => !v), [])
  const toggleCursor = useCallback(() => setCustomCursor((v) => !v), [])
  const toggleDrag = useCallback(() => setDrag((v) => !v), [])
  const toggleTheme = useCallback(
    () => setTheme((v) => (v === 'dark' ? 'light' : 'dark')),
    [],
  )

  return {
    reduced,
    customCursor,
    drag,
    theme,
    toggleMotion,
    toggleCursor,
    toggleDrag,
    toggleTheme,
  }
}

/**
 * En móviles la barra de direcciones cambia el 100vh real.
 * Esto fija una variable --vh con la altura útil verdadera.
 */
export function useViewportHeight() {
  useEffect(() => {
    let ultimo = -1
    let raf = 0

    /* La ventana visual: lo que el visitante ve de verdad, ya descontado el
       teclado. En iOS, window.innerHeight NO cambia al abrirse el teclado, así
       que el sitio seguía creyendo que tenía toda la pantalla: el panel del
       formulario terminaba de desplazarse detrás del teclado y al botón de
       enviar no había forma de llegar. */
    const visual = window.visualViewport

    const medir = () => {
      raf = 0
      // Al hacer zoom con dos dedos la ventana visual se achica sin que haya
      // teclado alguno; ahí no se toca nada o el sitio se reacomodaría solo.
      if (visual && visual.scale > 1.05) return

      const alto = Math.round(visual ? visual.height : window.innerHeight)
      // En el teléfono, resize se dispara al aparecer y desaparecer la barra de
      // direcciones. Si el alto no cambió no se toca la variable: escribirla
      // obliga a recalcular el estilo de toda la página.
      if (alto === ultimo) return
      ultimo = alto
      document.documentElement.style.setProperty('--vh', `${alto}px`)
    }

    // Un cuadro de espera agrupa la ráfaga de eventos que manda el navegador
    // mientras se arrastra el borde de la ventana.
    const pedir = () => {
      if (!raf) raf = requestAnimationFrame(medir)
    }

    medir()
    window.addEventListener('resize', pedir, { passive: true })
    window.addEventListener('orientationchange', pedir, { passive: true })
    visual?.addEventListener('resize', pedir)
    return () => {
      if (raf) cancelAnimationFrame(raf)
      window.removeEventListener('resize', pedir)
      window.removeEventListener('orientationchange', pedir)
      visual?.removeEventListener('resize', pedir)
    }
  }, [])
}
