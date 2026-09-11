/**
 * El emblema del área de trabajo: un cerebro con un engranaje encajado dentro.
 *
 * Ocupa el marco de vista previa mientras no se está señalando ningún proyecto.
 * Antes ahí no había más que la frase "señala un proyecto" sobre un rectángulo
 * vacío, y el hueco se leía como una imagen que no cargó. Ahora el marco dice
 * de qué va la escena aunque nadie mueva el cursor: pensar y construir.
 *
 * Va dibujado con trazo, no como fotografía: pesa unos pocos cientos de bytes,
 * escala sin perder filo en cualquier pantalla y se tiñe con el color ambiente
 * del sitio como cualquier otro elemento.
 */

/** Un diente del engranaje, repetido por rotación alrededor del centro. */
function Dientes({ cx, cy, r, n = 8 }: { cx: number; cy: number; r: number; n?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <rect
          key={i}
          x={cx - 2.6}
          y={cy - r - 5.6}
          width={5.2}
          height={7}
          rx={1.4}
          transform={`rotate(${(360 / n) * i} ${cx} ${cy})`}
        />
      ))}
    </>
  )
}

export function CerebroEngranaje({ className }: { className?: string }) {
  return (
    <svg
      className={`cerebro${className ? ` ${className}` : ''}`}
      viewBox="0 0 200 190"
      role="img"
      aria-label="Un cerebro con un engranaje: pensar y construir."
    >
      <g className="cerebro-trazo">
        {/* Silueta */}
        <path d="M62 62c-11-5-22 3-21 15-9 5-11 18-3 26-7 9-3 22 8 25 4 12 18 17 29 11 9 9 27 9 36-1 16 6 30-4 30-18 12-7 14-25 4-34 2-14-10-25-22-21-8-11-28-11-36 0-6-7-19-8-25-3Z" />
        {/* Circunvoluciones: pocas y abiertas, para que se lea a tamaño chico.
            La línea central se queda DENTRO de la silueta; llegando hasta el
            borde parecía un palo clavado en vez de la separación de los dos
            hemisferios. */}
        <path d="M100 61v72" />
        <path d="M100 66c-12 0-20 7-20 16s7 15 18 15" />
        <path d="M100 108c-14 0-23 6-23 15" />
        <path d="M62 62c0 10 5 17 14 20" />
        <path d="M41 103c9 2 16 0 21-6" />
        <path d="M65 139c1-9 6-15 14-18" />
      </g>

      {/* El engranaje ocupa el hemisferio derecho: la parte que ejecuta */}
      <g className="cerebro-engranaje">
        <Dientes cx={129} cy={97} r={20} />
        <circle cx={129} cy={97} r={20} />
        <circle className="cerebro-eje" cx={129} cy={97} r={7.5} />
      </g>
    </svg>
  )
}
