import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MagneticButton } from './MagneticButton'
import { CAMBIO, COBRO_EN_LINEA, dolares, pesos, type Pago } from '../data/precios'
import type { Servicio } from '../data/servicios'

/**
 * El precio, dentro de la tarjeta del servicio.
 *
 * La decisión de fondo: acá la cifra se muestra. La competencia la esconde
 * detrás de un "cotiza con nosotros" y con eso consigue que la mitad de la
 * gente no escriba nunca, porque no sabe si le alcanza. Un precio visible
 * espanta a quien no puede pagarlo —que no era cliente— y le ahorra el trámite
 * a quien sí.
 *
 * Y va pegado al servicio, no en una pestaña aparte. Cuando el catálogo y la
 * lista de precios viven en dos vistas distintas, quien mira un servicio tiene
 * que cambiar de pantalla y cruzar a mano cuál cuesta cuánto. Nadie hace ese
 * trabajo: se va.
 *
 * Las dos monedas no son un adorno: el peso es lo que se cobra y el dólar es la
 * referencia para quien está afuera. Va dicho con todas sus letras al pie, no
 * insinuado, para que nadie crea que le van a cobrar en dólares.
 */

/* --- La ventanita de compra ------------------------------------------------
   Pide lo mínimo: un nombre y un correo. No pide la tarjeta —eso lo hace Flow
   en su propia página, que es donde corresponde— y por eso esta web nunca ve un
   número de tarjeta ni tiene por qué guardarlo. */
