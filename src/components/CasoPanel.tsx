import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { SmartImage } from './SmartImage'
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
            {caso.hallazgos && (
              <div className="caso-bloque">
                <p className="eyebrow">Lo que muestran los datos</p>
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
                <p className="eyebrow brass">Criterio</p>
                <ul className="caso-notas">
                  {caso.notas.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="caso-fuente">{caso.fuente}</p>
          </div>
        </div>

        <div className="caso-foto" aria-hidden="true">
          <SmartImage src={caso.image} alt="" />
        </div>
      </div>
    </div>,
    document.body,
  )
}
