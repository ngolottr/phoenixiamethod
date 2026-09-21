/* ============================================================================
   REVISAR EL BANCO DE FRASES
   ----------------------------------------------------------------------------
   Corre solo antes de cada build (npm run build) y a mano con `npm run citas`.
   Existe para que un error en la lista de frases no llegue a producción:

     · Una frase repetida es justo lo que la sección promete que no pasa.
     · Una foto que falta deja un círculo roto en la pantalla que se vende como
       la de credibilidad.
     · Una foto sin crédito incumple su licencia (Creative Commons exige nombrar
       a quien la hizo).
     · Una frase de un párrafo entero deja de ser una cita.

   Y la comprobación más importante, que es la del ORDEN. La frase de cada día
   sale de una cuenta sobre la lista (ver src/lib/citaDelDia.ts). Si alguien
   inserta una frase en el medio, o reordena, o borra una ya publicada, todas
   las siguientes se corren un lugar y esa noche sale una que ya había salido.
   Para atajarlo, `scripts/citas-orden.json` guarda las frases ya publicadas en
   su orden; la lista actual tiene que EMPEZAR exactamente igual. Agregar al
   final es libre. Cambiar lo publicado, no.

   Se agrega una frase nueva así:
     1. Se escribe AL FINAL de `citas` en src/data/citas.ts.
     2. Su autor va en `autores` (con foto en public/images/autores/ y crédito).
     3. `npm run citas -- --fijar` para registrar el nuevo orden.
   ========================================================================== */

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const { citas, autores, LANZAMIENTO } = await import(pathToFileURL(join(raiz, 'src/data/citas.ts')).href)
const { fechaEnChile, fraseDelDia, diasEntre } = await import(pathToFileURL(join(raiz, 'src/lib/citaDelDia.ts')).href)

const errores = []
const avisos = []
const error = (t) => errores.push(t)
const aviso = (t) => avisos.push(t)

const MAX_CARACTERES = 260
const norm = (s) => String(s).toLowerCase().replace(/[^\p{L}\p{N} ]+/gu, ' ').replace(/\s+/g, ' ').trim()

/* --- Cada frase ---------------------------------------------------------- */
const ids = new Set()
const originales = new Map()
const traducciones = new Map()
for (const c of citas) {
  const donde = `«${c.id}»`
  for (const campo of ['id', 'es', 'original', 'idioma', 'autor', 'libro', 'anio', 'tema']) {
    if (c[campo] === undefined || c[campo] === '') error(`${donde}: falta el campo "${campo}"`)
  }
  if (ids.has(c.id)) error(`${donde}: identificador repetido`)
  ids.add(c.id)

  const o = norm(c.original)
  if (originales.has(o)) error(`${donde}: mismo texto original que «${originales.get(o)}» — sería una frase repetida`)
  originales.set(o, c.id)
  const t = norm(c.es)
  if (traducciones.has(t)) error(`${donde}: misma traducción que «${traducciones.get(t)}»`)
  traducciones.set(t, c.id)

  if (!autores[c.autor]) error(`${donde}: el autor "${c.autor}" no está en \`autores\``)
  if (c.resaltar && !c.es.toLowerCase().includes(c.resaltar.toLowerCase())) {
    error(`${donde}: la palabra a resaltar «${c.resaltar}» no aparece en la frase`)
  }
  if (c.original.length > MAX_CARACTERES) aviso(`${donde}: el original tiene ${c.original.length} caracteres; una cita es una frase, no un párrafo`)
  if (!['negocios', 'autoayuda', 'ia'].includes(c.tema)) error(`${donde}: tema desconocido "${c.tema}"`)
}

