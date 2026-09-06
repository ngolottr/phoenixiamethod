import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SmartImage } from './SmartImage'
import { MagneticButton } from './MagneticButton'
import { useAmbientApi } from '../hooks/useAmbient'
import type { Shot } from '../data/site'

type Props = {
  shots: Shot[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

/**
 * Visor a pantalla completa: flechas, teclado (← → Esc), contador, caption y la
 * frase que acompaña a cada foto. Mientras está abierto, el sitio entero queda
 * teñido con el color dominante de la imagen que se está mirando.
 */
export function Lightbox({ shots, index, onClose, onPrev, onNext }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const opener = useRef<Element | null>(null)
  const { paint } = useAmbientApi()
  const shot = shots[index]

  // Hacia dónde se desliza la lámina. En el salto del final al principio
  // (17 → 0) la resta miente, así que ahí se invierte a mano.
  const anterior = useRef(index)
  const [dir, setDir] = useState<1 | -1>(1)
  const [primera, setPrimera] = useState(true)

  useEffect(() => {
    if (index === anterior.current) return
    const salto = index - anterior.current
    const haciaAdelante = Math.abs(salto) > 1 ? salto < 0 : salto > 0
    setDir(haciaAdelante ? 1 : -1)
    setPrimera(false)
    anterior.current = index
  }, [index])

  // Cada cambio de foto repinta el ambiente
  useEffect(() => {
    paint(shot.src)
  }, [shot.src, paint])

  useEffect(() => {
    opener.current = document.activeElement
    ref.current?.querySelector<HTMLElement>('button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation()
        onPrev()
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation()
        onNext()
      } else if (e.key === 'Tab') {
        const focusables = ref.current?.querySelectorAll<HTMLElement>('button, [href]')
        if (!focusables || focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      ;(opener.current as HTMLElement | null)?.focus?.()
    }
  }, [onClose, onPrev, onNext])

  // Se monta fuera de .stage: ese contenedor crea su propio contexto de
  // apilamiento y dejaría el visor por debajo de la navegación fija.
  return createPortal(
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de galería. Imagen ${index + 1} de ${shots.length}: ${shot.caption}`}
      ref={ref}
    >
      <div className="lb-head">
        <span className="eyebrow">
          {(index + 1).toString().padStart(2, '0')} / {shots.length.toString().padStart(2, '0')}
        </span>
        <MagneticButton className="btn ghost" onClick={onClose} aria-label="Cerrar visor">
          Cerrar ✕
        </MagneticButton>
      </div>

      <div className="lb-stage">
        <div
          className={`lb-frame${primera ? ' is-conjuring' : ''}`}
          data-dir={dir}
          key={shot.src}
        >
          <SmartImage src={shot.src} alt={shot.alt} priority />
          {/* la frase vive sobre la foto, no al costado */}
          <figcaption className="lb-over">
            <span className="lb-over-t">{shot.caption}</span>
            <span className="lb-over-n">{shot.note}</span>
          </figcaption>
        </div>
      </div>

      <div className="lb-foot">
        <div className="lb-caption">
          <span className="eyebrow">{shot.category}</span>
        </div>
        <div className="arrows">
          <MagneticButton className="btn icon" onClick={onPrev} aria-label="Imagen anterior">
            ←
          </MagneticButton>
          <MagneticButton className="btn icon" onClick={onNext} aria-label="Imagen siguiente">
            →
          </MagneticButton>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {shot.caption}, imagen {index + 1} de {shots.length}. {shot.note}
      </span>
    </div>,
    document.body,
  )
}
