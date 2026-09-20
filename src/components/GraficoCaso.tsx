import { useId } from 'react'
import type { GraficoNombre } from '../data/proyectos'

/**
 * Las láminas de los casos: en vez de una fotografía, el trabajo dibujado.
 *
 * El marco de vista previa llevaba fotos del vault —un escritorio, un render de
 * Minecraft, un espejo— que no decían nada del caso que estaban ilustrando. Un
 * visitante que señala "Agentes y automatización" quiere ver un flujo, no un
 * retrato. Acá cada caso tiene su propia lámina, dibujada a trazo con los datos
 * reales del expediente.
 *
 * Van en SVG y no en imagen por la misma razón que el emblema del cerebro:
 * pesan unos cientos de bytes, no se pixelan en ninguna pantalla y se tiñen
 * solas con el color ambiente, así que funcionan en claro, en oscuro y con las
 * dos marcas sin mantener cuatro archivos distintos.
 *
 * La proporción es 4:5 —la del marco— y el dibujo se ajusta dentro sin recorte.
 */

const CAJA = { ancho: 320, alto: 400 }

/* --- 01 · Operación 100K --------------------------------------------------
   Crecimiento hacia los 100.000 y el reparto por plataforma. Las cifras son
   las del expediente: 6.688 · 4.690 · 422 = 11.800, el 11,8 % del objetivo.
   Cada barra lleva su nombre y su número al lado: quien no distingue los
   colores lee exactamente lo mismo que quien sí. */

/** Las tres plataformas, en el orden en que pesan. */
const REDES = [
  { nombre: 'TikTok', valor: 6688, etiqueta: '6.688', clase: 'gc-barra' },
  { nombre: 'Instagram', valor: 4690, etiqueta: '4.690', clase: 'gc-barra b' },
  { nombre: 'YouTube', valor: 422, etiqueta: '422', clase: 'gc-barra c' },
]

const RIEL = 238 // el ancho completo de una barra, de x=56 al margen derecho
const TOPE = 6688 // la plataforma más grande fija la escala

/** El glifo de cada red, a trazo y sin copiar el logotipo de nadie. */
function IconoRed({ nombre, x, y }: { nombre: string; x: number; y: number }) {
  const g = {
    TikTok: <path d="M12.5 3.5v10.2a3.3 3.3 0 1 1-2.6-3.2M12.5 3.5c.4 2.4 2 4 4.4 4.2" />,
    Instagram: (
      <>
        <rect x="3.5" y="3.5" width="13" height="13" rx="4" />
        <circle cx="10" cy="10" r="3.2" />
        <circle cx="13.9" cy="6.1" r=".9" />
      </>
    ),
    YouTube: (
      <>
        <rect x="2.5" y="5" width="15" height="10" rx="3.2" />
        <path d="M8.4 7.8l4.2 2.2-4.2 2.2z" />
      </>
    ),
  }[nombre]

  return (
    <g className="gc-icono" transform={`translate(${x} ${y})`}>
      {g}
    </g>
  )
}

