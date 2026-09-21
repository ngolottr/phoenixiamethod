import { useState, type ReactNode } from 'react'
import { MagneticButton } from '../components/MagneticButton'
import { Emblema } from '../components/Emblema'
import { CitaDelDia, rotuloDeHoy, useFraseDelDia } from '../components/CitaDelDia'
import { usePortal } from '../hooks/useAudio'
import { manifesto } from '../data/site'

const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

/** Convierte *palabra* en la palabra resaltada en verde veneno. */
function render(line: string): ReactNode[] {
  return line.split(/(\*[^*]+\*)/g).map((chunk, i) =>
    chunk.startsWith('*') && chunk.endsWith('*') ? (
      <em key={i}>{chunk.slice(1, -1)}</em>
    ) : (
      <span key={i}>{chunk}</span>
    ),
  )
}

/**
 * El método: los cinco principios de Phoenix, uno por pantalla, y una sexta
 * pantalla con la frase de hoy.
 *
 * Los cinco principios son la regla con la que Phoenix decide qué acepta y qué
 * no, y no se tocan. La frase del día no los reemplaza: los respalda. Va al
 * final del recorrido porque es la respuesta a la pregunta que queda cuando se
 * termina de leer un método —¿y esto quién más lo dice?—, y quien no llegue
 * hasta ahí igual la encuentra desde cualquier pantalla, en la cápsula de abajo.
 */
export function Manifesto({ sonido }: { sonido: boolean }) {
  const [i, setI] = useState(0)
  const versos = manifesto.verses
  const portal = usePortal(sonido)
  const frase = useFraseDelDia()

  /* La sexta pantalla existe solo cuando el banco de frases ya cargó. Mientras
     tanto —unos milisegundos— el método son cinco, exactamente como siempre. */
  const total = versos.length + (frase ? 1 : 0)
  const esCita = frase !== null && i === versos.length
  const verse = versos[i]

  /* El portal se dispara acá dentro, en el mismo clic que cambia el verso, y no
     desde un efecto: colgando del gesto del visitante ningún navegador lo
     bloquea por política de reproducción automática. */
  const mover = (paso: number) => {
    portal()
    setI((v) => (v + paso + total) % total)
  }
  const irALaFrase = () => {
    portal()
    setI(versos.length)
  }

  const textoLector =
    esCita && frase
      ? `Frase de hoy: ${frase.cita.es} ${frase.autor.nombre}, ${frase.cita.libroEs ?? frase.cita.libro}.`
      : `Verso ${i + 1} de ${total}: ${verse.line.replace(/\*/g, '').replace(/\n/g, ' ')}. ${verse.note}`

  return (
    <section className="scene mani" aria-labelledby="mani-title">
      {/* La composición vive detrás del verso: sostiene el clima sin robarle
          protagonismo a la tipografía, que es lo que manda en esta escena. */}
      <Emblema indice={i} />

      <p className="eyebrow rise" data-d="1" id="mani-title">
        {esCita && frase ? rotuloDeHoy(frase.fecha) : manifesto.eyebrow}
      </p>

      {esCita && frase ? (
        <CitaDelDia frase={frase} />
      ) : (
        <>
          <h2 className="mani-verse" key={i} style={{ marginTop: 'clamp(18px, 3vh, 36px)' }}>
            {render(verse.line)}
          </h2>

          <p className="mani-note">{verse.note}</p>
        </>
      )}

      <div className="mani-controls">
        <MagneticButton
          className="btn icon"
          onClick={() => mover(-1)}
          aria-label="Pantalla anterior"
        >
          ←
        </MagneticButton>

        <span className="mani-roman" aria-hidden="true">
          {ROMAN[i]} / {ROMAN[total - 1]}
        </span>

        <MagneticButton
          className="btn icon"
          onClick={() => mover(1)}
          aria-label="Pantalla siguiente"
        >
          →
        </MagneticButton>
      </div>

      {/* La cápsula: la frase de hoy no se esconde al final de un recorrido de
          seis pantallas. Con el nombre y la cara del autor a la vista, quien la
          ve sabe de qué se trata sin tener que hacer clic para averiguarlo. */}
      {frase && !esCita && (
        <button
          className="mani-cita-chip"
          data-evento="ver_cita"
          onClick={irALaFrase}
          aria-label={`Ver la frase de hoy, de ${frase.autor.nombre}`}
        >
          <img src={frase.autor.foto.archivo} alt="" width={28} height={28} loading="lazy" decoding="async" draggable={false} />
          <span>
            La frase de hoy <b>{frase.autor.nombre}</b>
          </span>
        </button>
      )}

      <span className="sr-only" aria-live="polite">
        {textoLector}
      </span>
    </section>
  )
}
