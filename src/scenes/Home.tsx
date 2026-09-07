import { SmartImage } from '../components/SmartImage'
import { MagneticButton } from '../components/MagneticButton'
import { Sello } from '../components/Sello'
import { brand, hero } from '../data/site'

/**
 * La escena de entrada.
 *
 * La figura viene recortada sobre fondo transparente, así que ya no hace falta
 * pelear con degradados para que el texto se lea: la fotografía no cubre nada.
 * El fondo lo pone la propia atmósfera del sitio —negro verdoso y el halo que
 * respira—, y bajo los pies se dibuja un resplandor para que la figura apoye en
 * algo en vez de flotar recortada en el vacío.
 */
export function Home({
  onEnter,
  onWork,
  onContacto,
  arrastrable,
}: {
  onEnter: () => void
  onWork: () => void
  onContacto: () => void
  /** el visitante encendió el arrastre: el sello se puede mover */
  arrastrable: boolean
}) {
  return (
    <section className="scene home" aria-labelledby="home-title">
      <div className="home-escena" aria-hidden="true">
        <span className="home-suelo" />
        <span className="home-aura" />
      </div>

      <div className="home-figura">
        <SmartImage src={hero.image} alt={hero.alt} priority />
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

        <p className="home-meta rise" data-d="5">
          <span>{brand.role}</span>
          <span className="home-anio">{brand.year}</span>
        </p>
      </div>

      <Sello onClick={onContacto} arrastrable={arrastrable} />
    </section>
  )
}
