import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

/** Cuánto se queda una foto en pantalla antes de pasar sola, como en la app. */
const FOTO_MS = 6000

type Pieza = { src: string; tipo: 'video' | 'foto' }

/** Los videos van primero: al abrir la colección, lo primero que corre es movimiento. */
function armarPiezas(set: Highlight): Pieza[] {
  const videos = (set.videos ?? []).map((src) => ({ src, tipo: 'video' as const }))
  const fotos = set.items.map((src) => ({ src, tipo: 'foto' as const }))
  return [...videos, ...fotos]
}

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
  const video = useRef<HTMLVideoElement>(null)
  const { paint } = useAmbientApi()

  const piezas = useMemo(() => armarPiezas(set), [set])
  const total = piezas.length
  const pieza = piezas[i]
  const note = set.notes[i % set.notes.length]

  const step = useCallback(
    (d: number) => setI((v) => Math.min(total - 1, Math.max(0, v + d))),
    [total],
  )

  // El color sale siempre de una foto: de un video no se puede muestrear
  // sin cargarlo entero, así que los videos toman el tono de la portada.
  useEffect(() => {
    paint(pieza.tipo === 'foto' ? pieza.src : set.items[0])
  }, [pieza, set.items, paint])

  // Las fotos pasan solas a los 6 segundos; los videos, cuando terminan
  useEffect(() => {
    if (pieza.tipo !== 'foto') return
    if (document.documentElement.dataset.motion === 'reduced') return
    const t = window.setTimeout(() => {
      setI((v) => (v + 1 < total ? v + 1 : v))
    }, FOTO_MS)
    return () => window.clearTimeout(t)
  }, [pieza, i, total])

  // Cada video arranca solo al entrar
  useEffect(() => {
    if (pieza.tipo !== 'video') return
    const v = video.current
    if (!v) return
    v.currentTime = 0
    v.play().catch(() => {})
  }, [pieza])

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

  // Precarga la siguiente foto para que el avance no parpadee
  useEffect(() => {
    const next = piezas[i + 1]
    if (next?.tipo === 'foto') {
      const img = new Image()
      img.src = next.src
    }
  }, [i, piezas])

  return createPortal(
    <div
      className="sv"
      role="dialog"
      aria-modal="true"
      aria-label={`Historias destacadas: ${set.title}. Imagen ${i + 1} de ${total}.`}
      ref={ref}
    >
      <div className="sv-bars" aria-hidden="true">
        {piezas.map((p, n) => (
          <span key={p.src} className={n <= i ? 'on' : undefined} />
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
        <div className="sv-frame" key={pieza.src}>
          {pieza.tipo === 'video' ? (
            <video
              ref={video}
              className="sv-video"
              src={pieza.src}
              poster={set.items[0]}
              muted
              playsInline
              autoPlay
              preload="auto"
              aria-label={`${set.title} — video ${i + 1}`}
              onEnded={() => setI((v) => (v + 1 < total ? v + 1 : v))}
              onError={() => setI((v) => (v + 1 < total ? v + 1 : v))}
            />
          ) : (
            <SmartImage src={pieza.src} alt={`${set.title} — imagen ${i + 1}`} priority />
          )}
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
