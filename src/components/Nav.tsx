import { MagneticButton } from './MagneticButton'
import { Ajustes } from './Ajustes'
import { Isotipo } from './Isotipo'
import { BLOQUES, SCENES, type SceneDef } from '../hooks/useSceneRouter'
import { persona, phoenix } from '../data/site'
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
  /** En la parte comercial la firma es Phoenix; en la personal, ElGolott. */
  const enNegocio = scene.bloque === 'negocio'

  return (
    <>
      <header className={`topnav${hidden ? ' is-away' : ''}`} aria-hidden={hidden || undefined}>
        {/* La firma de la esquina no es decorativa: dice bajo qué marca está
            leyendo el visitante. Cambia con el bloque porque el sitio aloja
            dos marcas, y una barra que dijera siempre lo mismo estaría
            mintiendo en la mitad del recorrido. */}
        <button
          className={`wordmark${enNegocio ? ' es-phoenix' : ''}`}
          onClick={() => onGo(0)}
          aria-label={`${enNegocio ? phoenix.name : persona.name}. Volver al inicio`}
        >
          {enNegocio ? (
            <>
              <Isotipo className="wordmark-marca" />
              PHOENIX<b>IA METHOD</b>
            </>
          ) : (
            <>
              EL<b>GOLOTT</b>
            </>
          )}
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
          {/* Llamada inmediata, para quien necesita hablar ya. En el teléfono
              abre el marcador; en el computador, la app de llamadas que haya.
              Va en todas las escenas porque una urgencia no espera al final
              del recorrido. */}
          <a
            className="util util-llamar"
            href={`tel:${phoenix.telefono.tel}`}
            title={`Llamar ahora: ${phoenix.telefono.visible}`}
          >
            <svg className="util-llamar-icono" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6.6 3.5h2.6l1.4 4.2-2 1.5a12 12 0 0 0 6.2 6.2l1.5-2 4.2 1.4v2.6A2.1 2.1 0 0 1 18.4 20 15.9 15.9 0 0 1 4 5.6a2.1 2.1 0 0 1 2.6-2.1z" />
            </svg>
            <span className="util-long">Llamar ahora</span>
            <span className="sr-only">Llamar ahora a Nicolás: {phoenix.telefono.visible}</span>
          </a>

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
        Escena {scene.num} de {SCENES.length}: {scene.label}. {BLOQUES[scene.bloque].marca}.
      </span>
    </>
  )
}
