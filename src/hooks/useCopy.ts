import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Copia texto al portapapeles con respaldo para navegadores antiguos
 * o contextos sin permisos, y expone un estado para el feedback visual.
 */
export function useCopy(resetAfter = 2200) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)

  const copy = useCallback(
    async (text: string) => {
      let ok = false
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text)
          ok = true
        } else {
          const el = document.createElement('textarea')
          el.value = text
          el.setAttribute('readonly', '')
          el.style.position = 'fixed'
          el.style.opacity = '0'
          document.body.appendChild(el)
          el.select()
          ok = document.execCommand('copy')
          document.body.removeChild(el)
        }
      } catch {
        ok = false
      }

      if (ok) {
        setCopied(true)
        if (timer.current) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => setCopied(false), resetAfter)
      }
      return ok
    },
    [resetAfter],
  )

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  return { copied, copy }
}
