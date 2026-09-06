import { useState, type FormEvent } from 'react'
import { MagneticButton } from './MagneticButton'
import { brand, contact } from '../data/site'

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

/**
 * Formulario local: valida en el navegador y, al confirmar, arma un mailto con
 * los datos. No hay backend ni se envía nada a ningún servidor.
 * Se usa tanto en la escena de Contacto como dentro del panal de Trabajo.
 */
export function ContactForm({ idPrefix = 'f' }: { idPrefix?: string }) {
  const [values, setValues] = useState<Values>({ name: '', email: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [sent, setSent] = useState(false)

  const set =
    (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  const id = (k: string) => `${idPrefix}-${k}`

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      <div className="field" data-invalid={!!err('name')}>
        <label htmlFor={id('name')}>Nombre</label>
        <input
          id={id('name')}
          name="name"
          value={values.name}
          onChange={set('name')}
          onBlur={blur('name')}
          placeholder="Cómo te llamas"
          autoComplete="name"
          aria-invalid={!!err('name')}
          aria-describedby={err('name') ? id('e-name') : undefined}
        />
        {err('name') && (
          <p className="field-error" id={id('e-name')} role="alert">
            {err('name')}
          </p>
        )}
      </div>

      <div className="field" data-invalid={!!err('email')}>
        <label htmlFor={id('email')}>Email</label>
        <input
          id={id('email')}
          name="email"
          type="email"
          value={values.email}
          onChange={set('email')}
          onBlur={blur('email')}
          placeholder="tu@correo.com"
          autoComplete="email"
          aria-invalid={!!err('email')}
          aria-describedby={err('email') ? id('e-email') : undefined}
        />
        {err('email') && (
          <p className="field-error" id={id('e-email')} role="alert">
            {err('email')}
          </p>
        )}
      </div>

      <div className="field" data-invalid={!!err('message')}>
        <label htmlFor={id('msg')}>Mensaje</label>
        <textarea
          id={id('msg')}
          name="message"
          value={values.message}
          onChange={set('message')}
          onBlur={blur('message')}
          placeholder="Qué tienes en mente"
          aria-invalid={!!err('message')}
          aria-describedby={err('message') ? id('e-msg') : undefined}
        />
        {err('message') && (
          <p className="field-error" id={id('e-msg')} role="alert">
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
  )
}
