/* ============================================================================
   ÚNICO ARCHIVO QUE NECESITAS EDITAR PARA CAMBIAR TODO EL CONTENIDO DEL SITIO.
   Textos, fotos, enlaces, proyectos, versos y las historias destacadas.

   Las fotos salen de public/images/ (publicaciones) y de
   public/images/highlights/<coleccion>/ (historias destacadas de Instagram).
   El color de fondo NO se define aquí: el sitio lo extrae de cada imagen.
   ========================================================================== */

export type Social = {
  label: string
  handle: string
  url: string
  /** qué se publica ahí, en pocas palabras */
  que: string
  /** foto que acompaña a la fila */
  image: string
}

/** Las categorías con las que se ordena la galería. */
export const categories = [
  { id: 'todo', label: 'Todo' },
  { id: 'retrato', label: 'Retrato' },
  { id: 'noche', label: 'Noche' },
  { id: 'humor', label: 'Humor' },
  { id: 'mundo', label: 'Mundo' },
  { id: 'juego', label: 'Juego' },
] as const

export type CategoryId = (typeof categories)[number]['id']

export type Shot = {
  src: string
  alt: string
  caption: string
  /** frase breve que acompaña a la foto; en las de humor es el chiste */
  note: string
  category: Exclude<CategoryId, 'todo'>
  year: string
}

export const brand = {
  name: 'ELGOLOTT',
  nameLine1: 'EL',
  nameLine2: 'GOLOTT',
  legalName: 'Nicolás Golott',
  role: 'Dirección creativa · Contenido · IA aplicada',
  location: 'Santiago, Chile',
  tagline: 'No pido permiso para ocupar el cuadro.',
  email: 'contacto.nicolaspk@gmail.com',
  year: '2026',
}

export const hero = {
  /** figura recortada sobre fondo transparente: deja el texto libre */
  image: 'images/hero-figura.png',
  alt: 'Nicolás de pie, ajustándose los lentes, recortado sobre el fondo.',
  eyebrow: 'Portfolio · MMXXVI',
  cta: 'Entrar',
}

export const about = {
  eyebrow: 'Sobre mí',
  title: 'Construyo\nen público.',
  paragraphs: [
    'Soy Nicolás. Trabajo en la intersección entre dirección creativa, contenido e inteligencia artificial aplicada: diseño sistemas que producen, miden y mejoran solos.',
    'No vendo humo ni resultados prestados. Todo lo que muestro acá lo construí, lo rompí y lo volví a armar delante de cámara. La autoridad se gana documentando, no posando.',
    'Y sí, entre medio hay memes. La seriedad permanente es otra forma de posar.',
  ],
  stats: [
    { value: '2026', label: 'Operación 100K' },
    { value: '113', label: 'Piezas publicadas' },
    { value: '∞', label: 'Iteraciones' },
  ],
  portraits: [
    { src: 'images/bn-bototos.jpg', alt: 'Retrato en blanco y negro, contrapicado.' },
    { src: 'images/espejo-amarillo.jpg', alt: 'Selfie de espejo con lentes amarillos y abrigo azul.' },
  ],
}

/* ---------------------------------------------------------------------------
   GALERÍA — publicaciones de Instagram
   --------------------------------------------------------------------------- */

