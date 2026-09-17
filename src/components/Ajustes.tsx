import { useEffect, useId, useRef, useState } from 'react'
import type { Theme } from '../hooks/usePreferences'

/* ============================================================================
   AJUSTES
   ----------------------------------------------------------------------------
   Un solo botón en la barra abre todo: apariencia arriba, efectos abajo.

   Antes los interruptores vivían sueltos en la cabecera, cuatro en fila. Con el
   menú de escenas al lado no cabían en un portátil de 1366 y en el teléfono se
   quedaban en cuadraditos de 34 píxeles, por debajo de lo que un dedo acierta
   con comodidad. Agrupados en un panel caben igual en cualquier pantalla, tienen
   sitio para decir qué hace cada uno, y el teléfono recibe exactamente las
   mismas opciones que el escritorio.

   Los efectos vienen apagados. El sitio tiene que abrir liviano en un equipo
   modesto antes que lucirse en uno bueno; encenderlos es decisión del visitante
   y queda guardada para la próxima visita.
   ========================================================================== */

type Props = {
  reduced: boolean
  onToggleMotion: () => void
  customCursor: boolean
  onToggleCursor: () => void
  drag: boolean
  onToggleDrag: () => void
  musica: boolean
  onToggleMusica: () => void
  sonido: boolean
  onToggleSonido: () => void
  theme: Theme
  onToggleTheme: () => void
}

/** Una fila de efecto: nombre, para qué sirve, y el interruptor. */
function Fila({
  nombre,
  detalle,
  on,
  onClick,
}: {
  nombre: string
  detalle: string
  on: boolean
  onClick: () => void
}) {
  return (
    <button className="aj-fila" role="switch" aria-checked={on} onClick={onClick}>
      <span className="aj-fila-txt">
        <span className="aj-fila-n">{nombre}</span>
        <span className="aj-fila-d">{detalle}</span>
      </span>
      <span className="aj-sw" aria-hidden="true">
        <span className="aj-sw-bola" />
      </span>
      <span className="aj-fila-e" aria-hidden="true">
        {on ? 'ON' : 'OFF'}
      </span>
    </button>
  )
}

export function Ajustes({
  reduced,
  onToggleMotion,
  customCursor,
  onToggleCursor,
  drag,
  onToggleDrag,
  musica,
  onToggleMusica,
  sonido,
  onToggleSonido,
  theme,
  onToggleTheme,
}: Props) {
  const [abierto, setAbierto] = useState(false)
  const caja = useRef<HTMLDivElement>(null)
  const disparador = useRef<HTMLButtonElement>(null)
  const id = useId()

  /* Los oyentes solo existen mientras el panel está abierto: cerrado no queda
     nada escuchando en la ventana. */
  useEffect(() => {
    if (!abierto) return

    const fuera = (e: PointerEvent) => {
      if (!caja.current?.contains(e.target as Node)) setAbierto(false)
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setAbierto(false)
      disparador.current?.focus()
    }

    document.addEventListener('pointerdown', fuera, { passive: true })
    window.addEventListener('keydown', tecla, true)
    return () => {
      document.removeEventListener('pointerdown', fuera)
      window.removeEventListener('keydown', tecla, true)
    }
  }, [abierto])

  const elegirTema = (quiero: Theme) => {
    if (theme !== quiero) onToggleTheme()
  }

  return (
    <div className="ajustes" ref={caja}>
      <button
        ref={disparador}
        className="util aj-boton"
        onClick={() => setAbierto((v) => !v)}
        aria-expanded={abierto}
        aria-controls={id}
        title="Apariencia y efectos"
      >
        <span className="util-icon" aria-hidden="true">
          ⚙
        </span>
        <span className="util-long">Ajustes</span>
        <span className="sr-only">Abrir apariencia y efectos</span>
      </button>

      {/* Se desmonta al cerrar: nada del panel queda en el documento. */}
      {abierto && (
        <div className="aj-panel" id={id}>
          <p className="aj-titulo">Apariencia</p>
          <div className="aj-tema" role="radiogroup" aria-label="Modo claro u oscuro">
            <button
              className="aj-tema-op"
              role="radio"
              aria-checked={theme === 'light'}
              onClick={() => elegirTema('light')}
            >
              <span aria-hidden="true">☀</span> Claro
            </button>
            <button
              className="aj-tema-op"
              role="radio"
              aria-checked={theme === 'dark'}
              onClick={() => elegirTema('dark')}
            >
              <span aria-hidden="true">☾</span> Oscuro
            </button>
          </div>

          <p className="aj-titulo">Efectos</p>
          <div className="aj-efectos">
            <Fila
              nombre="Movimiento"
              detalle="Animaciones de entrada y transiciones"
              on={!reduced}
              onClick={onToggleMotion}
            />
            <Fila
              nombre="Cursor"
              detalle="La malla se hunde bajo el puntero"
              on={customCursor}
              onClick={onToggleCursor}
            />
            <Fila
              nombre="Arrastre"
              detalle="Mover el sello y dejar ondas al pulsar"
              on={drag}
              onClick={onToggleDrag}
            />
          </div>

          <p className="aj-titulo">Audio</p>
          <div className="aj-efectos">
            <Fila
              nombre="Música"
              detalle="Cama lofi de fondo, en todo el recorrido"
              on={musica}
              onClick={onToggleMusica}
            />
            <Fila
              nombre="Sonidos"
              detalle="El portal al cambiar de verso en el manifiesto"
              on={sonido}
              onClick={onToggleSonido}
            />
          </div>

          <p className="aj-nota">
            Todo viene apagado para que el sitio abra liviano en cualquier equipo: mientras un
            efecto está apagado no se descarga su audio. Tu elección queda guardada.
          </p>

          {/* La entrada al panel privado. Discreta a propósito: pide contraseña,
              así que un visitante que la abra solo ve la puerta cerrada. */}
          <a className="aj-panel-privado" href="./panel.html">
            <span aria-hidden="true">▦</span> Estadísticas <em>· acceso privado</em>
          </a>
        </div>
      )}
    </div>
  )
}
