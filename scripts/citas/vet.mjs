// Verificación final por ventanas: el principio, el medio y el final de la frase tienen que aparecer
// en el MISMO libro (mismo ejemplar) y en la misma página. Deja también el texto tal como está impreso.
import { readFileSync, writeFileSync } from 'node:fs'
import { norm } from './verificar-ol.mjs'

const UA = { 'User-Agent': 'PhoenixCitas/1.0 (contacto.nicolaspk@gmail.com)' }
const espera = (ms) => new Promise((r) => setTimeout(r, ms))

async function pagina(q, n) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(`https://openlibrary.org/search/inside.json?q=${encodeURIComponent(q)}&page=${n}`, { headers: UA })
    if (r.status === 429 || r.status >= 500) { await espera(2000 * (i + 1)); continue }
    return (await r.json()).hits
  }
  return { hits: [], total: 0 }
}

/** Tramos sin apóstrofos, en ventanas de hasta 11 palabras. */
function ventanas(en) {
  const palabras = norm(en).split(' ')
  const tramos = []
  let cur = []
  for (const w of palabras) {
    if (w.includes("'")) { if (cur.length) tramos.push(cur); cur = [] } else cur.push(w)
  }
  if (cur.length) tramos.push(cur)
  const out = []
  for (const t of tramos) {
    for (let i = 0; i < t.length; i += 9) {
      const v = t.slice(i, i + 11)
      if (v.length >= 4) out.push(v.join(' '))
      if (i + 11 >= t.length) break
    }
  }
  return out
}

async function coincidencias(q, apellido, reLibro, maxPag = 16, tope = 6) {
  const res = []
  let total = 0
  for (let n = 1; n <= maxPag; n++) {
    const h = await pagina(`"${q}"`, n)
    total = h.total ?? total
    if (!h.hits?.length) break
    for (const x of h.hits) {
      const cr = norm((x.fields?.meta_creator || []).join(' '))
      const ti = norm((x.fields?.meta_title || []).join(' '))
      if (!cr.includes(apellido) || !reLibro.test(ti)) continue
      res.push({
        ia: x._id.split('|')[0],
        titulo: (x.fields.meta_title || [''])[0],
        pag: x.fields?.page_num?.[0]?.[0] ?? -1,
        frag: (x.highlight?.text || []).join(' … ').replace(/\{\{\{|\}\}\}/g, '').replace(/\s+/g, ' '),
      })
      if (res.length >= tope) return res
    }
    if (n * 20 >= total) break
    await espera(200)
  }
  return res
}

export async function vetar(c) {
  const vs = ventanas(c.en)
  if (!vs.length) return { ...c, estado: 'SIN_VENTANAS' }
  const reLibro = new RegExp(c.clave, 'i')
  const porVentana = []
  for (const v of vs) {
    porVentana.push({ v, hits: await coincidencias(v, c.apellido.toLowerCase(), reLibro) })
    await espera(150)
  }
  // ejemplares (ia) que contienen TODAS las ventanas
  const sets = porVentana.map((p) => new Set(p.hits.map((h) => h.ia)))
  const comunes = [...sets[0]].filter((ia) => sets.every((s) => s.has(ia)))
  if (!comunes.length) {
    const hallo = porVentana.filter((p) => p.hits.length).length
    return { ...c, estado: hallo ? 'PARCIAL' : 'NO_ENCONTRADA', ventanas: vs.length, encontradas: hallo, ejemplo: porVentana.flatMap((p) => p.hits)[0]?.frag?.slice(0, 260) }
  }
  const ia = comunes[0]
  const paginas = porVentana.map((p) => p.hits.find((h) => h.ia === ia)?.pag)
  const cerca = Math.max(...paginas) - Math.min(...paginas) <= 1
  const titulo = porVentana[0].hits.find((h) => h.ia === ia).titulo
  const impreso = porVentana.map((p) => p.hits.find((h) => h.ia === ia).frag.slice(0, 240)).join('  ⟪…⟫  ')
  return { ...c, estado: cerca ? 'VERIFICADA' : 'DISTANTES', ventanas: vs.length, ia, titulo, paginas, impreso }
}

if (process.argv[1]?.endsWith('vet.mjs')) {
  const [, , entrada, salida] = process.argv
  const lista = JSON.parse(readFileSync(entrada, 'utf8'))
  const out = []
  for (const c of lista) {
    const r = await vetar(c)
    out.push(r)
    console.log(`\n${r.estado.padEnd(12)} ${c.id} ${c.autor} — ${c.en.slice(0, 70)}`)
    if (r.estado === 'VERIFICADA') console.log(`   [${r.ventanas} ventanas, páginas ${r.paginas.join('/')}] ${r.titulo.slice(0, 50)}\n   IMPRESO: ${r.impreso}`)
    else if (r.ejemplo) console.log(`   ${r.encontradas}/${r.ventanas} ventanas. Ejemplo: ${r.ejemplo}`)
    await espera(150)
  }
  writeFileSync(salida, JSON.stringify(out, null, 1))
  console.log('\nResumen:', JSON.stringify(out.reduce((a, r) => ((a[r.estado] = (a[r.estado] || 0) + 1), a), {})))
}
