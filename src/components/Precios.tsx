import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { MagneticButton } from './MagneticButton'
import { CAMBIO, COBRO_EN_LINEA, dolares, montoACobrar, paquetes, pesos, type Paquete } from '../data/precios'

/**
 * Los precios, a la vista.
 *
 * La decisión de fondo: acá la cifra se muestra. La competencia la esconde
 * detrás de un "cotiza con nosotros" y con eso consigue que la mitad de la
 * gente no escriba nunca, porque no sabe si le alcanza. Un precio visible
 * espanta a quien no puede pagarlo —que no era cliente— y le ahorra el trámite
 * a quien sí.
 *
 * Las dos monedas no son un adorno: el peso es lo que se cobra y el dólar es la
 * referencia para quien está afuera. Va dicho con todas sus letras al pie, no
 * insinuado, para que nadie crea que le van a cobrar en dólares.
 */

/* --- La ventanita de compra ------------------------------------------------
   Pide lo mínimo: un nombre y un correo. No pide la tarjeta —eso lo hace Flow
   en su propia página, que es donde corresponde— y por eso esta web nunca ve un
   número de tarjeta ni tiene por qué guardarlo. */
function Comprar({ paquete, onClose }: { paquete: Paquete; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [yendo, setYendo] = useState(false)
  const [error, setError] = useState('')

  const monto = montoACobrar(paquete)
  const esAnticipo = paquete.forma === 'anticipo'

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
        body: JSON.stringify({ paquete: paquete.id, nombre, email }),
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
    <div className="compra" role="dialog" aria-modal="true" aria-label={`Comprar ${paquete.nombre}`} ref={ref}>
      <div className="compra-caja">
        <p className="eyebrow">{esAnticipo ? 'Reservar cupo' : 'Comprar'}</p>
        <h3 className="display h-sm compra-titulo">{paquete.nombre}</h3>

        <div className="compra-monto">
          <span className="cm-v">{monto !== null ? pesos(monto) : ''}</span>
          <span className="cm-n">
            {esAnticipo && paquete.clp
              ? `Anticipo del 30 %. El total es ${pesos(paquete.clp)} y el resto se acuerda en la reunión.`
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
              {yendo ? 'Abriendo Flow…' : `Ir a pagar ${monto !== null ? pesos(monto) : ''}`}
            </button>
            <MagneticButton className="btn ghost" onClick={onClose} aria-label="Cancelar la compra">
              Cancelar
            </MagneticButton>
          </div>
        </form>

        {/* Quien está a punto de pagar merece saber exactamente qué sigue. */}
        <p className="compra-nota">
          Te lleva a <strong>Flow</strong>, la pasarela chilena, para pagar con tarjeta o
          transferencia. Los datos de tu tarjeta no pasan nunca por este sitio.
        </p>
      </div>
    </div>,
    document.body,
  )
}

/* --- La grilla -------------------------------------------------------------- */

export function Precios({ onContacto }: { onContacto: () => void }) {
  const [comprando, setComprando] = useState<Paquete | null>(null)

  return (
    <>
      <ul className="pr-grilla">
        {paquetes.map((p) => {
          const monto = montoACobrar(p)
          return (
            <li className={`pr-card${p.destacado ? ' es-destacado' : ''}`} key={p.id}>
              {p.destacado && <span className="pr-sello">Empieza por acá</span>}

              <div className="pr-cabeza">
                <h3 className="pr-titulo">{p.nombre}</h3>
                <p className="pr-bajada">{p.bajada}</p>
              </div>

              <div className="pr-cifra">
                {p.clp === null ? (
                  <span className="pr-clp a-conversar">A conversar</span>
                ) : (
                  <>
                    {p.prefijo && <span className="pr-desde">{p.prefijo}</span>}
                    <span className="pr-clp">{pesos(p.clp)}</span>
                    {p.sufijo && <span className="pr-sufijo">{p.sufijo}</span>}
                    {/* El dólar va debajo y más chico: es referencia, no precio */}
                    <span className="pr-usd">{p.usd !== null ? dolares(p.usd) : ''}</span>
                  </>
                )}
              </div>

              {/* El botón va ANTES de la lista, no al final de la tarjeta.
                  Puesto abajo quedaba fuera de la pantalla y había que
                  adivinar que existía haciendo scroll: en una página de
                  precios, esconder el botón de comprar es el único error que
                  no se puede cometer. Lo que incluye el paquete se lee
                  después, por quien ya está interesado. */}
              <div className="pr-pie">
                {p.forma === 'conversar' || !COBRO_EN_LINEA ? (
                  /* Sin pasarela lista, el botón manda al formulario y lo dice
                     con todas sus letras. No promete un pago que no existe. */
                  <button
                    className={`btn ${p.destacado ? 'solid' : 'ghost'} pr-btn`}
                    data-evento={p.forma === 'conversar' ? 'precio_conversar' : `hablar:${p.id}`}
                    onClick={onContacto}
                  >
                    {p.forma === 'conversar' ? 'Cuéntame tu caso' : 'Contratar'}
                  </button>
                ) : (
                  <>
                    <button
                      className={`btn ${p.destacado ? 'solid' : 'ghost'} pr-btn`}
                      data-evento={`comprar:${p.id}`}
                      onClick={() => setComprando(p)}
                    >
                      {p.forma === 'anticipo' && monto !== null
                        ? `Reservar cupo · ${pesos(monto)}`
                        : `Comprar · ${monto !== null ? pesos(monto) : ''}`}
                    </button>
                    <button className="pr-hablar" data-evento={`hablar:${p.id}`} onClick={onContacto}>
                      o hablemos primero
                    </button>
                  </>
                )}
                {p.letraChica && COBRO_EN_LINEA && <span className="pr-chica">{p.letraChica}</span>}
              </div>

              <ul className="pr-items">
                {p.incluye.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </li>
          )
        })}
      </ul>

      {/* Dónde queda parado cada número, dicho sin letra chica escondida.

          Acá decía "con IVA incluido" y se quitó: eso depende del giro con el
          que se formalice Phoenix, que todavía no está definido. Una afirmación
          tributaria falsa en una página de precios no es un detalle de
          redacción —es lo que después discute un cliente cuando le llega la
          boleta por un monto distinto al que leyó. Cuando el giro esté
          decidido, vuelve a escribirse, y esa vez siendo cierta. */}
      <p className="pr-aviso">
        Precios en pesos chilenos. El valor en dólares es solo referencia,
        calculado a ${CAMBIO.clp} por dólar ({CAMBIO.fecha}); el cobro se hace
        siempre en pesos. Si estás fuera de Chile, escríbeme y lo coordinamos.
      </p>

      {comprando && <Comprar paquete={comprando} onClose={() => setComprando(null)} />}
    </>
  )
}
