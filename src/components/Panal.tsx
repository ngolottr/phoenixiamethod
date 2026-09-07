import { useEffect, useRef } from 'react'

/* ============================================================================
   LA MALLA DE PANAL
   ----------------------------------------------------------------------------
   Dibujada en un lienzo, no con un patrón de fondo repetido.

   La diferencia importa: un patrón de CSS se puede mover o escalar entero, pero
   no se puede tocar un pedazo. Acá cada vértice existe como un punto, así que
   los que quedan cerca del cursor se corren hacia él y el tejido se abolla de
   verdad, como una red cuando alguien la empuja con el dedo.
   ========================================================================== */

/** Lado del hexágono en píxeles. Más chico = malla más tupida y más costo. */
const LADO = 26
/** Hasta dónde llega la mano que hunde. */
const RADIO = 230
/** Cuánto se hunde en el punto exacto del cursor. */
const FUERZA = 30

export function Panal() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const finoElPuntero = window.matchMedia('(pointer: fine)').matches
    let ancho = 0
    let alto = 0
    let mx = -9999
    let my = -9999
    let raf = 0
    let color = '43, 229, 143'

    /** Segmentos de la malla: cada uno es [x1, y1, x2, y2]. */
    let lineas: Float64Array = new Float64Array(0)

    /* --- Construir la malla ---------------------------------------------- */

    const construir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      ancho = window.innerWidth
      alto = window.innerHeight
      canvas.width = Math.floor(ancho * dpr)
      canvas.height = Math.floor(alto * dpr)
      canvas.style.width = `${ancho}px`
      canvas.style.height = `${alto}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Hexágonos de lado plano: los centros van en columnas separadas 1,5·lado,
      // y las columnas impares bajan media fila.
      const pasoX = LADO * 1.5
      const pasoY = LADO * Math.sqrt(3)
      const acumulado: number[] = []

      let columna = 0
      for (let cx = -LADO; cx < ancho + LADO * 2; cx += pasoX, columna++) {
        const desfase = columna % 2 ? pasoY / 2 : 0
        for (let cy = -LADO + desfase; cy < alto + LADO * 2; cy += pasoY) {
          // De las seis aristas se dibujan tres: las otras las aporta el vecino,
          // y así ninguna línea se pinta dos veces.
          for (let k = 0; k < 3; k++) {
            const a = ((k * 60 - 30) * Math.PI) / 180
            const b = (((k + 1) * 60 - 30) * Math.PI) / 180
            acumulado.push(
              cx + LADO * Math.cos(a),
              cy + LADO * Math.sin(a),
              cx + LADO * Math.cos(b),
              cy + LADO * Math.sin(b),
            )
          }
        }
      }
      lineas = Float64Array.from(acumulado)
    }

    /* --- La abolladura ---------------------------------------------------- */

    /** Corre un punto hacia el cursor; mientras más cerca, más se corre. */
    const hundir = (x: number, y: number): [number, number] => {
      const dx = x - mx
      const dy = y - my
      const d = Math.hypot(dx, dy)
      if (d > RADIO || d < 0.01) return [x, y]
      const t = 1 - d / RADIO
      const k = t * t * FUERZA
      return [x - (dx / d) * k, y - (dy / d) * k]
    }

    /* --- Pintar ------------------------------------------------------------ */

    const pintar = () => {
      ctx.clearRect(0, 0, ancho, alto)
      ctx.lineWidth = 1

      // Primera pasada: toda la malla, muy tenue
      ctx.beginPath()
      for (let i = 0; i < lineas.length; i += 4) {
        const [ax, ay] = hundir(lineas[i], lineas[i + 1])
        const [bx, by] = hundir(lineas[i + 2], lineas[i + 3])
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
      }
      ctx.strokeStyle = `rgba(${color}, 0.10)`
      ctx.stroke()

      // Segunda pasada: solo lo que está dentro de la mano, más encendido.
      // Ese brillo es lo que hace leer la deformación como profundidad.
      if (mx > -9000) {
        ctx.beginPath()
        for (let i = 0; i < lineas.length; i += 4) {
          if (Math.abs(lineas[i] - mx) > RADIO || Math.abs(lineas[i + 1] - my) > RADIO) continue
          const [ax, ay] = hundir(lineas[i], lineas[i + 1])
          const [bx, by] = hundir(lineas[i + 2], lineas[i + 3])
          ctx.moveTo(ax, ay)
          ctx.lineTo(bx, by)
        }
        const brillo = ctx.createRadialGradient(mx, my, 0, mx, my, RADIO)
        brillo.addColorStop(0, `rgba(${color}, 0.55)`)
        brillo.addColorStop(0.55, `rgba(${color}, 0.18)`)
        brillo.addColorStop(1, `rgba(${color}, 0)`)
        ctx.strokeStyle = brillo
        ctx.stroke()
      }

      raf = 0
    }

    const pedirPintado = () => {
      if (!raf) raf = requestAnimationFrame(pintar)
    }

    /* --- Escuchas ---------------------------------------------------------- */

    const alMover = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      pedirPintado()
    }

    const alSalir = () => {
      mx = -9999
      my = -9999
      pedirPintado()
    }

    const alRedimensionar = () => {
      construir()
      pedirPintado()
    }

    /** El color lo manda la foto o el video que se esté mirando. */
    const leerColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--amb-accent').trim()
      if (!v) return
      const d = document.createElement('div')
      d.style.color = v
      document.body.appendChild(d)
      const rgb = getComputedStyle(d).color.match(/\d+/g)
      d.remove()
      if (rgb && rgb.length >= 3) {
        const nuevo = `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`
        if (nuevo !== color) {
          color = nuevo
          pedirPintado()
        }
      }
    }

    construir()
    leerColor()
    pintar()

    // El color se consulta de a poco: preguntarlo en cada cuadro obliga al
    // navegador a recalcular estilos y no vale la pena para algo que cambia
    // como mucho una vez por segundo.
    const reloj = window.setInterval(leerColor, 400)

    if (finoElPuntero) {
      window.addEventListener('pointermove', alMover, { passive: true })
      document.addEventListener('pointerleave', alSalir)
    }
    window.addEventListener('resize', alRedimensionar)

    return () => {
      window.clearInterval(reloj)
      window.removeEventListener('pointermove', alMover)
      document.removeEventListener('pointerleave', alSalir)
      window.removeEventListener('resize', alRedimensionar)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  return <canvas ref={ref} className="panal" aria-hidden="true" />
}
