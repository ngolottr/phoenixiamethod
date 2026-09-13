import { useEffect, useRef, useState } from 'react'

const CLAVE = 'phoenix:sello'
/** Cuánto puede moverse el dedo antes de que deje de ser un clic. */
const TOLERANCIA = 6

type Pos = { x: number; y: number }

function leerGuardada(): Pos | null {
  try {
    const bruto = window.localStorage.getItem(CLAVE)
    if (!bruto) return null
    const p = JSON.parse(bruto)
    return typeof p?.x === 'number' && typeof p?.y === 'number' ? p : null
  } catch {
    return null
  }
}

/**
 * El sello de "Trabajemos juntos".
 *
 * Con el arrastre encendido se puede llevar por toda la pantalla y se queda
 * donde lo dejen: la posición se guarda en el navegador de cada visitante, así
 * que si vuelve, lo encuentra donde él lo puso. Arrastrar no dispara el clic —
 * solo cuenta como clic si el dedo casi no se movió, que es como se comporta
 * cualquier cosa arrastrable bien hecha.
 *
 * Con el arrastre apagado —que es como arranca— es un botón y nada más: no se
 * registran manejadores de puntero, no se vigila el tamaño de la ventana y no
 * se lee el almacenamiento. Un efecto apagado no debe costar nada.
 */
export function Sello({ onClick, arrastrable }: { onClick: () => void; arrastrable: boolean }) {
  const ref = useRef<HTMLButtonElement>(null)
  const [pos, setPos] = useState<Pos | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const inicio = useRef({ x: 0, y: 0, px: 0, py: 0, movido: 0 })

  useEffect(() => {
    if (!arrastrable) {
      // Vuelve a su esquina de siempre mientras el efecto esté apagado.
      setPos(null)
      setArrastrando(false)
      return
    }
    setPos(leerGuardada())
  }, [arrastrable])

  // Si la ventana se achica, el sello no puede quedar fuera de la vista
  useEffect(() => {
    if (!pos) return
    const acomodar = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      setPos((p) =>
        p
          ? {
              x: Math.min(Math.max(p.x, 8), Math.max(8, window.innerWidth - r.width - 8)),
              y: Math.min(Math.max(p.y, 8), Math.max(8, window.innerHeight - r.height - 8)),
            }
          : p,
      )
    }
    window.addEventListener('resize', acomodar, { passive: true })
    return () => window.removeEventListener('resize', acomodar)
  }, [pos])

  /* Sin arrastre: un botón normal. Ni un manejador de puntero de más. */
  if (!arrastrable) {
    return (
      <button ref={ref} className="sello" onClick={onClick} aria-label={ETIQUETA}>
        <Cara />
      </button>
    )
  }

  const alPresionar = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    inicio.current = { x: e.clientX, y: e.clientY, px: r.left, py: r.top, movido: 0 }
    el.setPointerCapture(e.pointerId)
    setArrastrando(true)
  }

  const alMover = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!arrastrando) return
    const el = ref.current
    if (!el) return

    const dx = e.clientX - inicio.current.x
    const dy = e.clientY - inicio.current.y
    inicio.current.movido = Math.max(inicio.current.movido, Math.hypot(dx, dy))

    const r = el.getBoundingClientRect()
    const x = Math.min(Math.max(inicio.current.px + dx, 8), window.innerWidth - r.width - 8)
    const y = Math.min(Math.max(inicio.current.py + dy, 8), window.innerHeight - r.height - 8)
    setPos({ x, y })
  }

  const alSoltar = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!arrastrando) return
    ref.current?.releasePointerCapture(e.pointerId)
    setArrastrando(false)

    if (inicio.current.movido < TOLERANCIA) {
      onClick()
      return
    }
    try {
      if (pos) window.localStorage.setItem(CLAVE, JSON.stringify(pos))
    } catch {
      /* modo privado: se pierde la posición y no pasa nada */
    }
  }

  return (
    <button
      ref={ref}
      className={`sello${arrastrando ? ' is-arrastrando' : ''}${pos ? ' is-suelto' : ''}`}
      style={pos ? { left: pos.x, top: pos.y } : undefined}
      onPointerDown={alPresionar}
      onPointerMove={alMover}
      onPointerUp={alSoltar}
      onPointerCancel={alSoltar}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick()
        }
      }}
      aria-label={`${ETIQUETA} Puedes arrastrarlo para moverlo.`}
      title="Arrástrame"
    >
      <Cara />
    </button>
  )
}

const ETIQUETA = 'Trabajemos juntos: ir al formulario de contacto.'

/** Lo que se ve del sello: el aro de texto girando y la flecha del centro. */
function Cara() {
  return (
    <>
      <span className="sello-anillo" aria-hidden="true">
        <svg viewBox="0 0 200 200" aria-hidden="true">
          <defs>
            <path
              id="sello-curva"
              d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
              fill="none"
            />
          </defs>
          <text className="sello-texto">
            <textPath href="#sello-curva" startOffset="0%">
              TRABAJEMOS JUNTOS · TRABAJEMOS JUNTOS ·
            </textPath>
          </text>
        </svg>
      </span>
      <span className="sello-centro" aria-hidden="true">
        →
      </span>
    </>
  )
}
