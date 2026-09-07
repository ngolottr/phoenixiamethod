import { useEffect, useRef } from 'react'

/**
 * La malla de panal que cubre el sitio, y que se hunde bajo el cursor.
 *
 * Son dos capas de la misma malla. La de abajo está quieta. La de arriba solo
 * existe dentro de un círculo que sigue al puntero y está encogida con su
 * origen justo ahí: al comprimirse hacia el centro, las celdas se juntan y la
 * zona se lee como una depresión, como si el tejido cediera bajo el dedo.
 *
 * La posición del puntero viaja como dos variables CSS y se actualiza una vez
 * por cuadro, no en cada evento: mover el mouse dispara cientos de eventos por
 * segundo y repintar en todos ellos traba la página.
 */
export function Panal() {
  const hoyo = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return

    let raf = 0
    let x = -1000
    let y = -1000
    let pendiente = false

    const pintar = () => {
      pendiente = false
      const el = hoyo.current
      if (!el) return
      el.style.setProperty('--mx', `${x}px`)
      el.style.setProperty('--my', `${y}px`)
    }

    const alMover = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!pendiente) {
        pendiente = true
        raf = requestAnimationFrame(pintar)
      }
    }

    const alSalir = () => {
      x = -1000
      y = -1000
      pintar()
    }

    window.addEventListener('pointermove', alMover, { passive: true })
    document.addEventListener('pointerleave', alSalir)
    return () => {
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerleave', alSalir)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div className="panal" aria-hidden="true" />
      <div className="panal-hoyo" ref={hoyo} aria-hidden="true" />
    </>
  )
}
