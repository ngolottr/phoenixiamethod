import { useState } from 'react'
import { SmartImage } from '../components/SmartImage'
import { work } from '../data/site'

const TONES = ['emerald', 'midnight', 'brass'] as const

export function Work({ onContact }: { onContact: () => void }) {
  const [active, setActive] = useState<string | null>(null)

  return (
    <section className="scene" aria-labelledby="work-title">
      <div className="rise" data-d="1">
        <p className="eyebrow">Proyectos y servicios</p>
        <h2 id="work-title" className="display h-md" style={{ marginTop: 14 }}>
          Lo que hago
          {'\n'}
          <em>cuando nadie mira.</em>
        </h2>
      </div>

      <div className="work-list rise" data-d="2" style={{ marginTop: 'clamp(18px, 3vh, 40px)' }}>
        {work.map((w, i) => {
          const Row = w.url ? 'a' : 'div'
          return (
            <Row
              key={w.index}
              className="work-row"
              data-open={active === w.index}
              tabIndex={0}
              role={w.url ? undefined : 'group'}
              {...(w.url ? { href: w.url, target: '_blank', rel: 'noopener noreferrer' } : {})}
              onMouseEnter={() => setActive(w.index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(w.index)}
              onBlur={() => setActive(null)}
            >
              <span className="wi">{w.index}</span>
              <span className="wt">
                {w.title}
                {w.url && <span aria-hidden="true"> ↗</span>}
              </span>
              <span className="wd">{w.description}</span>
              <span className="wm">
                {w.category} · {w.meta}
              </span>
              <span className="work-ghost" aria-hidden="true">
                <SmartImage src={w.image} alt="" tone={TONES[i % TONES.length]} />
              </span>
            </Row>
          )
        })}
      </div>

      <div className="rise" data-d="4" style={{ marginTop: 'clamp(16px, 3vh, 34px)' }}>
        <button className="btn ghost" onClick={onContact}>
          Trabajemos juntos <span className="arrow">→</span>
        </button>
      </div>
    </section>
  )
}
