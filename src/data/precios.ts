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

   REGLA DE LA MARCA: acá solo se pone precio a lo que se sabe hacer y ya se
   hizo. Si algún día se agrega un paquete que todavía no se ha entregado nunca,
   no va con precio: va a conversación.

   LAS DOS MONEDAS. Nicolás vende dentro y fuera de Chile, así que cada cifra
   viaja en pesos y en dólares. El peso es el precio de verdad —es lo que se
   cobra y lo que se paga— y el dólar es la referencia para que un cliente de
   afuera sepa si le alcanza antes de escribir. Por eso el cambio va anotado con
   su fecha: cuando el dólar se mueva, se actualiza acá y en ningún otro lado.

   DÓNDE VIVEN LOS MONTOS. En `api/_precios.js`, no acá. Este archivo tiene el
   texto —qué incluye cada paquete, qué advertencia lleva el botón— y de allá
   saca las cifras. Se hizo así porque la función que cobra también las
   necesita, y dos listas de precios en dos archivos distintos terminan
   mostrando una cosa y cobrando otra.
   ========================================================================== */

import { PRECIOS, anticipoDe } from '../../api/_precios.js'

/**
 * El cambio con el que se calcularon los dólares de este archivo.
 *
 * Se anota la fecha a propósito: un precio en dólares convertido hace tres
 * meses ya no es el mismo, y sin la fecha nadie sabe si hay que recalcular.
 * Cuando se actualice, hay que repasar los `usd` de abajo.
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
 *
 * Se pone en `true` el día que las llaves de la pasarela estén cargadas en
 * Vercel, y no antes. Es un interruptor explícito y no una detección
 * automática porque el navegador no puede saber si el servidor tiene las
 * llaves sin preguntárselo, y preguntar significa una llamada de más en cada
 * visita para responder algo que cambia una vez en la vida.
 */
export const COBRO_EN_LINEA = false

/**
 * Cómo se paga un paquete desde el sitio.
 *
 * - `completo`: se paga entero con un clic. Solo para lo que es acotado y no
 *   depende de entender antes el problema del cliente.
 * - `anticipo`: se cobra el 30 % que reserva el cupo; el resto se acuerda en la
 *   reunión. Vender un proyecto de $690.000 con un clic y sin hablar antes
 *   termina en devoluciones y en clientes que esperaban otra cosa.
 * - `conversar`: no se paga en línea. El botón lleva al formulario.
 */
export type FormaDePago = 'completo' | 'anticipo' | 'conversar'

export type Paquete = {
  /** Identificador estable: viaja al servidor y queda en la orden de Flow. */
  id: string
  nombre: string
  /** Una línea: qué problema resuelve, no qué tecnología usa. */
  bajada: string
  /** El precio en pesos. `null` cuando el paquete va a conversación. */
  clp: number | null
  /** El mismo precio en dólares, al cambio de `CAMBIO`. Solo referencia. */
  usd: number | null
  /** "desde" cuando el alcance cambia el precio; vacío cuando es cerrado. */
  prefijo?: string
  /** "al mes" y similares. */
  sufijo?: string
  /** Qué se lleva el cliente. Concreto y comprobable. */
  incluye: string[]
  forma: FormaDePago
  /** Lo que se cobra ahora mismo, si la forma es `anticipo`. */
  anticipo?: number
  /** El aviso que va bajo el botón. Nadie debería pagar sin saber esto. */
  letraChica?: string
  /** El que se muestra primero y con marco: el de entrada, no el más caro. */
  destacado?: boolean
}

/** El precio en pesos de un paquete, sacado de la lista que usa el servidor. */
const clpDe = (id: keyof typeof PRECIOS) => PRECIOS[id].total

/**
 * El mismo precio en dólares.
 *
 * Se calcula, no se escribe a mano: así no puede quedar un dólar viejo al lado
 * de un peso nuevo. Se redondea a la decena porque es una referencia, no un
 * monto que alguien vaya a pagar —USD 719 y USD 720 dicen exactamente lo mismo
 * y el segundo se lee mejor.
 */
const usdDe = (id: keyof typeof PRECIOS) => Math.round(clpDe(id) / CAMBIO.clp / 10) * 10

