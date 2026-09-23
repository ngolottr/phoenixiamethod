/* ============================================================================
   EMPEZAR UN PAGO
   ----------------------------------------------------------------------------
   El sitio manda acá el identificador del paquete y el correo de quien compra.
   Esta función busca el monto en `_precios.js`, crea la orden en Flow y
   devuelve la dirección a la que hay que mandar al comprador.

   Lo que NO hace, y es lo importante: no acepta un monto. El navegador solo
   dice QUÉ quiere comprar; CUÁNTO cuesta lo decide el servidor. Un formulario
   que manda el precio es un formulario donde el precio lo pone el cliente.

   Tampoco marca nada como pagado. Que alguien llegue hasta acá significa que
   empezó a pagar, nada más. Lo que confirma una venta es `pago-confirmado.js`,
   preguntándole a Flow.
   ========================================================================== */

import { cobroDe } from './_precios.js'
import { crearOrden, hayLlaves, enProduccion } from './_flow.js'
import {
  RE_EMAIL,
  aplicarCors,
  correoValido,
  cuerpoDemasiadoGrande,
  fallo,
  ipDe,
  limpiarLinea,
  pasaLosCuposCompartidos,
  sinCache,
  validarCampos,
  vieneDeLaWeb,
} from './_seguridad.js'

/** La dirección pública del sitio: Flow tiene que poder volver acá. */
function sitio() {
  const url = (process.env.SITIO_URL || 'https://phoenixiamethod.cl').trim()
  return url.replace(/\/$/, '')
}

/**
 * El número de orden del comercio, único e irrepetible.
 *
 * Lleva el paquete adentro para que la cartola de Flow se lea sola, y una cola
 * al azar porque dos personas pueden comprar lo mismo en el mismo segundo y
 * Flow rechaza una orden repetida.
 */
function numeroDeOrden(id) {
  const cuando = new Date().toISOString().replace(/\D/g, '').slice(2, 14)
  const azar = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `PH-${id}-${cuando}-${azar}`
}

export default async function handler(req, res) {
  sinCache(res)
  if (aplicarCors(req, res, 'POST')) return

  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Método no permitido' })
  if (!vieneDeLaWeb(req)) return fallo(res, 403, 'No se pudo iniciar el pago.', 'origen no permitido')
  if (cuerpoDemasiadoGrande(req)) return fallo(res, 413, 'No se pudo iniciar el pago.', 'cuerpo enorme')

  if (!hayLlaves()) {
    return fallo(
      res,
      503,
      'El pago en línea todavía no está disponible. Escríbeme y lo coordinamos.',
      'faltan FLOW_API_KEY o FLOW_SECRET_KEY en el entorno',
    )
  }

  let b
  try {
    b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return fallo(res, 400, 'No se pudo leer la solicitud.', 'cuerpo ilegible')
  }

  const malos = validarCampos(b, { paquete: 40, email: 254, nombre: 80 })
  if (malos.length) return fallo(res, 400, 'Revisa tus datos.', `campos raros: ${malos}`)

  /* El monto sale de acá dentro, del identificador y de nada más. Si el
     paquete no está en la lista, no está a la venta: los que van a
     conversación no tienen precio que cobrar. */
  const cobro = cobroDe(String(b.paquete || '').slice(0, 40))
  if (!cobro) return fallo(res, 400, 'Ese paquete no se puede pagar en línea.', `paquete raro: ${b.paquete}`)

  const email = correoValido(b.email).toLowerCase()
  if (!RE_EMAIL.test(email)) return res.status(400).json({ ok: false, error: 'Revisa tu correo.' })
  const nombre = limpiarLinea(b.nombre, 80)

  /* Cada intento de pago abre una orden en Flow. Sin tope, un bucle deja el
     panel del comercio lleno de basura y hace ruido en la conciliación. */
  const ip = ipDe(req)
  if (!(await pasaLosCuposCompartidos([[`pagar:ip:${ip}`, 8, 30 * 60000], [`pagar:mail:${email}`, 8, 60 * 60000], ['pagar:total', 60, 60 * 60000]]))) {
    return fallo(res, 429, 'Demasiados intentos. Prueba en un rato.', `cupo agotado para ${ip}`)
  }

  const commerceOrder = numeroDeOrden(cobro.id)

  try {
    const { redirigirA, flowOrder } = await crearOrden({
      commerceOrder,
      subject: `Phoenix IA Method — ${cobro.concepto}`,
      amount: cobro.monto,
      email,
      urlConfirmation: `${sitio()}/api/pago-confirmado`,
      urlReturn: `${sitio()}/api/pago-listo`,
      optional: { paquete: cobro.id, nombre, total: cobro.total, cobra: cobro.cobra },
    })

    console.log(
      `[pagar] orden ${commerceOrder} (flow ${flowOrder}) por $${cobro.monto} — ${email}` +
        (enProduccion() ? '' : ' — MODO PRUEBAS'),
    )
    return res.status(200).json({ ok: true, url: redirigirA, orden: commerceOrder })
  } catch (e) {
    return fallo(res, 502, 'No se pudo abrir el pago. Inténtalo de nuevo o escríbeme.', e.message)
  }
}
