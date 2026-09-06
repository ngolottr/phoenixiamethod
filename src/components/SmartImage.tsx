import { useState } from 'react'

type Tone = 'emerald' | 'midnight' | 'brass'

type Props = {
  src: string
  alt: string
  tone?: Tone
  priority?: boolean
  zoom?: boolean
  className?: string
}

/**
 * Imagen con carga progresiva y respaldo procedural.
 * Si el archivo todavía no existe en public/images/, en lugar de un icono roto
 * dibuja la atmósfera de la fotografía por CSS e indica qué archivo falta.
 */
export function SmartImage({ src, alt, tone = 'emerald', priority = false, zoom = false, className }: Props) {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading')

  return (
    <div
      className={`img${zoom ? ' zoom' : ''}${status === 'ok' ? ' is-ready' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      {status !== 'error' && (
        <img
          src={src}
          alt={alt}
          className={status === 'ok' ? 'ready' : undefined}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          // @ts-expect-error fetchpriority todavía no está en los tipos de React 18
          fetchpriority={priority ? 'high' : 'auto'}
          draggable={false}
          onLoad={() => setStatus('ok')}
          onError={() => setStatus('error')}
        />
      )}

      {status === 'error' && (
        <div className="img-fallback" data-tone={tone} role="img" aria-label={alt}>
          <span className="slot">
            Espacio para tu foto
            <b>public/{src}</b>
          </span>
        </div>
      )}
    </div>
  )
}
