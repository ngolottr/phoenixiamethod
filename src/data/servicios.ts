/* ============================================================================
   LAS SOLUCIONES DE PHOENIX IA METHOD — QUÉ SE HACE Y CUÁNTO CUESTA
   ----------------------------------------------------------------------------
   Antes esto era el mapa de lo que se sabe hacer y los precios vivían en otra
   vista, un clic más allá. Eran dos listas que hablaban de lo mismo con
   nombres distintos, y el visitante tenía que adivinar qué paquete correspondía
   a qué servicio. Ahora cada servicio trae su precio pegado: se lee de una vez
   qué resuelve, qué incluye y qué vale.

   Los precios salen de `api/_precios.js` a través de `pago()` (ver
   `precios.ts`): acá no se escribe ni una cifra a mano.

   QUÉ LLEVA PRECIO Y QUÉ NO. Todo lo que tiene un alcance reconocible lleva
   cifra publicada. Lo único que va a conversación son los proyectos especiales,
   porque cotizar una plataforma sin entender antes el problema es inventar un
   número. Los proyectos se publican con "desde" —el alcance mueve el precio— y
   los mensuales con precio cerrado, porque un plan base tiene un valor y lo que
   se salga de él se conversa antes de cobrarlo.

   Los casos (proyectos.ts) son otra cosa y nunca se mezclan: ahí está lo que ya
   está construido, con cifras de resultado. Esto es la oferta.

   El ícono de cada uno reproduce el de la lámina, dibujado como trazo propio
   (ver components/ServicioIcono.tsx): sin librerías ni archivos externos.
   ========================================================================== */

import { pago, type Pago } from './precios'

export type IconoServicio =
  | 'lupa'
  | 'ia'
  | 'web'
  | 'video'
  | 'megafono'
  | 'barras'
  | 'paleta'
  | 'carro'
  | 'personas'
  | 'engranaje'
  | 'fichero'
  | 'asesor'
  | 'cohete'
  | 'cerebro'

export type Servicio = {
  icono: IconoServicio
  titulo: string
  bajada: string
  items: string[]
  /** El precio. `null` es "a conversar": no se puede pagar en línea. */
  pago: Pago | null
  /** El que se muestra con marco: el de entrada, no el más caro. */
  destacado?: boolean
}

