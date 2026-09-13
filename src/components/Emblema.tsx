/* ============================================================================
   LOS EMBLEMAS DEL MANIFIESTO
   ----------------------------------------------------------------------------
   Una composición por verso, dibujada en SVG. No son ilustraciones literales:
   cada una toma la idea del verso y la vuelve geometría, en la misma clave del
   resto del sitio —líneas finas, el acento del bloque, ámbar y mucho fondo.

   Van detrás del texto, tenues y en movimiento lento, para que el verso siga
   mandando y la imagen sostenga el clima.
   ========================================================================== */

const ACENTO = 'var(--amb-accent)'
const AMBAR = 'var(--ambar)'

/** 01 · NO ESPERO TURNO — un umbral que se abre donde no había puerta. */
function Umbral() {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
      {/* el muro */}
      {Array.from({ length: 11 }, (_, i) => (
        <line
          key={i}
          x1="20"
          y1={40 + i * 32}
          x2="380"
          y2={40 + i * 32}
          stroke={AMBAR}
          strokeWidth="0.6"
          opacity="0.28"
        />
      ))}
      {/* la abertura */}
      <rect x="148" y="86" width="104" height="228" stroke={ACENTO} strokeWidth="1.4" />
      <rect x="148" y="86" width="104" height="228" fill="url(#umbralLuz)" opacity="0.5" />
      {/* quien la cruza */}
      <path
        className="em-trazo"
        d="M200 314 L200 86"
        stroke={ACENTO}
        strokeWidth="2"
        strokeDasharray="228"
      />
      <circle cx="200" cy="86" r="5" fill={ACENTO} className="em-pulso" />
      <defs>
        <linearGradient id="umbralLuz" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="var(--amb-accent)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--amb-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

/** 02 · HAGO RUIDO CON CRITERIO — caos a la izquierda, orden a la derecha. */
function Onda() {
  const barras = Array.from({ length: 34 }, (_, i) => {
    const t = i / 33
    // el desorden se va apagando: al final las alturas caen en una curva limpia
    const caos = (Math.sin(i * 12.9898) * 43758.5453) % 1
    const desorden = Math.abs(caos) * 120 * (1 - t)
    const orden = 30 + Math.sin(t * Math.PI * 2) * 62 * t
    return { x: 24 + i * 10.4, h: Math.max(8, desorden + orden), t }
  })

  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <line x1="20" y1="200" x2="380" y2="200" stroke={AMBAR} strokeWidth="0.6" opacity="0.35" />
      {barras.map((b, i) => (
        <rect
          key={i}
          x={b.x}
          y={200 - b.h / 2}
          width="3.4"
          height={b.h}
          fill={b.t > 0.62 ? ACENTO : AMBAR}
          opacity={b.t > 0.62 ? 0.9 : 0.34}
          className="em-barra"
          style={{ ['--i' as string]: i }}
        />
      ))}
    </svg>
  )
}

/** 03 · LO FEO NO CONVIERTE — la retícula que hay debajo de lo que se ve bien. */
function Reticula() {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <rect x="70" y="70" width="260" height="260" stroke={AMBAR} strokeWidth="0.7" opacity="0.4" />
      {/* tercios */}
      {[156.7, 243.3].map((v) => (
        <g key={v}>
          <line x1={v} y1="70" x2={v} y2="330" stroke={AMBAR} strokeWidth="0.5" opacity="0.3" />
          <line x1="70" y1={v} x2="330" y2={v} stroke={AMBAR} strokeWidth="0.5" opacity="0.3" />
        </g>
      ))}
      {/* la proporción que sí funciona */}
      <rect x="70" y="70" width="160.7" height="260" stroke={ACENTO} strokeWidth="1.3" />
      <rect x="230.7" y="70" width="99.3" height="160.7" stroke={ACENTO} strokeWidth="1" opacity="0.7" />
      <path
        className="em-trazo"
        d="M230.7 70 A160.7 160.7 0 0 1 70 230.7"
        stroke={ACENTO}
        strokeWidth="1.6"
        strokeDasharray="253"
      />
      <circle cx="230.7" cy="230.7" r="4" fill={AMBAR} className="em-pulso" />
    </svg>
  )
}

/** 04 · ME RÍO DE MÍ PRIMERO — el mismo rostro, mirado desde los dos lados. */
function Espejo() {
  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
      <line x1="200" y1="40" x2="200" y2="360" stroke={AMBAR} strokeWidth="0.7" opacity="0.45" />
      {/* arriba: la cara seria */}
      <g opacity="0.85">
        <circle cx="200" cy="140" r="72" stroke={ACENTO} strokeWidth="1.2" />
        <line x1="176" y1="122" x2="188" y2="122" stroke={ACENTO} strokeWidth="2.4" />
        <line x1="212" y1="122" x2="224" y2="122" stroke={ACENTO} strokeWidth="2.4" />
        <line x1="178" y1="168" x2="222" y2="168" stroke={ACENTO} strokeWidth="1.6" />
      </g>
      {/* abajo: el reflejo, que se ríe */}
      <g opacity="0.5">
        <circle cx="200" cy="264" r="72" stroke={AMBAR} strokeWidth="1.2" strokeDasharray="4 5" />
        <line x1="176" y1="286" x2="188" y2="286" stroke={AMBAR} strokeWidth="2.4" />
        <line x1="212" y1="286" x2="224" y2="286" stroke={AMBAR} strokeWidth="2.4" />
        <path
          className="em-trazo"
          d="M176 232 Q200 208 224 232"
          stroke={AMBAR}
          strokeWidth="1.8"
          strokeDasharray="70"
        />
      </g>
    </svg>
  )
}

/** 05 · DOCUMENTO TODO, INCLUSO EL ERROR — la caída también queda registrada. */
function Registro() {
  const puntos = [
    [40, 300], [80, 286], [120, 252], [160, 262], [200, 214],
    [240, 320], [280, 236], [320, 176], [360, 120],
  ]
  const d = puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p[0]} ${p[1]}`).join(' ')

  return (
    <svg viewBox="0 0 400 400" fill="none" aria-hidden="true">
      {[120, 180, 240, 300].map((y) => (
        <line key={y} x1="30" y1={y} x2="370" y2={y} stroke={AMBAR} strokeWidth="0.5" opacity="0.24" />
      ))}
      <path className="em-trazo" d={d} stroke={ACENTO} strokeWidth="1.8" strokeDasharray="460" />
      {puntos.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r="3" fill={i === 5 ? AMBAR : ACENTO} opacity={i === 5 ? 1 : 0.55} />
      ))}
      {/* el error no se esconde: se marca */}
      <circle cx="240" cy="320" r="15" stroke={AMBAR} strokeWidth="1.2" className="em-pulso" />
      <line x1="240" y1="335" x2="240" y2="368" stroke={AMBAR} strokeWidth="0.8" opacity="0.6" />
    </svg>
  )
}

const EMBLEMAS = [Umbral, Onda, Reticula, Espejo, Registro]

export function Emblema({ indice }: { indice: number }) {
  const Dibujo = EMBLEMAS[indice % EMBLEMAS.length]
  return (
    <div className="emblema" aria-hidden="true" key={indice}>
      <Dibujo />
    </div>
  )
}
