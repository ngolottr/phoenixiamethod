/* ============================================================================
   SOLICITUDES DE PRIVACIDAD  →  FOLIO, AVISO A NICOLÁS Y ACUSE AL TITULAR
   ----------------------------------------------------------------------------
   El formulario de /privacidad es HTML puro (sin JavaScript: la página es
   estática y la política de seguridad no deja correr scripts sueltos), así que
   llega como formulario clásico y esta función responde con una página HTML,
   no con JSON.

   Qué hace con cada solicitud:
     1. Valida los datos y aplica los mismos filtros de abuso que el contacto.
     2. Le asigna un folio (PRV-AAMMDD-XXXX) y calcula el plazo de respuesta:
        2 días hábiles, que es lo que da la Ley 19.628 (art. 16) antes de que el
        titular pueda ir a tribunales.
     3. La guarda en Redis por 2 años con su folio, para poder demostrar qué se
        pidió y cuándo. Nada más la lee.
     4. Le avisa a Nicolás con el plazo en el asunto, y le manda al titular un
        acuse con el folio y la fecha. El acuse NO repite nada de lo que la
        persona escribió: si lo hiciera, este formulario serviría para mandarle
        cualquier texto a cualquier correo desde una dirección con buena fama.

   Cómo se atiende una solicitud: Neurona → 02_Fenix_IA_Method → Servicios →
   Privacidad_y_Datos.md (procedimiento paso a paso).
   ========================================================================== */

import crypto from 'node:crypto'
import { CORREO_NICOLAS, enviarCorreo, escapar } from './_correo.js'
import { ZONA, hayAlmacen, redis } from './_estadisticas.js'
import {
  RE_EMAIL,
  cuerpoDemasiadoGrande,
  correoValido,
  ipDe,
  limpiarLinea,
  limpiarTexto,
  pasaLosCuposCompartidos,
  sinCache,
  validarCampos,
  vieneDeLaWeb,
} from './_seguridad.js'

export const config = { maxDuration: 20 }

/** Lo que se puede pedir. La clave viaja en el formulario; el texto, en los correos. */
export const TIPOS = {
  acceso: 'Saber qué datos tienen de mí (acceso)',
  rectificacion: 'Corregir mis datos (rectificación)',
  supresion: 'Borrar mis datos (supresión)',
  oposicion: 'Que dejen de usar mis datos para algo (oposición)',
  portabilidad: 'Recibir mis datos en un archivo (portabilidad)',
  bloqueo: 'Suspender el uso de mis datos mientras se revisa (bloqueo)',
  consentimiento: 'Retirar un permiso que di, por ejemplo el de grabar (consentimiento)',
  otra: 'Otra consulta sobre mis datos',
}

const LIMITES = { tipo: 20, nombre: 80, email: 254, detalle: 1500, web: 200 }

const CUPO_IP = [3, 3600000] // 3 por hora desde una IP
const CUPO_CORREO = [2, 24 * 3600000] // 2 al día por dirección
const CUPO_TOTAL = [20, 24 * 3600000] // 20 al día en toda la web

/** Dos años, para poder mostrar qué se pidió, cuándo y cuándo se respondió. */
const GUARDAR_SEG = 2 * 365 * 86400

const DIAS_HABILES = 2

/* --- Fechas --------------------------------------------------------------- */

const fmtFecha = new Intl.DateTimeFormat('es-CL', {
  timeZone: ZONA,
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})
const fmtIso = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA, year: 'numeric', month: '2-digit', day: '2-digit' })
const fmtDiaSemana = new Intl.DateTimeFormat('en-US', { timeZone: ZONA, weekday: 'short' })

/**
 * Suma días hábiles saltando sábados y domingos. Los feriados no se descuentan:
 * el plazo que resulta es igual o más corto que el legal, nunca más largo.
 */
export function sumarDiasHabiles(desde, dias) {
  let t = desde
  let quedan = dias
  while (quedan > 0) {
    t += 86400000
    const d = fmtDiaSemana.format(new Date(t))
    if (d !== 'Sat' && d !== 'Sun') quedan -= 1
  }
  return t
}

