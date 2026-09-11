import { MagneticButton } from '../components/MagneticButton'
import { ContactForm } from '../components/ContactForm'
import { PanelScroll } from '../components/PanelScroll'
import { useCopy } from '../hooks/useCopy'
import { brand, contact } from '../data/site'

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

            {/* Aquí no va ningún enlace a redes. Redes es una escena propia del
                recorrido y las lista todas con su foto y su motivo; repetirlas
                acá solo daba una salida del sitio en la única pantalla donde lo
                que se busca es que la persona escriba. */}

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
