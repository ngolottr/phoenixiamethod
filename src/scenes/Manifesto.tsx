import { useState, type ReactNode } from 'react'
import { MagneticButton } from '../components/MagneticButton'
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

export function Manifesto() {
  const [i, setI] = useState(0)
  const verse = manifesto.verses[i]
  const total = manifesto.verses.length

  return (
    <section className="scene mani" aria-labelledby="mani-title">
      <p className="eyebrow rise" data-d="1" id="mani-title">
        {manifesto.eyebrow}
      </p>

      <h2 className="mani-verse" key={i} style={{ marginTop: 'clamp(18px, 3vh, 36px)' }}>
        {render(verse.line)}
      </h2>

      <p className="mani-note">{verse.note}</p>

      <div className="mani-controls">
        <MagneticButton
          className="btn icon"
          onClick={() => setI((v) => (v - 1 + total) % total)}
          aria-label="Verso anterior"
        >
          ←
        </MagneticButton>

        <span className="mani-roman" aria-hidden="true">
          {ROMAN[i]} / {ROMAN[total - 1]}
        </span>

        <MagneticButton
          className="btn icon"
          onClick={() => setI((v) => (v + 1) % total)}
          aria-label="Verso siguiente"
        >
          →
        </MagneticButton>
      </div>

      <span className="sr-only" aria-live="polite">
        Verso {i + 1} de {total}: {verse.line.replace(/\*/g, '').replace(/\n/g, ' ')}. {verse.note}
      </span>
    </section>
  )
}
