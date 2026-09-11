import { MagneticButton } from './MagneticButton'
import { Ajustes } from './Ajustes'
import { BLOQUES, SCENES, type SceneDef } from '../hooks/useSceneRouter'
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
  musica: boolean
  onToggleMusica: () => void
  sonido: boolean
  onToggleSonido: () => void
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
  musica,
  onToggleMusica,
  sonido,
  onToggleSonido,
  theme,
  onToggleTheme,
  hidden = false,
}: Props) {
  const isFirst = index === 0
  const isLast = index === SCENES.length - 1
  const siguiente = isLast ? null : SCENES[index + 1]
  const anterior = isFirst ? null : SCENES[index - 1]
  /** El paso siguiente cambia de bloque: conviene avisarlo antes de darlo. */
  const cambiaBloque = siguiente ? siguiente.bloque !== scene.bloque : false

  return (
    <>
      <header className={`topnav${hidden ? ' is-away' : ''}`} aria-hidden={hidden || undefined}>
        <button className="wordmark" onClick={() => onGo(0)} aria-label="Volver al inicio">
          EL<b>GOLOTT</b>
        </button>

        {/* El menú de escenas se retiró a propósito: el recorrido es la
            propuesta, no una lista de atajos. Se avanza con las flechas, y el
            bloque en curso queda dicho aquí arriba para no perder el norte. */}
        <p className="topnav-bloque" aria-hidden="true">
          <span className="topnav-bloque-n">{scene.num}</span>
          {BLOQUES[scene.bloque].titulo}
        </p>

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
            musica={musica}
            onToggleMusica={onToggleMusica}
            sonido={sonido}
            onToggleSonido={onToggleSonido}
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
        </div>
      </header>

      <div className={`botnav${hidden ? ' is-away' : ''}`} aria-hidden={hidden || undefined}>
        {/* Sin menú, estas flechas SON la navegación. Por eso la de avanzar
            dice a dónde lleva: el visitante decide seguir sabiendo qué viene,
            que es justo lo que una lista de atajos hacía a costa del recorrido. */}
        <div className="arrows">
          <MagneticButton
            className="btn icon"
            onClick={onPrev}
            disabled={isFirst}
            aria-label={anterior ? `Volver a ${anterior.label}` : 'Escena anterior'}
            style={isFirst ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
          >
            ←
          </MagneticButton>

          {/* Al final del recorrido el botón no se apaga: cierra el círculo y
              devuelve al inicio. Dejarlo muerto abandonaba al visitante en la
              última escena sin ninguna salida a la vista. */}
          <button
            className={`avanzar${cambiaBloque ? ' cambia-bloque' : ''}${isLast ? ' es-cierre' : ''}`}
            onClick={isLast ? () => onGo(0) : onNext}
            aria-label={siguiente ? `Continuar a ${siguiente.label}` : 'Volver al inicio'}
          >
            <span className="avanzar-txt">
              {siguiente ? (
                <>
                  {cambiaBloque && (
                    <span className="avanzar-bloque">{BLOQUES[siguiente.bloque].titulo}</span>
                  )}
                  <span className="avanzar-destino">{siguiente.label}</span>
                </>
              ) : (
                <>
                  <span className="avanzar-bloque">Fin del recorrido</span>
                  <span className="avanzar-destino">Volver al inicio</span>
                </>
              )}
            </span>
            <span className="avanzar-flecha" aria-hidden="true">
              {isLast ? '↺' : '→'}
            </span>
          </button>

          <span className="hint" aria-hidden="true">
            ← → cambian de escena · Esc vuelve al inicio
          </span>
        </div>

        <div className="ticker">
          <div className="ticker-marks" aria-hidden="true">
            {SCENES.map((s, i) => (
              <span key={s.id} className={i === index ? 'on' : undefined} />
            ))}
          </div>
          <span className="ticker-count">
            <b>{scene.num}</b> / {SCENES.length.toString().padStart(2, '0')} — {scene.label}
            <span className="ticker-bloque"> · {BLOQUES[scene.bloque].titulo}</span>
          </span>
        </div>
      </div>

      <span className="sr-only" aria-live="polite">
        Escena {scene.num} de {SCENES.length}: {scene.label}. {brand.name}.
      </span>
    </>
  )
}