export const gallery: Shot[] = [
  {
    src: 'images/camara-verde.jpg',
    alt: 'De pie en un pasillo de piedra con luz verde esmeralda.',
    caption: 'La Cámara',
    note: 'La luz hizo la mitad del trabajo. La otra mitad fue no moverme.',
    category: 'retrato',
    year: '2026',
  },
  {
    src: 'images/bn-bototos.jpg',
    alt: 'Retrato en blanco y negro sentado, contrapicado, con bototos.',
    caption: 'Contrapicado',
    note: 'Sin color no hay dónde esconderse.',
    category: 'retrato',
    year: '2026',
  },
  {
    src: 'images/sepia-osb.jpg',
    alt: 'Perfil contra un muro de madera, luz dura de mediodía.',
    caption: 'Muro y Sombra',
    note: 'El sol pega fuerte y eso también es dirección de arte.',
    category: 'retrato',
    year: '2026',
  },
  {
    src: 'images/espejo-amarillo.jpg',
    alt: 'Selfie de espejo con abrigo azul y lentes de cristal amarillo.',
    caption: 'Cristal Ámbar',
    note: 'El espejo es el único fotógrafo que siempre está disponible.',
    category: 'retrato',
    year: '2026',
  },
  {
    src: 'images/fiesta-roja.jpg',
    alt: 'Escena de fiesta bañada en luz roja, movimiento en la toma.',
    caption: 'Sala Roja',
    note: 'Se movió la foto, no yo.',
    category: 'noche',
    year: '2026',
  },
  {
    src: 'images/luz-azul.jpg',
    alt: 'Silueta entre humo y luz azul de discoteca.',
    caption: 'Azul Total',
    note: 'Toda la pieza era de ese color. La foto no exagera.',
    category: 'noche',
    year: '2026',
  },
  {
    src: 'images/dientes.jpg',
    alt: 'Selfie de espejo en un baño, lavándose los dientes.',
    caption: 'Higiene Editorial',
    note: 'El baño de la pega también es un set. Es cosa de decidirlo.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/spiderman.jpg',
    alt: 'Traje de Spider-Man junto a una caja gigante de Funko POP.',
    caption: 'Vecino y Amigable',
    note: 'Un gran traje conlleva una gran foto.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/borroso.jpg',
    alt: 'Rostro desenfocado en la oscuridad, lentes reflejando luz.',
    caption: 'Sin Testigos',
    note: 'Salió movida y quedó mejor que las diez anteriores.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/minecraft-render.jpg',
    alt: 'Render de Minecraft con mi cara sobre un cuerpo de bloques.',
    caption: 'Bloques',
    note: 'Mi cara aguanta cualquier motor gráfico.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/libro-hp.jpg',
    alt: 'Sentado sobre un libro gigante en una exposición.',
    caption: 'Capítulo Uno',
    note: 'Ninguna banca fue tan cómoda ni tan literaria.',
    category: 'mundo',
    year: '2026',
  },
  {
    src: 'images/espaldas-hp.jpg',
    alt: 'De espaldas frente a un mural iluminado en rojo.',
    caption: 'De Espaldas',
    note: 'A veces la mejor foto es la que no posaste.',
    category: 'mundo',
    year: '2026',
  },
  {
    src: 'images/semaforo-luna.jpg',
    alt: 'Luna creciente sobre nubes con un semáforo en rojo abajo.',
    caption: 'Rojo y Luna',
    note: 'Esperar el verde tiene sus recompensas.',
    category: 'mundo',
    year: '2026',
  },
  {
    src: 'images/balcon.jpg',
    alt: 'Selfie en un balcón con torres y cielo nublado de Santiago.',
    caption: 'Santiago Nublado',
    note: 'La ciudad que me tocó, en el color que le tocó.',
    category: 'mundo',
    year: '2026',
  },
  {
    src: 'images/parque.jpg',
    alt: 'Selfie en un parque soleado acompañado.',
    caption: 'Sol de Parque',
    note: 'Los mejores planes no se agendan.',
    category: 'mundo',
    year: '2026',
  },
  {
    src: 'images/escalera.jpg',
    alt: 'Selfie con dos amigos en una escalera mecánica de mall.',
    caption: 'Escalera Arriba',
    note: 'Subiendo, como corresponde.',
    category: 'mundo',
    year: '2026',
  },
  {
    src: 'images/setup-gaming.jpg',
    alt: 'En cuclillas frente al setup de streaming con Minecraft en pantalla.',
    caption: 'El Puesto',
    note: 'Acá se graba, se edita y se falla. En ese orden.',
    category: 'juego',
    year: '2026',
  },
  {
    src: 'images/piscina.jpg',
    alt: 'En la piscina con lentes de sol haciendo el gesto de silencio.',
    caption: 'Silencio',
    note: 'No pregunten. Es verano.',
    category: 'juego',
    year: '2026',
  },
]

/* ---------------------------------------------------------------------------
   HISTORIAS DESTACADAS — rescatadas de Instagram
   Los archivos se listan solos en highlightFiles.ts. Acá van los metadatos:
   título, descripción y las frases que acompañan a cada imagen.
   --------------------------------------------------------------------------- */

