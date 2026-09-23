/* ============================================================================
   FLOW AVISA QUE UN PAGO SE CERRÓ
   ----------------------------------------------------------------------------
   Esto es lo único que convierte un intento en una venta. Flow hace un POST acá
   con un token cuando el pago termina, y esta función le pregunta a Flow —con
   la clave secreta en la mano— en qué quedó realmente.

   Y ESA VUELTA NO ES BUROCRACIA. El aviso llega por internet abierto: cualquiera
   puede hacer el mismo POST inventando un token. Por eso el aviso no se cree
   nunca: lo único que se usa de él es el token, y el estado se va a buscar a la
   fuente. Si esto confiara en lo que trae el POST, bastaría un `curl` para
   avisarle a Nicolás de ventas que nunca ocurrieron.

   Flow reintenta si no recibe un 200. Por eso esta función contesta 200 apenas
   entiende el aviso, incluso cuando el pago salió rechazado: un rechazo
   entendido es un aviso procesado. Solo devuelve error cuando de verdad no pudo
   consultar, que es cuando sí conviene que Flow insista.
   ========================================================================== */

import { PAGADA, estadoDelPago, hayLlaves, tokenValido } from './_flow.js'
import { CORREO_NICOLAS, enviarCorreo, escapar } from './_correo.js'
import { PRECIOS } from './_precios.js'
import { dentroDelCupo, sinCache } from './_seguridad.js'

/** Lo que Flow guardó cuando se creó la orden. Puede no venir. */
function extras(datos) {
  try {
    const o = datos?.optional
    return typeof o === 'string' ? JSON.parse(o) : o || {}
  } catch {
    return {}
  }
}

/**
 * La retención de segunda categoría vigente.
 *
 * Sube por tramos según la Ley 21.133: 15,25 % durante 2026 y hasta 17 % en
 * 2028. Va como constante y no incrustada en el texto para que el día que
 * cambie se corrija en un solo sitio.
 */
const RETENCION = 0.1525

/** Dónde se emite la boleta. Es el portal simplificado, que es el que usa. */
const SII_BOLETAS = 'https://www2.sii.cl/siimple/home-diferenciado'

/**
 * El correo que le llega a Nicolás cuando alguien paga.
 *
 * Trae además lo que hay que hacer con esa venta: emitir la boleta de
 * honorarios, que Flow no emite por él —Flow solo entrega el comprobante del
 * pago—. Va con el monto ya calculado y el enlace directo, porque el momento
 * en que uno se acuerda de una obligación es el momento en que conviene tener
 * todo a mano; si hay que ir a buscar la cifra y la dirección, se posterga.
 *
 * Sobre la retención: se informa cuánto es, no quién debe enterarla. Eso
 * depende de si el comprador es empresa o persona natural, y no es algo que
 * este correo pueda saber ni deba decidir.
 */
async function avisar(pago, sueltos) {
  const paquete = PRECIOS[sueltos.paquete]?.nombre || sueltos.paquete || 'sin identificar'
  const bruto = Number(pago.amount || 0)
  const monto = bruto.toLocaleString('es-CL')
  const retencion = Math.round(bruto * RETENCION)
  const quien = sueltos.nombre || '(no dejó nombre)'
  const correo = pago.payer || '(sin correo)'
  const esAnticipo = sueltos.cobra === 'anticipo'
  const resto = esAnticipo && sueltos.total ? Number(sueltos.total) - bruto : 0

  const lineas = [
    `Paquete: ${paquete}`,
    `Pagó: $${monto}${esAnticipo ? ' (anticipo)' : ''}`,
    ...(resto > 0 ? [`Queda por cobrar: $${resto.toLocaleString('es-CL')}`] : []),
    `Nombre: ${quien}`,
    `Correo: ${correo}`,
    `Orden: ${pago.commerceOrder}`,
    '',
    esAnticipo
      ? 'Reservó su cupo. Escríbele hoy para agendar la reunión de inicio.'
      : 'Pagó completo. Escríbele hoy para coordinar.',
    '',
    '--- Boleta de honorarios ---',
    `Emitir por: $${monto}`,
    `Retención ${(RETENCION * 100).toFixed(2).replace('.', ',')} %: $${retencion.toLocaleString('es-CL')}`,
    `Líquido: $${(bruto - retencion).toLocaleString('es-CL')}`,
    `Emitirla en: ${SII_BOLETAS}`,
    'Flow no emite la boleta: solo entrega el comprobante del pago.',
  ]

  await enviarCorreo({
    para: CORREO_NICOLAS,
    nombrePara: 'Nicolás Golott',
    asunto: `💰 Venta: ${paquete} — $${monto}`,
    texto: lineas.join('\n'),
    html: `<p>${lineas
      .map((l) =>
        l.startsWith('Emitirla en:')
          ? `Emitirla en: <a href="${SII_BOLETAS}">el portal del SII</a>`
          : escapar(l),
      )
      .join('<br />')}</p>`,
    responderA: { email: correo, name: quien },
  })
}

export default async function handler(req, res) {
  sinCache(res)
  if (req.method !== 'POST') return res.status(405).end()
  if (!hayLlaves()) {
    console.error('[pago-confirmado] llegó un aviso y no hay llaves de Flow configuradas')
    return res.status(500).end()
  }

  /* Flow manda el aviso como formulario, no como JSON. Vercel ya lo convierte
     en objeto, pero si llegara en crudo hay que saber leerlo igual. */
  let token = ''
  const b = req.body
  if (typeof b === 'string') token = new URLSearchParams(b).get('token') || ''
  else token = String(b?.token || '')

  if (!tokenValido(token)) {
    console.error('[pago-confirmado] aviso sin token válido')
    return res.status(400).end()
  }

  let pago
  try {
    pago = await estadoDelPago(token)
  } catch (e) {
    // Acá sí conviene que Flow reintente: el problema es nuestro, no del aviso.
    console.error('[pago-confirmado] no se pudo consultar el estado →', e.message)
    return res.status(500).end()
  }

  if (Number(pago.status) !== PAGADA) {
    console.log(`[pago-confirmado] orden ${pago.commerceOrder} quedó en estado ${pago.status}, no se avisa`)
    return res.status(200).end()
  }

  /* Un token pagado es válido para siempre: quien lo tenga podría reenviar el
     aviso en bucle y llenarte la bandeja de "Venta" repetidas. Se corta recién
     acá, con el pago ya confirmado, para no tragarse el reintento legítimo de
     Flow cuando la consulta de arriba falló. */
  if (!dentroDelCupo(`pago-confirmado:${token}`, 1, 24 * 3600000)) return res.status(200).end()

  try {
    await avisar(pago, extras(pago))
    console.log(`[pago-confirmado] ✅ ${pago.commerceOrder} por $${pago.amount}`)
  } catch (e) {
    /* La venta está hecha y cobrada: que el correo no salga no puede hacer que
       Flow reintente para siempre. Queda en el registro del servidor, que es
       donde se va a buscar si alguna vez falta un aviso. */
    console.error(`[pago-confirmado] pagada ${pago.commerceOrder} pero el correo falló →`, e.message)
  }

  return res.status(200).end()
}
