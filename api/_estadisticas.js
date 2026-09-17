/* ============================================================================
   ESTADÍSTICAS PROPIAS DEL SITIO
   ----------------------------------------------------------------------------
   Las visitas se cuentan acá mismo, sin Google Analytics ni ningún rastreador
   de terceros: el sitio sigue sin hablar con dominios externos desde el
   navegador, y la promesa de "0 dominios externos" sigue siendo cierta.

   Qué se guarda y qué NO:
     - NO se guarda la IP ni ninguna cookie. Cada visitante se reconoce por una
       huella que cambia todos los días (IP + navegador + fecha, pasada por un
       hash con una clave secreta). Sirve para contar personas distintas en un
       día; no sirve para seguir a nadie de un día a otro.
     - SÍ se guardan contadores agregados por día: escenas vistas, de dónde
       llegan, país y ciudad (los pone Vercel), tipo de equipo, navegador,
       hora del día y acciones (llamar, formulario, reserva…).
     - Una lista corta con las últimas 150 acciones, para ver el sitio "en vivo".

   Dónde se guarda: Upstash Redis (gratis, conectado desde el panel de Vercel →
   Storage). Se habla con su API REST usando fetch, así que no suma ninguna
   dependencia. Vercel crea solas las variables:
     KV_REST_API_URL / KV_REST_API_TOKEN   (o UPSTASH_REDIS_REST_URL / _TOKEN)

   Sin esas variables:
     - en producción las visitas no se registran y el panel avisa que falta
       conectar la base;
     - en local (vercel dev) se usa una memoria de mentira, para poder probar
       el panel entero sin tocar datos reales.

   Otra variable, puesta a mano:
     ESTADISTICAS_CLAVE   la contraseña del panel. También firma las sesiones y
                          sala las huellas: cambiarla cierra todas las sesiones.
   ========================================================================== */

import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { ipDe } from './_seguridad.js'

export const ZONA = 'America/Santiago'
const DIA_MS = 86400000
/** Los contadores diarios se borran solos después de ~13 meses. */
const VIDA_SEG = 400 * 86400

/* --- Conexión -------------------------------------------------------------- */

function credenciales() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || ''
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || ''
  return url && token ? { url: url.replace(/\/$/, ''), token } : null
}

/** En Vercel (producción o vista previa) VERCEL vale "1"; en `vercel dev`, no. */
export const enVercel = () => process.env.VERCEL === '1'
const enProduccion = enVercel

/** ¿Hay dónde guardar? En local siempre sí (memoria de prueba). */
export function hayAlmacen() {
  return Boolean(credenciales()) || !enProduccion()
}

