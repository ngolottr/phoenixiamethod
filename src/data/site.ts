/* ============================================================================
   ÚNICO ARCHIVO QUE NECESITAS EDITAR PARA CAMBIAR TODO EL CONTENIDO DEL SITIO.
   Textos, fotos, enlaces, proyectos, versos y las historias destacadas.

   El sitio lleva DOS marcas y este archivo está partido en dos por eso:

   · PHOENIX IA METHOD — el negocio. Es lo primero que ve cualquiera que
     llegue: portada, soluciones, método y contacto. Todo lo suyo vive en la
     primera mitad del archivo, empezando por `phoenix`.

   · ELGOLOTT — la marca personal de Nicolás, en el bloque de marketing:
     quién está detrás, la galería, las historias y las redes. Empieza en
     `persona` y sigue hasta el final.

   Si vas a tocar el discurso comercial, tócalo arriba. Si vas a subir una foto
   o cambiar una red, es abajo. Mezclar los dos lados es exactamente lo que
   este archivo trata de evitar.

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

/* ===========================================================================
   ▓▓▓ PHOENIX IA METHOD — EL NEGOCIO ▓▓▓
   Todo lo que sigue hasta el aviso de ELGOLOTT es la parte comercial.
   =========================================================================== */

/**
 * La marca del negocio.
 *
 * El nombre va partido en dos líneas porque en la portada se compone así:
 * PHOENIX arriba, IA METHOD debajo y en cursiva. `short` es para cuando solo
 * cabe una palabra (la barra en pantallas chicas, el pie de los correos).
 */
export const phoenix = {
  name: 'PHOENIX IA METHOD',
  nameLine1: 'PHOENIX',
  nameLine2: 'IA METHOD',
  short: 'Phoenix',
  legalName: 'Nicolás Golott',
  role: 'IA aplicada · Automatización · Sistemas',
  location: 'Santiago, Chile',
  /* La frase de la marca es también su regla de trabajo, y aparece tal cual en
     el método: primero el problema de la persona, después la solución, y recién
     entonces la herramienta. Prometer "transformación" sin haber escuchado el
     problema es justo lo que Phoenix no hace. */
  tagline: 'Primero el problema.\nDespués la tecnología.',
  proposito:
    'Ayudo a personas y equipos a meter inteligencia artificial y automatización en el trabajo que ya hacen: para ganar tiempo, ordenar procesos y resolver lo que hoy se resuelve a mano.',
  email: 'contacto.nicolaspk@gmail.com',
  /* Para urgencias: el botón "Llamar" de la barra superior marca directo.
     `tel` va en formato internacional para que funcione desde cualquier país. */
  telefono: { tel: '+56920596120', visible: '+56 9 2059 6120' },
  dominio: 'phoenixiamethod.cl',
  year: '2026',
}

export const hero = {
  eyebrow: 'IA aplicada y automatización',
  cta: 'Entrar',
  /** las tres palabras del ciclo de la marca, bajo el nombre */
  ciclo: ['Problema', 'Método', 'Sistema'],
}

/**
 * EL MÉTODO — los cinco principios, uno por pantalla.
 *
 * No son eslóganes: son las reglas con las que Phoenix decide qué acepta y qué
 * no, copiadas del contexto maestro de Neurona. Están escritos en primera
 * persona y en negativo a propósito —lo que NO se hace es más informativo que
 * una promesa— y cada uno se puede contrastar con los casos de la escena de
 * soluciones. Un método que no se puede desmentir no es un método.
 *
 * El asterisco marca la palabra que se resalta con el color de la marca.
 */
export const manifesto = {
  eyebrow: 'El método',
  verses: [
    {
      line: 'PRIMERO\nEL\n*PROBLEMA*',
      note: 'No parto preguntando qué herramienta de IA vender. Parto preguntando qué te está costando tiempo hoy. La tecnología viene tercera, siempre.',
    },
    {
      line: 'PRUEBO\nANTES\nDE\n*VENDER*',
      note: 'Cada cosa que ofrezco la usé yo primero para resolver un problema mío. Soy el primer caso de estudio de Phoenix, y por eso hay algo que mostrar.',
    },
    {
      line: 'NO\n*INVENTO*\nAUTORIDAD',
      note: 'Lo que no he construido, no lo ofrezco. Prefiero enseñar el tablero con los números incómodos que un folleto con los cómodos.',
    },
    {
      line: 'SIMPLE\nANTES\nQUE\n*PERFECTO*',
      note: 'Simple, funcional, medible, mejorable, automatizado. En ese orden, y cada paso funcionando de verdad antes de empezar el siguiente.',
    },
    {
      line: 'LA IA\n*AMPLIFICA*\nNO\nREEMPLAZA',
      note: 'La máquina acelera; el criterio sigue siendo tuyo. Si al final del proyecto no entiendes tu propio proceso, el trabajo se hizo mal.',
    },
  ],
}

