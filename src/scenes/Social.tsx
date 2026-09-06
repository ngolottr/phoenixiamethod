import { MagneticButton } from '../components/MagneticButton'
import { brand, socialScene, socials } from '../data/site'

export function Social({ onHome }: { onHome: () => void }) {
  return (
    <section className="scene" aria-labelledby="social-title">
      <div className="rise" data-d="1">
        <p className="eyebrow">{socialScene.eyebrow}</p>
        <h2 id="social-title" className="display h-md" style={{ marginTop: 14 }}>
          {socialScene.title}
        </h2>
      </div>

      <nav className="social-list rise" data-d="2" aria-label="Redes sociales">
        {socials.map((s) => (
          <a
            key={s.label}
            className="social-row"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sl">
              {s.label}
              <span className="sa" aria-hidden="true">
                ↗
              </span>
            </span>
            <span className="sh">{s.handle}</span>
          </a>
        ))}
      </nav>

      <div
        className="rise"
        data-d="4"
        style={{ marginTop: 'clamp(16px, 3vh, 32px)', display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}
      >
        <MagneticButton className="btn ghost" onClick={onHome}>
          ↺ Volver al inicio
        </MagneticButton>
        <span className="label">
          © {brand.year} {brand.legalName} · {brand.location}
        </span>
      </div>
    </section>
  )
}
