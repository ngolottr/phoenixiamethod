import { SmartImage } from '../components/SmartImage'
import { about } from '../data/site'

export function About() {
  return (
    <section className="scene" aria-labelledby="about-title">
      <div className="pane pane-scroll">
        <div className="about-grid">
          <div>
            <p className="eyebrow rise" data-d="1">
              {about.eyebrow}
            </p>

            <h2 id="about-title" className="display h-md rise" data-d="2" style={{ marginTop: 18 }}>
              {about.title}
            </h2>

            <div className="rise" data-d="3" style={{ marginTop: 26, display: 'grid', gap: 14 }}>
              {about.paragraphs.map((p, i) => (
                <p className="body" key={i}>
                  {i === 0 ? <strong>{p}</strong> : p}
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
          </div>

          <div className="about-frames rise" data-d="3" aria-hidden="true">
            <div className="f1">
              <SmartImage src={about.portraits[0].src} alt={about.portraits[0].alt} tone="emerald" zoom />
            </div>
            <div className="f2">
              <SmartImage src={about.portraits[1].src} alt={about.portraits[1].alt} tone="midnight" zoom />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
