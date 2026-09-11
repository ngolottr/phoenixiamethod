/* ============================================================================
   LOS CASOS
   ----------------------------------------------------------------------------
   Todo lo que hay acá salió del vault de Obsidian de Nicolás (Neurona). Las
   cifras son las reales, incluidas las que no favorecen: 24 me gusta por cada
   seguidor es un número incómodo, y justamente por eso convence. Un cliente
   distingue enseguida entre alguien que muestra su tablero y alguien que
   muestra un folleto.

   Si cambian los datos en Obsidian, hay que actualizarlos acá.

   NO se anota de qué archivo del vault salió cada caso. Esto es un sitio
   público: la estructura de carpetas de Neurona es privada y no tiene por qué
   verla un visitante. Antes había un campo "fuente" que la imprimía al pie de
   cada expediente; se quitó por eso.
   ========================================================================== */

export type Cifra = { valor: string; etiqueta: string; nota?: string }
export type Hallazgo = { titulo: string; dato: string; porque: string }

/**
 * Una herramienta del sistema: qué es, qué papel cumple y una captura real.
 *
 * `proporcion` es la de la imagen de verdad ("ancho / alto"). Sin ella el marco
 * usa una fija y cualquier captura que no case deja franjas vacías a los lados.
 */
export type Herramienta = {
  nombre: string
  rol: string
  para: string
  image: string
  proporcion?: string
}

/**
 * Un punto de la fotografía y el color que salió de ahí.
 *
 * Sin explicaciones: la muestra y su clave, señaladas sobre el sitio exacto de
 * la imagen donde se midieron. Una paleta se entiende mirándola; un párrafo
 * al lado de cada color solo estorba.
 */
export type MarcaColor = {
  /** posición sobre la foto, en porcentaje */
  x: number
  y: number
  /** el color medido en ese punto, promediando un cuadrado de píxeles */
  muestra: string
  /** el que quedó en el CSS del sitio */
  final: string
  nombre: string
  /** la etiqueta se abre hacia la izquierda cuando el punto va muy a la derecha */
  izquierda?: boolean
}

export type Paleta = {
  image: string
  alt: string
  marcas: MarcaColor[]
}

export type Caso = {
  index: string
  title: string
  category: string
  meta: string
  image: string
  /** una línea, la que se lee en el índice */
  description: string
  estado: string
  /** el párrafo de apertura del panel */
  resumen: string
  cifras?: Cifra[]
  hallazgos?: Hallazgo[]
  metodo?: { titulo: string; pasos: string[] }
  notas?: string[]
  /** Con qué está construido. Capturas reales, no logotipos de catálogo. */
  herramientas?: Herramienta[]
  /** Encabezado del bloque anterior. Cada caso enseña algo distinto. */
  tituloHerramientas?: string
  /** La fotografía de origen, anotada con los colores que salieron de ella. */
  paleta?: Paleta
}

