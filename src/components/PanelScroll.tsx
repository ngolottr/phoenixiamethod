import { useEffect, useRef, type ReactNode, type RefObject } from 'react'

/* ============================================================================
   PANEL QUE SE DESLIZA
   ----------------------------------------------------------------------------
   Hay escenas cuyo contenido no cabe en la pantalla de un teléfono. En vez de
   recortarlo, el panel lleva su propio desplazamiento interno — el documento
   nunca se mueve.

   El problema de un panel así es que no se ve que sea deslizable: el visitante
   cree que el texto está cortado. Por eso, mientras quede algo por debajo, el
   borde inferior se desvanece y aparece la palabra "desliza". Cuando llega al
   final, ambos desaparecen y lo último se lee limpio.
   ========================================================================== */

/**
 * Marca la caja con data-mas="si" mientras quede contenido por debajo.
 * El CSS se encarga del resto.
 */
export function useAvisoDeMas(
  caja: RefObject<HTMLElement | null>,
  panel: RefObject<HTMLElement | null>,
  /** Cambia cuando el elemento que se desliza se vuelve a montar (p. ej. un filtro). */
  llave?: unknown,
) {
  useEffect(() => {
    const p = panel.current
    const c = caja.current
    if (!p || !c) return

    const medir = () => {
      // Se miran los dos ejes: la galería se desliza de lado en el escritorio
      // y hacia abajo en el teléfono, y el aviso tiene que apuntar bien.
      const quedaY = p.scrollHeight - p.clientHeight - p.scrollTop
      const quedaX = p.scrollWidth - p.clientWidth - p.scrollLeft
      const hayY = quedaY > 8
      const hayX = quedaX > 8
      c.dataset.mas = hayY || hayX ? 'si' : 'no'
      c.dataset.eje = hayY ? 'y' : 'x'
    }

    medir()
    p.addEventListener('scroll', medir, { passive: true })

    // Las fotos llegan después que el HTML: hasta que no cargan, el alto que
    // mediríamos sería el equivocado. El observador vuelve a medir sin que
    // haya que adivinar cuándo.
    const ojo = new ResizeObserver(medir)
    ojo.observe(p)
    for (const hijo of Array.from(p.children)) ojo.observe(hijo)

    return () => {
      p.removeEventListener('scroll', medir)
      ojo.disconnect()
    }
  }, [caja, panel, llave])
}

/**
 * El aviso suelto, para cuando la zona que se desliza no es un panel.
 * El velo se pinta *encima* del panel, no como máscara suya: enmascarar el
 * contenedor dejaba la escena de Redes completamente en blanco.
 */
export function AvisoDeMas() {
  return (
    <>
      <span className="pane-velo" aria-hidden="true" />
      <span className="pane-mas" aria-hidden="true">
        desliza <b className="pane-mas-y">↓</b>
        <b className="pane-mas-x">→</b>
      </span>
    </>
  )
}

export function PanelScroll({
  className = '',
  children,
}: {
  className?: string
  children: ReactNode
}) {
  const caja = useRef<HTMLDivElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  useAvisoDeMas(caja, panel)

  return (
    <div className="pane-caja" ref={caja} data-mas="no">
      <div className={`pane pane-scroll ${className}`.trim()} ref={panel}>
        {children}
      </div>
      <AvisoDeMas />
    </div>
  )
}
