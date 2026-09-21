import { useEffect, useState, type ReactNode } from 'react'
import type { Autor, Cita, Foto } from '../data/citas'
import { fechaEnChile, fechaLarga, fraseDelDia, type FraseDelDia } from '../lib/citaDelDia'

/**
 * La frase de hoy: una cita de un libro famoso, con su autor, su foto y el libro.
 *
 * Está en el Método porque ahí hace un trabajo concreto: la credibilidad. Quien
 * llega desconfiando de una web que dice "IA y automatización" se topa con
 * frases de gente que escribió los libros que ya conoce (Drucker, Covey,
 * Kahneman, Sagan…), y eso ubica el criterio de Phoenix en una tradición y no en
 * un eslogan. Por eso cada frase se verificó contra el texto real del libro:
 * una cita mal atribuida en la sección que existe para dar confianza es
 * peor que no tener sección.
 */

export type FraseHoy = FraseDelDia & { fecha: string; autor: Autor }

/**
 * La frase de hoy en Chile, o null mientras carga el banco.
 *
 * El banco de frases se importa AQUÍ, dinámicamente, y no arriba del archivo:
 * pesa más que todo el resto de la escena y solo lo necesita quien llega al
 * Método. Importado de forma estática viajaría dentro del código de todas las
 * visitas, y este sitio se presenta como uno que carga rápido.
 *
 * La fecha se revisa cada minuto por si la pestaña se queda abierta pasada la
 * medianoche.
 */
export function useFraseDelDia(): FraseHoy | null {
  const [banco, setBanco] = useState<typeof import('../data/citas') | null>(null)
  const [fecha, setFecha] = useState(() => {
    // Solo en desarrollo: ?dia=2026-10-05 muestra la frase de ese día, para revisar
    // cómo se ve cada una sin esperar. En producción esta línea ni existe.
    const forzada = import.meta.env.DEV ? new URLSearchParams(window.location.search).get('dia') : null
    return forzada && /^\d{4}-\d{2}-\d{2}$/.test(forzada) ? forzada : fechaEnChile()
  })

  useEffect(() => {
    let vivo = true
    import('../data/citas').then((m) => vivo && setBanco(m))
    const t = window.setInterval(() => {
      if (!import.meta.env.DEV) setFecha(fechaEnChile())
    }, 60_000)
    return () => {
      vivo = false
      window.clearInterval(t)
    }
  }, [])

  if (!banco) return null
  const frase = fraseDelDia(banco, fecha)
  return { ...frase, fecha, autor: banco.autores[frase.cita.autor] }
}

/** Resalta con el color de la marca la palabra que carga el sentido de la frase. */
function conResalte(texto: string, palabra?: string): ReactNode {
  if (!palabra) return texto
  const i = texto.toLowerCase().indexOf(palabra.toLowerCase())
  if (i < 0) return texto
  return (
    <>
      {texto.slice(0, i)}
      <em>{texto.slice(i, i + palabra.length)}</em>
      {texto.slice(i + palabra.length)}
    </>
  )
}

/** El libro, como lo conoce quien lo leyó en castellano, con el título original al lado. */
function Libro({ cita }: { cita: Cita }) {
  const conocido = cita.libroEs ?? cita.libro
  return (
    <span className="cita-libro">
      <em>{conocido}</em>
      {cita.libroEs && cita.libroEs !== cita.libro ? ` (${cita.libro})` : ''} · {cita.anio}
      {cita.donde ? ` · ${cita.donde}` : ''}
    </span>
  )
}

/**
 * El crédito de la foto va a la vista, no escondido en un archivo: las fotos
 * vienen de Wikimedia Commons con licencia libre, y esa licencia exige nombrar
 * a quien la hizo. Si el autor de la foto no se conoce, se dice tal cual.
 */
function CreditoFoto({ foto }: { foto: Foto }) {
  const licencia = foto.licencia.toLowerCase().startsWith('public domain') ? 'dominio público' : foto.licencia
  return (
    <p className="cita-credito">
      {foto.tipo === 'retrato' ? 'Retrato' : 'Foto'}: {foto.credito ? `${foto.credito} · ` : ''}
      {licencia} ·{' '}
      <a href={foto.enlace} target="_blank" rel="noopener noreferrer">
        Wikimedia Commons
      </a>
    </p>
  )
}

const ORIGINAL = { en: 'Original', fr: 'Original (francés)', es: 'Original' } as const

export function CitaDelDia({ frase }: { frase: FraseHoy }) {
  const { cita, autor, vuelta } = frase
  // El largo decide el tamaño de la letra: la misma medida para una frase de
  // seis palabras y para una de treinta dejaría una enorme y la otra ilegible.
  const largo = cita.es.length < 95 ? 'corta' : cita.es.length < 165 ? 'media' : 'larga'
  const traducida = cita.idioma !== 'es'

  return (
    <figure className="cita" data-largo={largo}>
      <blockquote className="cita-texto" lang="es" key={cita.id}>
        “{conResalte(cita.es, cita.resaltar)}”
      </blockquote>

      <figcaption className="cita-autor">
        <span className="cita-foto">
          <img
            src={autor.foto.archivo}
            alt={`${autor.foto.tipo === 'retrato' ? 'Retrato' : 'Foto'} de ${autor.nombre}`}
            width={84}
            height={84}
            loading="lazy"
            decoding="async"
            draggable={false}
            style={autor.foto.posicion ? { objectPosition: autor.foto.posicion } : undefined}
          />
        </span>
        <span className="cita-quien">
          <span className="cita-nombre">{autor.nombre}</span>
          <Libro cita={cita} />
        </span>
      </figcaption>

      {cita.nota && <p className="cita-nota">{cita.nota}</p>}

      <p className="cita-original" lang={cita.idioma}>
        {ORIGINAL[cita.idioma]}
        {cita.traductor ? ` · trad. ${cita.traductor}` : ''}: “{cita.original}”
      </p>

      <div className="cita-pie">
        <CreditoFoto foto={autor.foto} />
        <p className="cita-aviso">
          {traducida ? 'Traducción propia. ' : ''}
          Cita de un libro publicado: su autor no patrocina ni respalda este sitio.
          {/* Solo mientras sea cierto. Cuando la lista se acabe y empiece a repetirse,
              la promesa deja de aparecer sola en vez de quedar mintiendo. */}
          {vuelta === 1 ? ' Una distinta cada día, sin repetirse.' : ''}
        </p>
      </div>
    </figure>
  )
}

/** El rótulo de la escena: "La frase de hoy · 21 de septiembre". */
export function rotuloDeHoy(fecha: string): string {
  return `La frase de hoy · ${fechaLarga(fecha)}`
}