export const casos: Caso[] = [
  {
    index: '01',
    title: 'Operación 100K',
    category: 'Contenido · Sistema',
    meta: 'En curso · 2026',
    image: 'images/setup-gaming.jpg',
    description:
      'Documentar en público el intento de llegar a 100.000 seguidores usando IA como sistema de trabajo.',
    estado: 'En curso',
    resumen:
      'No es un proyecto sobre inteligencia artificial. Es un experimento sobre construir audiencia a propósito, con la IA como herramienta y con todo el proceso a la vista: lo que funciona, lo que falla y lo que todavía no se entiende. El número no es el contenido; el camino hacia el número es el contenido.',
    cifras: [
      { valor: '11.800', etiqueta: 'Punto de partida', nota: 'TikTok 6.688 · Instagram 4.690 · YouTube 422' },
      { valor: '11,8 %', etiqueta: 'Del objetivo', nota: 'Faltan 88.200' },
      { valor: '109', etiqueta: 'Videos ya publicados', nota: 'Sin sistema detrás' },
    ],
    /* Capturas reales de las tres, trabajando. Un logotipo bajado de internet
       lo pone cualquiera; esto es el sistema andando. */
    tituloHerramientas: 'Con qué está construido',
    herramientas: [
      {
        nombre: 'Claude',
        rol: 'El cerebro',
        para: 'Con quien pienso, discuto las ideas y hago el trabajo pesado.',
        image: 'images/herramientas/claude.jpg',
      },
      {
        nombre: 'Obsidian',
        rol: 'La memoria',
        para: 'La bóveda donde queda ordenado y conectado todo lo que pasa. Sin esto, cada conversación empieza de cero.',
        image: 'images/herramientas/obsidian.jpg',
      },
      {
        nombre: 'CapCut',
        rol: 'La salida',
        para: 'Donde se arma el video. La única de las tres que se ve en el resultado.',
        image: 'images/herramientas/capcut.jpg',
      },
    ],
    metodo: {
      titulo: 'Cómo se opera',
      pasos: [
        'Crear · Publicar · Medir · Analizar · Aprender · Ajustar',
        'Cada semana cierra con cuatro decisiones: continuar, detener, experimentar, escalar',
        'Todo se etiqueta como dato, hipótesis o recomendación. Nunca se mezclan',
      ],
    },
  },
  {
    index: '02',
    title: 'Agentes & Automatización',
    category: 'Sistemas · n8n',
    meta: 'En diseño',
    image: 'images/minecraft-render.jpg',
    description:
      'Una cadena de agentes que decide qué grabar con datos, publica solo y cierra el ciclo con métricas.',
    estado: 'En diseño',
    resumen:
      'La primera versión automatizaba la edición del video. Al probarla quedó claro que el cuello de botella no era editar, sino decidir qué grabar. El sistema se reordenó: la edición volvió a ser manual y la automatización se movió a la capa de estrategia y distribución.',
    cifras: [
      { valor: '5', etiqueta: 'Agentes en el roster', nota: 'Ordenados por dependencia técnica' },
      { valor: '1', etiqueta: 'Se construye a la vez', nota: 'Ocho a la vez no es automatizar' },
    ],
    /* Un flujo real, con sus nodos a la vista. Hablar de "automatización" sin
       enseñar nada es lo que hace todo el mundo; esto se puede mirar. */
    tituloHerramientas: 'Un flujo, por dentro',
    herramientas: [
      {
        nombre: 'Transcribir canales enteros',
        rol: 'n8n · flujo armado',
        para:
          'Revisa los canales que sigo, detecta los videos nuevos por su RSS, descarta los Shorts y saca la transcripción de cada uno. De ahí sale material para decidir qué grabar, en vez de partir de una hoja en blanco. Está armado y probado nodo a nodo; todavía no corre solo todos los días.',
        image: 'images/herramientas/n8n-flujo.jpg',
        proporcion: '1280 / 328',
      },
    ],
    /* Este caso no lleva ni "por qué está hecho así" ni notas al pie: el flujo
       de arriba ya enseña en qué consiste el sistema, y en una automatización
       el diagrama explica mejor que cualquier párrafo. */
    metodo: {
      titulo: 'Los agentes',
      pasos: [
        'Guiones — escribe el vertical diario a partir de datos, no de una hoja en blanco',
        'Publicación — sube a Instagram y TikTok con su caption, sin pasos manuales',
        'YouTube — ideas y guiones con cadencia propia',
        'Métricas — estructura los resultados para que la máquina pueda leerlos',
        'Subtítulos — genera el archivo listo para importar en la edición',
      ],
    },
  },
  {
    index: '03',
    title: 'Dirección de arte',
    category: 'Marca · Web',
    meta: 'Este sitio',
    image: 'images/camara-verde.jpg',
    description:
      'Identidad visual y puesta en escena para marcas personales que no quieren parecerse a nadie.',
    estado: 'Entregado',
    resumen:
      'El caso lo estás mirando. Este sitio no parte de una plantilla: la paleta completa se extrajo de una sola fotografía —el pasillo de piedra con luz verde— y el sistema se construyó alrededor de esa atmósfera.',
    cifras: [
      { valor: '113', etiqueta: 'Fotos propias', nota: 'Publicaciones e historias rescatadas' },
      { valor: '8', etiqueta: 'Escenas sin scroll', nota: 'Se navega, no se desliza' },
      { valor: '62 kB', etiqueta: 'Pesa la página', nota: 'Comprimida, con todo adentro' },
    ],
    /* Los colores no están elegidos a ojo: cada uno se midió sobre la foto,
       promediando un cuadrado de píxeles en el punto que se señala. Se muestran
       los dos —el medido y el que quedó en el CSS— para que la afirmación se
       pueda comprobar en vez de tener que creerla. */
    paleta: {
      image: 'images/camara-verde.jpg',
      alt: 'El pasillo de piedra con luz verde del que salió toda la paleta.',
      marcas: [
        { x: 74, y: 11, muestra: '#0FA462', final: '#2BE58F', nombre: 'Luz', izquierda: true },
        { x: 8, y: 47, muestra: '#1A4C31', final: '#0C2B1F', nombre: 'Piedra' },
        { x: 50, y: 38, muestra: '#2B2530', final: '#1A2035', nombre: 'Camisa' },
        { x: 46, y: 68, muestra: '#151110', final: '#040D0A', nombre: 'Sombra' },
        { x: 55, y: 90, muestra: '#FCF1D2', final: '#EFE7D5', nombre: 'Hueso', izquierda: true },
        { x: 7, y: 5, muestra: '#2F4528', final: '#C8A05A', nombre: 'Latón' },
      ],
    },
  },
  {
    index: '04',
    title: 'Diseño web',
    category: 'Marca personal · Producto',
    meta: 'Disponible',
    image: 'images/espejo-amarillo.jpg',
    description:
      'Sitios de marca personal construidos a medida: sin plantilla, sin dependencias y hechos para que la visita termine en un contacto.',
    estado: 'Disponible',
    resumen:
      'Esto que estás usando es el producto. No es una demostración ni una maqueta: es un sitio real, en producción, con formulario y agenda conectados a un calendario de verdad. Lo que ves acá es lo que se entrega — construido pieza por pieza, no elegido de un catálogo de plantillas.',
    /* Todas estas cifras se midieron sobre el sitio en producción, no son
       estimaciones de folleto. Un cliente puede abrir las herramientas de su
       propio navegador y comprobarlas mientras lee esto. */
    cifras: [
      { valor: '204 ms', etiqueta: 'Hasta quedar listo', nota: 'Medido en producción, no en el portátil del que lo hizo' },
      { valor: '0', etiqueta: 'Dominios externos', nota: 'Ni un rastreador, ni una fuente de Google' },
      { valor: '2', etiqueta: 'Dependencias', nota: 'React y nada más' },
    ],
    tituloHerramientas: 'El sistema, no la plantilla',
    herramientas: [
      {
        nombre: 'Un sistema de diseño propio',
        rol: 'Lo que se entrega debajo del sitio',
        para:
          'Escala tipográfica, tokens de color y reglas que no se rompen. Por eso una página nueva se agrega en minutos y sigue pareciendo del mismo sitio: no hay que volver a decidir nada que ya se decidió una vez.',
        image: 'images/herramientas/sistema-diseno.jpg',
        proporcion: '1400 / 760',
      },
    ],
    metodo: {
      titulo: 'Por qué éste vende y una plantilla no',
      pasos: [
        'La identidad sale de tus fotos, no de un tema comprado: nadie más puede tener este sitio',
        'Sin librerías de interfaz ni servicios de terceros: no se rompe cuando uno de ellos cambia o cae',
        'La agenda y el formulario van conectados de verdad — la visita termina en una reunión, no en un "gracias por escribir"',
        'Funciona igual en un teléfono de gama baja: los efectos vienen apagados y los enciende quien quiera',
      ],
    },
    notas: [
      'Lo que estás mirando es también la prueba: si el sitio te pareció rápido y distinto, eso es exactamente lo que se entrega.',
      'Trabajo un proyecto a la vez y parto entendiendo el negocio antes de abrir el editor. Si quieres ver cómo se aplicaría al tuyo, conversémoslo.',
    ],
  },
]