export function nuevoFolio(ahora = Date.now()) {
  const [a, m, d] = fmtIso.format(new Date(ahora)).split('-')
  const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const azar = Array.from(crypto.randomBytes(4), (b) => letras[b % letras.length]).join('')
  return `PRV-${a.slice(2)}${m}${d}-${azar}`
}

/* --- Páginas de respuesta -------------------------------------------------- */

function pagina({ estado = 200, titulo, cuerpo }) {
  return {
    estado,
    html: `<!doctype html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="robots" content="noindex"><meta name="theme-color" content="#120B07">
<title>${escapar(titulo)} — Phoenix IA Method</title>
<style>
  :root{--brasa:#120B07;--arena:#F8F4F1;--humo:#B39C90;--fuego:#F26522}
  *{box-sizing:border-box}
  body{margin:0;background:var(--brasa);color:var(--arena);font-family:'Calibri','Segoe UI',system-ui,-apple-system,sans-serif;line-height:1.7;-webkit-font-smoothing:antialiased}
  main{width:min(620px,100%);margin:0 auto;padding:64px 20px 96px}
  .marca{font-size:10px;letter-spacing:.34em;text-transform:uppercase;color:var(--fuego);margin:0 0 28px}
  h1{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:clamp(28px,7vw,40px);line-height:1.15;margin:0 0 18px}
  p{color:var(--humo)} strong{color:var(--arena);font-weight:600}
  .folio{display:inline-block;padding:10px 16px;border:1px solid rgba(248,244,241,.2);border-radius:6px;font:600 18px/1.2 ui-monospace,Consolas,monospace;letter-spacing:.06em;color:var(--arena)}
  a{color:var(--fuego)}
  .volver{display:inline-block;margin-top:36px;padding:13px 22px;text-decoration:none;font-size:11px;letter-spacing:.2em;text-transform:uppercase;background:var(--fuego);color:var(--brasa);border-radius:4px;font-weight:600}
</style></head>
<body><main>
<p class="marca">Phoenix IA Method · Privacidad</p>
${cuerpo}
</main></body></html>`,
  }
}

function paginaError(estado, mensaje) {
  return pagina({
    estado,
    titulo: 'No pude registrar tu solicitud',
    cuerpo: `<h1>No pude registrar tu solicitud.</h1>
<p>${escapar(mensaje)}</p>
<p>También puedes escribir directo a <a href="mailto:${escapar(CORREO_NICOLAS)}">${escapar(CORREO_NICOLAS)}</a>.</p>
<a class="volver" href="/privacidad#ejercer">Volver al formulario</a>`,
  })
}

function paginaRecibida({ folio, plazo }) {
  return pagina({
    titulo: 'Solicitud recibida',
    cuerpo: `<h1>Recibí tu solicitud.</h1>
<p>Tu folio es</p>
<p class="folio">${escapar(folio)}</p>
<p>Te respondo al correo que dejaste a más tardar el <strong>${escapar(plazo)}</strong>. Si pedir lo que necesitas toma más trabajo, ese día te confirmo cómo va y te entrego la respuesta completa dentro de 30 días.</p>
<p>Guarda el folio: sirve para cualquier consulta sobre esta solicitud.</p>
<a class="volver" href="/privacidad">Volver a la política</a>`,
  })
}

function responder(res, { estado, html }) {
  res.statusCode = estado
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(html)
}

/* --- Correos -------------------------------------------------------------- */

