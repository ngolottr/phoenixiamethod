import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { SmartImage } from '../components/SmartImage'
import { VideoLoop } from '../components/VideoLoop'
import { MagneticButton } from '../components/MagneticButton'
import { useAmbientApi } from '../hooks/useAmbient'
import { highlights, highlightsScene, type Highlight } from '../data/site'

/* --------------------------------------------------------------------------
   Visor de historias: barras segmentadas arriba, imagen al centro, frase abajo.
   Cada imagen tiñe el sitio entero con su color dominante.
   -------------------------------------------------------------------------- */

function StoryViewer({
  set,
  start,
  onClose,
}: {
  set: Highlight
  start: number
  onClose: () => void
}) {
  const [i, setI] = useState(start)
  const ref = useRef<HTMLDivElement>(null)
  const opener = useRef<Element | null>(null)
  const { paint } = useAmbientApi()

  const total = set.items.length
  const src = set.items[i]
  const note = set.notes[i % set.notes.length]

  const step = useCallback(
    (d: number) => setI((v) => Math.min(total - 1, Math.max(0, v + d))),
    [total],
  )

  useEffect(() => {
    paint(src)
  }, [src, paint])

  useEffect(() => {
    opener.current = document.activeElement
    ref.current?.querySelector<HTMLElement>('button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'ArrowLeft') {
        e.stopPropagation()
        step(-1)
      } else if (e.key === 'ArrowRight') {
        e.stopPropagation()
        step(1)
      } else if (e.key === 'Tab') {
        const f = ref.current?.querySelectorAll<HTMLElement>('button')
        if (!f || f.length === 0) return
        const first = f[0]
        const last = f[f.length - 1]
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
  }, [onClose, step])

  // Precarga la siguiente para que el avance no parpadee
  useEffect(() => {
    const next = set.items[i + 1]
    if (next) {
      const img = new Image()
      img.src = next
    }
  }, [i, set.items])

  return createPortal(
    <div
      className="sv"
      role="dialog"
      aria-modal="true"
      aria-label={`Historias destacadas: ${set.title}. Imagen ${i + 1} de ${total}.`}
      ref={ref}
    >
      <div className="sv-bars" aria-hidden="true">
        {set.items.map((it, n) => (
          <span key={it} className={n <= i ? 'on' : undefined} />
        ))}
      </div>

      <div className="sv-head">
        <div className="sv-id">
          <span className="sv-title">{set.title}</span>
          <span className="sv-kind">
            {set.kind} · {i + 1}/{total}
          </span>
        </div>
        <MagneticButton className="btn ghost" onClick={onClose} aria-label="Cerrar historias">
          Cerrar ✕
        </MagneticButton>
      </div>

      <div className="sv-stage">
        {/* zonas de toque a los costados, igual que en la app */}
        <button className="sv-zone left" onClick={() => step(-1)} aria-label="Anterior" disabled={i === 0} />
        <div className="sv-frame" key={src}>
          <SmartImage src={src} alt={`${set.title} — imagen ${i + 1}`} priority />
        </div>
        <button
          className="sv-zone right"
          onClick={() => (i === total - 1 ? onClose() : step(1))}
          aria-label={i === total - 1 ? 'Cerrar historias' : 'Siguiente'}
        />
      </div>

      <div className="sv-foot">
        <p className="sv-note">{note}</p>
        <div className="arrows">
          <MagneticButton className="btn icon" onClick={() => step(-1)} aria-label="Historia anterior">
            ←
          </MagneticButton>
          <MagneticButton className="btn icon" onClick={() => step(1)} aria-label="Historia siguiente">
            →
          </MagneticButton>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {set.title}, {i + 1} de {total}. {note}
      </span>
    </div>,
    document.body,
  )
}

/* -------------------------------------------------------------------------- */

export function Highlights({ onLockNav }: { onLockNav: (locked: boolean) => void }) {
  const [openSet, setOpenSet] = useState<Highlight | null>(null)
  const { paint, reset } = useAmbientApi()

  const open = (set: Highlight) => {
    setOpenSet(set)
    onLockNav(true)
  }

  const close = useCallback(() => {
    setOpenSet(null)
    onLockNav(false)
    reset()
  }, [onLockNav, reset])

  const total = highlights.reduce((s, h) => s + h.items.length, 0)

  return (
    <section className="scene" aria-labelledby="hl-title">
      <div className="hl-head rise" data-d="1">
        <div>
          <p className="eyebrow">{highlightsScene.eyebrow}</p>
          <h2 id="hl-title" className="display h-md" style={{ marginTop: 12 }}>
            {highlightsScene.title}
          </h2>
        </div>
        <p className="body" style={{ maxWidth: '38ch' }}>
          {highlightsScene.intro}
        </p>
      </div>

      <div className="hl-grid rise" data-d="2">
        {highlights.map((set) => (
          <button
            key={set.slug}
            className="hl-card"
            onClick={() => open(set)}
            onMouseEnter={() => paint(set.items[0])}
            onFocus={() => paint(set.items[0])}
            onMouseLeave={() => !openSet && reset()}
            onBlur={() => !openSet && reset()}
            aria-label={`Abrir ${set.title}: ${set.items.length} historias. ${set.blurb}`}
          >
            <span className="hl-ring">
              {set.videos?.length ? (
                <VideoLoop fuentes={set.videos} poster={set.items[0]} alt={`${set.title} en movimiento`} />
              ) : (
                <SmartImage src={set.items[0]} alt="" />
              )}
              {set.videos?.length ? (
                <span className="hl-vivo" aria-hidden="true">
                  ▶
                </span>
              ) : null}
            </span>
            <span className="hl-meta">
              <span className="hl-kind">{set.kind}</span>
              <span className="hl-title">{set.title}</span>
              <span className="hl-count">{set.items.length} historias</span>
            </span>
            <span className="hl-blurb">{set.blurb}</span>
          </button>
        ))}
      </div>

      <p className="gal-hint rise" data-d="3">
        {total} historias rescatadas · las flechas ← → recorren cada colección
      </p>

      {openSet && <StoryViewer set={openSet} start={0} onClose={close} />}
    </section>
  )
}
