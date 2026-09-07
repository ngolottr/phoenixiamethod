import { MagneticButton } from './MagneticButton'
import { Ajustes } from './Ajustes'
import { SCENES, type SceneDef } from '../hooks/useSceneRouter'
import { brand } from '../data/site'
import type { Theme } from '../hooks/usePreferences'

type Props = {
  index: number
  scene: SceneDef
  onGo: (i: number) => void
  onPrev: () => void
  onNext: () => void
  reduced: boolean
  onToggleMotion: () => void
  customCursor: boolean
  onToggleCursor: () => void
  drag: boolean
  onToggleDrag: () => void
  theme: Theme
  onToggleTheme: () => void
  /** el visor de galería está abierto: la navegación se retira */
  hidden?: boolean
}

export function Nav({
  index,
  scene,
  onGo,
  onPrev,
  onNext,
  reduced,
  onToggleMotion,
  customCursor,
  onToggleCursor,
  drag,
  onToggleDrag,
  theme,
  onToggleTheme,
  hidden = false,
}: Props) {
  const isFirst = index === 0
  const isLast = index === SCENES.length - 1

  return (
    <>
      <header className={`topnav${hidden ? ' is-away' : ''}`} aria-hidden={hidden || undefined}>
        <button className="wordmark" onClick={() => onGo(0)} aria-label="Volver al inicio">
          EL<b>GOLOTT</b>
        </button>

        <nav className="menu" aria-label="Escenas del portfolio">
          {SCENES.map((s, i) => (
            <button
              key={s.id}
              className="menu-item"
              aria-current={i === index}
              onClick={() => onGo(i)}
            >
              <span className="num">{s.num}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* Un atajo directo al tema, que es lo que más se toca, y el resto
            dentro del panel. Así la barra no crece con cada opción nueva. */}
        <div className="utils">
          <button
            className="util util-tema"
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            <span className="util-icon" aria-hidden="true">
              {theme === 'dark' ? '☾' : '☀'}
            </span>
            <span className="util-long">{theme === 'dark' ? 'Oscuro' : 'Claro'}</span>
            <span className="sr-only">
              Apariencia: modo {theme === 'dark' ? 'oscuro' : 'claro'}. Pulsa para cambiar.
            </span>
          </button>

          <Ajustes
            reduced={reduced}
            onToggleMotion={onToggleMotion}
            customCursor={customCursor}
            onToggleCursor={onToggleCursor}
            drag={drag}
            onToggleDrag={onToggleDrag}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
        </div>
      </header>

      <div className={`botnav${hidden ? ' is-away' : ''}`} aria-hidden={hidden || undefined}>
        <div className="arrows">
          <MagneticButton
            className="btn icon"
            onClick={onPrev}
            disabled={isFirst}
            aria-label="Escena anterior"
            style={isFirst ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
          >
            ←
          </MagneticButton>
          <MagneticButton
            className="btn icon"
            onClick={onNext}
            disabled={isLast}
            aria-label="Escena siguiente"
            style={isLast ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
          >
            →
          </MagneticButton>
          <span className="hint" aria-hidden="true">← → cambian de escena · Esc vuelve al inicio</span>
        </div>

        <div className="ticker">
          <div className="ticker-marks" aria-hidden="true">
            {SCENES.map((s, i) => (
              <span key={s.id} className={i === index ? 'on' : undefined} />
            ))}
          </div>
          <span className="ticker-count">
            <b>{scene.num}</b> / {SCENES.length.toString().padStart(2, '0')} — {scene.label}
          </span>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Escena {scene.num} de {SCENES.length}: {scene.label}. {brand.name}.
      </span>
    </>
  )
}
