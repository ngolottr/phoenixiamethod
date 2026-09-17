/* ============================================================================
   PANEL DE ESTADÍSTICAS — privado
   ----------------------------------------------------------------------------
   Se entra desde el sitio: Ajustes → Estadísticas (o /panel.html). Pide la
   contraseña, que vive en Vercel (ESTADISTICAS_CLAVE), y deja una sesión de 30
   días en este dispositivo.

   Qué se refresca y cada cuánto:
     - "En vivo" (quién está ahora, lo último que pasó): cada 20 segundos.
     - El periodo completo: al entrar, al cambiar de rango, con el botón, y cada
       5 minutos. Leer 90 días son cientos de lecturas a la base, y el plan
       gratis tiene cupo mensual: no se relee sin necesidad.
     - Con la pestaña escondida no se pide nada.

   Sin React, como la página de reserva: una sola pantalla que carga al tiro.
   ========================================================================== */

import '../styles/global.css'
import './panel.css'
import { estoyExcluido, excluirEsteDispositivo } from '../lib/analitica'

type Par = [string, number]
type Totales = {
  visitantes: number
  sesiones: number
  vistas: number
  escenasPorVisita: number
  duracionMedia: number
  rebote: number
  dias: number
  acciones: {
    llamadas: number
    whatsapp: number
    contactos: number
    reservas: number
    agenda: number
    correo: number
  }
}
type Periodo = {
  rango: { desde: string; hasta: string; dias: number }
  totales: Totales
  anterior: Totales
  serie: { fecha: string; visitantes: number; sesiones: number; vistas: number; horas?: Record<string, number> }[]
  horas: number[]
  escenas: Par[]
  fuentes: Par[]
  paises: Par[]
  ciudades: Par[]
  equipos: Par[]
  navegadores: Par[]
  sistemas: Par[]
  eventos: Par[]
}
type Reciente = { t: number; tipo: 'vista' | 'evento'; n: string; p: string; c: string; e: string; f: string }
type Vivo = {
  ahora: number
  hoy: { visitantes: number; vistas: number; sesiones: number }
  recientes: Reciente[]
  servidor: number
}

const PASE = 'st-pase'
const raiz = document.getElementById('panel')!

const estado = {
  pase: leerPase(),
  dias: 7,
  periodo: null as Periodo | null,
  vivo: null as Vivo | null,
  cargando: false,
  error: '',
  sinAlmacen: false,
  actualizado: 0,
}

function leerPase() {
  try {
    return localStorage.getItem(PASE) || ''
  } catch {
    return ''
  }
}
function guardarPase(p: string) {
  try {
    if (p) localStorage.setItem(PASE, p)
    else localStorage.removeItem(PASE)
  } catch {
    /* la sesión dura lo que dure la pestaña */
  }
  estado.pase = p
}

/* --- Textos ----------------------------------------------------------------- */

