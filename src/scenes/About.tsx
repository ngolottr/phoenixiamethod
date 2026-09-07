import { useEffect, useRef, useState } from 'react'
import { SmartImage } from '../components/SmartImage'
import { useAmbientApi } from '../hooks/useAmbient'
import { about, gallery, linkHub } from '../data/site'

/** Cada cuánto cambia el cuadro, en milisegundos. */
const RITMO = 3200

export function About() {
  const [i, setI] = useState(0)
  const { paint, reset } = useAmbientApi()
  const timer = useRef<number | null>(null)

  // Las mismas fotos de la galería: si mañana agregas una, aparece acá sola.
  const fotos = gallery

  useEffect(() => {
    if (document.documentElement.dataset.motion === 'reduced') return
    timer.current = window.setInterval(() => setI((v) => (v + 1) % fotos.length), RITMO)
    return () => {
      if (timer.current) window.clearInterval(timer.current)
    }
  }, [fotos.length])

  // El sitio se tiñe con la foto que está pasando
  useEffect(() => {
    paint(fotos[i].src)
    return () => reset()
  }, [i, fotos, paint, reset])

  return (
    <section className="scene" aria-labelledby="about-title">
      <div className="pane pane-scroll">
        <div className="about-grid">
          <div>
            <p className="eyebrow rise" data-d="1">
              {about.eyebrow}
            </p>

            <h2 id="about-title" className="display h-md rise" data-d="2" style={{ marginTop: 14 }}>
              {about.title}
            </h2>

            <div className="rise" data-d="3" style={{ marginTop: 24, display: 'grid', gap: 13 }}>
              {about.paragraphs.map((p, n) => (
                <p className="body" key={n}>
                  {n === 0 ? <strong>{p}</strong> : p}
                </p>
              ))}
            </div>

            <div className="about-stats rise" data-d="4">
              {about.stats.map((s) => (
                <div className="about-stat" key={s.label}>
                  <div className="v">{s.value}</div>
                  <div className="l">{s.label}</div>
                </div>
              ))}
            </div>

            <a
              className="about-hub rise"
              data-d="5"
              href={linkHub.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {linkHub.label} <span aria-hidden="true">↗</span>
            </a>
          </div>

          {/* --- El proyector: un cuadro tras otro, con destello al cambiar --- */}
          <div className="proyector rise" data-d="3">
            <div className="proyector-marco">
              {fotos.map((f, n) => (
                <div
                  key={f.src}
                  className={`proyector-cuadro${n === i ? ' on' : ''}`}
                  aria-hidden={n !== i}
                >
                  <SmartImage src={f.src} alt={n === i ? f.alt : ''} />
                </div>
              ))}
              <span className="proyector-destello" key={i} aria-hidden="true" />
              <span className="proyector-pie">
                <span className="proyector-t">{fotos[i].caption}</span>
                <span className="proyector-n">
                  {String(i + 1).padStart(2, '0')} / {String(fotos.length).padStart(2, '0')}
                </span>
              </span>
            </div>

            <div className="proyector-marcas" aria-hidden="true">
              {fotos.map((f, n) => (
                <span key={f.src} className={n === i ? 'on' : undefined} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        {fotos[i].caption}
      </span>
    </section>
  )
}
