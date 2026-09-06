/** Capas de atmósfera: grano analógico, viñeta profunda y el halo verde que respira. */
export function Atmosphere() {
  return (
    <>
      {/* capa de color: adopta el tono de la foto que se esté mirando */}
      <div className="ambient" aria-hidden="true" />
      <div className="halo" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
    </>
  )
}

/** Cortina que barre la pantalla durante el cambio de escena. */
export function Curtain({ active, direction }: { active: boolean; direction: 1 | -1 }) {
  return (
    <div
      className={`curtain${active ? ' is-active' : ''}`}
      data-dir={direction}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
      <span />
    </div>
  )
}