function correoParaNicolas({ folio, tipo, nombre, email, detalle, plazo, sospechas }) {
  const filtro = sospechas.length ? `\n⚠️ Filtrada como posible robot: ${sospechas.join(' · ')}\n` : ''
  const texto = `Solicitud de privacidad ${folio}
${filtro}
Qué pide:   ${TIPOS[tipo]}
Nombre:     ${nombre}
Correo:     ${email}
Responder a más tardar: ${plazo} (2 días hábiles, Ley 19.628)

Detalle:
${detalle || '(sin detalle)'}

Cómo atenderla: Neurona → 02_Fenix_IA_Method → Servicios → Privacidad_y_Datos.md
Responde directo a este correo para contestarle.`

  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:24px 12px;background:#f4f4f2;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fff;border:1px solid #e3e3df;">
<tr><td style="padding:24px 26px 0;">
  <p style="margin:0;font:700 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;color:#b4531f;text-transform:uppercase;">Solicitud de privacidad · ${escapar(folio)}</p>
  <p style="margin:10px 0 0;font:400 20px/1.35 Helvetica,Arial,sans-serif;color:#111;">${escapar(TIPOS[tipo])}</p>
</td></tr>
${
  sospechas.length
    ? `<tr><td style="padding:14px 26px 0;"><p style="margin:0;padding:10px 12px;background:#fdf1e7;border-left:3px solid #b4531f;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#5c3a22;">Filtrada como posible robot (${escapar(sospechas.join(' · '))}).</p></td></tr>`
    : ''
}
<tr><td style="padding:16px 26px 0;font:400 14px/1.7 Helvetica,Arial,sans-serif;color:#111;">
  <b>Responder a más tardar:</b> ${escapar(plazo)}<br>
  <b>Nombre:</b> ${escapar(nombre)}<br>
  <b>Correo:</b> ${escapar(email)}
</td></tr>
<tr><td style="padding:16px 26px 0;"><p style="margin:0;font:400 15px/1.65 Helvetica,Arial,sans-serif;color:#111;">${escapar(detalle || '(sin detalle)').replace(/\n/g, '<br>')}</p></td></tr>
<tr><td style="padding:18px 26px 24px;"><p style="margin:0;padding-top:14px;border-top:1px solid #ececE8;font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#6b6b66;">Plazo legal: 2 días hábiles (Ley 19.628, art. 16). Procedimiento en Neurona → Servicios → Privacidad_y_Datos.md. Responde directo a este correo para contestarle.</p></td></tr>
</table></td></tr></table></body></html>`
  return { texto, html }
}

/** El acuse NO lleva nada escrito por la persona: ni su nombre ni su detalle. */
function acuseParaTitular({ folio, tipo, plazo }) {
  const texto = `Hola:

Recibí tu solicitud de privacidad en phoenixiamethod.cl.

Folio: ${folio}
Qué pediste: ${TIPOS[tipo]}
Te respondo a más tardar el ${plazo}.

Si no fuiste tú quien la envió, responde este correo y la anulo.

Nicolás Golott
Phoenix IA Method
https://phoenixiamethod.cl/privacidad`

  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:24px 12px;background:#120B07;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#1a110c;border:1px solid rgba(248,244,241,.12);">
<tr><td style="padding:30px 32px 0;"><p style="margin:0;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.42em;color:#F26522;text-transform:uppercase;">Solicitud recibida</p></td></tr>
<tr><td style="padding:14px 32px 0;"><p style="margin:0;font:400 24px/1.3 Georgia,serif;color:#F8F4F1;">Folio ${escapar(folio)}</p></td></tr>
<tr><td style="padding:14px 32px 0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#B39C90;">
  Recibí tu solicitud: <span style="color:#F8F4F1;">${escapar(TIPOS[tipo])}</span>.<br>
  Te respondo a este correo a más tardar el <span style="color:#F8F4F1;">${escapar(plazo)}</span>.<br><br>
  Si no fuiste tú quien la envió, responde este correo y la anulo.
</td></tr>
<tr><td style="padding:24px 32px 30px;"><p style="margin:0;padding-top:18px;border-top:1px solid rgba(248,244,241,.12);font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#B39C90;">Nicolás Golott<br><span style="color:#FFC46B;">Phoenix IA Method</span><br><a href="https://phoenixiamethod.cl/privacidad" style="color:#F26522;">Política de privacidad</a></p></td></tr>
</table></td></tr></table></body></html>`
  return { texto, html }
}

/* ------------------------------------------------------------------------- */

export default async function handler(req, res) {
  sinCache(res)
  res.setHeader('X-Robots-Tag', 'noindex')

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return responder(res, paginaError(405, 'Esta dirección solo recibe el formulario de la política de privacidad.'))
  }
  if (!vieneDeLaWeb(req)) {
    return responder(res, paginaError(403, 'El formulario tiene que enviarse desde phoenixiamethod.cl.'))
  }
  if (cuerpoDemasiadoGrande(req)) {
    return responder(res, paginaError(413, 'El mensaje es demasiado largo.'))
  }

  // Vercel ya convierte el formulario clásico en objeto. Si llegara como texto
  // (por ejemplo, en local), se lee igual.
  let cuerpo = req.body || {}
  if (typeof cuerpo === 'string') {
    try {
      cuerpo = Object.fromEntries(new URLSearchParams(cuerpo))
    } catch {
      return responder(res, paginaError(400, 'No pude leer el formulario.'))
    }
  }

  const malos = validarCampos(cuerpo, LIMITES)
  if (malos.length) return responder(res, paginaError(400, 'Revisa los datos del formulario.'))

  const tipo = String(cuerpo.tipo || '').trim()
  const datos = {
    tipo,
    nombre: limpiarLinea(cuerpo.nombre, LIMITES.nombre),
    email: correoValido(cuerpo.email),
    detalle: limpiarTexto(cuerpo.detalle, LIMITES.detalle),
  }
  if (!Object.hasOwn(TIPOS, tipo)) return responder(res, paginaError(400, 'Elige qué quieres pedir.'))
  if (datos.nombre.length < 2) return responder(res, paginaError(400, 'Escribe tu nombre.'))
  if (!RE_EMAIL.test(datos.email)) return responder(res, paginaError(400, 'Revisa tu correo: ahí te llega la respuesta.'))

  const permitido = await pasaLosCuposCompartidos([
    [`privacidad:ip:${ipDe(req)}`, ...CUPO_IP],
    [`privacidad:mail:${datos.email.toLowerCase()}`, ...CUPO_CORREO],
    ['privacidad:total', ...CUPO_TOTAL],
  ])
  if (!permitido) {
    res.setHeader('Retry-After', '3600')
    return responder(
      res,
      paginaError(429, 'Ya recibí una solicitud tuya. Si necesitas agregar algo, responde el correo de acuse.'),
    )
  }

  // Campo trampa: una persona no lo ve, un robot lo llena.
  const sospechas = []
  if (limpiarTexto(cuerpo.web, 10)) sospechas.push('campo trampa lleno')

  const ahora = Date.now()
  const folio = nuevoFolio(ahora)
  const plazo = fmtFecha.format(new Date(sumarDiasHabiles(ahora, DIAS_HABILES)))
  const registro = { folio, t: ahora, ...datos, plazo, sospechas: sospechas.length ? sospechas : undefined }

  try {
    if (hayAlmacen()) await redis([['SET', `privacidad:sol:${folio}`, JSON.stringify(registro), 'EX', GUARDAR_SEG]])
  } catch (e) {
    console.error('[privacidad] no pude guardar la solicitud →', e.message)
  }

  const aviso = correoParaNicolas({ ...registro, sospechas })
  try {
    await enviarCorreo({
      para: CORREO_NICOLAS,
      nombrePara: 'Nicolás',
      asunto: `${sospechas.length ? '(posible robot) ' : ''}Solicitud de privacidad ${folio} — responder antes del ${plazo}`,
      texto: aviso.texto,
      html: aviso.html,
      responderA: datos.email.toLowerCase() === CORREO_NICOLAS.toLowerCase() ? undefined : { email: datos.email, name: datos.nombre },
    })
  } catch (e) {
    // Sin aviso, la solicitud igual quedó guardada con su folio.
    console.error('[privacidad] no pude avisar a Nicolás →', e.message)
  }

  if (!sospechas.length) {
    const acuse = acuseParaTitular(registro)
    try {
      await enviarCorreo({
        para: datos.email,
        nombrePara: datos.nombre,
        asunto: `Recibí tu solicitud de privacidad — folio ${folio}`,
        texto: acuse.texto,
        html: acuse.html,
        responderA: { email: CORREO_NICOLAS, name: 'Nicolás Golott' },
      })
    } catch (e) {
      console.error('[privacidad] no pude mandar el acuse →', e.message)
    }
  }

  return responder(res, paginaRecibida({ folio, plazo }))
}