function Comprar({
  nombreServicio,
  pago,
  onClose,
}: {
  nombreServicio: string
  pago: Pago
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [yendo, setYendo] = useState(false)
  const [error, setError] = useState('')

  const esAnticipo = pago.forma === 'anticipo'

  useEffect(() => {
    ref.current?.querySelector<HTMLInputElement>('input')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [onClose])

  async function alPagar(e: React.FormEvent) {
    e.preventDefault()
    if (yendo) return
    setError('')
    setYendo(true)
    try {
      const r = await fetch('/api/pagar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        /* Va el identificador del paquete, no el precio. El monto lo pone el
           servidor: si viajara desde acá, cualquiera con la consola abierta
           podría pagar mil pesos por un proyecto de un millón. */
        body: JSON.stringify({ paquete: pago.id, nombre, email }),
      })
      const d = await r.json().catch(() => ({}))
      if (!r.ok || !d.ok || !d.url) {
        setError(d.error || 'No se pudo abrir el pago. Inténtalo de nuevo o escríbeme.')
        setYendo(false)
        return
      }
      window.location.href = d.url
    } catch {
      setError('No se pudo conectar. Revisa tu internet e inténtalo de nuevo.')
      setYendo(false)
    }
  }

  return createPortal(
    <div className="compra" role="dialog" aria-modal="true" aria-label={`Comprar ${nombreServicio}`} ref={ref}>
      <div className="compra-caja">
        <p className="eyebrow">{esAnticipo ? 'Reservar cupo' : 'Comprar'}</p>
        <h3 className="display h-sm compra-titulo">{nombreServicio}</h3>

        <div className="compra-monto">
          <span className="cm-v">{pesos(pago.cobraAhora)}</span>
          <span className="cm-n">
            {esAnticipo
              ? `Anticipo del 30 %. El proyecto parte en ${pesos(pago.clp)} y el resto se acuerda en la reunión.`
              : pago.sufijo === 'al mes'
                ? 'Es el primer mes. Se cobra mes a mes y se corta cuando quieras.'
                : 'Se paga completo, una sola vez.'}
          </span>
        </div>

        <form onSubmit={alPagar} className="compra-form">
          <label className="campo">
            <span>Tu nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={80}
              autoComplete="name"
              required
            />
          </label>
          <label className="campo">
            <span>Tu correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={120}
              autoComplete="email"
              required
            />
            <small>Ahí te llega el comprobante y ahí te escribo.</small>
          </label>

          {error && <p className="field-error" role="alert">{error}</p>}

          <div className="compra-botones">
            <button type="submit" className="btn solid" disabled={yendo}>
              {yendo ? 'Abriendo Flow…' : `Ir a pagar ${pesos(pago.cobraAhora)}`}
            </button>
            <MagneticButton className="btn ghost" onClick={onClose} aria-label="Cancelar la compra">
              Cancelar
            </MagneticButton>
          </div>
        </form>

        {/* Quien está a punto de pagar merece saber exactamente qué sigue. */}
        <p className="compra-nota">
          Te lleva a <strong>Flow</strong>, la pasarela chilena, para pagar con tarjeta o
          transferencia. Los datos de tu tarjeta no pasan nunca por este sitio.{' '}
          <a href="/privacidad" target="_blank" rel="noopener">Política de privacidad</a>.
        </p>
      </div>
    </div>,
    document.body,
  )
}

/* --- La cifra y el botón, dentro de la tarjeta ----------------------------- */

export function PrecioServicio({
  servicio,
  onContacto,
}: {
  servicio: Servicio
  onContacto: () => void
}) {
  const [comprando, setComprando] = useState(false)
  const p = servicio.pago

  /* Sin precio publicado: el botón lleva a conversar y no finge otra cosa. */
  if (!p) {
    return (
      <div className="srv-precio">
        <div className="srv-cifra">
          <span className="pr-clp a-conversar">A conversar</span>
        </div>
        <div className="srv-pie">
          <button className="btn ghost pr-btn" data-evento="precio_conversar" onClick={onContacto}>
            Cuéntame tu caso
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="srv-precio">
      <div className="srv-cifra">
        {p.prefijo && <span className="pr-desde">{p.prefijo}</span>}
        <span className="pr-clp">{pesos(p.clp)}</span>
        {p.sufijo && <span className="pr-sufijo">{p.sufijo}</span>}
        {/* El dólar va debajo y más chico: es referencia, no precio */}
        <span className="pr-usd">{dolares(p.usd)}</span>
      </div>

      {/* El botón va ANTES de la lista, no al final de la tarjeta. Puesto abajo
          quedaba fuera de la pantalla y había que adivinar que existía haciendo
          scroll: en una página con precios, esconder el botón de comprar es el
          único error que no se puede cometer. Lo que incluye se lee después,
          por quien ya está interesado. */}
      <div className="srv-pie">
        {COBRO_EN_LINEA ? (
          <>
            <button
              className={`btn ${servicio.destacado ? 'solid' : 'ghost'} pr-btn`}
              data-evento={`comprar:${p.id}`}
              onClick={() => setComprando(true)}
            >
              {p.forma === 'anticipo'
                ? `Reservar cupo · ${pesos(p.cobraAhora)}`
                : `Comprar · ${pesos(p.cobraAhora)}`}
            </button>
            <button className="pr-hablar" data-evento={`hablar:${p.id}`} onClick={onContacto}>
              o hablemos primero
            </button>
          </>
        ) : (
          /* Sin pasarela lista, el botón manda al formulario y lo dice con
             todas sus letras. No promete un pago que no existe. */
          <button
            className={`btn ${servicio.destacado ? 'solid' : 'ghost'} pr-btn`}
            data-evento={`hablar:${p.id}`}
            onClick={onContacto}
          >
            Contratar
          </button>
        )}
        {COBRO_EN_LINEA && <span className="pr-chica">{p.letraChica}</span>}
      </div>

      {comprando && (
        <Comprar nombreServicio={servicio.titulo} pago={p} onClose={() => setComprando(false)} />
      )}
    </div>
  )
}

/* --- Dónde queda parado cada número, sin letra chica escondida -------------
   Acá decía "con IVA incluido" y era falso: Phoenix opera en segunda categoría
   y no está afecto a IVA (verificado en el perfil del SII el 20-09-2026, código
   960909). Ahora dice lo que de verdad ocurre, y dice también que se emite
   boleta de honorarios —no factura—, porque un cliente empresa necesita saberlo
   ANTES de contratar y no cuando pida su crédito fiscal y no lo tenga. Si algún
   día Phoenix pasa a primera categoría, esta frase se cambia junto con el giro. */
export function AvisoPrecios() {
  return (
    <p className="pr-aviso">
      Precios en pesos chilenos y sin IVA: los servicios se documentan con boleta
      de honorarios. Lo que se construye una vez se publica con «desde», porque
      el alcance mueve el precio, y se reserva con un 30 %; lo mensual es precio
      cerrado y sin permanencia. El valor en dólares es solo referencia,
      calculado a ${CAMBIO.clp} por dólar ({CAMBIO.fecha}); el cobro se hace
      siempre en pesos. Si estás fuera de Chile, escríbeme y lo coordinamos.
    </p>
  )
}
