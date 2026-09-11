import { useState } from 'react'
import { SmartImage } from '../components/SmartImage'
import { CerebroEngranaje } from '../components/CerebroEngranaje'
import { Vortex } from '../components/Vortex'
import { CasoPanel } from '../components/CasoPanel'
import { casos, type Caso } from '../data/proyectos'

const TONES = ['emerald', 'midnight', 'brass'] as const

/**
 * El trabajo: primera parada del bloque de negocio.
 *
 * La llamada ya no abre un formulario aquí mismo. Contacto es la escena
 * siguiente del recorrido y tiene el formulario completo, así que el botón
 * atraviesa el vórtice y deja al visitante ahí: un solo formulario que mantener
 * y un paso menos entre ver el trabajo y escribir.
 */
export function Work({
  onLockNav,
  onContacto,
}: {
  onLockNav: (locked: boolean) => void
  onContacto: () => void
}) {
  const [active, setActive] = useState<string | null>(null)
  const [abierto, setAbierto] = useState<Caso | null>(null)
  const [entrando, setEntrando] = useState(false)

  /** El proyecto que se está señalando, para la vista previa de al lado. */
  const activo = casos.find((c) => c.index === active) ?? null

  return (
    <section className="scene" aria-labelledby="work-title">
      <div className="rise" data-d="1">
        <p className="eyebrow">Proyectos y servicios</p>
        <h2 id="work-title" className="display h-md" style={{ marginTop: 12 }}>
          Lo que hago
          {'\n'}
          <em>cuando nadie mira.</em>
        </h2>
      </div>

      {/* La lista y su vista previa. Antes la fotografía era un fantasma que se
          dibujaba DENTRO de la fila, encima de la descripción y de la categoría:
          ni se leía el texto ni se veía la foto. Ahora tiene columna propia, se
          muestra entera y no pisa nada. */}
      <div className="work-cuerpo rise" data-d="2">
        <div className="work-list">
          {casos.map((c) => (
            <button
              key={c.index}
              className="work-row"
              data-open={active === c.index}
              onClick={() => {
                setAbierto(c)
                onLockNav(true)
              }}
              onMouseEnter={() => setActive(c.index)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(c.index)}
              onBlur={() => setActive(null)}
              aria-label={`Abrir el proyecto ${c.title}`}
            >
              <span className="wi">{c.index}</span>
              <span className="wt">
                {c.title}
                <span className="wt-mas" aria-hidden="true">
                  ver
                </span>
              </span>
              <span className="wd">{c.description}</span>
              <span className="wm">
                {c.category} · {c.meta}
              </span>
            </button>
          ))}
        </div>

        {/* Un solo marco para los cuatro proyectos: se monta el que corresponda
            al que se está señalando, y se desmonta al salir. */}
        <aside className="work-vista" aria-hidden="true">
          {/* En reposo manda el emblema; al señalar un proyecto se cruza con su
              fotografía. Antes el marco quedaba vacío y parecía una imagen rota. */}
          <span className={`work-vista-marca${activo ? ' is-oculta' : ''}`}>
            <CerebroEngranaje />
          </span>

          {casos.map((c, i) =>
            active === c.index ? (
              <span className="work-vista-foto" key={c.index}>
                <SmartImage src={c.image} alt="" tone={TONES[i % TONES.length]} />
              </span>
            ) : null,
          )}
          <span className="work-vista-pie">
            {activo ? activo.title : 'Señala un proyecto'}
          </span>
        </aside>
      </div>

      {/* --- La llamada: es el único elemento de la página que insiste --- */}
      <div className="cta rise" data-d="4">
        <div className="cta-copy">
          <p className="cta-kicker">¿Tienes algo entre manos?</p>
          <p className="cta-line">
            Cuéntame qué quieres construir y te digo en un correo si puedo ayudarte.
          </p>
        </div>

        <button className="cta-btn" onClick={() => setEntrando(true)}>
          <span className="cta-btn-bg" aria-hidden="true" />
          <span className="cta-btn-txt">Trabajemos juntos</span>
          <span className="cta-btn-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {abierto && (
        <CasoPanel
          caso={abierto}
          onClose={() => {
            setAbierto(null)
            onLockNav(false)
          }}
        />
      )}

      {/* El vórtice tapa el salto y al terminar deja al visitante en Contacto */}
      <Vortex
        activo={entrando}
        onDone={() => {
          setEntrando(false)
          onContacto()
        }}
      />
    </section>
  )
}
