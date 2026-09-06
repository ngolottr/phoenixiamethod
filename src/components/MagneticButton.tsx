import { useRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode
  /** intensidad del imán en píxeles */
  strength?: number
}

/**
 * Botón con respuesta física sutil: se inclina hacia el cursor y vuelve a su sitio.
 * Se desactiva por completo en modo "reducir movimiento" y con punteros gruesos.
 */
export function MagneticButton({ children, strength = 10, className, ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null)

  const isEnabled = () =>
    document.documentElement.dataset.motion !== 'reduced' &&
    window.matchMedia('(pointer: fine)').matches

  const onMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el || !isEnabled()) return
    const r = el.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * strength * 2
    const y = ((e.clientY - r.top) / r.height - 0.5) * strength * 2
    el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`
  }

  const reset = () => {
    const el = ref.current
    if (el) el.style.transform = ''
  }

  return (
    <button
      {...rest}
      ref={ref}
      className={className ?? 'btn'}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onBlur={reset}
    >
      {children}
    </button>
  )
}
