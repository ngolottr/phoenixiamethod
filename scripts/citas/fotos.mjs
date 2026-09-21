// Resuelve y descarga la foto de cada autor (Wikimedia Commons, licencia libre) y guarda sus créditos.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'

const UA = { 'User-Agent': 'PhoenixCitas/1.0 (contacto.nicolaspk@gmail.com)' }
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
const limpia = (h) => String(h || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim()
const LIBRES = /^(public domain|pd[- ]|cc0|cc[- ]by(?![- ]?(nc|nd))|cc[- ]by-sa)/i
const DIR = new URL('./fotos/', import.meta.url)
if (!existsSync(DIR)) mkdirSync(DIR)

async function json(url) {
  for (let i = 0; i < 4; i++) {
    const r = await fetch(url, { headers: UA })
    if (r.status === 429) { await espera(2500 * (i + 1)); continue }
    return r.json()
  }
  throw new Error('429 ' + url)
}
async function info(nombre) {
  const c = await json('https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=extmetadata|url|size&iiurlwidth=420&format=json&titles=' + encodeURIComponent('File:' + nombre.replace(/^File:/, '')))
  const i = Object.values(c.query.pages)[0].imageinfo?.[0]
  if (!i) return null
  const m = i.extmetadata || {}
  return {
    archivo: nombre.replace(/^File:/, '').replace(/ /g, '_'),
    licencia: limpia(m.LicenseShortName?.value),
    autorFoto: limpia(m.Artist?.value),
    restricciones: limpia(m.Restrictions?.value),
    pagina: i.descriptionurl, miniatura: i.thumburl, ancho: i.width, alto: i.height,
  }
}

// slug → { wp, archivo? }  (archivo = foto concreta de Commons cuando la principal no sirve)
const A = {
  'peter-drucker': { wp: 'Peter Drucker' }, 'eric-ries': { wp: 'Eric Ries' }, 'peter-thiel': { wp: 'Peter Thiel' },
  'ben-horowitz': { wp: 'Ben Horowitz' }, 'simon-sinek': { wp: 'Simon Sinek' }, 'clayton-christensen': { wp: 'Clayton Christensen' },
  'andy-grove': { wp: 'Andrew Grove' }, 'daniel-pink': { wp: 'Daniel H. Pink' }, 'steven-pressfield': { wp: 'Steven Pressfield' },
  'fred-brooks': { wp: 'Fred Brooks' }, 'ray-dalio': { wp: 'Ray Dalio' }, 'seth-godin': { wp: 'Seth Godin' },
  'yvon-chouinard': { wp: 'Yvon Chouinard' }, 'ed-catmull': { wp: 'Ed Catmull' }, 'steven-johnson': { wp: 'Steven Johnson (author)' },
  'malcolm-gladwell': { wp: 'Malcolm Gladwell', archivo: 'Malcolm Gladwell, 2008 (cropped) 02.jpg' },
  'robert-pirsig': { wp: 'Robert M. Pirsig' }, 'jim-collins': { wp: 'Jim Collins (author)', archivo: 'Jim Collins.jpg' },
  'stephen-covey': { wp: 'Stephen Covey' }, 'dale-carnegie': { wp: 'Dale Carnegie' }, 'napoleon-hill': { wp: 'Napoleon Hill' },
  'james-clear': { wp: 'James Clear' }, 'viktor-frankl': { wp: 'Viktor Frankl' }, 'carol-dweck': { wp: 'Carol Dweck' },
  'angela-duckworth': { wp: 'Angela Duckworth' }, 'mihaly-csikszentmihalyi': { wp: 'Mihaly Csikszentmihalyi' },
  'daniel-kahneman': { wp: 'Daniel Kahneman' }, 'nassim-taleb': { wp: 'Nassim Nicholas Taleb', archivo: 'Nassim Nicholas Taleb 2013.jpg' },
  'shunryu-suzuki': { wp: 'Shunryu Suzuki' }, 'saint-exupery': { wp: 'Antoine de Saint-Exupéry' },
  'marco-aurelio': { wp: 'Marcus Aurelius' }, 'seneca': { wp: 'Seneca the Younger' }, 'epicteto': { wp: 'Epictetus' },
  'maquiavelo': { wp: 'Niccolò Machiavelli' }, 'sun-tzu': { wp: 'Sun Tzu' }, 'benjamin-franklin': { wp: 'Benjamin Franklin' },
  'ralph-waldo-emerson': { wp: 'Ralph Waldo Emerson' }, 'henry-david-thoreau': { wp: 'Henry David Thoreau' },
  'james-allen': { wp: 'James Allen (author)' }, 'adam-smith': { wp: 'Adam Smith' }, 'samuel-butler': { wp: 'Samuel Butler (novelist)' },
  'frederick-taylor': { wp: 'Frederick Winslow Taylor' },
  'nick-bostrom': { wp: 'Nick Bostrom' }, 'pedro-domingos': { wp: 'Pedro Domingos' }, 'erik-brynjolfsson': { wp: 'Erik Brynjolfsson' },
  'cathy-oneil': { wp: "Cathy O'Neil" }, 'sherry-turkle': { wp: 'Sherry Turkle' }, 'herbert-simon': { wp: 'Herbert A. Simon' },
  'joseph-weizenbaum': { wp: 'Joseph Weizenbaum' }, 'norbert-wiener': { wp: 'Norbert Wiener' }, 'marshall-mcluhan': { wp: 'Marshall McLuhan' },
  'arthur-c-clarke': { wp: 'Arthur C. Clarke' }, 'carl-sagan': { wp: 'Carl Sagan' }, 'douglas-hofstadter': { wp: 'Douglas Hofstadter' },
  'tim-berners-lee': { wp: 'Tim Berners-Lee' }, 'eric-raymond': { wp: 'Eric S. Raymond' }, 'nicholas-negroponte': { wp: 'Nicholas Negroponte' },
  'jaron-lanier': { wp: 'Jaron Lanier' }, 'richard-feynman': { wp: 'Richard Feynman', archivo: 'Richard Feynman 1959.png' },
  'stewart-brand': { wp: 'Stewart Brand' },
}

const salida = {}
for (const [slug, a] of Object.entries(A)) {
  let f = null
  try {
    if (a.archivo) f = await info(a.archivo)
    else {
      const p = await json('https://en.wikipedia.org/w/api.php?action=query&redirects=1&prop=pageimages&piprop=original|name&format=json&titles=' + encodeURIComponent(a.wp))
      const pag = Object.values(p.query.pages)[0]
      if (pag.pageimage && /\/wikipedia\/commons\//.test(pag.original?.source || '')) f = await info(pag.pageimage)
      else salida[slug] = { motivo: 'sin foto principal en Commons' }
    }
    if (f) {
      const libre = LIBRES.test(f.licencia || '') && !/personality/i.test(f.restricciones || '')
      if (!libre) { salida[slug] = { ...f, motivo: 'licencia/restricción: ' + f.licencia + ' ' + f.restricciones }; continue }
      const ext = /\.png$/i.test(f.archivo) ? 'png' : 'jpg'
      const r = await fetch(f.miniatura, { headers: UA })
      if (!r.ok) { salida[slug] = { ...f, motivo: 'descarga ' + r.status }; continue }
      writeFileSync(new URL(`./${slug}.${ext}`, DIR), Buffer.from(await r.arrayBuffer()))
      salida[slug] = { ...f, wp: a.wp, ext, ok: true }
    }
  } catch (e) { salida[slug] = { motivo: 'error ' + e.message } }
  await espera(350)
}
writeFileSync(new URL('./fotos-final.json', import.meta.url), JSON.stringify(salida, null, 1))
const ok = Object.entries(salida).filter(([, v]) => v.ok)
console.log(ok.length + ' fotos descargadas de ' + Object.keys(A).length)
for (const [k, v] of Object.entries(salida)) if (!v.ok) console.log('SIN FOTO', k, '|', v.motivo)
