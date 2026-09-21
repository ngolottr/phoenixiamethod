// Clásicos de dominio público: baja el libro completo de Project Gutenberg y busca frases con su ubicación.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const UA = { 'User-Agent': 'PhoenixCitas/1.0 (contacto.nicolaspk@gmail.com)' }
const DIR = new URL('./gutenberg/', import.meta.url)
if (!existsSync(DIR)) mkdirSync(DIR)

export async function libro(id) {
  const ruta = new URL(`./${id}.txt`, DIR)
  if (existsSync(ruta)) return readFileSync(ruta, 'utf8')
  for (const u of [
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/ebooks/${id}.txt.utf-8`,
  ]) {
    try {
      const r = await fetch(u, { headers: UA })
      if (r.ok) {
        let t = await r.text()
        const a = t.search(/\*\*\* ?START OF/i)
        const b = t.search(/\*\*\* ?END OF/i)
        if (a >= 0) t = t.slice(t.indexOf('\n', a) + 1, b > a ? b : undefined)
        writeFileSync(ruta, t)
        return t
      }
    } catch {}
  }
  throw new Error('no se pudo bajar ' + id)
}

const RE_TITULO = /^\s*(BOOK|CHAPTER|LETTER|SECTION|PART|ESSAY|THE FIRST|THE SECOND|I{1,3}V?X?I*\.?|[IVXL]+\.)\b.*$/

/** Párrafos con su ubicación (el último encabezado visto). */
export function parrafos(texto) {
  const bloques = texto.replace(/\r/g, '').split(/\n\s*\n/)
  let ubic = ''
  const out = []
  for (const b of bloques) {
    const linea = b.trim().split('\n')[0].trim()
    if (linea.length < 70 && (/^(BOOK|CHAPTER|LETTER|SECTION|PART|ESSAY|Chapter|Book|Letter)\b/.test(linea) || /^[IVXL]+\.?$/.test(linea) || (/^[A-Z][A-Z ,.'’:;-]{5,}$/.test(linea) && b.trim().split('\n').length <= 3))) {
      ubic = b.trim().replace(/\s+/g, ' ').slice(0, 80)
      continue
    }
    out.push({ ubic, texto: b.replace(/\s+/g, ' ').trim() })
  }
  return out
}

export const norm = (s) =>
  String(s || '')
    .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
    .toLowerCase().replace(/[^a-z0-9' ]+/g, ' ').replace(/\s+/g, ' ').trim()

/** Oraciones de un párrafo que cumplen la expresión. */
export function buscar(ps, re, max = 40) {
  const hits = []
  for (const p of ps) {
    const oraciones = p.texto.split(/(?<=[.!?;:]["'”’]?)\s+(?=[A-Z"“‘'])/)
    for (let i = 0; i < oraciones.length; i++) {
      if (re.test(oraciones[i])) {
        hits.push({ ubic: p.ubic, oracion: oraciones[i].trim(), contexto: (oraciones[i - 1] || '') + ' ' + oraciones[i] + ' ' + (oraciones[i + 1] || '') })
        if (hits.length >= max) return hits
      }
    }
  }
  return hits
}

/** ¿Está la frase, palabra por palabra? Devuelve dónde. */
export function verificar(ps, frase) {
  const n = norm(frase)
  for (const p of ps) if (norm(p.texto).includes(n)) return { ok: true, ubic: p.ubic, parrafo: p.texto }
  return { ok: false }
}

// --- Uso: node gutenberg.mjs <id> "<regex>" [max]
if (process.argv[1]?.endsWith('gutenberg.mjs') && process.argv[2]) {
  const t = await libro(process.argv[2])
  const ps = parrafos(t)
  const re = new RegExp(process.argv[3], 'i')
  for (const h of buscar(ps, re, Number(process.argv[4] || 12))) console.log(`[${h.ubic}]\n   ${h.oracion.slice(0, 420)}\n`)
}
