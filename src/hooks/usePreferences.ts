import { useCallback, useEffect, useState } from 'react'

const MOTION_KEY = 'elgolott:motion'
const CURSOR_KEY = 'elgolott:cursor'

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

/**
 * Preferencias de experiencia: reducir movimiento y cursor personalizado.
 * El valor inicial de "reducir movimiento" respeta prefers-reduced-motion
 * del sistema; el interruptor de la interfaz lo puede sobrescribir.
 */
export function usePreferences() {
  const [reduced, setReduced] = useState<boolean>(() => {
    const saved = readStored(MOTION_KEY)
    if (saved === 'reduced') return true
    if (saved === 'full') return false
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  })

  const [customCursor, setCustomCursor] = useState<boolean>(() => {
    const saved = readStored(CURSOR_KEY)
    if (saved === 'off') return false
    if (saved === 'on') return true
    return typeof window !== 'undefined'
      ? window.matchMedia('(pointer: fine)').matches
      : false
  })

  useEffect(() => {
    document.documentElement.dataset.motion = reduced ? 'reduced' : 'full'
    store(MOTION_KEY, reduced ? 'reduced' : 'full')
  }, [reduced])

  useEffect(() => {
    document.documentElement.dataset.cursor = customCursor ? 'on' : 'off'
    store(CURSOR_KEY, customCursor ? 'on' : 'off')
  }, [customCursor])

  const toggleMotion = useCallback(() => setReduced((v) => !v), [])
  const toggleCursor = useCallback(() => setCustomCursor((v) => !v), [])

  return { reduced, customCursor, toggleMotion, toggleCursor }
}

/**
 * En móviles la barra de direcciones cambia el 100vh real.
 * Esto fija una variable --vh con la altura útil verdadera.
 */
export function useViewportHeight() {
  useEffect(() => {
    const set = () => {
      document.documentElement.style.setProperty('--vh', `${window.innerHeight}px`)
    }
    set()
    window.addEventListener('resize', set)
    window.addEventListener('orientationchange', set)
    return () => {
      window.removeEventListener('resize', set)
      window.removeEventListener('orientationchange', set)
    }
  }, [])
}
