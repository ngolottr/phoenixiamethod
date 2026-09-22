/* ============================================================================
   CONTADOR DE VISITAS — el lado del navegador
   ----------------------------------------------------------------------------
   Manda a /api/evento (mismo dominio, sin terceros ni cookies):
     - cada escena que se ve,
     - las acciones que importan: llamar, WhatsApp, correo, abrir la agenda,
       salir a una red social, y cualquier botón marcado con data-evento="…",
     - al irse, cuánto tiempo estuvo y cuántas escenas vio.

   No cuenta:
     - en local (localhost), para no ensuciar los números mientras se trabaja;
     - en el dispositivo donde Nicolás entró al panel y marcó "no contarme".
   ========================================================================== */

const EXCLUIR = 'st-excluir'
const SESION = 'st-sesion'

function leer(storage: 'local' | 'session', clave: string) {
  try {
    return (storage === 'local' ? localStorage : sessionStorage).getItem(clave)
  } catch {
    return null
  }
}
function escribir(storage: 'local' | 'session', clave: string, valor: string | null) {
  try {
    const s = storage === 'local' ? localStorage : sessionStorage
    if (valor === null) s.removeItem(clave)
    else s.setItem(clave, valor)
  } catch {
    /* sin almacenamiento: se cuenta igual, solo que cada pestaña es sesión nueva */
  }
}

const esLocal = () => /^(localhost|127\.|192\.168\.|\[::1\])/.test(location.hostname)

/** ¿Este dispositivo es el de Nicolás? */
export const estoyExcluido = () => leer('local', EXCLUIR) === '1'
export const excluirEsteDispositivo = (si: boolean) => escribir('local', EXCLUIR, si ? '1' : null)

/** Para probar en local: agrega ?contar=1 a la dirección. */
const forzado = () => new URLSearchParams(location.search).has('contar')
const activo = () => (forzado() || !esLocal()) && !estoyExcluido()

let sesion = ''
let esNueva = false
let inicio = Date.now()
const escenasVistas = new Set<string>()
let despedido = false

function asegurarSesion() {
  if (sesion) return
  const guardada = leer('session', SESION)
  if (guardada) {
    sesion = guardada
    esNueva = false
    return
  }
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  sesion = Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 20)
  escribir('session', SESION, sesion)
  esNueva = true
}

function enviar(datos: Record<string, unknown>) {
  if (!activo()) return
  const cuerpo = JSON.stringify({ ...datos, sesion })
  try {
    const blob = new Blob([cuerpo], { type: 'application/json' })
    if (navigator.sendBeacon && navigator.sendBeacon('/api/evento', blob)) return
  } catch {
    /* cae al fetch */
  }
  fetch('/api/evento', {
    method: 'POST',
    body: cuerpo,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {})
}

/**
 * El identificador de esta sesión, para adjuntarlo al formulario de contacto o
 * a la reserva: si la persona deja su nombre y correo, el servidor recupera con
 * esto qué escenas vio antes de escribir. No depende de `activo()`: aunque las
 * visitas no se estén contando (por ejemplo en local), igual sirve el id.
 */
export function sesionActual() {
  asegurarSesion()
  return sesion
}

/** Una escena (o página) vista. */
export function contarVista(nombre: string) {
  asegurarSesion()
  escenasVistas.add(nombre)
  const nueva = esNueva
  esNueva = false
  const params = new URLSearchParams(location.search)
  enviar({
    tipo: 'vista',
    nombre,
    nueva,
    ref: nueva ? document.referrer : '',
    utm: nueva ? params.get('utm_source') || params.get('ref') || '' : '',
  })
}

/** Una acción: llamar, abrir un caso, etc. Nombre en minúsculas, sin espacios. */
export function contarEvento(nombre: string) {
  asegurarSesion()
  enviar({ tipo: 'evento', nombre: nombre.toLowerCase().replace(/[^a-z0-9_:.-]/g, '_').slice(0, 60) })
}

/** Qué acción representa un clic, si es que representa alguna. */
function eventoDelClic(objetivo: Element | null): string | null {
  const marcado = objetivo?.closest<HTMLElement>('[data-evento]')
  if (marcado?.dataset.evento) return marcado.dataset.evento

  const a = objetivo?.closest<HTMLAnchorElement>('a[href]')
  if (!a) return null
  const href = a.getAttribute('href') || ''
  if (href.startsWith('tel:')) return 'llamar'
  if (href.startsWith('mailto:')) return 'correo'
  if (/agendar/.test(href)) return 'abrir_agenda'
  try {
    const url = new URL(a.href)
    if (url.host === location.host) return null
    if (/wa\.me|whatsapp/.test(url.host)) return 'whatsapp'
    const host = url.host.replace(/^www\./, '')
    return `enlace:${host}`
  } catch {
    return null
  }
}

/** Arranca el contador: clics y despedida. Llamar una sola vez por página. */
let iniciado = false
export function iniciarAnalitica() {
  // React en modo estricto monta los efectos dos veces en desarrollo.
  if (iniciado) return
  iniciado = true
  asegurarSesion()
  inicio = Date.now()

  document.addEventListener(
    'click',
    (e) => {
      const nombre = eventoDelClic(e.target as Element | null)
      if (nombre) contarEvento(nombre)
    },
    { capture: true, passive: true },
  )

  /* Se manda solo el tiempo nuevo desde la última despedida, y "primera" una
     sola vez: así volver a la pestaña y salir de nuevo suma minutos sin contar
     dos visitas terminadas. */
  let yaSalio = false
  const despedirse = () => {
    if (despedido) return
    despedido = true
    const ahora = Date.now()
    enviar({
      tipo: 'salida',
      segundos: Math.round((ahora - inicio) / 1000),
      escenas: escenasVistas.size,
      primera: !yaSalio,
    })
    yaSalio = true
    inicio = ahora
  }
  addEventListener('pagehide', despedirse)
  // En el teléfono "pagehide" a veces no llega: al esconder la pestaña se
  // despide, y si vuelve se rearma para despedirse de nuevo más tarde.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') despedirse()
    else {
      despedido = false
      inicio = Date.now()
    }
  })
}
