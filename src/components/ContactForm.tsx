import { useRef, useState, type FormEvent } from 'react'
import { MagneticButton } from './MagneticButton'
import { contact, presupuestos } from '../data/site'
import { sesionActual } from '../lib/analitica'

type Values = { name: string; email: string; budget: string; message: string }
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
 * Formulario de contacto. Al enviarlo, lleva derecho a la página de agendar
 * con el nombre, el correo y el mensaje ya puestos: la persona elige la hora
 * en el momento, sin esperar ningún correo. `/api/contacto` se llama en
 * paralelo (con `keepalive`, para que sobreviva el cambio de página) solo
 * para avisarle a Nicolás y dejar el registro — nunca bloquea el cambio de
 * página, porque de eso depende que la persona no se quede esperando un
 * correo que a veces no llega.
 */
export function ContactForm({ idPrefix = 'f' }: { idPrefix?: string }) {
  const [values, setValues] = useState<Values>({ name: '', email: '', budget: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [yendo, setYendo] = useState(false)
  const [trampa, setTrampa] = useState('')

  /* Cuándo se abrió el formulario. Se envía junto con los datos: una persona
     tarda al menos unos segundos en escribir, un robot rellena y dispara al
     instante, y el servidor descarta lo que llega demasiado rápido. */
  const abierto = useRef(Date.now())

  const set =
    (key: keyof Values) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const next = { ...values, [key]: e.target.value }
      setValues(next)
      if (touched[key]) setErrors(validate(next))
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

    const nombre = values.name.trim()
    const email = values.email.trim()
    const mensaje = values.message.trim()
    setYendo(true)

    fetch('/api/contacto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        nombre,
        email,
        presupuesto: values.budget,
        mensaje,
        web: trampa,
        desde: Date.now() - abierto.current,
        sesion: sesionActual(),
      }),
    }).catch(() => {
      /* No bloquea el paso siguiente: si esto falla, la persona igual llega a
         agendar, y el correo de la reunión ya lleva su mensaje adjunto. */
    })

    const params = new URLSearchParams({ nombre, email, tema: mensaje })
    if (values.budget) params.set('presupuesto', values.budget)
    window.location.href = `/agendar.html?${params.toString()}`
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
          maxLength={80}
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
          maxLength={254}
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

      <div className="field">
        <label htmlFor={id('budget')}>Presupuesto estimado</label>
        <select id={id('budget')} name="budget" value={values.budget} onChange={set('budget')}>
          {presupuestos.map((p) => (
            <option key={p} value={p === presupuestos[0] ? '' : p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="field" data-invalid={!!err('message')}>
        <label htmlFor={id('msg')}>Qué necesitas</label>
        <textarea
          id={id('msg')}
          name="message"
          maxLength={2000}
          value={values.message}
          onChange={set('message')}
          onBlur={blur('message')}
          placeholder="Cuéntame el problema que quieres resolver"
          aria-invalid={!!err('message')}
          aria-describedby={err('message') ? id('e-msg') : undefined}
        />
        {err('message') && (
          <p className="field-error" id={id('e-msg')} role="alert">
            {err('message')}
          </p>
        )}
      </div>

      {/* Trampa para robots: fuera de la vista, fuera del recorrido del teclado
          y de solo lectura. Lo último es lo que importa: el autocompletado del
          teléfono llena campos aunque digan autocomplete="off", y si llenaba
          este, el servidor descartaba en silencio la solicitud de una persona
          real. Un campo de solo lectura no lo toca el autocompletado, pero un
          robot que escribe directo en el DOM sí lo sigue llenando. */}
      <input
        type="text"
        className="sr-only"
        tabIndex={-1}
        readOnly
        autoComplete="off"
        aria-hidden="true"
        value={trampa}
        onChange={(e) => setTrampa(e.target.value)}
      />

      <div className="form-foot">
        <MagneticButton type="submit" className="btn solid" disabled={yendo}>
          {yendo ? 'Un momento…' : 'Elegir mi horario'} <span className="arrow">→</span>
        </MagneticButton>
        <p className="form-note">
          {contact.formNote} Al enviar aceptas la{' '}
          <a href="/privacidad" target="_blank" rel="noopener">política de privacidad</a>.
        </p>
      </div>
    </form>
  )
}