export const contact = {
  eyebrow: 'Contacto',
  title: 'Cuéntame\ntu problema.',
  intro:
    'No hace falta que sepas qué herramienta usar ni que tengas el proyecto definido. Con que sepas qué te está costando tiempo, alcanza para la primera conversación.',
  copyLabel: 'Copiar email',
  copiedLabel: 'Copiado',
  formNote: 'Te llega un correo con el siguiente paso: agendar una reunión 1:1 por videollamada.',
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

/* ===========================================================================
   ▓▓▓ ELGOLOTT — MARKETING Y MARCA PERSONAL ▓▓▓
   Desde aquí hacia abajo es el segundo bloque: la persona detrás de Phoenix.
   =========================================================================== */

/**
 * La marca personal. Es la de Nicolás, no la del negocio: aquí se documenta
 * el proceso de aprender, y por eso puede permitirse memes y errores donde
 * Phoenix tiene que ser preciso.
 */
export const persona = {
  name: 'ELGOLOTT',
  nameLine1: 'EL',
  nameLine2: 'GOLOTT',
  legalName: 'Nicolás Golott',
  handle: '@elgolott',
  role: 'Contenido · Aprendizaje en público · IA',
  location: 'Santiago, Chile',
  tagline: 'No pido permiso para ocupar el cuadro.',
  email: 'contacto.nicolaspk@gmail.com',
  year: '2026',
}

export const about = {
  eyebrow: 'Quién está detrás',
  title: 'Aprendo\nen público.',
  paragraphs: [
    'Soy Nicolás Golott, fundador de Phoenix IA Method. Trabajo como jefe de tienda mientras construyo esto: el método no salió de un curso, sale de resolver con IA problemas que tengo de verdad, en un trabajo de verdad.',
    'ElGolott es la otra mitad. Ahí publico el proceso completo —lo que funciona, lo que falla y lo que todavía no entiendo—, porque la autoridad se gana documentando, no posando. Lo que aprendo grabando termina siendo método; el método es lo que ofrece Phoenix.',
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

  /* --- La colección de memes, rescatada de las historias destacadas.
     Entra completa en Humor: es la parte menos posada de todo el sitio y por
     eso mismo la que más se parece a él. --- */
  {
    src: 'images/highlights/memes/01.jpg',
    alt: 'Montaje con la cabeza desproporcionada, en un local de luces moradas.',
    caption: 'Proporciones',
    note: 'El montaje lo hice yo. Se nota, y me da lo mismo.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/02.jpg',
    alt: 'Contrapicado extremo del rostro, mirando hacia arriba.',
    caption: 'Contrapicado',
    note: 'Ángulo elegido a conciencia.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/03.jpg',
    alt: 'Primer plano con la lengua afuera y la cabeza colgando.',
    caption: 'Se Acabó',
    note: 'El día me pasó por encima.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/04.jpg',
    alt: 'Contrapicado bajo un toldo, con audífonos puestos.',
    caption: 'Mentón',
    note: 'Encuadre nivel papada.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/05.jpg',
    alt: 'Primerísimo plano con el pelo mojado sobre la frente.',
    caption: 'Recién Salido',
    note: 'Recién salido. De todo.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/06.jpg',
    alt: 'Rostro dado vuelta, tomado desde el suelo.',
    caption: 'Al Revés',
    note: 'Denle vuelta el celular, yo ya no puedo.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/07.jpg',
    alt: 'Comiendo un postre con la corona de papel de Burger King puesta.',
    caption: 'La Corona',
    note: 'La corona es merecida.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/08.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Sin Pedirlo',
    note: 'Nadie me pidió esta foto.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/09.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Las Tres',
    note: 'Así se ve la inspiración a las tres de la tarde.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/10.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Guardada',
    note: 'Esta la guardé para un momento importante. Este.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/11.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Sin Equipo',
    note: 'Ninguna cámara profesional habría logrado esto.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/12.jpg',
    alt: 'Selfie de espejo en un baño, con el texto "foto antes de hacer kk".',
    caption: 'El Proceso',
    note: 'Documentar el proceso. Todo el proceso.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/13.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Técnica Mixta',
    note: 'Autorretrato, técnica mixta.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/14.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Solo',
    note: 'Me reí solo antes de subirla.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/15.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Marca Personal',
    note: 'La cara que pongo cuando dicen "marca personal".',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/16.jpg',
    alt: 'Autorretrato improvisado de la colección de memes.',
    caption: 'Envejecer Mal',
    note: 'Esto va a envejecer pésimo y está perfecto.',
    category: 'humor',
    year: '2026',
  },
  {
    src: 'images/highlights/memes/17.jpg',
    alt: 'Última imagen de la colección de memes.',
    caption: 'Fin',
    note: 'Fin de la colección. Gracias por llegar hasta acá.',
    category: 'humor',
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