const esc = (t: unknown) =>
  String(t ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const num = (n: number) => new Intl.NumberFormat('es-CL').format(Math.round(n || 0))

const duracion = (seg: number) => {
  if (!seg) return '0 s'
  const m = Math.floor(seg / 60)
  const s = seg % 60
  return m ? `${m} min ${String(s).padStart(2, '0')} s` : `${s} s`
}

const ESCENAS: Record<string, string> = {
  inicio: 'Inicio',
  trabajo: 'Soluciones',
  contacto: 'Contacto',
  manifiesto: 'Método',
  'sobre-mi': 'Sobre mí',
  redes: 'Redes',
  galeria: 'Galería',
  destacados: 'Destacados',
  agendar: 'Página de reserva',
}

const CASOS: Record<string, string> = {
  '01': 'Operación 100K',
  '02': 'Agentes y automatización',
  '03': 'Neurona',
  '04': 'Sitios y sistemas a medida',
}

function nombreEvento(n: string) {
  const fijos: Record<string, string> = {
    llamar: 'Tocó "Llamar ahora"',
    whatsapp: 'Abrió WhatsApp',
    correo: 'Tocó el correo',
    copiar_email: 'Copió el correo',
    abrir_agenda: 'Abrió la agenda',
    contacto_enviado: 'Envió el formulario',
    reserva_hecha: 'Reservó una reunión',
    cta_trabajemos: 'Tocó "Trabajemos juntos"',
    ver_casos: 'Vio los casos reales',
  }
  if (fijos[n]) return fijos[n]
  if (n.startsWith('abrir_caso:')) return `Abrió el caso ${CASOS[n.slice(11)] || n.slice(11)}`
  if (n.startsWith('enlace:')) return `Salió a ${n.slice(7)}`
  return n
}

let regiones: Intl.DisplayNames | null = null
try {
  regiones = new Intl.DisplayNames(['es'], { type: 'region' })
} catch {
  regiones = null
}
const pais = (codigo: string) => {
  if (!codigo) return 'Desconocido'
  try {
    return regiones?.of(codigo) || codigo
  } catch {
    return codigo
  }
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const DIAS_SEM = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const fechaCorta = (iso: string) => {
  const [a, m, d] = iso.split('-').map(Number)
  const dia = new Date(Date.UTC(a, m - 1, d, 12))
  return `${DIAS_SEM[dia.getUTCDay()]} ${d} ${MESES[m - 1]}`
}

function haceCuanto(t: number) {
  const s = Math.max(0, Math.round((Date.now() - t) / 1000))
  if (s < 45) return 'recién'
  const m = Math.round(s / 60)
  if (m < 60) return `hace ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `hace ${h} h`
  return `hace ${Math.round(h / 24)} d`
}

/* --- Red -------------------------------------------------------------------- */

async function pedir<T>(ruta: string): Promise<T | null> {
  const r = await fetch(ruta, { headers: { Authorization: `Bearer ${estado.pase}` }, cache: 'no-store' })
  if (r.status === 401) {
    guardarPase('')
    estado.error = 'La sesión venció. Vuelve a entrar.'
    pintar()
    return null
  }
  const datos = await r.json().catch(() => ({ ok: false, error: 'Respuesta ilegible.' }))
  if (datos.sinAlmacen) {
    estado.sinAlmacen = true
    return null
  }
  if (!datos.ok) throw new Error(datos.error || 'No pude leer las estadísticas.')
  estado.sinAlmacen = false
  return datos as T
}

async function cargarPeriodo() {
  estado.cargando = true
  estado.error = ''
  pintar()
  try {
    const [p, v] = await Promise.all([
      pedir<Periodo>(`/api/estadisticas?vista=periodo&dias=${estado.dias}`),
      pedir<Vivo>('/api/estadisticas?vista=vivo'),
    ])
    if (p) estado.periodo = p
    if (v) estado.vivo = v
    estado.actualizado = Date.now()
  } catch (e) {
    estado.error = (e as Error).message
  }
  estado.cargando = false
  pintar()
}

async function cargarVivo() {
  if (!estado.pase || document.visibilityState !== 'visible') return
  try {
    const v = await pedir<Vivo>('/api/estadisticas?vista=vivo')
    if (v) {
      estado.vivo = v
      pintarVivo()
    }
  } catch {
    /* el próximo intento lo arregla */
  }
}

/* --- Piezas ----------------------------------------------------------------- */

function delta(actual: number, antes: number, alReves = false) {
  if (!antes && !actual) return '<span class="pn-delta">sin datos antes</span>'
  if (!antes) return '<span class="pn-delta pn-sube">nuevo</span>'
  const pct = Math.round(((actual - antes) / antes) * 100)
  if (pct === 0) return '<span class="pn-delta">= que antes</span>'
  const bueno = alReves ? pct < 0 : pct > 0
  return `<span class="pn-delta ${bueno ? 'pn-sube' : 'pn-baja'}">${pct > 0 ? '▲' : '▼'} ${Math.abs(pct)} %</span>`
}

function tarjeta(etiqueta: string, valor: string, extra: string, destacada = false) {
  return `<div class="pn-kpi${destacada ? ' is-destacada' : ''}">
    <p class="pn-kpi-l">${esc(etiqueta)}</p>
    <p class="pn-kpi-v">${valor}</p>
    <p class="pn-kpi-x">${extra}</p>
  </div>`
}

/**
 * Barras verticales, una sola serie. HTML en vez de SVG: se estira a cualquier
 * ancho sin deformar el texto. Cada barra lleva su dato para el cartel flotante.
 */
function barras(puntos: { etiqueta: string; valor: number; detalle: string }[], titulo: string) {
  const max = Math.max(1, ...puntos.map((p) => p.valor))
  const tope = Math.ceil(max / 4) * 4 || 4
  const guias = [tope, tope / 2, 0]
  const cadaCuanto = Math.ceil(puntos.length / 8)
  return `<div class="pn-grafico" role="img" aria-label="${esc(titulo)}">
    <div class="pn-ejey">${guias.map((g) => `<span>${num(g)}</span>`).join('')}</div>
    <div class="pn-area">
      ${guias.map((_, i) => `<i class="pn-guia" style="top:${(i / 2) * 100}%"></i>`).join('')}
      <div class="pn-barras">
        ${puntos
          .map(
            (p, i) => `<div class="pn-col" data-tip="${esc(p.detalle)}">
              <span class="pn-barra${p.valor ? '' : ' is-cero'}" style="height:${(p.valor / tope) * 100}%"></span>
              <span class="pn-x">${i % cadaCuanto === 0 ? esc(p.etiqueta) : ''}</span>
            </div>`,
          )
          .join('')}
      </div>
    </div>
  </div>
  <details class="pn-tabla-ver"><summary>Ver como tabla</summary>
    <table class="pn-tabla"><tbody>
      ${puntos.map((p) => `<tr><td>${esc(p.detalle.split(' · ')[0])}</td><td>${num(p.valor)}</td></tr>`).join('')}
    </tbody></table>
  </details>`
}

function lista(titulo: string, filas: Par[], nombrar: (k: string) => string = (k) => k, vacio = 'Todavía nada') {
  const total = filas.reduce((t, [, v]) => t + v, 0)
  const max = Math.max(1, ...filas.map(([, v]) => v))
  return `<section class="pn-caja">
    <h2 class="pn-h">${esc(titulo)}</h2>
    ${
      filas.length
        ? `<ol class="pn-lista">${filas
            .map(
              ([k, v]) => `<li>
                <span class="pn-lista-fondo" style="width:${(v / max) * 100}%"></span>
                <span class="pn-lista-n">${esc(nombrar(k))}</span>
                <span class="pn-lista-v">${num(v)}<em>${total ? Math.round((v / total) * 100) : 0} %</em></span>
              </li>`,
            )
            .join('')}</ol>`
        : `<p class="pn-vacio">${vacio}</p>`
    }
  </section>`
}

/* --- Pantallas -------------------------------------------------------------- */

function pantallaEntrar() {
  raiz.innerHTML = `<main class="pn-entrar">
    <p class="eyebrow">Phoenix IA Method · Privado</p>
    <h1 class="display h-md">Estadísticas<br><em>del sitio.</em></h1>
    <form class="pn-form" novalidate>
      <label for="pn-clave">Contraseña</label>
      <input id="pn-clave" name="clave" type="password" autocomplete="current-password" required autofocus />
      <label class="pn-check"><input type="checkbox" name="excluir" checked /> No contar mis propias visitas desde este dispositivo</label>
      <button class="pn-btn" type="submit">Entrar</button>
      <p class="pn-error" role="alert">${esc(estado.error)}</p>
    </form>
    <a class="pn-volver" href="./">← Volver al sitio</a>
  </main>`

  const form = raiz.querySelector('form')!
  form.addEventListener('submit', async (e) => {
    e.preventDefault()
    const boton = form.querySelector('button')!
    const datos = new FormData(form)
    boton.disabled = true
    boton.textContent = 'Entrando…'
    try {
      const r = await fetch('/api/estadisticas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: datos.get('clave') }),
      })
      const j = await r.json().catch(() => ({}))
      if (!j.ok) throw new Error(j.error || 'No pude entrar.')
      guardarPase(j.pase)
      excluirEsteDispositivo(datos.get('excluir') === 'on')
      estado.error = ''
      await cargarPeriodo()
    } catch (err) {
      estado.error = (err as Error).message
      pantallaEntrar()
    }
  })
}

function pantallaSinAlmacen() {
  return `<section class="pn-caja pn-aviso">
    <h2 class="pn-h">Falta conectar la base de datos</h2>
    <p>El panel ya funciona, pero todavía no hay dónde guardar las visitas. Se conecta una sola vez desde Vercel:
    <b>proyecto phoenixiamethod → Storage → Upstash for Redis (plan Free)</b>, conectado a este proyecto. Después se vuelve a publicar el sitio y los números empiezan a llegar solos.</p>
  </section>`
}

function pintar() {
  if (!estado.pase) return pantallaEntrar()

  const p = estado.periodo
  const rangos = [
    [1, 'Hoy'],
    [7, '7 días'],
    [30, '30 días'],
    [90, '90 días'],
  ] as const

  raiz.innerHTML = `<div class="pn">
    <header class="pn-cabeza">
      <div>
        <p class="eyebrow">Phoenix IA Method · Privado</p>
        <h1 class="display h-md">Estadísticas</h1>
      </div>
      <div class="pn-vivo" id="pn-vivo"></div>
    </header>

    <div class="pn-barra-controles">
      <div class="filters" role="group" aria-label="Rango de fechas">
        ${rangos
          .map(([d, t]) => `<button class="filter" data-dias="${d}" aria-pressed="${estado.dias === d}">${t}</button>`)
          .join('')}
      </div>
      <div class="pn-acciones">
        <span class="pn-actualizado" id="pn-actualizado"></span>
        <button class="filter" id="pn-refrescar">${estado.cargando ? 'Cargando…' : '↻ Actualizar'}</button>
        <label class="pn-check pn-check-chico"><input type="checkbox" id="pn-excluir" ${estoyExcluido() ? 'checked' : ''}/> No contarme aquí</label>
        <button class="filter" id="pn-salir">Salir</button>
      </div>
    </div>

    ${estado.error ? `<p class="pn-error" role="alert">${esc(estado.error)}</p>` : ''}
    ${estado.sinAlmacen ? pantallaSinAlmacen() : ''}
    ${p ? cuerpo(p) : estado.sinAlmacen ? '' : '<div class="pn-cargando" aria-busy="true"></div>'}

    <footer class="pn-pie">
      <a class="pn-volver" href="./">← Volver al sitio</a>
      <span>Sin cookies ni rastreadores externos. Los visitantes se cuentan con una huella anónima que cambia cada día.</span>
    </footer>
    <div class="pn-tip" id="pn-tip" hidden></div>
  </div>`

  raiz.querySelectorAll<HTMLButtonElement>('[data-dias]').forEach((b) =>
    b.addEventListener('click', () => {
      estado.dias = Number(b.dataset.dias)
      cargarPeriodo()
    }),
  )
  raiz.querySelector('#pn-refrescar')?.addEventListener('click', () => cargarPeriodo())
  raiz.querySelector('#pn-salir')?.addEventListener('click', () => {
    guardarPase('')
    estado.periodo = null
    estado.vivo = null
    pintar()
  })
  raiz.querySelector<HTMLInputElement>('#pn-excluir')?.addEventListener('change', (e) =>
    excluirEsteDispositivo((e.target as HTMLInputElement).checked),
  )
  activarCarteles()
  pintarVivo()
}

function cuerpo(p: Periodo) {
  const t = p.totales
  const a = p.anterior
  const conversiones = t.acciones.llamadas + t.acciones.contactos + t.acciones.reservas + t.acciones.whatsapp
  const conversionesAntes = a.acciones.llamadas + a.acciones.contactos + a.acciones.reservas + a.acciones.whatsapp
  const tasa = t.sesiones ? ((conversiones / t.sesiones) * 100).toFixed(1).replace('.', ',') : '0'
  const vsTexto = p.rango.dias === 1 ? 'vs. ayer' : `vs. ${p.rango.dias} días anteriores`

  const puntos =
    p.rango.dias === 1
      ? p.horas.map((v, h) => ({ etiqueta: `${h}h`, valor: v, detalle: `${h}:00 a ${h}:59 · ${num(v)} visitas` }))
      : p.serie.map((d) => ({
          etiqueta: fechaCorta(d.fecha).slice(4),
          valor: d.visitantes,
          detalle: `${fechaCorta(d.fecha)} · ${num(d.visitantes)} visitantes · ${num(d.vistas)} escenas vistas`,
        }))

  return `
    <section class="pn-kpis" aria-label="Resumen">
      ${tarjeta('Visitantes únicos', num(t.visitantes), `${delta(t.visitantes, a.visitantes)} <small>${vsTexto}</small>`, true)}
      ${tarjeta('Visitas', num(t.sesiones), delta(t.sesiones, a.sesiones))}
      ${tarjeta('Escenas vistas', num(t.vistas), `${t.escenasPorVisita.toString().replace('.', ',')} por visita`)}
      ${tarjeta('Tiempo medio', duracion(t.duracionMedia), delta(t.duracionMedia, a.duracionMedia))}
      ${tarjeta('Rebote', `${t.rebote} %`, `${delta(t.rebote, a.rebote, true)} <small>vieron 1 escena</small>`)}
    </section>

    <section class="pn-kpis pn-kpis-acciones" aria-label="Acciones que importan">
      ${tarjeta('Llamadas', num(t.acciones.llamadas), delta(t.acciones.llamadas, a.acciones.llamadas), true)}
      ${tarjeta('Formularios enviados', num(t.acciones.contactos), delta(t.acciones.contactos, a.acciones.contactos), true)}
      ${tarjeta('Reuniones reservadas', num(t.acciones.reservas), delta(t.acciones.reservas, a.acciones.reservas), true)}
      ${tarjeta('Abrieron la agenda', num(t.acciones.agenda), delta(t.acciones.agenda, a.acciones.agenda))}
      ${tarjeta('Conversión', `${tasa} %`, `${delta(conversiones, conversionesAntes)} <small>visitas que contactaron</small>`)}
    </section>

    <div class="pn-grilla-2">
      <section class="pn-caja pn-ancha">
        <h2 class="pn-h">${p.rango.dias === 1 ? 'Visitas por hora, hoy' : 'Visitantes únicos por día'}</h2>
        ${barras(puntos, p.rango.dias === 1 ? 'Visitas por hora de hoy' : 'Visitantes únicos por día')}
      </section>

      <section class="pn-caja">
        <h2 class="pn-h">Actividad en vivo</h2>
        <ol class="pn-feed" id="pn-feed"></ol>
      </section>
    </div>

    <div class="pn-grilla-3">
      ${lista('Escenas más vistas', p.escenas, (k) => ESCENAS[k] || k)}
      ${lista('De dónde llegan', p.fuentes, (k) => (k === 'directo' ? 'Directo / sin origen' : k))}
      ${lista('Acciones y clics', p.eventos, nombreEvento)}
      ${lista('Países', p.paises, pais)}
      ${lista('Ciudades', p.ciudades, (k) => {
        const [c, cod] = k.split(', ')
        return cod ? `${c} · ${pais(cod)}` : k
      })}
      ${lista('Equipos', p.equipos)}
      ${lista('Navegadores', p.navegadores)}
      ${lista('Sistemas', p.sistemas)}
      ${
        p.rango.dias === 1
          ? ''
          : `<section class="pn-caja"><h2 class="pn-h">¿A qué hora llegan?</h2>${barras(
              p.horas.map((v, h) => ({ etiqueta: `${h}h`, valor: v, detalle: `${h}:00 a ${h}:59 · ${num(v)} visitas` })),
              'Visitas según la hora del día',
            )}</section>`
      }
    </div>`
}

function pintarVivo() {
  const v = estado.vivo
  const caja = raiz.querySelector('#pn-vivo')
  if (caja) {
    caja.innerHTML = v
      ? `<span class="pn-punto${v.ahora ? ' is-on' : ''}" aria-hidden="true"></span>
         <span><b>${num(v.ahora)}</b> ${v.ahora === 1 ? 'persona' : 'personas'} en el sitio ahora</span>
         <span class="pn-vivo-hoy">Hoy: ${num(v.hoy.visitantes)} visitantes · ${num(v.hoy.vistas)} escenas</span>`
      : ''
  }

  const feed = raiz.querySelector('#pn-feed')
  if (feed && v) {
    feed.innerHTML = v.recientes.length
      ? v.recientes
          .slice(0, 40)
          .map((r) => {
            const que = r.tipo === 'vista' ? `Vio ${ESCENAS[r.n] || r.n}` : nombreEvento(r.n)
            const donde = r.c ? r.c.split(', ')[0] : r.p ? pais(r.p) : ''
            const meta = [donde, r.e, r.f ? `llegó desde ${r.f === 'directo' ? 'acceso directo' : r.f}` : '']
              .filter(Boolean)
              .join(' · ')
            return `<li class="${r.tipo === 'evento' ? 'is-accion' : ''}">
              <span class="pn-feed-t">${haceCuanto(r.t)}</span>
              <span class="pn-feed-q">${esc(que)}</span>
              <span class="pn-feed-m">${esc(meta)}</span>
            </li>`
          })
          .join('')
      : '<li class="pn-vacio">Todavía no pasa nada. Aparece acá apenas alguien entre.</li>'
  }

  const act = raiz.querySelector('#pn-actualizado')
  if (act && estado.actualizado) act.textContent = `Actualizado ${haceCuanto(estado.actualizado)}`
}

/** El cartel que sigue al puntero sobre las barras. */
function activarCarteles() {
  const tip = raiz.querySelector<HTMLElement>('#pn-tip')
  if (!tip) return
  raiz.querySelectorAll<HTMLElement>('.pn-col').forEach((col) => {
    const mostrar = (x: number, y: number) => {
      tip.textContent = col.dataset.tip || ''
      tip.hidden = false
      const ancho = tip.offsetWidth
      tip.style.left = `${Math.min(innerWidth - ancho - 8, Math.max(8, x - ancho / 2))}px`
      tip.style.top = `${y - 44}px`
      col.classList.add('is-hover')
    }
    col.addEventListener('pointermove', (e) => mostrar(e.clientX, e.clientY))
    col.addEventListener('pointerleave', () => {
      tip.hidden = true
      col.classList.remove('is-hover')
    })
  })
}

/* --- Arranque ---------------------------------------------------------------- */

if (estado.pase) cargarPeriodo()
else pantallaEntrar()

setInterval(cargarVivo, 20000)
setInterval(() => {
  if (estado.pase && document.visibilityState === 'visible') cargarPeriodo()
}, 5 * 60000)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') cargarVivo()
})
