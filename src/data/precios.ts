/* ============================================================================
   LOS PRECIOS DE PHOENIX IA METHOD
   ----------------------------------------------------------------------------
   Publicar los precios es una decisión comercial, no un detalle de diseño: la
   mayoría de la competencia esconde la cifra detrás de un "cotiza con nosotros"
   y consigue con eso que la mitad de la gente no escriba nunca, porque no sabe
   si le alcanza. Acá están a la vista.

   De dónde salen las cifras (mercado chileno, septiembre de 2026): una landing
   se cobra entre $170.000 y $640.000, un sitio corporativo entre $300.000 y
   $1.200.000, una tienda entre $380.000 y $2.000.000, y la operación mensual de
   un sistema con IA entre $150.000 y $600.000. El piso de esas bandas es de
   quien instala una plantilla; el techo, de una consultora con equipo. Phoenix
   va en medio: por encima del que arma plantillas, por debajo de la agencia con
   planilla.

   UN SERVICIO, UN PRECIO. Este archivo ya no arma una lista de "paquetes"
   aparte de los servicios: eso obligaba a mantener dos catálogos y a que el
   visitante cruzara a mano cuál paquete correspondía a qué servicio. Ahora cada
   servicio de `servicios.ts` trae su precio pegado, y lo que hay acá es la
   maquinaria que lo calcula.

   LAS DOS MONEDAS. Nicolás vende dentro y fuera de Chile, así que cada cifra
   viaja en pesos y en dólares. El peso es el precio de verdad —es lo que se
   cobra y lo que se paga— y el dólar es la referencia para que un cliente de
   afuera sepa si le alcanza antes de escribir. Por eso el cambio va anotado con
   su fecha: cuando el dólar se mueva, se actualiza acá y en ningún otro lado.

   DÓNDE VIVEN LOS MONTOS. En `api/_precios.js`, no acá. Este archivo tiene el
   texto —qué advertencia lleva el botón, cómo se lee la cifra— y de allá saca
   las cifras. Se hizo así porque la función que cobra también las necesita, y
   dos listas de precios en dos archivos distintos terminan mostrando una cosa y
   cobrando otra.
   ========================================================================== */

import { PRECIOS, anticipoDe } from '../../api/_precios.js'

/** Los identificadores que el servidor sabe cobrar. */
export type IdPaquete = keyof typeof PRECIOS

/**
 * El cambio con el que se calcularon los dólares de este archivo.
 *
 * Se anota la fecha a propósito: un precio en dólares convertido hace tres
 * meses ya no es el mismo, y sin la fecha nadie sabe si hay que recalcular.
 */
export const CAMBIO = { clp: 960, fecha: '19 de septiembre de 2026' }

/**
 * ¿Está la pasarela lista para cobrar?
 *
 * Mientras esto sea `false`, los precios se muestran igual pero el botón lleva
 * al formulario en vez de abrir un pago. Es a propósito: un botón que dice
 * "Comprar" y contesta "no disponible" es peor que no tener botón —quema la
 * única oportunidad de que esa persona haga clic, y deja la impresión de que el
 * sitio está a medio terminar.
 */
export const COBRO_EN_LINEA = true

/**
 * Cómo se paga un servicio desde el sitio.
 *
 * - `completo`: se paga entero con un clic. Los mensuales y el diagnóstico.
 * - `anticipo`: se cobra el 30 % que reserva el cupo; el resto se acuerda en la
 *   reunión. Vender un proyecto de $690.000 con un clic y sin hablar antes
 *   termina en devoluciones y en clientes que esperaban otra cosa.
 * - `conversar`: no se paga en línea. El botón lleva al formulario.
 */
export type FormaDePago = 'completo' | 'anticipo' | 'conversar'

/** El precio de un servicio, tal como se muestra y tal como se cobra. */
export type Pago = {
  /** Identificador estable: viaja al servidor y queda en la orden de Flow. */
  id: IdPaquete
  /** El precio en pesos. Es el precio de verdad. */
  clp: number
  /** El mismo precio en dólares, al cambio de `CAMBIO`. Solo referencia. */
  usd: number
  /** Lo que se cobra ahora mismo. Igual al total, salvo en los de anticipo. */
  cobraAhora: number
  forma: Exclude<FormaDePago, 'conversar'>
  /** "desde" cuando el alcance mueve el precio; vacío cuando es cerrado. */
  prefijo?: string
  /** "al mes" en los que se cobran mes a mes. */
  sufijo?: string
  /** El aviso que va bajo el botón. Nadie debería pagar sin saber esto. */
  letraChica: string
}

/**
 * El precio de un servicio, armado desde la lista que usa el servidor.
 *
 * Los dólares se calculan, no se escriben a mano: así no puede quedar un dólar
 * viejo al lado de un peso nuevo. Se redondean a la decena porque son una
 * referencia, no un monto que alguien vaya a pagar —USD 719 y USD 720 dicen
 * exactamente lo mismo y el segundo se lee mejor.
 *
 * La forma de pago tampoco se repite acá: sale de `cobra`, en `_precios.js`,
 * que es el mismo campo que decide qué se le cobra de verdad a la tarjeta. Si
 * se declarara a mano en los dos lados, el día que cambie en uno el sitio va a
 * prometer un anticipo y Flow va a cobrar el total.
 */
export function pago(
  id: IdPaquete,
  extra: { sufijo?: string; letraChica?: string; prefijo?: string } = {},
): Pago {
  const p = PRECIOS[id]
  const esAnticipo = p.cobra === 'anticipo'
  return {
    id,
    clp: p.total,
    usd: Math.round(p.total / CAMBIO.clp / 10) * 10,
    cobraAhora: esAnticipo ? anticipoDe(p.total) : p.total,
    forma: p.cobra,
    /* Lo que se construye una vez lleva "desde" porque el alcance lo mueve; lo
       que se cobra al mes es un plan cerrado y no lo lleva. */
    prefijo: esAnticipo ? 'desde' : undefined,
    letraChica: esAnticipo
      ? 'El anticipo reserva tu cupo. El resto se acuerda en la reunión.'
      : 'Se paga entero, una sola vez.',
    ...extra,
  }
}

/** $690.000 — así se escribe una cifra en Chile, con punto de miles. */
export function pesos(n: number) {
  return `$${n.toLocaleString('es-CL')}`
}

/** USD 719 — sin decimales: es una referencia, no el monto que se cobra. */
export function dolares(n: number) {
  return `USD ${n.toLocaleString('en-US')}`
}
