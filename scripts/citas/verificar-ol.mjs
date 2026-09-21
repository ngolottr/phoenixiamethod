// Verifica cada cita contra el TEXTO COMPLETO de libros reales (Open Library / Internet Archive).
// Una cita queda VERIFICADA solo si aparece, palabra por palabra, dentro de un libro cuyo
// autor (meta_creator) es la persona a quien se le atribuye y cuyo título es el que declaramos.
import { readFileSync, writeFileSync } from 'node:fs'

const UA = { 'User-Agent': 'PhoenixCitas/1.0 (contacto.nicolaspk@gmail.com)' }
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

export const norm = (s) =>
  String(s || '')
    .replace(/\{\{\{|\}\}\}/g, '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, ' ')
    .toLowerCase()
    .replace(/[^a-z0-9'à-ÿ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** El tramo más largo sin apóstrofos (el índice trata distinto ' y ’), para la búsqueda. */
function segmentoDeBusqueda(en) {
  const palabras = norm(en).split(' ')
  let mejor = [], actual = []
  for (const p of palabras) {
    if (p.includes("'")) { if (actual.length > mejor.length) mejor = actual; actual = []; continue }
    actual.push(p)
  }
  if (actual.length > mejor.length) mejor = actual
  return mejor.slice(0, 14).join(' ') // 14 palabras alcanzan para identificarla
}

async function pagina(q, n) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`https://openlibrary.org/search/inside.json?q=${encodeURIComponent(q)}&page=${n}`, { headers: UA })
    if (r.status === 429 || r.status >= 500) { await espera(2000 * (i + 1)); continue }
    return (await r.json()).hits
  }
  return { hits: [], total: 0 }
}

export async function verificar(c, maxPaginas = 14) {
  const seg = segmentoDeBusqueda(c.en)
  if (seg.split(' ').length < 4) return { ...c, estado: 'CORTA', motivo: 'sin tramo buscable' }
  const q = `"${seg}"`
  const apellido = c.apellido.toLowerCase()
  const reLibro = new RegExp(c.clave, 'i')
  const objetivo = norm(c.en)
  const vistos = []
  let total = 0
  for (let n = 1; n <= maxPaginas; n++) {
    const h = await pagina(q, n)
    total = h.total ?? total
    if (!h.hits?.length) break
    for (const x of h.hits) {
      const creador = norm((x.fields?.meta_creator || []).join(' '))
      const titulo = norm((x.fields?.meta_title || []).join(' '))
      if (!creador.includes(apellido) || !reLibro.test(titulo)) continue
      const frags = (x.highlight?.text || []).map(norm)
      const completo = frags.some((f) => f.includes(objetivo))
      vistos.push({
        ia: x._id.split('|')[0],
        titulo: (x.fields.meta_title || [''])[0],
        creador: (x.fields.meta_creator || [''])[0],
        pagina: x.fields?.page_num?.[0]?.[0],
        completo,
        fragmento: (x.highlight?.text || []).join(' … ').replace(/\s+/g, ' ').slice(0, 320),
      })
      if (completo) return { ...c, estado: 'VERIFICADA', total, ...vistos[vistos.length - 1] }
    }
    if ((n * 20) >= total) break
    await espera(220)
  }
  if (vistos.length) return { ...c, estado: 'PARCIAL', total, ...vistos[0] }
  return { ...c, estado: 'NO_ENCONTRADA', total }
}

// --- Uso como programa: node verificar-ol.mjs candidatas.json salida.json
if (process.argv[1] && process.argv[1].endsWith('verificar-ol.mjs')) {
  const [, , entrada, salida] = process.argv
  const lista = JSON.parse(readFileSync(entrada, 'utf8'))
  const out = []
  for (const c of lista) {
    const r = await verificar(c)
    out.push(r)
    console.log(r.estado.padEnd(13), (c.autor + ' — ' + c.libro).slice(0, 44).padEnd(45), c.en.slice(0, 70), r.estado === 'PARCIAL' ? '\n      ↳ ' + r.fragmento.slice(0, 200) : '')
    await espera(200)
  }
  writeFileSync(salida, JSON.stringify(out, null, 1))
  const cuenta = out.reduce((a, r) => ((a[r.estado] = (a[r.estado] || 0) + 1), a), {})
  console.log('\nResumen:', JSON.stringify(cuenta))
}
