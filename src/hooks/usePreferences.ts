import { useCallback, useEffect, useState } from 'react'

const THEME_KEY = 'phoenix:theme'

export type Theme = 'dark' | 'light'

/**
 * Pinta la barra del navegador del teléfono con el fondo que el sitio tenga
 * puesto en ese momento.
 *
 * No lleva ninguna lista de colores: lee el token `--brasa` ya resuelto, así
 * que acierta con las cuatro combinaciones —Phoenix y ElGolott, en claro y en
 * oscuro— sin que haya que acordarse de actualizarla cada vez que cambie una
 * paleta. Por eso la llaman tanto el cambio de tema como el cambio de bloque.
 */
export function pintarBarraDelNavegador() {
  const meta = document.querySelector('meta[name="theme-color"]')
  if (!meta) return
  const fondo = getComputedStyle(document.documentElement).getPropertyValue('--brasa').trim()
  if (fondo) meta.setAttribute('content', fondo)
}

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
 * El sitio corre siempre en su versión sobria y profesional: sin animaciones
 * de entrada, sin arrastre, sin música ni sonidos de interfaz. Nada de eso es
 * una opción del visitante. Lo único que queda encendido de forma permanente
 * es el cursor propio (en escritorio, donde hay puntero fino) y las ondas al
 * hacer clic: tampoco son una opción, son parte fija de la identidad.
 *
 * El tema sí es una elección real —claro u oscuro— y respeta al sistema la
 * primera vez: alguien que navega en claro a pleno día no debería recibir una
 * pantalla negra por defecto.
 */
export function usePreferences() {
  const reduced = true
  const customCursor = true

  const [theme, setTheme] = useState<Theme>(() => {
    const saved = readStored(THEME_KEY)
    if (saved === 'light' || saved === 'dark') return saved
    return media('(prefers-color-scheme: light)') ? 'light' : 'dark'
  })

  useEffect(() => {
    document.documentElement.dataset.motion = 'reduced'
    document.documentElement.dataset.cursor = 'on'
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    store(THEME_KEY, theme)
    pintarBarraDelNavegador()
  }, [theme])

  const toggleTheme = useCallback(
    () => setTheme((v) => (v === 'dark' ? 'light' : 'dark')),
    [],
  )

  return {
    reduced,
    customCursor,
    theme,
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