export type Highlight = {
  slug: string
  title: string
  kind: string
  blurb: string
  /** una frase por video */
  notes: string[]
  /** los videos de la colección: es lo único que se muestra */
  videos: string[]
}

export const highlights: Highlight[] = [
  {
    slug: 'cielo',
    title: 'Cielo',
    kind: 'Contemplación',
    blurb:
      'Miro para arriba todos los días. Santiago tiene un cielo que nadie mira porque siempre está apurado.',
    notes: [
      'Esto estaba ahí. Solo había que mirar.',
      'Mismo cielo, distinto día.',
      'La ciudad tapa, pero no del todo.',
      'Atardecer sin filtro. No hace falta.',
      'Las palmeras de Santiago no piden permiso.',
      'Gratis, todos los días, a la misma hora.',
    ],
    videos: [
      'videos/cielo-01.mp4',
      'videos/cielo-02.mp4',
      'videos/cielo-03.mp4',
      'videos/cielo-04.mp4',
      'videos/cielo-05.mp4',
      'videos/cielo-06.mp4',
    ],
  },
  {
    slug: 'gym',
    title: 'Gym',
    kind: 'Disciplina',
    blurb:
      'La parte que nadie sube porque no es entretenida. La constancia se ve fea antes de verse bien.',
    notes: [
      'El día que no querís ir es el que cuenta.',
      'Nadie aplaude esta parte.',
      'Repetición. Otra vez. Y otra.',
      'Progreso lento es progreso igual.',
      'Acá no hay atajo que sirva.',
      'Esto no se delega.',
    ],
    videos: [
      'videos/gym-01.mp4',
      'videos/gym-02.mp4',
      'videos/gym-03.mp4',
      'videos/gym-04.mp4',
      'videos/gym-05.mp4',
      'videos/gym-06.mp4',
    ],
  },
  {
    slug: 'elgolott',
    title: 'El Golott',
    kind: 'La marca',
    blurb:
      'El personaje y la persona, en el mismo cuadro. Acá vive lo que después se convierte en contenido.',
    notes: [
      'Documentar mientras pasa, no después.',
      'El detrás de cámara es la mitad del trabajo.',
      'Trabajando en algo que todavía no se puede mostrar.',
      'Esto también es marca personal.',
      'Sin producción. Con intención.',
      'Lo que no se sube igual cuenta.',
    ],
    videos: [
      'videos/elgolott-01.mp4',
      'videos/elgolott-02.mp4',
      'videos/elgolott-03.mp4',
      'videos/elgolott-04.mp4',
      'videos/elgolott-05.mp4',
      'videos/elgolott-06.mp4',
    ],
  },
]

export const highlightsScene = {
  eyebrow: 'Historias destacadas',
  title: 'Lo que\nno se borra.',
  intro:
    'Tres colecciones rescatadas de Instagram. Pulsa una y los videos corren solos, mientras el sitio se tiñe con el color de lo que estás mirando.',
}

/* ------------------------------------------------------------------------- */

export type Work = {
  index: string
  title: string
  category: string
  description: string
  meta: string
  image: string
  url?: string
}

export const work: Work[] = [
  {
    index: '01',
    title: 'Operación 100K',
    category: 'Contenido',
    description:
      'Sistema de producción diaria de contenido vertical: guion, grabación, edición y métricas en un solo pipeline documentado en público.',
    meta: 'En curso · 2026',
    image: 'images/setup-gaming.jpg',
  },
  {
    index: '02',
    title: 'Fénix IA Method',
    category: 'Consultoría',
    description:
      'Metodología para meter IA y automatización en problemas reales de personas y organizaciones. Diagnóstico, rediseño y medición.',
    meta: 'Metodología propia',
    image: 'images/sepia-osb.jpg',
  },
  {
    index: '03',
    title: 'Agentes & Automatización',
    category: 'Sistemas',
    description:
      'Flujos con n8n, transcripción local y agentes que cortan, escriben y publican. Menos clics, más output.',
    meta: 'Infraestructura',
    image: 'images/minecraft-render.jpg',
  },
  {
    index: '04',
    title: 'Dirección de arte',
    category: 'Marca',
    description:
      'Identidad visual, dirección de fotografía y puesta en escena para marcas personales que no quieren parecerse a nadie.',
    meta: 'Bajo pedido',
    image: 'images/camara-verde.jpg',
  },
]

