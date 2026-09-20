import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { SmartImage } from './SmartImage'
import { GraficoCaso } from './GraficoCaso'
import { MagneticButton } from './MagneticButton'
import type { Caso } from '../data/proyectos'

/**
 * El expediente de un proyecto: cifras reales, hallazgos y método.
 *
 * Está pensado como un tablero abierto, no como un folleto. Por eso incluye
 * los números que no favorecen y deja anotado de dónde salió cada dato: es
 * mucho más creíble mostrar el registro que prometer un resultado.
 */
export function CasoPanel({ caso, onClose }: { caso: Caso; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const opener = useRef<Element | null>(null)

  useEffect(() => {
    opener.current = document.activeElement
    ref.current?.querySelector<HTMLElement>('button')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      } else if (e.key === 'Tab') {
        const f = ref.current?.querySelectorAll<HTMLElement>('button, [href]')
        if (!f || f.length === 0) return
        const first = f[0]
        const last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      ;(opener.current as HTMLElement | null)?.focus?.()
    }
  }, [onClose])

  return createPortal(
    <div className="caso" role="dialog" aria-modal="true" aria-label={caso.title} ref={ref}>
      <div className="caso-inner">
        <header className="caso-head">
          <div className="caso-id">
            <span className="caso-num">{caso.index}</span>
            <div>
              <p className="eyebrow">{caso.category}</p>
              <h3 className="display h-md caso-titulo">{caso.title}</h3>
              <span className="caso-estado">{caso.estado}</span>
            </div>
          </div>
          <MagneticButton className="btn ghost" onClick={onClose} aria-label="Cerrar el proyecto">
            Cerrar ✕
          </MagneticButton>
        </header>

        <div className="caso-cuerpo">
          <div className="caso-col">
            <p className="body caso-resumen">{caso.resumen}</p>

            {caso.cifras && (
              <div className="caso-cifras">
                {caso.cifras.map((c) => (
                  <div className="caso-cifra" key={c.etiqueta}>
                    <span className="cc-v">{c.valor}</span>
                    <span className="cc-e">{c.etiqueta}</span>
                    {c.nota && <span className="cc-n">{c.nota}</span>}
                  </div>
                ))}
              </div>
            )}

            {caso.metodo && (
              <div className="caso-bloque">
                <p className="eyebrow brass">{caso.metodo.titulo}</p>
                <ol className="caso-pasos">
                  {caso.metodo.pasos.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <div className="caso-col">
            {/* La fotografía de origen con los colores señalados sobre ella.
                El número del punto es el mismo de la lista de abajo: los globos
                flotando sobre la imagen taparían justo lo que hay que mirar. */}
            {caso.paleta && (
              <div className="caso-bloque">
                <p className="eyebrow">De dónde salió el color</p>

                {/* Cada color, señalado donde se midió. Sin explicaciones: una
                    paleta se entiende mirándola. */}
                <figure className="paleta">
                  <span className="paleta-foto">
                    <SmartImage src={caso.paleta.image} alt={caso.paleta.alt} />
                    {caso.paleta.marcas.map((m) => (
                      <span
                        key={m.nombre}
                        className={`paleta-marca${m.izquierda ? ' a-la-izquierda' : ''}`}
                        style={{ left: `${m.x}%`, top: `${m.y}%` }}
                      >
                        <span className="pm-punto" style={{ background: m.final }} />
                        <span className="pm-clave">
                          <span className="pm-n">{m.nombre}</span>
                          <code>{m.final}</code>
                        </span>
                      </span>
                    ))}
                  </span>
                </figure>
              </div>
            )}

            {/* Con qué está construido: capturas de las herramientas trabajando
                de verdad. Un logotipo lo pone cualquiera; esto muestra el
                sistema andando, que es lo que el caso está afirmando. */}
            {caso.herramientas && (
              <div className="caso-bloque">
                <p className="eyebrow">
                  {caso.tituloHerramientas ?? 'Con qué está construido'}
                </p>
                <div className="caso-herramientas">
                  {caso.herramientas.map((h) => (
                    <figure className="herramienta" key={h.nombre}>
                      {/* El marco toma la proporción de la imagen: con una fija,
                          cualquier captura que no case deja franjas vacías. */}
                      <span
                        className="herramienta-foto"
                        style={h.proporcion ? { aspectRatio: h.proporcion } : undefined}
                      >
                        <SmartImage src={h.image} alt={`${h.nombre} en uso`} />
                      </span>
                      <figcaption>
                        <span className="herramienta-n">{h.nombre}</span>
                        <span className="herramienta-r">{h.rol}</span>
                        <span className="herramienta-p">{h.para}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            )}

            {caso.hallazgos && (
              <div className="caso-bloque">
                <p className="eyebrow">Por qué está hecho así</p>
                <div className="caso-hallazgos">
                  {caso.hallazgos.map((h) => (
                    <div className="caso-hallazgo" key={h.titulo}>
                      <span className="ch-t">{h.titulo}</span>
                      <span className="ch-d">{h.dato}</span>
                      <span className="ch-p">{h.porque}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {caso.notas && (
              <div className="caso-bloque">
                <p className="eyebrow brass">Lo que también hay que decir</p>
                <ul className="caso-notas">
                  {caso.notas.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        </div>

        {/* El telón del fondo: la misma lámina del marco, muy atrás. Va un poco
            menos apagada que una fotografía porque es trazo fino y al 10 % no
            se vería nada. */}
        <div className={`caso-foto${caso.grafico ? ' es-grafico' : ''}`} aria-hidden="true">
          {caso.grafico ? <GraficoCaso nombre={caso.grafico} /> : <SmartImage src={caso.image} alt="" />}
        </div>
      </div>
    </div>,
    document.body,
  )
}
