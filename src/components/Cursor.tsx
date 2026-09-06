import { useEffect, useRef } from 'react'

/**
 * Cursor personalizado: un punto que sigue exacto y un anillo que llega tarde.
 * El anillo crece sobre cualquier elemento interactivo.
 * Solo se monta si el usuario lo tiene activado y usa un puntero fino.
 */
export function Cursor({ enabled }: { enabled: boolean }) {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!enabled) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let raf = 0
    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const eased = { ...target }

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX
      target.y = e.clientY
      if (dot.current) dot.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`

      const el = e.target as HTMLElement | null
      const hot = !!el?.closest('a, button, [role="button"], input, textarea')
      ring.current?.classList.toggle('is-hot', hot)
    }

    const loop = () => {
      eased.x += (target.x - eased.x) * 0.16
      eased.y += (target.y - eased.y) * 0.16
      if (ring.current) {
        ring.current.style.transform = `translate(${eased.x.toFixed(2)}px, ${eased.y.toFixed(2)}px)`
      }
      raf = requestAnimationFrame(loop)
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <>
      <div ref={ring} className="cursor-ring" aria-hidden="true" />
      <div ref={dot} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
