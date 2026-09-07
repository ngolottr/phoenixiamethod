import { useEffect, useRef, useState } from 'react'
import { SmartImage } from './SmartImage'

/**
 * Reproduce una lista de videos en secuencia, en bucle y sin sonido.
 *
 * Los navegadores solo dejan que un video arranque solo si está silenciado, así
 * que va muted y con playsInline para que iOS no lo abra a pantalla completa.
 * Mientras el primero carga se ve la foto de portada, y si el visitante pidió
 * reducir el movimiento no se carga ningún video: se queda la foto.
 */
export function VideoLoop({
  fuentes,
  poster,
  alt,
}: {
  fuentes: string[]
  poster: string
  alt: string
}) {
  const ref = useRef<HTMLVideoElement>(null)
  const [i, setI] = useState(0)
  const [listo, setListo] = useState(false)
  const [permitido, setPermitido] = useState(false)

  useEffect(() => {
    setPermitido(document.documentElement.dataset.motion !== 'reduced' && fuentes.length > 0)
  }, [fuentes.length])

  // Al terminar uno, entra el siguiente; al llegar al último, vuelve al primero
  useEffect(() => {
    const v = ref.current
    if (!v || !permitido) return
    v.load()
    const arrancar = () => v.play().catch(() => {})
    v.addEventListener('loadeddata', arrancar)
    return () => v.removeEventListener('loadeddata', arrancar)
  }, [i, permitido])

  if (!permitido) return <SmartImage src={poster} alt={alt} />

  return (
    <div className="vloop">
      {/* la portada sostiene el cuadro hasta que el video tiene imagen */}
      <div className={`vloop-poster${listo ? ' oculto' : ''}`}>
        <SmartImage src={poster} alt={alt} />
      </div>
      <video
        ref={ref}
        className={listo ? 'listo' : undefined}
        src={fuentes[i]}
        muted
        playsInline
        autoPlay
        preload="metadata"
        aria-label={alt}
        onLoadedData={() => setListo(true)}
        onEnded={() => setI((v) => (v + 1) % fuentes.length)}
        onError={() => setI((v) => (v + 1) % fuentes.length)}
      />
    </div>
  )
}
