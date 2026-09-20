/* ============================================================================
   LOS CASOS DE PHOENIX IA METHOD
   ----------------------------------------------------------------------------
   Todo lo que hay acá salió del vault de Obsidian de Nicolás (Neurona). Las
   cifras son las reales, incluidas las que no favorecen: "11,8 % del objetivo"
   es un número incómodo de publicar, y justamente por eso convence. Un cliente
   distingue enseguida entre alguien que muestra su tablero y alguien que
   muestra un folleto.

   Regla de la marca, y no es un adorno: aquí solo entra lo que ya se construyó.
   Un servicio que suena bien pero todavía no se ha hecho no es un caso, es una
   promesa — y Phoenix se posiciona justamente al revés: la autoridad viene de
   experimentar, documentar y recién entonces ofrecer.

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

/**
 * Las láminas dibujadas que ilustran un caso, en `components/GraficoCaso`.
 *
 * Tres de los cuatro casos llevaban una fotografía del vault —un escritorio,
 * un render, un espejo— que no decía nada del trabajo que estaba ilustrando.
 * Un caso de automatización se enseña con su flujo, no con un retrato. Neurona
 * es la excepción y mantiene su captura: ahí la herramienta ES la prueba.
 */
export type GraficoNombre = 'redes' | 'agentes' | 'sitios'