export const manifesto = {
  eyebrow: 'Manifiesto',
  verses: [
    { line: 'NO\n*ESPERO*\nTURNO', note: 'La oportunidad no toca la puerta. Se construye la puerta.' },
    { line: 'HAGO\n*RUIDO*\nCON\nCRITERIO', note: 'Presencia no es gritar. Es que se note cuando entras.' },
    { line: 'LO\n*FEO*\nNO\nCONVIERTE', note: 'La estética es una decisión de negocio, no un adorno.' },
    { line: 'ME\n*RÍO*\nDE MÍ\nPRIMERO', note: 'El que no se ríe de sí mismo se lo toma todo demasiado en serio.' },
    { line: 'DOCUMENTO\nTODO\n*INCLUSO*\nEL ERROR', note: 'La autoridad se gana mostrando el proceso, no el trofeo.' },
  ],
}

export const contact = {
  eyebrow: 'Contacto',
  title: 'Hablemos\nen serio.',
  intro:
    'Colaboraciones, dirección creativa, consultoría de IA o simplemente una idea que no te deja dormir.',
  copyLabel: 'Copiar email',
  copiedLabel: 'Copiado',
  formNote: 'Te llega un correo con el siguiente paso: agendar 30 minutos por Zoom.',
}

/** Opciones del desplegable de presupuesto. La primera es el marcador vacío. */
export const presupuestos = [
  'Prefiero conversarlo',
  'Menos de $300.000',
  'Entre $300.000 y $1.000.000',
  'Más de $1.000.000',
]

/** Franjas en que Nicolás atiende reuniones, en hora de Chile. */
export const disponibilidad = {
  resumen: 'Lunes a viernes desde las 20:30 · Sábados desde las 16:00 · Domingos todo el día',
}

/** Enlaces reales, tomados de elgolottlinks.carrd.co */
export const socials: Social[] = [
  {
    label: 'Instagram',
    handle: '@elgolott',
    url: 'https://www.instagram.com/elgolott/',
    que: 'El día a día, los cortes y lo que no alcanza a ser video.',
    image: 'images/camara-verde.jpg',
  },
  {
    label: 'TikTok',
    handle: '@elgolott',
    url: 'https://www.tiktok.com/@elgolott',
    que: 'Vertical diario de Operación 100K. Lo que estoy construyendo, en público.',
    image: 'images/dientes.jpg',
  },
  {
    label: 'YouTube',
    handle: '@ElGolott',
    url: 'https://www.youtube.com/@ElGolott',
    que: 'Lo largo: procesos completos, sin cortes convenientes.',
    image: 'images/setup-gaming.jpg',
  },
  {
    label: 'Twitch',
    handle: '/elgolott',
    url: 'https://www.twitch.tv/elgolott',
    que: 'En vivo. Acá se ve cuando algo falla, que es la mitad del trabajo.',
    image: 'images/minecraft-render.jpg',
  },
  {
    label: 'Discord',
    handle: 'La comunidad',
    url: 'https://discord.gg/GPzXhQ972',
    que: 'Donde se conversa de verdad. Preguntas, pruebas y lo que no publico.',
    image: 'images/escalera.jpg',
  },
  {
    label: 'LinkedIn',
    handle: 'Nicolás Golott Rojas',
    url: 'https://www.linkedin.com/in/nicol%C3%A1s-golott-rojas-0248782a9/',
    que: 'El lado formal: IA aplicada, automatización y transformación digital.',
    image: 'images/espejo-amarillo.jpg',
  },
  {
    label: 'X',
    handle: '@elgolott',
    url: 'https://x.com/elgolott',
    que: 'Ideas sueltas antes de que se conviertan en algo.',
    image: 'images/semaforo-luna.jpg',
  },
]

/** Todos los enlaces en un solo lugar, para el acceso directo de "Sobre mí". */
export const linkHub = {
  label: 'Todos mis enlaces',
  url: 'https://elgolottlinks.carrd.co/',
}

export const socialScene = {
  eyebrow: 'Señal',
  title: 'Dónde\nencontrarme.',
}