export const servicios: Servicio[] = [
  /* La puerta de entrada. Va primera y destacada a propósito: es lo que
     conviene que se compre antes que nada, y es la única cifra del catálogo
     que se descuenta después del proyecto. */
  {
    icono: 'lupa',
    titulo: 'Diagnóstico Fénix',
    bajada: 'Antes de construir nada: qué te está costando tiempo de verdad y qué conviene automatizar primero.',
    items: [
      'Una reunión 1:1 para entender el problema',
      'Revisión de tu sitio, tus procesos y tus herramientas',
      'Informe escrito con el plan, en orden de impacto',
      'Qué se puede resolver gratis y qué justifica pagar',
      'Si después contratas, se descuenta del proyecto',
    ],
    pago: pago('diagnostico', {
      letraChica: 'Se paga entero. Si después de revisarlo juntos el informe no te sirve, avísame dentro de 7 días y se devuelve completo.',
    }),
    destacado: true,
  },

  /* El paquete cerrado para pymes (M8), Reborn Phoenix. Va justo después del diagnóstico: es
     lo que la mayoría de los negocios chicos necesita, dicho sin tecnicismos y
     con un solo precio. El asistente con IA que conversa queda como el paso
     siguiente (Inteligencia artificial y agentes). */
  {
    icono: 'cohete',
    titulo: 'Reborn Phoenix · plan para pymes',
    bajada: 'Tu negocio recibe reservas o pedidos solo, desde el celular de tus clientes. Un precio cerrado, sin sorpresas.',
    items: [
      'Tus clientes reservan o piden solos, a cualquier hora',
      'Tu negocio en Google Maps con botón para reservar',
      'Un aviso en tu celular por cada reserva o pedido',
      'Recordatorio al cliente para que no se te caigan horas',
      'WhatsApp que responde fuera de horario con tu link',
      'Cartel con QR, te enseño a usarlo y un tablero con tus números',
    ],
    pago: pago('reborn', {
      prefijo: undefined,
      letraChica: 'Partes con $135.000. Los $315.000 restantes, al terminar el primer mes, cuando ya lo viste funcionando. Después, $45.000 al mes, sin permanencia. La agenda (AgendaPro, desde $15.900 al mes) la pagas directo a AgendaPro.',
    }),
  },

  /* --- Lo que se construye una vez ---------------------------------------- */
  {
    icono: 'ia',
    titulo: 'Inteligencia artificial y agentes',
    bajada: 'Un asistente que atiende, responde y agenda a la hora que sea, con la información de tu negocio.',
    items: [
      'Agente de WhatsApp o web que responde 24/7',
      'Conectado a tu agenda, tu catálogo y tus precios',
      'Escala a una persona cuando no sabe algo',
      'Entrenado con tus documentos, no con inventos',
      'Corriendo en tu cuenta, no en la mía',
    ],
    pago: pago('agentes'),
  },
  {
    icono: 'engranaje',
    titulo: 'Automatización e integraciones',
    bajada: 'Un flujo que hace solo lo que hoy haces a mano: recibe, decide con datos, ejecuta y te avisa.',
    items: [
      'El flujo armado, probado nodo a nodo y documentado',
      'Conectado a lo que ya usas: correo, planillas, WhatsApp',
      'Te queda el diagrama y la explicación de cada paso',
      'Un mes de ajustes mientras lo ves andar',
      'Precio por flujo, no por hora',
    ],
    pago: pago('automatizacion'),
  },
  {
    icono: 'fichero',
    titulo: 'CRM y gestión de clientes',
    bajada: 'Dejar de perder ventas en el chat: cada contacto con su ficha, su etapa y su próximo paso.',
    items: [
      'Embudo con etapas, del primer contacto al cierre',
      'Ficha por cliente: historial, documentos y próximo paso',
      'Los contactos del sitio y WhatsApp entran solos',
      'Recordatorios de seguimiento que se disparan solos',
      'Tablero con lo vendido, lo pendiente y lo perdido',
      'Sobre lo que ya usas o a medida; los datos son tuyos',
    ],
    pago: pago('crm'),
  },
  {
    icono: 'web',
    titulo: 'Desarrollo web y aplicaciones',
    bajada: 'Como éste: construido pieza por pieza, sin plantilla, con el formulario y la agenda conectados de verdad.',
    items: [
      'Identidad sacada de tu marca, no de un tema comprado',
      'Formulario y agenda conectados a tu correo y calendario',
      'Estadísticas propias, sin rastreadores de terceros',
      'Funciona igual en un teléfono de gama baja',
      'Te queda el código: ninguna plataforma te lo toma de rehén',
    ],
    pago: pago('sitio'),
  },
  {
    icono: 'carro',
    titulo: 'E-commerce y ventas',
    bajada: 'Cuando además hay que vender: catálogo, carrito y medios de pago chilenos andando el día que se publica.',
    items: [
      'Todo lo del sitio, más catálogo y carrito',
      'Medios de pago chilenos conectados y probados',
      'Despacho, stock y boletas según cómo trabajes',
      'Capacitación para que cargues productos tú mismo',
      'Un mes de ajustes después de publicar',
    ],
    pago: pago('tienda'),
  },
  {
    icono: 'paleta',
    titulo: 'Branding y diseño',
    bajada: 'Tu marca con identidad y propósito, no un logo suelto que después nadie sabe cómo usar.',
    items: [
      'Identidad visual: logo, colores y tipografías',
      'Manual corto de cómo se usa cada pieza',
      'Material corporativo y plantillas editables',
      'Diseño para redes, packaging y documentos',
      'Los archivos originales quedan contigo',
    ],
    pago: pago('branding'),
  },

  /* --- Lo que se cobra mes a mes ------------------------------------------ */
  {
    icono: 'video',
    titulo: 'Creación de contenido y video',
    bajada: 'Ideas que se ven, se sienten y conectan: contenido constante en vez de una ráfaga y tres meses en blanco.',
    items: [
      'Calendario de contenido del mes, cerrado por adelantado',
      'Ocho piezas al mes: reels, TikToks o shorts',
      'Edición, subtítulos y motion graphics',
      'Grabación en terreno a convenir por sesión',
      'Reporte de qué funcionó y qué se cambia',
    ],
    pago: pago('contenido', { sufijo: 'al mes' }),
  },
  {
    icono: 'megafono',
    titulo: 'Publicidad digital',
    bajada: 'Llegar a las personas correctas en el momento correcto, con la plata medida peso a peso.',
    items: [
      'Campañas en Meta, Google o TikTok Ads',
      'Segmentación, remarketing y pruebas A/B',
      'Seguimiento de conversiones instalado de verdad',
      'Reporte mensual con costo por contacto y por venta',
      'Gestión de hasta dos plataformas a la vez',
    ],
    pago: pago('publicidad', {
      sufijo: 'al mes',
      letraChica: 'Es la gestión. La inversión en la plataforma la pones tú y va aparte.',
    }),
  },
  {
    icono: 'barras',
    titulo: 'Marketing digital',
    bajada: 'Estrategia para atraer, convertir y fidelizar: el plan completo, no una pieza suelta.',
    items: [
      'Estrategia de marca y posicionamiento',
      'SEO: que te encuentren cuando te buscan',
      'Email marketing y embudos de venta',
      'Contenido y redes coordinados con las campañas',
      'Reunión mensual de números y decisiones',
    ],
    pago: pago('marketing', { sufijo: 'al mes' }),
  },
  {
    icono: 'personas',
    titulo: 'Redes sociales y comunidad',
    bajada: 'Construir comunidad, no juntar seguidores: gente que vuelve, pregunta y compra.',
    items: [
      'Gestión diaria de tus redes',
      'Respuesta a comentarios y mensajes',
      'Calendario de publicaciones y campañas',
      'Estrategia de comunidad y fidelización',
      'Monitoreo, análisis y reporte mensual',
    ],
    pago: pago('comunidad', { sufijo: 'al mes' }),
  },
  {
    icono: 'asesor',
    titulo: 'Consultoría y acompañamiento',
    bajada: 'Para cuando el sistema ya está andando y hay que mantenerlo vivo: ajustes, métricas y lo que aparezca.',
    items: [
      'Horas de trabajo al mes sobre lo ya construido',
      'Monitoreo de que los flujos sigan corriendo',
      'Capacitación a tu equipo en IA y herramientas',
      'Reporte mensual de qué pasó y qué conviene cambiar',
      'Prioridad cuando algo se cae. Sin permanencia',
    ],
    pago: pago('acompanamiento', {
      sufijo: 'al mes',
      letraChica: 'Se cobra mes a mes. Sin permanencia ni cláusula de salida.',
    }),
  },

  /* --- Lo único sin cifra --------------------------------------------------
     Y va sin cifra por la razón correcta: no se sabe qué vale hasta entender
     qué es. Poner un número acá sería inventarlo. */
  {
    icono: 'cohete',
    titulo: 'Proyectos especiales',
    bajada: 'Lo que no cabe en ninguno de los anteriores: una plataforma, un sistema interno, algo que todavía no existe.',
    items: [
      'Se cotiza después de entender el problema, no antes',
      'Se parte por la pieza que más duele, no por la más vistosa',
      'Desarrollo de productos digitales y sistemas a medida',
      'Trabajo un proyecto a la vez',
    ],
    pago: null,
  },
]

/** La tarjeta que cierra la grilla: no es un servicio más, es lo que los une. */
export const cierreMetodo = {
  icono: 'cerebro' as IconoServicio,
  titulo: 'Más que servicios,',
  enfasis: 'es un método.',
  texto:
    'El Método Fénix con IA te da la estrategia, las herramientas y el acompañamiento para transformar tus ideas en resultados reales.',
}