/** Ejecuta varios comandos de Redis de una vez. Devuelve sus resultados en orden. */
export async function redis(comandos) {
  if (!comandos.length) return []
  const cred = credenciales()
  if (!cred) {
    if (enProduccion()) throw new Error('sin almacén conectado')
    cargarMemoria()
    const salida = comandos.map((c) => memoria(c))
    guardarMemoria()
    return salida
  }
  const r = await fetch(`${cred.url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${cred.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(comandos.map((c) => c.map(String))),
  })
  if (!r.ok) throw new Error(`redis ${r.status}`)
  const datos = await r.json()
  return datos.map((d) => {
    if (d.error) throw new Error(`redis: ${d.error}`)
    return d.result
  })
}

/* --- Memoria de prueba (solo local) ---------------------------------------
   Imita los pocos comandos que se usan. Los conjuntos para "visitantes únicos"
   son Set de verdad en vez de HyperLogLog: en local da exacto y da lo mismo.
   Vive en un archivo temporal porque `vercel dev` corre cada función en su
   propio proceso: en memoria, lo que anota una no lo ve la otra. */
let mem = new Map()
const archivoMemoria = () => path.join(os.tmpdir(), 'phoenix-estadisticas-local.json')

function cargarMemoria() {
  try {
    const crudo = JSON.parse(fs.readFileSync(archivoMemoria(), 'utf8'))
    mem = new Map(
      Object.entries(crudo).map(([k, { t, v }]) => [
        k,
        t === 'set' ? new Set(v) : t === 'map' ? new Map(v) : v,
      ]),
    )
  } catch {
    mem = new Map()
  }
}

function guardarMemoria() {
  const plano = {}
  for (const [k, v] of mem) {
    plano[k] =
      v instanceof Set
        ? { t: 'set', v: [...v] }
        : v instanceof Map
          ? { t: 'map', v: [...v.entries()] }
          : { t: 'raw', v }
  }
  try {
    fs.writeFileSync(archivoMemoria(), JSON.stringify(plano))
  } catch {
    /* es solo para probar */
  }
}
function memoria([cmd, clave, ...args]) {
  const C = String(cmd).toUpperCase()
  const h = () => mem.get(clave) ?? (mem.set(clave, new Map()), mem.get(clave))
  const s = (k) => mem.get(k) ?? (mem.set(k, new Set()), mem.get(k))
  switch (C) {
    case 'HINCRBY': {
      const m = h()
      m.set(args[0], (m.get(args[0]) || 0) + Number(args[1]))
      return m.get(args[0])
    }
    case 'HGETALL': {
      const m = mem.get(clave)
      return m ? [...m.entries()].flatMap(([k, v]) => [k, String(v)]) : []
    }
    case 'PFADD': {
      const set = s(clave)
      const antes = set.size
      args.forEach((a) => set.add(a))
      return set.size > antes ? 1 : 0
    }
    case 'PFCOUNT': {
      const union = new Set()
      ;[clave, ...args].forEach((k) => (mem.get(k) || []).forEach((v) => union.add(v)))
      return union.size
    }
    case 'LPUSH': {
      const l = mem.get(clave) || []
      l.unshift(...args.reverse())
      mem.set(clave, l)
      return l.length
    }
    case 'LTRIM': {
      const l = mem.get(clave) || []
      mem.set(clave, l.slice(Number(args[0]), Number(args[1]) + 1))
      return 'OK'
    }
    case 'LRANGE': {
      const l = mem.get(clave) || []
      return l.slice(Number(args[0]), Number(args[1]) + 1)
    }
    case 'ZADD': {
      const z = mem.get(clave) || new Map()
      z.set(args[1], Number(args[0]))
      mem.set(clave, z)
      return 1
    }
    case 'ZREMRANGEBYSCORE': {
      const z = mem.get(clave) || new Map()
      for (const [m, p] of z) if (p >= Number(args[0]) && p <= Number(args[1])) z.delete(m)
      return 1
    }
    case 'ZCOUNT': {
      const z = mem.get(clave) || new Map()
      return [...z.values()].filter((p) => p >= Number(args[0]) && p <= Number(args[1])).length
    }
    case 'EXPIRE':
      return 1
    default:
      return null
  }
}

/* --- Fechas en hora de Chile ----------------------------------------------- */

const fmtDia = new Intl.DateTimeFormat('en-CA', {
  timeZone: ZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})
const fmtHora = new Intl.DateTimeFormat('en-GB', { timeZone: ZONA, hour: '2-digit', hour12: false })

/** "2026-09-16" en Santiago. */
export const diaDe = (t = Date.now()) => fmtDia.format(new Date(t))
/** 0-23 en Santiago. */
export const horaDe = (t = Date.now()) => Number(fmtHora.format(new Date(t))) % 24

/** Los últimos `n` días, del más antiguo al de hoy. */
export function ultimosDias(n, hasta = Date.now()) {
  const dias = []
  const vistos = new Set()
  // Se camina de a 20 horas para no saltarse un día con el cambio de horario.
  for (let t = hasta; dias.length < n; t -= 20 * 3600000) {
    const d = diaDe(t)
    if (!vistos.has(d)) {
      vistos.add(d)
      dias.unshift(d)
    }
  }
  return dias
}

/* --- Claves ---------------------------------------------------------------- */

export const K = {
  dia: (d) => `st:d:${d}`, // totales del día (vistas, sesiones, eventos…)
  unicos: (d) => `st:u:${d}`, // HyperLogLog de visitantes
  sesiones: (d) => `st:s:${d}`, // HyperLogLog de sesiones
  dim: (nombre, d) => `st:${nombre}:${d}`, // hash de una dimensión
  recientes: 'st:recientes',
  activos: 'st:activos',
}

export const DIMENSIONES = [
  'escena',
  'fuente',
  'pais',
  'ciudad',
  'equipo',
  'navegador',
  'sistema',
  'evento',
  'hora',
]

/* --- Clasificar al visitante ------------------------------------------------ */

export const RE_BOT =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python|axios|node-fetch|go-http|java\/|vercel-screenshot/i

export function equipoDe(ua) {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return 'Tablet'
  if (/mobi|iphone|ipod|android/i.test(ua)) return 'Celular'
  return 'Computador'
}

export function navegadorDe(ua) {
  if (/instagram/i.test(ua)) return 'App de Instagram'
  if (/musical_ly|bytedance|tiktok/i.test(ua)) return 'App de TikTok'
  if (/fban|fbav/i.test(ua)) return 'App de Facebook'
  if (/edg\//i.test(ua)) return 'Edge'
  if (/opr\/|opera/i.test(ua)) return 'Opera'
  if (/samsungbrowser/i.test(ua)) return 'Samsung Internet'
  if (/firefox|fxios/i.test(ua)) return 'Firefox'
  if (/chrome|crios/i.test(ua)) return 'Chrome'
  if (/safari/i.test(ua)) return 'Safari'
  return 'Otro'
}

export function sistemaDe(ua) {
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS'
  if (/android/i.test(ua)) return 'Android'
  if (/windows/i.test(ua)) return 'Windows'
  if (/mac os/i.test(ua)) return 'macOS'
  if (/cros/i.test(ua)) return 'ChromeOS'
  if (/linux/i.test(ua)) return 'Linux'
  return 'Otro'
}

/** Nombre legible de la fuente, a partir del host que trajo al visitante. */
export function fuenteDe(host, utm) {
  const u = String(utm || '').toLowerCase().trim()
  if (u) return u.slice(0, 40)
  const h = String(host || '').toLowerCase().replace(/^www\./, '').replace(/^m\./, '').replace(/^l\./, '').replace(/^lm\./, '')
  if (!h) return 'directo'
  const conocidas = [
    [/instagram/, 'instagram'],
    [/tiktok/, 'tiktok'],
    [/youtube|youtu\.be/, 'youtube'],
    [/google\./, 'google'],
    [/bing\./, 'bing'],
    [/duckduckgo/, 'duckduckgo'],
    [/facebook|fb\.com|fb\.me/, 'facebook'],
    [/linkedin|lnkd\.in/, 'linkedin'],
    [/whatsapp|wa\.me/, 'whatsapp'],
    [/^t\.co$|twitter|x\.com/, 'x / twitter'],
    [/twitch/, 'twitch'],
    [/chatgpt|openai/, 'chatgpt'],
  ]
  for (const [re, nombre] of conocidas) if (re.test(h)) return nombre
  return h.slice(0, 60)
}

/* --- La huella del día ------------------------------------------------------ */

const clave = () => process.env.ESTADISTICAS_CLAVE || 'solo-local'

/** Identificador anónimo que cambia cada día. No se puede volver a la IP. */
export function huella(ip, ua, dia) {
  return crypto.createHmac('sha256', clave()).update(`${dia}|${ip}|${ua}`).digest('base64url').slice(0, 22)
}

/* --- Registrar -------------------------------------------------------------- */

/**
 * Suma un golpe a los contadores. `datos`:
 *   tipo      'vista' | 'evento' | 'salida'
 *   nombre    la escena o el nombre del evento
 *   visitante huella del día
 *   sesion    identificador de la pestaña (o '' si no aplica)
 *   nueva     primera vista de la sesión: ahí se cuentan fuente, país, equipo…
 *   fuente, pais, ciudad, equipo, navegador, sistema
 *   segundos, escenas  (solo en 'salida')
 */
export async function registrar(datos, ahora = Date.now()) {
  const d = diaDe(ahora)
  const cmds = []
  const hinc = (k, campo, n = 1) => cmds.push(['HINCRBY', k, campo, n])
  const vence = new Set()
  const tocar = (k) => vence.add(k)

  const kd = K.dia(d)
  tocar(kd)

  if (datos.visitante) {
    cmds.push(['PFADD', K.unicos(d), datos.visitante])
    tocar(K.unicos(d))
    cmds.push(['ZADD', K.activos, ahora, datos.visitante])
    cmds.push(['ZREMRANGEBYSCORE', K.activos, 0, ahora - 15 * 60000])
  }

  if (datos.tipo === 'vista') {
    hinc(kd, 'vistas')
    hinc(K.dim('escena', d), datos.nombre)
    tocar(K.dim('escena', d))
    if (datos.nueva) {
      if (datos.sesion) {
        cmds.push(['PFADD', K.sesiones(d), datos.sesion])
        tocar(K.sesiones(d))
      }
      hinc(kd, 'sesiones')
      hinc(K.dim('hora', d), String(horaDe(ahora)))
      for (const dim of ['fuente', 'pais', 'ciudad', 'equipo', 'navegador', 'sistema']) {
        if (!datos[dim]) continue
        hinc(K.dim(dim, d), datos[dim])
        tocar(K.dim(dim, d))
      }
      tocar(K.dim('hora', d))
    }
  } else if (datos.tipo === 'evento') {
    hinc(kd, 'eventos')
    hinc(K.dim('evento', d), datos.nombre)
    tocar(K.dim('evento', d))
  } else if (datos.tipo === 'salida') {
    hinc(kd, 'segundos', Math.max(0, Math.min(1800, Math.round(datos.segundos || 0))))
    if (datos.primera) {
      hinc(kd, 'salidas')
      if ((datos.escenas || 0) <= 1) hinc(kd, 'rebotes')
    }
  }

  if (datos.tipo === 'vista' || datos.tipo === 'evento') {
    const linea = JSON.stringify({
      t: ahora,
      tipo: datos.tipo,
      n: datos.nombre,
      p: datos.pais || '',
      c: datos.ciudad || '',
      e: datos.equipo || '',
      f: datos.nueva ? datos.fuente || '' : '',
    })
    cmds.push(['LPUSH', K.recientes, linea])
    cmds.push(['LTRIM', K.recientes, 0, 149])
  }

  for (const k of vence) cmds.push(['EXPIRE', k, VIDA_SEG])
  await redis(cmds)
}

/** El país y la ciudad los pone Vercel en cabeceras; la ciudad viene codificada. */
export function lugar(req) {
  const pais = String(req.headers['x-vercel-ip-country'] || '').toUpperCase().slice(0, 2)
  let ciudad = String(req.headers['x-vercel-ip-city'] || '')
  try {
    ciudad = decodeURIComponent(ciudad)
  } catch {
    /* se queda como vino */
  }
  ciudad = ciudad.replace(/[^\p{L}\p{N} .'-]/gu, '').slice(0, 50)
  return { pais: pais || '', ciudad: ciudad && pais ? `${ciudad}, ${pais}` : '' }
}

/**
 * Para las funciones del servidor que confirman algo importante (formulario
 * enviado, reunión reservada): lo cuentan ellas, que saben que de verdad pasó.
 * Nunca tumba la respuesta al visitante.
 */
export async function contarDesdeServidor(req, nombre) {
  try {
    if (!hayAlmacen()) return
    const ua = String(req.headers['user-agent'] || '')
    await registrar({
      tipo: 'evento',
      nombre,
      visitante: huella(ipDe(req), ua, diaDe()),
      ...lugar(req),
      equipo: equipoDe(ua),
    })
  } catch (e) {
    console.error(`[estadisticas] no se pudo contar ${nombre} →`, e.message)
  }
}

/* --- Leer -------------------------------------------------------------------- */

const aObjeto = (plano) => {
  const o = {}
  for (let i = 0; i < (plano || []).length; i += 2) o[plano[i]] = Number(plano[i + 1]) || 0
  return o
}

const sumar = (destino, origen) => {
  for (const [k, v] of Object.entries(origen)) destino[k] = (destino[k] || 0) + v
  return destino
}

const ranking = (o, max = 12) =>
  Object.entries(o)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)

function totalesDe(dias, sumaDia, unicos, sesionesHll) {
  const vistas = sumaDia.vistas || 0
  const sesiones = sesionesHll || sumaDia.sesiones || 0
  const salidas = sumaDia.salidas || 0
  return {
    visitantes: unicos,
    sesiones,
    vistas,
    escenasPorVisita: sesiones ? +(vistas / sesiones).toFixed(1) : 0,
    duracionMedia: salidas ? Math.round((sumaDia.segundos || 0) / salidas) : 0,
    rebote: salidas ? Math.round(((sumaDia.rebotes || 0) / salidas) * 100) : 0,
    dias: dias.length,
  }
}

/** Todo lo que el panel necesita para un rango de `n` días. */
export async function leerPeriodo(n) {
  const ahora = Date.now()
  const dias = ultimosDias(n, ahora)
  const previos = ultimosDias(n, ahora - n * DIA_MS)

  const cmds = []
  for (const d of dias) {
    cmds.push(['HGETALL', K.dia(d)])
    cmds.push(['PFCOUNT', K.unicos(d)])
    for (const dim of DIMENSIONES) cmds.push(['HGETALL', K.dim(dim, d)])
  }
  cmds.push(['PFCOUNT', ...dias.map(K.unicos)])
  cmds.push(['PFCOUNT', ...dias.map(K.sesiones)])
  for (const d of previos) {
    cmds.push(['HGETALL', K.dia(d)])
    cmds.push(['HGETALL', K.dim('evento', d)])
  }
  cmds.push(['PFCOUNT', ...previos.map(K.unicos)])
  cmds.push(['PFCOUNT', ...previos.map(K.sesiones)])

  const r = await redis(cmds)
  let i = 0

  const serie = []
  const sumaDia = {}
  const dims = Object.fromEntries(DIMENSIONES.map((x) => [x, {}]))
  for (const d of dias) {
    const tot = aObjeto(r[i++])
    const unicosDia = Number(r[i++]) || 0
    sumar(sumaDia, tot)
    const porDim = {}
    for (const dim of DIMENSIONES) {
      porDim[dim] = aObjeto(r[i++])
      sumar(dims[dim], porDim[dim])
    }
    serie.push({
      fecha: d,
      visitantes: unicosDia,
      sesiones: tot.sesiones || 0,
      vistas: tot.vistas || 0,
      horas: n === 1 ? porDim.hora : undefined,
    })
  }
  const unicos = Number(r[i++]) || 0
  const sesionesHll = Number(r[i++]) || 0

  const sumaPrev = {}
  const eventosPrev = {}
  for (let j = 0; j < previos.length; j++) {
    sumar(sumaPrev, aObjeto(r[i++]))
    sumar(eventosPrev, aObjeto(r[i++]))
  }
  const unicosPrev = Number(r[i++]) || 0
  const sesionesPrev = Number(r[i++]) || 0

  const horas = Array.from({ length: 24 }, (_, h) => dims.hora[String(h)] || 0)

  return {
    rango: { desde: dias[0], hasta: dias[dias.length - 1], dias: n },
    totales: { ...totalesDe(dias, sumaDia, unicos, sesionesHll), acciones: accionesDe(dims.evento) },
    anterior: { ...totalesDe(previos, sumaPrev, unicosPrev, sesionesPrev), acciones: accionesDe(eventosPrev) },
    serie,
    horas,
    escenas: ranking(dims.escena, 20),
    fuentes: ranking(dims.fuente),
    paises: ranking(dims.pais),
    ciudades: ranking(dims.ciudad),
    equipos: ranking(dims.equipo),
    navegadores: ranking(dims.navegador),
    sistemas: ranking(dims.sistema),
    eventos: ranking(dims.evento, 30),
  }
}

/** Las acciones que valen plata, sumadas aparte para las tarjetas de arriba. */
function accionesDe(ev) {
  const suma = (pred) => Object.entries(ev).reduce((t, [k, v]) => (pred(k) ? t + v : t), 0)
  return {
    llamadas: suma((k) => k === 'llamar'),
    whatsapp: suma((k) => k === 'whatsapp'),
    contactos: suma((k) => k === 'contacto_enviado'),
    reservas: suma((k) => k === 'reserva_hecha'),
    agenda: suma((k) => k === 'abrir_agenda'),
    correo: suma((k) => k === 'correo' || k === 'copiar_email'),
  }
}

/** Lo liviano: quién está ahora y qué pasó recién. Para refrescar seguido. */
export async function leerEnVivo() {
  const ahora = Date.now()
  const d = diaDe(ahora)
  const [activos, recientes, hoy, unicosHoy] = await redis([
    ['ZCOUNT', K.activos, ahora - 5 * 60000, ahora],
    ['LRANGE', K.recientes, 0, 59],
    ['HGETALL', K.dia(d)],
    ['PFCOUNT', K.unicos(d)],
  ])
  const tot = aObjeto(hoy)
  return {
    ahora: Number(activos) || 0,
    hoy: { visitantes: Number(unicosHoy) || 0, vistas: tot.vistas || 0, sesiones: tot.sesiones || 0 },
    recientes: (recientes || [])
      .map((l) => {
        try {
          return JSON.parse(l)
        } catch {
          return null
        }
      })
      .filter(Boolean),
    servidor: ahora,
  }
}

/* --- Sesión del panel ------------------------------------------------------- */

const firmar = (texto) =>
  crypto.createHmac('sha256', `panel|${clave()}`).update(texto).digest('base64url')

/** Un pase para el panel, válido `dias` días. */
export function emitirPase(dias = 30) {
  const vence = String(Date.now() + dias * DIA_MS)
  return `${vence}.${firmar(vence)}`
}

export function paseValido(pase) {
  const [vence, firma] = String(pase || '').split('.')
  if (!vence || !firma || !/^\d+$/.test(vence)) return false
  if (Number(vence) < Date.now()) return false
  const esperada = Buffer.from(firmar(vence))
  const recibida = Buffer.from(firma)
  return esperada.length === recibida.length && crypto.timingSafeEqual(esperada, recibida)
}

/** Compara la contraseña sin filtrar por tiempo cuántos caracteres acertó. */
export function claveCorrecta(intento) {
  // trim: al cargar la variable desde una terminal se cuela el salto de línea
  const real = String(process.env.ESTADISTICAS_CLAVE || '').trim()
  if (!real) return !enProduccion() && String(intento) === 'local'
  const a = crypto.createHash('sha256').update(String(intento).trim()).digest()
  const b = crypto.createHash('sha256').update(real).digest()
  return crypto.timingSafeEqual(a, b)
}
