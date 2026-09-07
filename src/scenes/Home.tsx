import { SmartImage } from '../components/SmartImage'
import { MagneticButton } from '../components/MagneticButton'
import { Sello } from '../components/Sello'
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

      {/* Único elemento circular de la página, y además arrastrable. */}
      <Sello onClick={onContacto} />
    </section>
  )
}
