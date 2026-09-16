/* ============================================================================
   LOS SERVICIOS DE PHOENIX IA METHOD
   ----------------------------------------------------------------------------
   Sacados de la lámina "¿Qué es el Método Fénix con IA?". No son casos: los
   casos (proyectos.ts) muestran lo que ya está construido y con cifras; esto
   es el mapa de lo que se sabe hacer, para que quien entra sepa si su problema
   cae dentro. Por eso van en vistas separadas y nunca se mezclan.

   El ícono de cada uno reproduce el de la lámina, dibujado como trazo propio
   (ver components/ServicioIcono.tsx): sin librerías ni archivos externos.
   ========================================================================== */

export type IconoServicio =
  | 'ia'
  | 'web'
  | 'video'
  | 'megafono'
  | 'barras'
  | 'paleta'
  | 'carro'
  | 'personas'
  | 'engranaje'
  | 'asesor'
  | 'cohete'
  | 'cerebro'

export type Servicio = {
  icono: IconoServicio
  titulo: string
  bajada: string
  items: string[]
}

export const servicios: Servicio[] = [
  {
    icono: 'ia',
    titulo: 'Inteligencia artificial',
    bajada: 'Automatiza, optimiza y multiplica tus resultados.',
    items: [
      'Chatbots y asistentes virtuales',
      'Automatización de procesos',
      'Integraciones con IA (APIs, GPTs, etc.)',
      'Análisis de datos y reportes',
      'Soluciones personalizadas',
    ],
  },
  {
    icono: 'web',
    titulo: 'Desarrollo web y aplicaciones',
    bajada: 'Tu presencia digital, sin límites.',
    items: [
      'Páginas web modernas y rápidas',
      'Tiendas online (e-commerce)',
      'Landing pages',
      'Aplicaciones a medida',
      'Integraciones y APIs',
    ],
  },
  {
    icono: 'video',
    titulo: 'Creación de contenido y video',
    bajada: 'Ideas que se ven, se sienten y conectan.',
    items: [
      'Fotos y videos profesionales',
      'Reels, TikToks, Shorts',
      'Edición y postproducción',
      'Motion graphics',
      'Calendario de contenido',
    ],
  },
  {
    icono: 'megafono',
    titulo: 'Publicidad digital',
    bajada: 'Llegamos a las personas correctas, en el momento ideal.',
    items: [
      'Meta Ads (Facebook / Instagram)',
      'Google Ads',
      'TikTok Ads',
      'Remarketing',
      'Segmentación avanzada',
    ],
  },
  {
    icono: 'barras',
    titulo: 'Marketing digital',
    bajada: 'Estrategia para atraer, convertir y fidelizar.',
    items: [
      'Estrategia de marca',
      'Posicionamiento SEO',
      'Gestión de redes sociales',
      'Email marketing',
      'Embudos de venta',
    ],
  },
  {
    icono: 'paleta',
    titulo: 'Branding y diseño',
    bajada: 'Tu marca, con identidad y propósito.',
    items: [
      'Identidad visual',
      'Logos y estilo de marca',
      'Diseño gráfico',
      'Material corporativo',
      'Packaging digital y físico',
    ],
  },
  {
    icono: 'carro',
    titulo: 'E-commerce y ventas',
    bajada: 'Convierte visitas en clientes.',
    items: [
      'Tiendas online',
      'Funnels de venta',
      'Automatización de ventas',
      'Integración con medios de pago',
      'Estrategias de conversión',
    ],
  },
  {
    icono: 'personas',
    titulo: 'Redes sociales y comunidad',
    bajada: 'Construimos comunidades que hacen crecer tu marca.',
    items: [
      'Gestión de redes sociales',
      'Interacción y fidelización',
      'Estrategia de comunidad',
      'Creación de contenido',
      'Monitoreo y análisis',
    ],
  },
  {
    icono: 'engranaje',
    titulo: 'Automatización e integraciones',
    bajada: 'Haz que tu negocio funcione en piloto automático.',
    items: [
      'Flujos de trabajo automatizados',
      'Integraciones entre plataformas',
      'CRM y gestión de clientes',
      'Bots y asistentes IA',
      'Optimización de procesos',
    ],
  },
  {
    icono: 'asesor',
    titulo: 'Consultoría e implementación',
    bajada: 'No solo te entregamos soluciones, te acompañamos en el proceso.',
    items: [
      'Asesoría personalizada',
      'Capacitación en IA y herramientas',
      'Soporte continuo',
      'Escalamiento de proyectos',
      'Comunidad Fénix',
    ],
  },
  {
    icono: 'cohete',
    titulo: 'Proyectos especiales',
    bajada: 'Soluciones a medida para ideas únicas.',
    items: [
      'Desarrollo de productos digitales',
      'Integraciones con IA',
      'Plataformas y sistemas personalizados',
      'Automatizaciones avanzadas',
      'Investigación y desarrollo',
    ],
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
