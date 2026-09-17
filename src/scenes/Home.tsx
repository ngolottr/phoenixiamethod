import { MagneticButton } from '../components/MagneticButton'
import { Isotipo } from '../components/Isotipo'
import { Sello } from '../components/Sello'
import { hero, phoenix } from '../data/site'

/**
 * La escena de entrada — PHOENIX IA METHOD.
 *
 * Antes esta pantalla la ocupaba una fotografía de Nicolás recortada, porque
 * el sitio era un portafolio personal. Ya no lo es: lo primero que ve quien
 * llega es el negocio, así que el lugar de honor lo ocupa el isotipo de la
 * marca y la persona pasa al bloque de marketing, que es donde se la busca.
 *
 * El cambio además arregla algo que la foto arrastraba: el emblema es un
 * dibujo, no una imagen que pueda tardar o fallar, se ve nítido en cualquier
 * pantalla y se apaga solo en modo claro. La composición no cambia —el
 * resplandor sigue detrás y la sombra al pie— para que la llama apoye en algo
 * en vez de flotar recortada en el vacío.
 */
export function Home({
  onEnter,
  onContacto,
  arrastrable,
}: {
  /** entra al recorrido por el bloque de negocio: lo primero son las soluciones */
  onEnter: () => void
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

      <div className="home-figura" aria-hidden="true">
        <Isotipo className="home-isotipo" />
      </div>

      <div className="home-copy">
        {/* Solo en el teléfono vertical: la llama entra al flujo, arriba, en
            una franja que mide lo que sobra de pantalla después del texto. Así
            nunca queda detrás del titular y tampoco deja un hueco al pie. */}
        <div className="home-llama-movil" aria-hidden="true">
          <Isotipo className="home-isotipo" />
        </div>

        <p className="eyebrow rise home-eyebrow" data-d="1">
          {hero.eyebrow} — {phoenix.location}
        </p>

        <h1 id="home-title" className="display h-xl home-name rise" data-d="2">
          {phoenix.nameLine1}
          {'\n'}
          <em>{phoenix.nameLine2}</em>
        </h1>

        <div className="home-line rise" data-d="3">
          <p className="home-tag">{phoenix.tagline}</p>
        </div>

        {/* Una sola puerta. "Entrar" abre el recorrido por las soluciones, y el
            sello —que gira en su esquina— es el atajo para quien ya se decidió
            y solo quiere escribir. */}
        <div className="home-cta rise" data-d="4">
          <MagneticButton className="btn solid" onClick={onEnter}>
            {hero.cta} <span className="arrow">→</span>
          </MagneticButton>
        </div>

        {/* El ciclo de la marca, dicho en tres palabras: de dónde se parte y a
            dónde se llega. Es la versión corta del método que se explica
            entero cuatro escenas más adelante. */}
        <p className="home-ciclo rise" data-d="5">
          {hero.ciclo.map((paso, i) => (
            <span key={paso}>
              {i > 0 && (
                <b aria-hidden="true" className="home-ciclo-flecha">
                  →
                </b>
              )}
              {paso}
            </span>
          ))}
        </p>

        <p className="home-meta rise" data-d="6">
          <span>{phoenix.role}</span>
          <span className="home-anio">{phoenix.year}</span>
        </p>
      </div>

      <Sello onClick={onContacto} arrastrable={arrastrable} />
    </section>
  )
}
