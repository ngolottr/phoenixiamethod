import { MagneticButton } from '../components/MagneticButton'
import { ContactForm } from '../components/ContactForm'
import { PanelScroll } from '../components/PanelScroll'
import { useCopy } from '../hooks/useCopy'
import { brand, contact, linkHub, socials } from '../data/site'

export function Contact() {
  const { copied, copy } = useCopy()

  return (
    <section className="scene" aria-labelledby="contact-title">
      <PanelScroll>
        <div className="contact-grid">
          <div>
            <p className="eyebrow rise" data-d="1">
              {contact.eyebrow}
            </p>

            <h2 id="contact-title" className="display h-md rise" data-d="2" style={{ marginTop: 16 }}>
              {contact.title}
            </h2>

            <p className="body rise" data-d="3" style={{ marginTop: 22 }}>
              {contact.intro}
            </p>

            <div className="mail-line rise" data-d="4">
              <a className="mail-value" href={`mailto:${brand.email}`}>
                {brand.email}
              </a>
              <MagneticButton
                className="btn ghost"
                onClick={() => copy(brand.email)}
                aria-label={`Copiar la dirección ${brand.email} al portapapeles`}
              >
                {copied ? contact.copiedLabel : contact.copyLabel} ⧉
              </MagneticButton>
              <span className={`copied-flag${copied ? ' on' : ''}`} aria-hidden="true">
                ✓ en el portapapeles
              </span>
            </div>

            <div
              className="rise"
              data-d="5"
              style={{ marginTop: 'clamp(20px, 4vh, 40px)', display: 'flex', gap: 18, flexWrap: 'wrap' }}
            >
              {socials.slice(0, 4).map((s) => (
                <a key={s.label} className="label" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗
                </a>
              ))}
              <a className="label" href={linkHub.url} target="_blank" rel="noopener noreferrer">
                {linkHub.label} ↗
              </a>
            </div>

            <span className="sr-only" aria-live="polite">
              {copied ? 'Correo copiado al portapapeles' : ''}
            </span>
          </div>

          <div className="rise" data-d="3">
            <ContactForm idPrefix="contacto" />
          </div>
        </div>
      </PanelScroll>
    </section>
  )
}