/* --- Cada autor ---------------------------------------------------------- */
const usados = new Set(citas.map((c) => c.autor))
for (const [slug, a] of Object.entries(autores)) {
  if (!usados.has(slug)) aviso(`autor "${slug}" no tiene ninguna frase (la foto pesa sin usarse)`)
  const f = a.foto
  if (!existsSync(join(raiz, 'public', f.archivo))) error(`autor "${slug}": no existe el archivo public/${f.archivo}`)
  if (!f.licencia) error(`autor "${slug}": la foto no declara su licencia`)
  if (!/^https:\/\/commons\.wikimedia\.org\//.test(f.enlace)) error(`autor "${slug}": el enlace de la foto no apunta a Wikimedia Commons`)
  // Sin autor conocido solo vale el dominio público: una licencia Creative Commons exige nombrar a quien hizo la foto.
  if (!f.credito && !/^public domain$/i.test(f.licencia)) error(`autor "${slug}": la licencia ${f.licencia} exige el nombre de quien hizo la foto`)
}

/* --- El orden de lo ya publicado ---------------------------------------- */
const rutaOrden = join(raiz, 'scripts/citas-orden.json')
const actuales = citas.map((c) => c.id)
if (process.argv.includes('--fijar')) {
  if (errores.length) {
    console.error('No se fija el orden mientras haya errores:\n' + errores.map((e) => '  ✖ ' + e).join('\n'))
    process.exit(1)
  }
  writeFileSync(rutaOrden, JSON.stringify(actuales, null, 1) + '\n')
  console.log(`Orden fijado: ${actuales.length} frases.`)
}
if (existsSync(rutaOrden)) {
  const publicadas = JSON.parse(readFileSync(rutaOrden, 'utf8'))
  // Se informa solo dónde EMPIEZA el desorden: una frase movida corre todas las siguientes
  // y avisar de cada una serían cien líneas que dicen lo mismo.
  const primero = publicadas.findIndex((id, i) => actuales[i] !== id)
  if (primero >= 0) {
    const id = publicadas[primero]
    const dia = primero + 1
    const afectadas = publicadas.length - primero
    error(
      actuales.includes(id)
        ? `el orden de lo ya publicado cambió a partir del lugar ${dia}: debería estar «${id}» y está «${actuales[primero] ?? 'nada'}». Se corren ${afectadas} frases y saldría una repetida. Vuelve a dejar las frases publicadas en su orden y agrega las nuevas al final.`
        : `se borró la frase ya publicada «${id}» (lugar ${dia}). Se corren ${afectadas} frases un día y saldría una repetida.`,
    )
  }
  if (actuales.length > publicadas.length) aviso(`${actuales.length - publicadas.length} frase(s) nueva(s) sin registrar. Corre \`npm run citas -- --fijar\` cuando las publiques.`)
} else {
  aviso('no existe scripts/citas-orden.json: nada protege el orden de las frases ya publicadas. Corre `npm run citas -- --fijar`.')
}

/* --- Cuánto queda -------------------------------------------------------- */
const hoy = fechaEnChile()
const { numero, restantes, vuelta, cita } = fraseDelDia({ citas, LANZAMIENTO }, hoy)
const total = citas.length
const ultimoDia = new Date(Date.UTC(...LANZAMIENTO.split('-').map(Number).map((n, i) => (i === 1 ? n - 1 : n)), 12))
ultimoDia.setUTCDate(ultimoDia.getUTCDate() + total - 1)
const ultimoISO = ultimoDia.toISOString().slice(0, 10)
const aFecha = (iso) => new Intl.DateTimeFormat('es-CL', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso + 'T12:00:00Z'))

if (vuelta > 1) {
  aviso(`EL BANCO SE ACABÓ: hoy es el día ${numero} de la serie y hay ${total} frases, así que ya se están repitiendo (vuelta ${vuelta}). El sitio dejó de decir que no se repiten. Agrega frases nuevas al final de citas.`)
} else if (restantes < 30) {
  aviso(`QUEDAN ${restantes} DÍAS de frases sin repetir (la última sale el ${aFecha(ultimoISO)}). Hay que agregar más pronto.`)
}

/* --- Informe ------------------------------------------------------------- */
const porTema = citas.reduce((a, c) => ((a[c.tema] = (a[c.tema] || 0) + 1), a), {})
console.log(`Frases: ${total} de ${usados.size} autores  ·  ${Object.entries(porTema).map(([k, v]) => `${k} ${v}`).join(' · ')}`)
console.log(`Serie: lanzada el ${aFecha(LANZAMIENTO)}, día ${numero} hoy (${aFecha(hoy)}). Hoy sale «${cita.id}».`)
console.log(`Sin repetir hasta el ${aFecha(ultimoISO)}${restantes > 0 ? ` (${restantes} días más)` : ''}.`)
void diasEntre
for (const a of avisos) console.log('  ⚠ ' + a)
if (errores.length) {
  console.error('\nErrores en el banco de frases:')
  for (const e of errores) console.error('  ✖ ' + e)
  process.exit(1)
}
console.log('Banco de frases: OK')