export type Caso = {
  index: string
  title: string
  category: string
  meta: string
  /** La fotografía del caso. Se ignora cuando hay `grafico`. */
  image: string
  /** La lámina dibujada, cuando el caso se explica mejor con un esquema. */
  grafico?: GraficoNombre
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
    grafico: 'redes',
    description:
      'El laboratorio de Phoenix: llegar a 100.000 seguidores usando IA como sistema de trabajo, documentando todo.',
    estado: 'En curso',
    resumen:
      'Phoenix no empezó con un cliente: empezó conmigo. Este es el experimento donde se prueba el método antes de ofrecérselo a nadie —construir audiencia a propósito, con la IA como sistema de trabajo y con el proceso entero a la vista: lo que funciona, lo que falla y lo que todavía no entiendo. El número no es el contenido; el camino hacia el número es el contenido.',
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
    notas: [
      'Este caso es la prueba del principio de Phoenix: primero lo resuelvo para mí, después lo documento, y solo entonces se puede ofrecer. Al revés no sirve.',
    ],
  },
  {
    index: '02',
    title: 'Agentes y automatización',
    category: 'Automatización · n8n',
    meta: 'En diseño',
    image: 'images/minecraft-render.jpg',
    grafico: 'agentes',
    description:
      'Cadenas de agentes que hacen el trabajo repetitivo: deciden con datos, publican solas y devuelven métricas.',
    estado: 'En diseño',
    resumen:
      'La primera versión automatizaba la edición del video. Al probarla quedó claro que el cuello de botella no era editar, sino decidir qué grabar. El sistema se reordenó: la edición volvió a ser manual y la automatización se movió a la capa de estrategia y distribución. Ese reordenamiento —automatizar el cuello de botella real y no el que se ve más— es exactamente lo que se hace en un proyecto de cliente.',
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
    /* Este caso no lleva "por qué está hecho así": el flujo de arriba ya enseña
       en qué consiste el sistema, y en una automatización el diagrama explica
       mejor que cualquier párrafo. */
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
    title: 'Neurona',
    category: 'Conocimiento · IA',
    meta: 'En uso diario',
    image: 'images/herramientas/obsidian.jpg',
    description:
      'El sistema de conocimiento que hace que la IA sepa de qué le estás hablando: contexto que no se pierde entre conversaciones.',
    estado: 'En uso diario',
    resumen:
      'El problema que casi nadie nombra al usar IA: cada conversación empieza de cero. Explicas tu negocio, tu proceso y tus decisiones una y otra vez, y el resultado siempre es genérico porque la máquina no sabe nada de ti. Neurona es la respuesta a eso —una bóveda donde quedan escritos el contexto, las decisiones, los experimentos y los aprendizajes, conectados entre sí y legibles tanto por una persona como por un modelo. No es tomar notas: es construir la memoria que el sistema no trae.',
    cifras: [
      { valor: '2', etiqueta: 'Marcas dentro', nota: 'Phoenix IA Method y ElGolott, separadas a propósito' },
      { valor: '1', etiqueta: 'Contexto maestro', nota: 'El documento que se lee antes de cualquier cambio grande' },
      { valor: '0', etiqueta: 'Veces que se explica de nuevo', nota: 'Ese es todo el punto' },
    ],
    tituloHerramientas: 'Las dos piezas',
    herramientas: [
      {
        nombre: 'Obsidian',
        rol: 'Dónde vive el conocimiento',
        para: 'Archivos de texto en tu propio disco, enlazados entre sí. Sin servicio del que depender y sin formato que se muera: dentro de diez años se siguen abriendo.',
        image: 'images/herramientas/obsidian.jpg',
      },
      {
        nombre: 'Claude',
        rol: 'Quién lo lee y lo mantiene',
        para: 'Trabaja dentro de la bóveda: la ordena, la relaciona y la usa como contexto. La diferencia entre pedirle algo a una IA que no te conoce y a una que leyó todo lo tuyo se nota en la primera respuesta.',
        image: 'images/herramientas/claude.jpg',
      },
    ],
    metodo: {
      titulo: 'Por qué esto va primero',
      pasos: [
        'Sin contexto no hay automatización útil: un agente sin memoria repite trabajo en vez de ahorrarlo',
        'Cada decisión queda escrita con su porqué, para no volver a discutirla dentro de tres meses',
        'Lo que se aprende se documenta; lo documentado se estandariza; lo estandarizado se puede automatizar',
        'El conocimiento es tuyo y vive en tu disco. Ninguna herramienta se lo queda de rehén',
      ],
    },
    notas: [
      'Este sitio salió de ahí. Los casos, las cifras y el método que estás leyendo estaban escritos en la bóveda antes de existir como página.',
    ],
  },
  {
    index: '04',
    title: 'Sitios y sistemas a medida',
    category: 'Producto digital',
    meta: 'Este sitio',
    image: 'images/espejo-amarillo.jpg',
    grafico: 'sitios',
    description:
      'Cuando la solución es un producto digital: construido pieza por pieza, sin plantilla y hecho para terminar en una conversación.',
    estado: 'Disponible',
    resumen:
      'Automatizar no siempre alcanza: a veces el problema pide algo que todavía no existe. Esto que estás usando es ese caso. No es una demostración ni una maqueta: es un sitio real, en producción, con formulario y agenda conectados a un calendario de verdad. Lo que ves acá es lo que se entrega.',
    /* Todas estas cifras se midieron sobre el sitio en producción, no son
       estimaciones de folleto. Un cliente puede abrir las herramientas de su
       propio navegador y comprobarlas mientras lee esto. */
    cifras: [
      { valor: '204 ms', etiqueta: 'Hasta quedar listo', nota: 'Medido en producción, no en el portátil del que lo hizo' },
      { valor: '0', etiqueta: 'Dominios externos', nota: 'Ni rastreadores de terceros ni fuentes de Google: las visitas se cuentan en el propio sitio, sin cookies' },
      { valor: '2', etiqueta: 'Dependencias', nota: 'React y nada más' },
    ],
    tituloHerramientas: 'El sistema, no la plantilla',
    herramientas: [
      {
        nombre: 'Un sistema de diseño propio',
        rol: 'Lo que se entrega debajo del sitio',
        para:
          'Escala tipográfica, tokens de color y reglas que no se rompen. Por eso este sitio puede llevar dos marcas con dos paletas distintas cambiando un solo atributo, y por eso una página nueva se agrega en minutos sin volver a decidir nada que ya se decidió una vez.',
        image: 'images/herramientas/sistema-diseno.jpg',
        proporcion: '1400 / 760',
      },
    ],
    /* Los colores no están elegidos a ojo: cada uno se midió sobre la foto,
       promediando un cuadrado de píxeles en el punto que se señala. Se muestran
       los dos —el medido y el que quedó en el CSS— para que la afirmación se
       pueda comprobar en vez de tener que creerla.

       Ojo con lo que afirma este bloque: es la paleta del bloque de MARKETING,
       el de ElGolott. La de Phoenix no sale de una foto, sale del isotipo de la
       identidad. Si algún día se cambia una de las dos, hay que corregir aquí
       también: una prueba que dejó de ser cierta es peor que no tener prueba. */
    paleta: {
      image: 'images/camara-verde.jpg',
      alt: 'El pasillo de piedra con luz verde del que salió la paleta de ElGolott.',
      marcas: [
        { x: 74, y: 11, muestra: '#0FA462', final: '#2BE58F', nombre: 'Luz', izquierda: true },
        { x: 8, y: 47, muestra: '#1A4C31', final: '#0C2B1F', nombre: 'Piedra' },
        { x: 50, y: 38, muestra: '#2B2530', final: '#1A2035', nombre: 'Camisa' },
        { x: 46, y: 68, muestra: '#151110', final: '#040D0A', nombre: 'Sombra' },
        { x: 55, y: 90, muestra: '#FCF1D2', final: '#EFE7D5', nombre: 'Hueso', izquierda: true },
        { x: 7, y: 5, muestra: '#2F4528', final: '#C8A05A', nombre: 'Latón' },
      ],
    },
    metodo: {
      titulo: 'Por qué éste convierte y una plantilla no',
      pasos: [
        'La identidad sale de tu marca o de tus fotos, no de un tema comprado: nadie más puede tener este sitio',
        'Sin librerías de interfaz ni servicios de terceros: no se rompe cuando uno de ellos cambia o cae',
        'La agenda y el formulario van conectados de verdad — la visita termina en una reunión, no en un "gracias por escribir"',
        'Funciona igual en un teléfono de gama baja: los efectos vienen apagados y los enciende quien quiera',
      ],
    },
    notas: [
      'Lo que estás mirando es también la prueba: si el sitio te pareció rápido y distinto, eso es exactamente lo que se entrega.',
      'Trabajo un proyecto a la vez y parto entendiendo el problema antes de abrir el editor. Si quieres ver cómo se aplicaría al tuyo, conversémoslo.',
    ],
  },
]
