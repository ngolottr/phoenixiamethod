import { SmartImage } from '../components/SmartImage'
import { MagneticButton } from '../components/MagneticButton'
import { useAmbientApi } from '../hooks/useAmbient'
import { brand, linkHub, socialScene, socials } from '../data/site'

/**
 * La escena que más convierte: acá la gente decide si te sigue.
 * Cada red muestra su foto, su nombre y qué va a encontrar si entra —
 * porque "Instagram" solo no le dice a nadie por qué debería seguirte.
 */
export function Social({ onHome }: { onHome: () => void }) {
  const { paint, reset } = useAmbientApi()

  return (
    <section className="scene" aria-labelledby="social-title">
      <div className="soc-head rise" data-d="1">
        <div>
          <p className="eyebrow">{socialScene.eyebrow}</p>
          <h2 id="social-title" className="display h-md" style={{ marginTop: 10 }}>
            {socialScene.title}
          </h2>
        </div>
        <a
          className="soc-hub"
          href={linkHub.url}
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => paint(socials[0].image)}
          onMouseLeave={reset}
        >
          {linkHub.label} <span aria-hidden="true">↗</span>
        </a>
      </div>

      <nav className="soc-grid rise" data-d="2" aria-label="Redes sociales">
        {socials.map((s) => (
          <a
            key={s.label}
            className="soc-card"
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => paint(s.image)}
            onFocus={() => paint(s.image)}
            onMouseLeave={reset}
            onBlur={reset}
          >
            <span className="soc-foto" aria-hidden="true">
              <SmartImage src={s.image} alt="" />
            </span>
            <span className="soc-txt">
              <span className="soc-top">
                <span className="soc-nombre">{s.label}</span>
                <span className="soc-flecha" aria-hidden="true">
                  ↗
                </span>
              </span>
              <span className="soc-handle">{s.handle}</span>
              <span className="soc-que">{s.que}</span>
            </span>
          </a>
        ))}
      </nav>

      <div className="soc-pie rise" data-d="4">
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
