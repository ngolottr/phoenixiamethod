/* ============================================================================
   LOS MONTOS, EN UN SOLO SITIO
   ----------------------------------------------------------------------------
   Este archivo lo leen los dos lados: el sitio, para mostrar el precio, y la
   función de pago, para cobrarlo. Está acá y no en `src/` porque el servidor no
   puede importar TypeScript, y está solo acá —sin copia en `src/data/`— por la
   razón obvia: dos listas de precios se desincronizan, y el día que pase, el
   sitio va a mostrar una cifra y Flow va a cobrar otra.

   LO IMPORTANTE, Y NO ES UN DETALLE: el monto que se cobra sale SIEMPRE de este
   archivo, nunca de lo que mande el navegador. Si la función confiara en el
   número que le llega desde la página, cualquiera con la consola del navegador
   abierta podría pagar mil pesos por un proyecto de un millón doscientos. El
   navegador manda el identificador del paquete y nada más; el precio lo pone el
   servidor.
   ========================================================================== */

/** La parte que se cobra por adelantado en los proyectos grandes. */
export const PARTE_ANTICIPO = 0.3

/**
 * Cada paquete que se puede pagar en línea.
 *
 * `cobra` decide qué se cobra ahora: el total o el anticipo. Lo que va a
 * conversación no está en esta lista, y por eso no se puede pagar: si un
 * identificador no aparece acá, la función lo rechaza.
 */
export const PRECIOS = {
  diagnostico: { nombre: 'Diagnóstico Fénix', total: 90000, cobra: 'completo' },
  sitio: { nombre: 'Sitio que convierte', total: 690000, cobra: 'anticipo' },
  tienda: { nombre: 'Tienda online', total: 1190000, cobra: 'anticipo' },
  automatizacion: { nombre: 'Automatización a medida', total: 450000, cobra: 'anticipo' },
  acompanamiento: { nombre: 'Acompañamiento', total: 290000, cobra: 'completo' },
}

/** Redondeado al mil: nadie cobra $207.000 y 30 centavos. */
export const anticipoDe = (total) => Math.round((total * PARTE_ANTICIPO) / 1000) * 1000

/**
 * Lo que se le cobra hoy a quien compra este paquete, con el texto que va a
 * ver en su cartola. Devuelve null si el identificador no existe: eso es un
 * intento de pagar algo que no está a la venta.
 */
export function cobroDe(id) {
  const p = PRECIOS[id]
  if (!p) return null
  const monto = p.cobra === 'anticipo' ? anticipoDe(p.total) : p.total
  const concepto =
    p.cobra === 'anticipo'
      ? `${p.nombre} — anticipo ${Math.round(PARTE_ANTICIPO * 100)} %`
      : p.nombre
  return { id, monto, concepto, nombre: p.nombre, total: p.total, cobra: p.cobra }
}
