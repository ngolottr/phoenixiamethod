/* ============================================================================
   HABLAR CON FLOW
   ----------------------------------------------------------------------------
   Flow es la pasarela chilena con la que se cobra. Se eligió sobre Webpay y
   Mercado Pago por dos razones concretas: cobra 2,89 % + IVA, la comisión más
   baja de las tres, y no tiene costo fijo mensual —Phoenix no paga nada los
   meses en que no vende nada.

   Toda petición va firmada. La firma es un HMAC-SHA256 sobre los parámetros
   ordenados alfabéticamente y pegados uno tras otro (clave, valor, clave,
   valor…), con la clave secreta del comercio. Es lo que le prueba a Flow que la
   orden la creó este servidor y no cualquiera que conozca el número de comercio.

   LA CLAVE SECRETA NO SE ESCRIBE ACÁ NUNCA. Vive en las variables de entorno de
   Vercel, igual que las de Brevo y las de Google. Si alguna vez aparece escrita
   en este repositorio, hay que darla por perdida y rotarla en el panel de Flow.
   ========================================================================== */

import crypto from 'node:crypto'

/**
 * A qué Flow le hablamos.
 *
 * Por defecto, al de pruebas. Es a propósito y no es pereza: si el valor por
 * omisión fuera el de producción, cualquier despliegue mal configurado —una
 * rama, una prueba local, un olvido— empezaría a cobrarle de verdad a gente de
 * verdad. Para cobrar en serio hay que decirlo explícitamente en Vercel.
 */
export const API = (process.env.FLOW_API || 'https://sandbox.flow.cl/api').replace(/\/$/, '')

export const enProduccion = () => API.includes('www.flow.cl')

/** ¿Están puestas las llaves? Sin esto no se puede cobrar nada. */
export function hayLlaves() {
  return Boolean(process.env.FLOW_API_KEY && process.env.FLOW_SECRET_KEY)
}

/**
 * La firma de una petición: las claves en orden alfabético, cada una pegada a
 * su valor, todo firmado con el secreto del comercio.
 */
export function firmar(params) {
  const cadena = Object.keys(params)
    .sort()
    .map((k) => `${k}${params[k]}`)
    .join('')
  return crypto.createHmac('sha256', String(process.env.FLOW_SECRET_KEY)).update(cadena).digest('hex')
}

/** Los parámetros con su firma incorporada, listos para enviar. */
function firmados(params) {
  const con = { ...params, apiKey: String(process.env.FLOW_API_KEY) }
  return { ...con, s: firmar(con) }
}

/**
 * Crea la orden en Flow y devuelve a dónde hay que mandar al comprador.
 *
 * `amount` sale siempre de `_precios.js`, nunca del navegador — quien llame a
 * esto con un monto que le pasó el cliente está regalando la tienda.
 */
export async function crearOrden({ commerceOrder, subject, amount, email, urlConfirmation, urlReturn, optional }) {
  const cuerpo = firmados({
    commerceOrder,
    subject,
    currency: 'CLP',
    amount: String(amount),
    email,
    // 9 = todos los medios que el comercio tenga habilitados. Que el comprador
    // elija entre tarjeta y transferencia es cosa suya, no nuestra.
    paymentMethod: '9',
    urlConfirmation,
    urlReturn,
    ...(optional ? { optional: JSON.stringify(optional) } : {}),
  })

  const r = await fetch(`${API}/payment/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(cuerpo).toString(),
  })

  const texto = await r.text()
  let datos
  try {
    datos = JSON.parse(texto)
  } catch {
    throw new Error(`Flow contestó algo que no es JSON (${r.status}): ${texto.slice(0, 200)}`)
  }
  if (!r.ok || !datos.url || !datos.token) {
    throw new Error(`Flow rechazó la orden (${r.status}): ${texto.slice(0, 200)}`)
  }

  return { redirigirA: `${datos.url}?token=${datos.token}`, token: datos.token, flowOrder: datos.flowOrder }
}

/**
 * En qué quedó un pago, preguntándoselo a Flow.
 *
 * Esto es lo único que decide si una compra está pagada. Ni lo que diga el
 * navegador al volver, ni lo que traiga el aviso de Flow: los dos llegan por
 * internet y los dos se pueden falsificar. Lo que vale es lo que contesta Flow
 * cuando se le pregunta con la clave secreta en la mano.
 *
 * `status`: 1 pendiente · 2 pagada · 3 rechazada · 4 anulada.
 */
export async function estadoDelPago(token) {
  const params = firmados({ token })
  const r = await fetch(`${API}/payment/getStatus?${new URLSearchParams(params).toString()}`)
  const texto = await r.text()
  let datos
  try {
    datos = JSON.parse(texto)
  } catch {
    throw new Error(`Flow contestó algo que no es JSON (${r.status}): ${texto.slice(0, 200)}`)
  }
  if (!r.ok) throw new Error(`Flow no dio el estado (${r.status}): ${texto.slice(0, 200)}`)
  return datos
}

export const PAGADA = 2