export const paquetes: Paquete[] = [
  {
    id: 'diagnostico',
    nombre: 'Diagnóstico Fénix',
    bajada:
      'Antes de construir nada: qué te está costando tiempo de verdad, qué se puede automatizar hoy y qué no conviene tocar.',
    clp: clpDe('diagnostico'),
    usd: usdDe('diagnostico'),
    incluye: [
      'Una reunión de una hora para entender el problema',
      'Revisión de tu sitio, tus procesos y tus herramientas actuales',
      'Informe escrito con el plan, en orden de impacto',
      'Qué se puede resolver gratis y qué justifica pagar',
      'Si después contratas, los $90.000 se descuentan del proyecto',
    ],
    forma: 'completo',
    letraChica: 'Se paga entero. Si el informe no te sirve, se devuelve.',
    destacado: true,
  },
  {
    id: 'sitio',
    nombre: 'Sitio que convierte',
    bajada:
      'Como éste: construido pieza por pieza, sin plantilla, con el formulario y la agenda conectados de verdad.',
    clp: clpDe('sitio'),
    usd: usdDe('sitio'),
    prefijo: 'desde',
    incluye: [
      'Identidad sacada de tu marca o de tus fotos, no de un tema comprado',
      'Formulario y agenda conectados a tu correo y tu calendario',
      'Estadísticas propias, sin rastreadores de terceros ni cookies',
      'Funciona igual en un teléfono de gama baja',
      'Te queda el código: no hay plataforma que te lo tome de rehén',
    ],
    forma: 'anticipo',
    anticipo: anticipoDe(clpDe('sitio')),
    letraChica: 'El anticipo reserva tu cupo. El resto se acuerda en la reunión.',
  },
  {
    id: 'tienda',
    nombre: 'Tienda online',
    bajada:
      'Cuando además hay que vender: catálogo, carrito y medios de pago chilenos funcionando el día que se publica.',
    clp: clpDe('tienda'),
    usd: usdDe('tienda'),
    prefijo: 'desde',
    incluye: [
      'Todo lo del sitio, más catálogo y carrito',
      'Medios de pago chilenos conectados y probados',
      'Despacho, stock y boletas según cómo trabajes',
      'Capacitación para que cargues productos tú mismo',
      'Un mes de ajustes después de publicar',
    ],
    forma: 'anticipo',
    anticipo: anticipoDe(clpDe('tienda')),
    letraChica: 'El anticipo reserva tu cupo. El resto se acuerda en la reunión.',
  },
  {
    id: 'automatizacion',
    nombre: 'Automatización a medida',
    bajada:
      'Un flujo que hace solo lo que hoy haces a mano: recibe, decide con datos, ejecuta y te avisa. Por flujo.',
    clp: clpDe('automatizacion'),
    usd: usdDe('automatizacion'),
    prefijo: 'desde',
    incluye: [
      'El flujo armado, probado nodo a nodo y documentado',
      'Conectado a lo que ya usas: correo, planillas, CRM, WhatsApp',
      'Corriendo en tu cuenta, no en la mía',
      'Te queda el diagrama y la explicación de cada paso',
      'Un mes de ajustes mientras lo ves andar',
    ],
    forma: 'anticipo',
    anticipo: anticipoDe(clpDe('automatizacion')),
    letraChica: 'El anticipo reserva tu cupo. El resto se acuerda en la reunión.',
  },
  {
    id: 'acompanamiento',
    nombre: 'Acompañamiento',
    bajada:
      'Para cuando el sistema ya está andando y hay que mantenerlo vivo: ajustes, métricas y lo que vaya apareciendo.',
    clp: clpDe('acompanamiento'),
    usd: usdDe('acompanamiento'),
    sufijo: 'al mes',
    incluye: [
      'Horas de trabajo al mes sobre lo que ya está construido',
      'Monitoreo de que los flujos sigan corriendo',
      'Reporte mensual de qué pasó y qué conviene cambiar',
      'Prioridad cuando algo se cae',
      'Sin permanencia: se corta cuando quieras',
    ],
    forma: 'completo',
    letraChica: 'Se cobra mes a mes. Sin permanencia ni cláusula de salida.',
  },
  {
    id: 'especial',
    nombre: 'Proyecto especial',
    bajada:
      'Lo que no cabe en ninguno de los anteriores: una plataforma, un sistema interno, algo que todavía no existe.',
    clp: null,
    usd: null,
    incluye: [
      'Se cotiza después de entender el problema, no antes',
      'Trabajo un proyecto a la vez',
      'Se parte por la pieza que más duele, no por la más vistosa',
    ],
    forma: 'conversar',
  },
]

/** $690.000 — así se escribe una cifra en Chile, con punto de miles. */
export function pesos(n: number) {
  return `$${n.toLocaleString('es-CL')}`
}

/** USD 719 — sin decimales: es una referencia, no el monto que se cobra. */
export function dolares(n: number) {
  return `USD ${n.toLocaleString('en-US')}`
}

/** Lo que se cobra ahora mismo por este paquete, o null si no se cobra. */
export function montoACobrar(p: Paquete): number | null {
  if (p.forma === 'conversar' || p.clp === null) return null
  return p.forma === 'anticipo' ? p.anticipo ?? null : p.clp
}
