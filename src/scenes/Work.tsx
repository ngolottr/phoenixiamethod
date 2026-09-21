import { useState } from 'react'
import { SmartImage } from '../components/SmartImage'
import { GraficoCaso } from '../components/GraficoCaso'
import { CerebroEngranaje } from '../components/CerebroEngranaje'
import { Vortex } from '../components/Vortex'
import { CasoPanel } from '../components/CasoPanel'
import { PanelScroll } from '../components/PanelScroll'
import { ServicioIcono } from '../components/ServicioIcono'
import { AvisoPrecios, PrecioServicio } from '../components/Precios'
import { casos, type Caso } from '../data/proyectos'
import { servicios, cierreMetodo } from '../data/servicios'

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
  /* Dos vistas, no tres.
     Los precios eran la tercera y no debían serlo: obligaban a mirar el
     servicio en una pantalla, cambiar a otra y cruzar a mano cuál costaba
     cuánto. Ahora cada servicio muestra su precio en la misma tarjeta, y lo
     único que queda al lado son los casos: la prueba de que lo que se ofrece
     ya funcionó. Qué hago y qué vale, primero; qué hice, después. */
  const [vista, setVista] = useState<'soluciones' | 'casos'>('soluciones')

  /** El proyecto que se está señalando, para la vista previa de al lado. */
  const activo = casos.find((c) => c.index === active) ?? null

  return (
    <section className="scene work-scene" aria-labelledby="work-title">
      <div className="gal-head rise" data-d="1">
        <div>
          <p className="eyebrow">
            {vista === 'soluciones' ? 'Soluciones · Con su precio' : 'Soluciones · Casos reales'}
          </p>
          <h2 id="work-title" className="display h-md" style={{ marginTop: 12 }}>
            {vista === 'soluciones' ? 'Todo lo que' : 'Lo que ya'}
            {'\n'}
            <em>{vista === 'soluciones' ? 'sabemos construir.' : 'está funcionando.'}</em>
          </h2>
        </div>

        <div className="filters" role="group" aria-label="Cambiar vista">
          <button
            className="filter"
            aria-pressed={vista === 'soluciones'}
            data-evento="ver_precios"
            onClick={() => setVista('soluciones')}
          >
            Servicios y precios <span className="filter-n">{servicios.length}</span>
          </button>
          <button
            className="filter"
            aria-pressed={vista === 'casos'}
            data-evento="ver_casos"
            onClick={() => setVista('casos')}
          >
            Casos reales <span className="filter-n">{casos.length}</span>
          </button>
        </div>
      </div>

      {vista === 'soluciones' ? (
        <div className="srv-cuerpo rise" data-d="2" key="soluciones">
          <PanelScroll className="srv-panel">
            <ul className="srv-grilla">
              {servicios.map((s) => (
                <li className={`srv-card${s.destacado ? ' es-destacado' : ''}`} key={s.titulo}>
                  {s.destacado && <span className="pr-sello">Empieza por acá</span>}
                  <div className="srv-cabeza">
                    <ServicioIcono nombre={s.icono} />
                    <div>
                      <h3 className="srv-titulo">{s.titulo}</h3>
                      <p className="srv-bajada">{s.bajada}</p>
                    </div>
                  </div>
                  <PrecioServicio servicio={s} onContacto={() => setEntrando(true)} />
                  <ul className="srv-items">
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </li>
              ))}
              <li className="srv-card srv-metodo">
                <ServicioIcono nombre={cierreMetodo.icono} />
                <p className="srv-metodo-t">
                  {cierreMetodo.titulo}
                  {'\n'}
                  <em>{cierreMetodo.enfasis}</em>
                </p>
                <p className="srv-bajada">{cierreMetodo.texto}</p>
                <button className="srv-metodo-link" onClick={() => setVista('casos')}>
                  Ver casos reales <span aria-hidden="true">→</span>
                </button>
              </li>
            </ul>
            <AvisoPrecios />
          </PanelScroll>
        </div>
      ) : (
      /* La lista y su vista previa. Antes la fotografía era un fantasma que se
          dibujaba DENTRO de la fila, encima de la descripción y de la categoría:
          ni se leía el texto ni se veía la foto. Ahora tiene columna propia, se
          muestra entera y no pisa nada. */
      <div className="work-cuerpo rise" data-d="2" key="casos">
        <div className="work-list">
          {casos.map((c) => (
            <button
              key={c.index}
              className="work-row"
              data-open={active === c.index}
              data-evento={`abrir_caso:${c.index}`}
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

          {/* Casi todos los casos se explican mejor dibujados que fotografiados:
              un flujo de agentes o una tienda se entienden de un vistazo, y una
              foto del escritorio no dice nada. El que conserva captura es
              Neurona, donde la herramienta misma es la prueba. */}
          {casos.map((c, i) =>
            active === c.index ? (
              <span className="work-vista-foto" key={c.index}>
                {c.grafico ? (
                  <GraficoCaso nombre={c.grafico} />
                ) : (
                  <SmartImage src={c.image} alt="" tone={TONES[i % TONES.length]} />
                )}
              </span>
            ) : null,
          )}
          <span className="work-vista-pie">
            {activo ? activo.title : 'Señala un proyecto'}
          </span>
        </aside>
      </div>
      )}

      {/* --- La llamada: es el único elemento de la página que insiste --- */}
      <div className="cta rise" data-d="4">
        <div className="cta-copy">
          <p className="cta-kicker">¿Hay algo que te esté costando tiempo?</p>
          <p className="cta-line">
            Cuéntame el problema —no la herramienta— y te digo en un correo si puedo ayudarte.
          </p>
        </div>

        <button className="cta-btn" data-evento="cta_trabajemos" onClick={() => setEntrando(true)}>
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
