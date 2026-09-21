/* ============================================================================
   RECIBIR UNA VISITA O UNA ACCIÓN
   ----------------------------------------------------------------------------
   El navegador manda acá, con sendBeacon, cada escena vista, cada acción
   (llamar, abrir la agenda, ver un caso…) y la salida con el tiempo en el sitio.
   Ver api/_estadisticas.js para qué se guarda y qué no.

   Siempre contesta 204 y nunca dice por qué descartó algo: a un robot no hay
   que explicarle cómo pasar el filtro, y a una persona no le importa.
   ========================================================================== */

import {
  RE_BOT,
  diaDe,
  equipoDe,
  fuenteDe,
  hayAlmacen,
  huella,
  lugar,
  navegadorDe,
  redis,
  registrar,
  sistemaDe,
} from './_estadisticas.js'
import { cuerpoDemasiadoGrande, ipDe, pasaLosCupos, sinCache, vieneDeLaWeb } from './_seguridad.js'

const RE_SESION = /^[A-Za-z0-9_-]{8,40}$/

/* --- Qué nombres se aceptan ------------------------------------------------
   Lista cerrada, no un patrón abierto. Con un patrón, cualquiera con una línea
   de comandos podía inventar mil nombres distintos y llenar el panel de basura.
   Y lo más importante: "contacto_enviado" y "reserva_hecha" NO están acá. Esas
   las cuenta solo el servidor cuando el correo salió o el evento se creó; si
   el navegador pudiera mandarlas, se podrían fabricar conversiones falsas. */
const ESCENAS = new Set([
  'inicio', 'trabajo', 'contacto', 'manifiesto', 'sobre-mi', 'redes', 'galeria', 'destacados', 'agendar',
])
const EVENTOS = new Set([
  'llamar', 'whatsapp', 'correo', 'copiar_email', 'abrir_agenda', 'cta_trabajemos', 'ver_casos',
  // Precios. "comprar:X" es solo que abrió la ventanita de compra: la VENTA no
  // se cuenta acá nunca, la cuenta el servidor en pago-confirmado.js cuando
  // Flow confirma. Si el navegador pudiera declarar ventas, cualquiera podría
  // fabricar ingresos falsos en el panel con una línea de consola.
  'ver_precios', 'precio_conversar',
])
/* Tres letras como mínimo porque hay paquetes con identificador corto —`crm`—
   y el patrón anterior, de cuatro, los dejaba fuera sin que nada lo avisara:
   el botón se pulsaba, el evento salía y el servidor lo descartaba en silencio. */
const RE_PAQUETE = /^(comprar|hablar):[a-z]{3,20}$/
const nombreValido = (tipo, n) =>
  tipo === 'vista'
    ? ESCENAS.has(n)
    : EVENTOS.has(n) ||
      /^abrir_caso:\d{2}$/.test(n) ||
      RE_PAQUETE.test(n) ||
      (/^enlace:[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(n) && n.length <= 70)

/* --- Techo diario ------------------------------------------------------------
   El plan gratis de la base tiene 500.000 comandos al mes y cada golpe usa unos
   diez. Los cupos por IP de _seguridad.js viven en la memoria de cada instancia:
   alguien con muchas IP los esquiva. Este techo vive en la base, así que vale
   para todas las instancias: pasado el límite del día se deja de anotar (el
   sitio sigue funcionando igual) y el cupo del mes no se agota por un ataque.
   Un día normal del sitio está muy por debajo. */
const TECHO_DIARIO = 3000

export default async function handler(req, res) {
  sinCache(res)
  const listo = () => res.status(204).end()

  if (req.method !== 'POST') return res.status(405).end()
  if (!hayAlmacen()) return listo()
  if (!vieneDeLaWeb(req) || cuerpoDemasiadoGrande(req)) return listo()

  const ua = String(req.headers['user-agent'] || '')
  if (!ua || RE_BOT.test(ua)) return listo()

  let b
  try {
    b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return listo()
  }

  const tipo = ['vista', 'evento', 'salida'].includes(b.tipo) ? b.tipo : null
  const nombre = String(b.nombre || '').toLowerCase().slice(0, 80)
  if (!tipo || (tipo !== 'salida' && !nombreValido(tipo, nombre))) return listo()

  const ip = ipDe(req)
  // Una persona real no genera más de esto; un bucle sí.
  if (!pasaLosCupos([[`evento:ip:${ip}`, 120, 10 * 60000], ['evento:total', 300, 60000]])) return listo()

  try {
    const clave = `st:cupo:${diaDe()}`
    const [usados] = await redis([['INCR', clave], ['EXPIRE', clave, 172800]])
    if (Number(usados) > TECHO_DIARIO) return listo()
  } catch {
    return listo()
  }

  const sesion = RE_SESION.test(String(b.sesion || '')) ? String(b.sesion) : ''
  let hostRef = ''
  try {
    hostRef = b.ref ? new URL(String(b.ref)).host : ''
  } catch {
    hostRef = ''
  }
  const propio = String(req.headers.host || '')
  if (hostRef === propio) hostRef = ''

  try {
    await registrar({
      tipo,
      nombre,
      visitante: huella(ip, ua, diaDe()),
      sesion,
      nueva: tipo === 'vista' && b.nueva === true,
      fuente: fuenteDe(hostRef, b.utm),
      ...lugar(req),
      equipo: equipoDe(ua),
      navegador: navegadorDe(ua),
      sistema: sistemaDe(ua),
      segundos: Number(b.segundos) || 0,
      escenas: Number(b.escenas) || 0,
      primera: b.primera === true,
    })
  } catch (e) {
    console.error('[evento] no se pudo registrar →', e.message)
  }
  return listo()
}