function Redes({ id }: { id: string }) {
  return (
    <>
      <text className="gc-eyebrow" x="26" y="28">
        Camino a 100.000
      </text>

      {/* --- La curva: lo recorrido va macizo, lo que falta va punteado ---- */}
      <defs>
        <linearGradient id={`${id}-area`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className="gc-area-alta" />
          <stop offset="100%" className="gc-area-baja" />
        </linearGradient>
      </defs>

      <line className="gc-meta" x1="26" y1="62" x2="294" y2="62" />
      <text className="gc-mini" x="294" y="54" textAnchor="end">
        100.000 · la meta
      </text>

      <path
        className="gc-relleno"
        fill={`url(#${id}-area)`}
        d="M26 166 C 60 164 92 156 128 140 L128 172 L26 172 Z"
      />
      <path className="gc-trazo" d="M26 166 C 60 164 92 156 128 140" />
      <path className="gc-proyeccion" d="M128 140 C 178 132 240 108 286 66" />

      <circle className="gc-punto" cx="128" cy="140" r="4" />
      <circle className="gc-punto-hueco" cx="286" cy="66" r="4" />
      <text className="gc-mini fuerte" x="136" y="158">
        Hoy · 11.800
      </text>

      <line className="gc-eje" x1="26" y1="172" x2="294" y2="172" />

      {/* --- Cuánto de la meta está cubierto, a escala real -----------------
          El 11,8 % se ve raquítico al lado del riel entero, y esa es
          exactamente la lectura honesta: falta casi todo. */}
      <text className="gc-label" x="26" y="204">
        11,8 % del objetivo
      </text>
      <text className="gc-mini" x="294" y="204" textAnchor="end">
        Faltan 88.200
      </text>
      <rect className="gc-riel" x="26" y="212" width="268" height="6" rx="3" />
      <rect className="gc-barra" x="26" y="212" width="31.6" height="6" rx="3" />

      <line className="gc-eje tenue" x1="26" y1="246" x2="294" y2="246" />

      {/* --- El reparto por plataforma ------------------------------------ */}
      {REDES.map((r, i) => {
        const cy = 278 + i * 44
        return (
          <g key={r.nombre}>
            <IconoRed nombre={r.nombre} x={26} y={cy - 10} />
            <text className="gc-label" x="56" y={cy - 4}>
              {r.nombre}
            </text>
            <text className="gc-valor" x="294" y={cy - 2} textAnchor="end">
              {r.etiqueta}
            </text>
            <rect className="gc-riel" x="56" y={cy + 6} width={RIEL} height="6" rx="3" />
            <rect
              className={r.clase}
              x="56"
              y={cy + 6}
              width={Math.max(6, (r.valor / TOPE) * RIEL)}
              height="6"
              rx="3"
            />
          </g>
        )
      })}
    </>
  )
}

/* --- 02 · Agentes y automatización ---------------------------------------
   El flujo que ya está armado, con sus nodos y sus conectores: revisa los
   canales por RSS, descarta los Shorts y transcribe el resto. Es el mismo que
   se describe en el expediente, dibujado como se ve en el lienzo. */

/** Un nodo del flujo: caja redondeada, cuadrito de color y su nombre. */
function Nodo({
  x,
  y,
  ancho,
  titulo,
  pie,
  disparador = false,
}: {
  x: number
  y: number
  ancho: number
  titulo: string
  pie?: string
  disparador?: boolean
}) {
  const alto = 44
  return (
    <g>
      <rect
        className={`gc-nodo${disparador ? ' es-disparador' : ''}`}
        x={x}
        y={y}
        width={ancho}
        height={alto}
        rx={disparador ? 22 : 9}
      />
      <rect className="gc-nodo-chip" x={x + 13} y={y + alto / 2 - 4} width="8" height="8" rx="2.5" />
      <text className="gc-label" x={x + 29} y={y + (pie ? alto / 2 - 2 : alto / 2 + 3)}>
        {titulo}
      </text>
      {pie && (
        <text className="gc-mini" x={x + 29} y={y + alto / 2 + 11}>
          {pie}
        </text>
      )}
    </g>
  )
}

function Agentes({ id }: { id: string }) {
  return (
    <>
      <defs>
        {/* La malla de puntos del lienzo: lo que hace que se lea como un
            editor de flujos y no como un organigrama. */}
        <pattern id={`${id}-malla`} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle className="gc-malla" cx="1.4" cy="1.4" r="1.1" />
        </pattern>
      </defs>
      <rect x="14" y="40" width="292" height="330" rx="10" fill={`url(#${id}-malla)`} />

      <text className="gc-eyebrow" x="26" y="28">
        Flujo armado · n8n
      </text>

      <Nodo x={76} y={56} ancho={168} titulo="Cada día" pie="Disparador programado" disparador />

      {/* Disparador → RSS */}
      <path className="gc-conector" d="M160 100 V126" />
      <path className="gc-flecha" d="M156 122l4 5 4-5" />

      <Nodo x={48} y={128} ancho={224} titulo="Canales que sigo" pie="Detecta los videos nuevos por RSS" />

      {/* RSS → bifurcación */}
      <path className="gc-conector" d="M160 172 V184 Q160 190 154 190 H95 Q89 190 89 196 V208" />
      <path className="gc-conector" d="M160 172 V184 Q160 190 166 190 H225 Q231 190 231 196 V208" />
      <path className="gc-flecha" d="M85 204l4 5 4-5" />
      <path className="gc-flecha" d="M227 204l4 5 4-5" />

      <Nodo x={26} y={210} ancho={126} titulo="Descarta" pie="Los Shorts, fuera" />
      <Nodo x={168} y={210} ancho={126} titulo="Transcribe" pie="Texto completo" />

      {/* Bifurcación → salida */}
      <path className="gc-conector" d="M89 254 V272 Q89 278 95 278 H154 Q160 278 160 284 V296" />
      <path className="gc-conector" d="M231 254 V272 Q231 278 225 278 H166 Q160 278 160 284 V296" />
      <path className="gc-flecha" d="M156 292l4 5 4-5" />

      <Nodo x={48} y={298} ancho={224} titulo="Material para decidir" pie="En vez de una hoja en blanco" />

      <text className="gc-mini" x="160" y="362" textAnchor="middle">
        Probado nodo a nodo · todavía no corre solo
      </text>
    </>
  )
}

/* --- 04 · Sitios y sistemas a medida -------------------------------------
   Lo que se entrega cuando la solución es un producto digital: una tienda
   armada pieza por pieza, con su carrito conectado de verdad. El panel de
   pago flotando por encima es el punto: la visita termina en una venta, no
   en una galería bonita. */
function Sitios() {
  const tarjetas = [
    { x: 40, y: 168 },
    { x: 164, y: 168 },
    { x: 40, y: 232 },
    { x: 164, y: 232 },
  ]

  return (
    <>
      <text className="gc-eyebrow" x="26" y="28">
        Tienda · producto digital
      </text>

      {/* --- La ventana ---------------------------------------------------- */}
      <rect className="gc-ventana" x="26" y="44" width="268" height="252" rx="10" />
      <line className="gc-eje tenue" x1="26" y1="72" x2="294" y2="72" />
      <circle className="gc-semaforo" cx="41" cy="58" r="3" />
      <circle className="gc-semaforo" cx="53" cy="58" r="3" />
      <circle className="gc-semaforo" cx="65" cy="58" r="3" />
      <rect className="gc-riel" x="80" y="52" width="196" height="12" rx="6" />
      {/* El candado va entero: el arco suelto se leía como un garabato */}
      <path className="gc-candado" d="M89.4 58.4v-1.6a2.2 2.2 0 0 1 4.4 0v1.6" />
      <rect className="gc-candado-cuerpo" x="88" y="58.4" width="7.2" height="5.2" rx="1.4" />

      {/* Menú */}
      <rect className="gc-riel" x="40" y="86" width="34" height="5" rx="2.5" />
      <rect className="gc-riel" x="80" y="86" width="26" height="5" rx="2.5" />
      <rect className="gc-riel" x="112" y="86" width="30" height="5" rx="2.5" />
      <path className="gc-carro" d="M262 84h3l2.6 9.4h9.6l2.4-6.6h-13" />
      <circle className="gc-punto" cx="269" cy="97.5" r="1.8" />
      <circle className="gc-punto" cx="276" cy="97.5" r="1.8" />

      {/* Portada */}
      <rect className="gc-bloque" x="40" y="104" width="240" height="52" rx="6" />
      <rect className="gc-riel claro" x="52" y="116" width="120" height="7" rx="3.5" />
      <rect className="gc-riel claro" x="52" y="129" width="86" height="5" rx="2.5" />
      <rect className="gc-btn" x="52" y="140" width="56" height="10" rx="5" />

      {/* La grilla de productos */}
      {tarjetas.map((t) => (
        <g key={`${t.x}-${t.y}`}>
          <rect className="gc-ventana" x={t.x} y={t.y} width="116" height="56" rx="6" />
          <rect className="gc-bloque" x={t.x + 8} y={t.y + 8} width="34" height="34" rx="4" />
          <rect className="gc-riel claro" x={t.x + 50} y={t.y + 14} width="52" height="5" rx="2.5" />
          <rect className="gc-riel claro" x={t.x + 50} y={t.y + 24} width="36" height="4" rx="2" />
          <rect className="gc-btn tenue" x={t.x + 50} y={t.y + 34} width="26" height="8" rx="4" />
        </g>
      ))}

      {/* --- El carrito, por encima de todo lo demás -----------------------
          Se sale del marco del navegador a propósito: el punto del caso es que
          la visita termina en una venta, no en una galería bonita. Va corrido
          a la derecha para no comerse la grilla entera. */}
      <rect className="gc-panel" x="158" y="258" width="136" height="116" rx="10" />
      <text className="gc-eyebrow chico" x="174" y="280">
        Tu carrito
      </text>
      <rect className="gc-riel claro" x="174" y="290" width="56" height="5" rx="2.5" />
      <rect className="gc-riel claro" x="246" y="290" width="32" height="5" rx="2.5" />
      <rect className="gc-riel claro" x="174" y="304" width="44" height="5" rx="2.5" />
      <rect className="gc-riel claro" x="252" y="304" width="26" height="5" rx="2.5" />
      <line className="gc-eje tenue" x1="174" y1="320" x2="278" y2="320" />
      <text className="gc-mini" x="174" y="336">
        Total
      </text>
      <rect className="gc-riel" x="238" y="330" width="40" height="7" rx="3.5" />
      <rect className="gc-btn" x="174" y="346" width="104" height="16" rx="8" />
      <text className="gc-btn-txt" x="226" y="357" textAnchor="middle">
        Pagar
      </text>
    </>
  )
}

const LAMINAS: Record<GraficoNombre, (p: { id: string }) => JSX.Element> = {
  redes: Redes,
  agentes: Agentes,
  sitios: Sitios,
}

const ETIQUETAS: Record<GraficoNombre, string> = {
  redes:
    'El avance hacia los 100.000 seguidores y el reparto actual: TikTok 6.688, Instagram 4.690 y YouTube 422.',
  agentes:
    'El flujo de n8n que revisa los canales por RSS, descarta los Shorts y transcribe el resto.',
  sitios:
    'Una tienda en línea con su grilla de productos y el carrito conectado al pago.',
}

export function GraficoCaso({ nombre, className }: { nombre: GraficoNombre; className?: string }) {
  /* Los degradados y la malla se definen dentro del propio SVG, y la lámina se
     dibuja dos veces en la misma página (el marco y el telón del expediente):
     sin un identificador único por instancia, la segunda copia se quedaría con
     las definiciones de la primera. */
  const id = useId().replace(/:/g, '')
  const Lamina = LAMINAS[nombre]

  return (
    <svg
      className={`gcaso${className ? ` ${className}` : ''}`}
      viewBox={`0 0 ${CAJA.ancho} ${CAJA.alto}`}
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ETIQUETAS[nombre]}
    >
      <Lamina id={id} />
    </svg>
  )
}
