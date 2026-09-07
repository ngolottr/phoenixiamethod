import { useCallback, useMemo, useRef, useState } from 'react'
import { SmartImage } from '../components/SmartImage'
import { AvisoDeMas, useAvisoDeMas } from '../components/PanelScroll'
import { Lightbox } from '../components/Lightbox'
import { Spell, useSpell } from '../components/Spell'
import { useAmbientApi } from '../hooks/useAmbient'
import { categories, gallery, type CategoryId } from '../data/site'

export function Gallery({ onLockNav }: { onLockNav: (locked: boolean) => void }) {
  const [filter, setFilter] = useState<CategoryId>('todo')
  const [open, setOpen] = useState<number | null>(null)
  const { paint, reset } = useAmbientApi()
  const spell = useSpell()
  const caja = useRef<HTMLDivElement>(null)
  const tira = useRef<HTMLDivElement>(null)
  useAvisoDeMas(caja, tira, filter)

  const shots = useMemo(
    () => (filter === 'todo' ? gallery : gallery.filter((s) => s.category === filter)),
    [filter],
  )

  // El conjuro sale del punto exacto del clic; el visor entra 180 ms después,
  // justo cuando las chispas ya se abrieron.
  const openAt = useCallback(
    (i: number, e: React.MouseEvent) => {
      spell.cast(e)
      window.setTimeout(() => {
        setOpen(i)
        onLockNav(true)
      }, document.documentElement.dataset.motion === 'reduced' ? 0 : 180)
    },
    [onLockNav, spell],
  )

  const close = useCallback(() => {
    setOpen(null)
    onLockNav(false)
    reset()
  }, [onLockNav, reset])

  const step = useCallback(
    (delta: number) => setOpen((i) => (i === null ? null : (i + delta + shots.length) % shots.length)),
    [shots.length],
  )

  const changeFilter = (id: CategoryId) => {
    setFilter(id)
    setOpen(null)
    reset()
  }

  return (
    <section className="scene" aria-labelledby="gal-title">
      <div className="gal-head rise" data-d="1">
        <div>
          <p className="eyebrow">Galería</p>
          <h2 id="gal-title" className="display h-md" style={{ marginTop: 12 }}>
            Fotogramas.
          </h2>
        </div>

        <div className="filters" role="group" aria-label="Filtrar por categoría">
          {categories.map((c) => (
            <button
              key={c.id}
              className="filter"
              aria-pressed={filter === c.id}
              onClick={() => changeFilter(c.id)}
            >
              {c.label}
              <span className="filter-n">
                {c.id === 'todo' ? gallery.length : gallery.filter((s) => s.category === c.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* En el teléfono la tira se desliza: la caja avisa cuando queda galería
          por debajo, para que una fila a medias no se lea como un corte. */}
      <div className="pane-caja" ref={caja} data-mas="no">
      <div className="gal-strip rise" data-d="2" key={filter} ref={tira}>
        {shots.map((shot, i) => (
          <button
            key={shot.src}
            className="gal-item"
            onClick={(e) => openAt(i, e)}
            // el color se adelanta al hover: la escena ya empieza a teñirse
            onMouseEnter={() => paint(shot.src)}
            onFocus={() => paint(shot.src)}
            onMouseLeave={() => open === null && reset()}
            onBlur={() => open === null && reset()}
            aria-label={`Ampliar: ${shot.caption}. ${shot.note}`}
          >
            <SmartImage src={shot.src} alt={shot.alt} />
            <span className="gal-cap">
              <span className="t">{shot.caption}</span>
              <span className="y">
                {(i + 1).toString().padStart(2, '0')} — {shot.category}
              </span>
            </span>
          </button>
        ))}
      </div>
        <AvisoDeMas />
      </div>

      <p className="gal-hint rise" data-d="3">
        <span className="con-cursor">
          Pasa el cursor y el sitio toma el color de la foto. Pulsa para verla completa.
        </span>
        <span className="con-dedo">Toca una foto: el sitio se tiñe con su color y se abre completa.</span>
      </p>

      <Spell point={spell.point} onDone={spell.clear} />

      {open !== null && shots[open] && (
        <Lightbox
          shots={shots}
          index={open}
          onClose={close}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </section>
  )
}
