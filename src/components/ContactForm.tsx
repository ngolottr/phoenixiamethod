import { useRef, useState, type FormEvent } from 'react'
import { MagneticButton } from './MagneticButton'
import { brand, contact, presupuestos } from '../data/site'

type Values = { name: string; email: string; budget: string; message: string }
type Errors = Partial<Record<keyof Values, string>>
type Estado = 'listo' | 'enviando' | 'enviado' | 'error'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i

function validate(v: Values): Errors {
  const e: Errors = {}
  if (v.name.trim().length < 2) e.name = 'Dime cómo te llamas (mínimo 2 caracteres).'
  if (!EMAIL_RE.test(v.email.trim())) e.email = 'Ese correo no tiene buena pinta.'
  if (v.message.trim().length < 12) e.message = 'Cuéntame un poco más (mínimo 12 caracteres).'
  return e
}

/**
 * Formulario de contacto. Valida en el navegador y envía la solicitud a
 * /api/contacto, que la reenvía al flujo de n8n: ahí se redacta el correo de
 * respuesta con la propuesta de reunión y se guarda el contacto en la planilla.
 *
 * Si el envío falla, no se pierde nada: se ofrece abrir el correo a mano.
 */
export function ContactForm({ idPrefix = 'f' }: { idPrefix?: string }) {
  const [values, setValues] = useState<Values>({ name: '', email: '', budget: '', message: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [estado, setEstado] = useState<Estado>('listo')
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
      if (estado === 'error') setEstado('listo')
    }

  const blur = (key: keyof Values) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(values))
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched({ name: true, email: true, message: true })
    if (Object.keys(found).length > 0) return

    setEstado('enviando')
    try {
      const r = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: values.name.trim(),
          email: values.email.trim(),
          presupuesto: values.budget,
          mensaje: values.message.trim(),
          web: trampa,
          desde: Date.now() - abierto.current,
        }),
      })
      setEstado(r.ok ? 'enviado' : 'error')
    } catch {
      setEstado('error')
    }
  }

  const mailto = () => {
    const subject = encodeURIComponent(`Contacto desde el portfolio — ${values.name}`)
    const body = encodeURIComponent(
      `${values.message}\n\nPresupuesto: ${values.budget || 'No indicado'}\n\n—\n${values.name}\n${values.email}`,
    )
    window.location.href = `mailto:${brand.email}?subject=${subject}&body=${body}`
  }

  const err = (k: keyof Values) => (touched[k] ? errors[k] : undefined)
  const id = (k: string) => `${idPrefix}-${k}`

  /* --- Confirmación: lo que la persona ve al enviar --- */
  if (estado === 'enviado') {
    return (
      <div className="form-done" role="status">
        <p className="eyebrow">Solicitud recibida</p>
        <p className="form-done-t">
          Gracias, {values.name.split(' ')[0]}.
          {'\n'}
          Revisa tu correo.
        </p>
        <p className="body" style={{ marginTop: 14 }}>
          En un momento te llega un mensaje con el siguiente paso: responder con los horarios que te
          acomoden para una reunión de 30 minutos. Si no lo ves, mira en spam.
        </p>
        <p className="form-note" style={{ marginTop: 16 }}>
          Atiendo de lunes a viernes desde las 20:30, sábados desde las 16:00 y domingos todo el día
          (hora de Chile).
        </p>
      </div>
    )
  }

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
        <MagneticButton type="submit" className="btn solid" disabled={estado === 'enviando'}>
          {estado === 'enviando' ? 'Enviando…' : 'Enviar solicitud'} <span className="arrow">→</span>
        </MagneticButton>

        {estado === 'error' ? (
          <p className="field-error" role="alert" style={{ maxWidth: '34ch' }}>
            No se pudo enviar.{' '}
            <button type="button" className="link-inline" onClick={mailto}>
              Ábrelo en tu correo
            </button>{' '}
            y te respondo igual.
          </p>
        ) : (
          <p className="form-note">{contact.formNote}</p>
        )}
      </div>
    </form>
  )
}
