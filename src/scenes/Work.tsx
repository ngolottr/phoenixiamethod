import { useCallback, useEffect, useRef, useState } from 'react'
import { SmartImage } from '../components/SmartImage'
import { Vortex } from '../components/Vortex'
import { ContactForm } from '../components/ContactForm'
import { MagneticButton } from '../components/MagneticButton'
import { CasoPanel } from '../components/CasoPanel'
import { useCopy } from '../hooks/useCopy'
import { brand, contact } from '../data/site'
import { casos, type Caso } from '../data/proyectos'

const TONES = ['emerald', 'midnight', 'brass'] as const

export function Work({ onLockNav }: { onLockNav: (locked: boolean) => void }) {
  const [active, setActive] = useState<string | null>(null)
  const [abierto, setAbierto] = useState<Caso | null>(null)
  const [entrando, setEntrando] = useState(false)
  const [panel, setPanel] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement | null>(null)
  const { copied, copy } = useCopy()

  /** Atravesar el panal: primero el vórtice, después el formulario. */
  const entrar = () => {
    setEntrando(true)
    onLockNav(true)
  }

  const abrirPanel = useCallback(() => {
    setEntrando(false)
    setPanel(true)
  }, [])

  const cerrarPanel = useCallback(() => {
    setPanel(false)
    onLockNav(false)
    boton.current?.focus()
  }, [onLockNav])

  useEffect(() => {
    if (!panel) return
    panelRef.current?.querySelector<HTMLElement>('input, button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cerrarPanel()
      } else if (e.key === 'Tab') {
        const f = panelRef.current?.querySelectorAll<HTMLElement>(
          'input, textarea, button, [href]',
        )
        if (!f || f.length === 0) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [panel, cerrarPanel])

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

      <div className="work-list rise" data-d="2">
        {casos.map((c, i) => (
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
            <span className="work-ghost" aria-hidden="true">
              <SmartImage src={c.image} alt="" tone={TONES[i % TONES.length]} />
            </span>
          </button>
        ))}
      </div>

      {/* --- La llamada: es el único elemento de la página que insiste --- */}
      <div className="cta rise" data-d="4">
        <div className="cta-copy">
          <p className="cta-kicker">¿Tienes algo entre manos?</p>
          <p className="cta-line">
            Cuéntame qué quieres construir y te digo en un correo si puedo ayudarte.
          </p>
        </div>

        <button ref={boton} className="cta-btn" onClick={entrar}>
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

      <Vortex activo={entrando} onDone={abrirPanel} />

      {panel && (
        <div
          className="hive"
          role="dialog"
          aria-modal="true"
          aria-label="Formulario de contacto"
          ref={panelRef}
        >
          <div className="hive-inner">
            <div className="hive-head">
              <div>
                <p className="eyebrow">{contact.eyebrow}</p>
                <h3 className="display h-md" style={{ marginTop: 10 }}>
                  {contact.title}
                </h3>
              </div>
              <MagneticButton className="btn ghost" onClick={cerrarPanel} aria-label="Cerrar formulario">
                Cerrar ✕
              </MagneticButton>
            </div>

            <div className="hive-body">
              <div className="hive-side">
                <p className="body">{contact.intro}</p>
                <div className="mail-line">
                  <a className="mail-value" href={`mailto:${brand.email}`}>
                    {brand.email}
                  </a>
                  <MagneticButton
                    className="btn ghost"
                    onClick={() => copy(brand.email)}
                    aria-label={`Copiar la dirección ${brand.email}`}
                  >
                    {copied ? contact.copiedLabel : contact.copyLabel} ⧉
                  </MagneticButton>
                </div>
              </div>

              <ContactForm idPrefix="hive" />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
