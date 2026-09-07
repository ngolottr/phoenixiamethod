import { SmartImage } from '../components/SmartImage'
import { MagneticButton } from '../components/MagneticButton'
import { brand, hero } from '../data/site'

export function Home({
  onEnter,
  onWork,
  onContacto,
}: {
  onEnter: () => void
  onWork: () => void
  onContacto: () => void
}) {
  return (
    <section className="scene home" aria-labelledby="home-title">
      <div className="home-media">
        <SmartImage src={hero.image} alt={hero.alt} tone="emerald" priority />
      </div>

      <div className="home-copy">
        <p className="eyebrow rise" data-d="1">
          {hero.eyebrow} — {brand.location}
        </p>

        <h1 id="home-title" className="display h-xl home-name rise" data-d="2">
          {brand.nameLine1}
          {'\n'}
          <em>{brand.nameLine2}</em>
        </h1>

        <div className="home-line rise" data-d="3">
          <p className="home-tag">{brand.tagline}</p>
        </div>

        <div className="home-cta rise" data-d="4">
          <MagneticButton className="btn solid" onClick={onEnter}>
            {hero.cta} <span className="arrow">→</span>
          </MagneticButton>
          <MagneticButton className="btn" onClick={onWork}>
            Ver trabajo
          </MagneticButton>
        </div>
      </div>

      <div className="home-meta rise" data-d="5">
        <p className="label">{brand.role}</p>
        <p className="label" style={{ marginTop: 8, color: 'var(--laton)' }}>
          {brand.year}
        </p>
      </div>

      {/* El sello: queda sobre la figura de la foto, girando lento. Es lo único
          circular de toda la página, así que la vista se le va sola. */}
      <MagneticButton
        className="sello rise"
        data-d="5"
        onClick={onContacto}
        aria-label="Trabajemos juntos: ir al formulario de contacto"
        strength={16}
      >
        <span className="sello-anillo" aria-hidden="true">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            <defs>
              <path
                id="sello-curva"
                d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
                fill="none"
              />
            </defs>
            <text className="sello-texto">
              <textPath href="#sello-curva" startOffset="0%">
                TRABAJEMOS JUNTOS · TRABAJEMOS JUNTOS ·
              </textPath>
            </text>
          </svg>
        </span>
        <span className="sello-centro" aria-hidden="true">
          →
        </span>
      </MagneticButton>
    </section>
  )
}
