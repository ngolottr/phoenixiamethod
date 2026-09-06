import { useState, type FormEvent } from 'react'
import { MagneticButton } from '../components/MagneticButton'
import { useCopy } from '../hooks/useCopy'
import { brand, contact, socials } from '../data/site'

type Values = { name: string; email: string; message: string }
type Errors = Partial<Record<keyof Values, string>>

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Dime cómo te llamas (mínimo 2 caracteres).'
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Ese correo no tiene buena pinta.'
  if (v.message.trim().length < 12) e.message = 'Cuéntame un poco más (mínimo 12 caracteres).'
  return e
}

export function Contact() {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [sent, setSent] = useState(false)
  const { copied, copy } = useCopy()

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = { ...values, [key]: e.target.value }
    setValues(next)
    if (touched[key]) setErrors(validate(next))
    if (sent) setSent(false)
  }

  const blur = (key: keyof Values) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(values))
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(found).length > 0) return
    setSent(true)
  }

  const mailto = () => {
    const subject = encodeURIComponent(`Contacto desde el portfolio — ${values.name}`)
    const body = encodeURIComponent(`${values.message}\n\n—\n${values.name}\n${values.email}`)
    window.location.href = `mailto:${brand.email}?subject=${subject}&body=${body}`
  }

  const err = (k: keyof Values) => (touched[k] ? errors[k] : undefined)

  return (
    <section className="scene" aria-labelledby="contact-title">
      <div className="pane pane-scroll">
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

            <div className="rise" data-d="5" style={{ marginTop: 'clamp(20px, 4vh, 40px)', display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              {socials.slice(0, 4).map((s) => (
                <a key={s.label} className="label" href={s.url} target="_blank" rel="noopener noreferrer">
                  {s.label} ↗
                </a>
              ))}
            </div>

            <span className="sr-only" aria-live="polite">
              {copied ? 'Correo copiado al portapapeles' : ''}
            </span>
          </div>

          <form className="form rise" data-d="3" onSubmit={onSubmit} noValidate>
            <div className="field" data-invalid={!!err('name')}>
              <label htmlFor="f-name">Nombre</label>
              <input
                id="f-name"
                name="name"
                value={values.name}
                onChange={set('name')}
                onBlur={blur('name')}
                placeholder="Cómo te llamas"
                autoComplete="name"
                aria-invalid={!!err('name')}
                aria-describedby={err('name') ? 'e-name' : undefined}
              />
              {err('name') && (
                <p className="field-error" id="e-name" role="alert">
                  {err('name')}
                </p>
              )}
            </div>

            <div className="field" data-invalid={!!err('email')}>
              <label htmlFor="f-email">Email</label>
              <input
                id="f-email"
                name="email"
                type="email"
                value={values.email}
                onChange={set('email')}
                onBlur={blur('email')}
                placeholder="tu@correo.com"
                autoComplete="email"
                aria-invalid={!!err('email')}
                aria-describedby={err('email') ? 'e-email' : undefined}
              />
              {err('email') && (
                <p className="field-error" id="e-email" role="alert">
                  {err('email')}
                </p>
              )}
            </div>

            <div className="field" data-invalid={!!err('message')}>
              <label htmlFor="f-msg">Mensaje</label>
              <textarea
                id="f-msg"
                name="message"
                value={values.message}
                onChange={set('message')}
                onBlur={blur('message')}
                placeholder="Qué tienes en mente"
                aria-invalid={!!err('message')}
                aria-describedby={err('message') ? 'e-msg' : undefined}
              />
              {err('message') && (
                <p className="field-error" id="e-msg" role="alert">
                  {err('message')}
                </p>
              )}
            </div>

            <div className="form-foot">
              {!sent ? (
                <>
                  <MagneticButton type="submit" className="btn">
                    Revisar mensaje <span className="arrow">→</span>
                  </MagneticButton>
                  <p className="form-note">{contact.formNote}</p>
                </>
              ) : (
                <>
                  <MagneticButton type="button" className="btn solid" onClick={mailto}>
                    Abrir en tu correo <span className="arrow">→</span>
                  </MagneticButton>
                  <p className="form-ok" role="status">
                    ✓ Todo correcto — listo para enviar
                  </p>
                </>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
