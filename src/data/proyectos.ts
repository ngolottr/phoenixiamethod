/* ============================================================================
   LOS CASOS
   ----------------------------------------------------------------------------
   Todo lo que hay acá salió del vault de Obsidian de Nicolás (Neurona). Las
   cifras son las reales, incluidas las que no favorecen: 24 me gusta por cada
   seguidor es un número incómodo, y justamente por eso convence. Un cliente
   distingue enseguida entre alguien que muestra su tablero y alguien que
   muestra un folleto.

   Si cambian los datos en Obsidian, hay que actualizarlos acá. La fuente de
   cada caso queda anotada para poder volver a buscarla.
   ========================================================================== */

export type Cifra = { valor: string; etiqueta: string; nota?: string }
export type Hallazgo = { titulo: string; dato: string; porque: string }

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
  /** de dónde salió, dentro de Neurona */
  fuente: string
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
    hallazgos: [
      {
        titulo: 'TikTok convierte mal',
        dato: '24 me gusta por cada seguidor',
        porque:
          'Le gusta lo que ve pero no sigue la cuenta. El contenido entretiene y no da una razón para volver.',
      },
      {
        titulo: 'YouTube rinde poco por video',
        dato: '3,9 suscriptores por video',
        porque: 'Hay mucho trabajo hecho que no acumuló audiencia.',
      },
      {
        titulo: 'Instagram tiene gente esperando',
        dato: '4.690 seguidores con 6 publicaciones',
        porque: 'Es la mejor relación entre audiencia y esfuerzo. Ahí hay algo que recoger.',
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
      'La línea base decía "desde cero", y era falso: había 11.800 seguidores. Se corrigió el encuadre en vez de sostener el relato más vendedor.',
      'Los 100K son una meta, no una promesa. No existe tasa de crecimiento garantizada.',
    ],
    fuente: 'Neurona · 04_Metricas/Registro_Publicaciones.md',
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
    hallazgos: [
      {
        titulo: 'El orden lo dicta la dependencia',
        dato: 'El agente de guiones no puede funcionar sin el de métricas',
        porque:
          'Sin un registro que la máquina pueda leer, "usar las mejores estadísticas" es una frase vacía. Se construye primero lo que desbloquea al resto.',
      },
      {
        titulo: 'Pausar no es descartar',
        dato: 'El agente editor quedó documentado, no borrado',
        porque: 'El trabajo con transcripción se reutiliza para generar subtítulos, que es la parte realmente mecánica.',
      },
    ],
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
    notas: [
      'Límite que no se cruza: ningún agente escribe en primera persona. El guion es estructura, no libreto.',
    ],
    fuente: 'Neurona · 01_Estrategia/Sistema_de_Agentes.md',
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
    hallazgos: [
      {
        titulo: 'El color no está escrito a mano',
        dato: 'Cada foto tiñe el sitio con su propio color dominante',
        porque:
          'El navegador muestrea la imagen y calcula la paleta. Cualquier foto nueva funciona sola, sin tocar una línea de código.',
      },
      {
        titulo: 'La agenda es propia',
        dato: 'Reservas conectadas al calendario real',
        porque:
          'El visitante ve solo las horas verdaderamente libres, con margen entre reuniones. Sin servicios externos de pago.',
      },
    ],
    notas: [
      'Sin librerías de animación: todo el movimiento es CSS. Sin scroll, sin plantillas, sin dependencias que caduquen.',
    ],
    fuente: 'Construido y desplegado · elgolott.vercel.app',
  },
  {
    index: '04',
    title: 'Fénix IA Method',
    category: 'Consultoría',
    meta: 'En construcción',
    image: 'images/sepia-osb.jpg',
    description:
      'Metodología para meter IA y automatización en problemas reales de personas y organizaciones.',
    estado: 'En construcción',
    resumen:
      'La metodología existe como práctica —es lo que se aplica en los otros tres proyectos— pero todavía no está escrita como método transferible. Se está construyendo a partir de los casos reales, no al revés.',
    notas: [
      'Prefiero decir que está en construcción antes que presentar un método que todavía no puedo demostrar. La autoridad se gana documentando, no anunciando.',
      'Si te interesa cómo se aplicaría a tu caso, conversémoslo directo: hoy eso se hace caso a caso.',
    ],
    fuente: 'Neurona · 02_Fenix_IA_Method — carpeta aún sin documentar',
  },
]
