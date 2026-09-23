/* ============================================================================
   EL COMPRADOR VUELVE DE FLOW
   ----------------------------------------------------------------------------
   Flow devuelve a la persona acá cuando termina —pagó, se arrepintió o le
   rechazaron la tarjeta— y lo hace con un POST, no con un enlace normal. Por eso
   esto es una función y no un archivo HTML: una página estática no puede leer un
   POST.

   La página se arma acá, en el servidor, con el estado ya resuelto. Podría
   redirigir a un .html y dejar que el navegador leyera el resultado de la
   dirección, pero eso pide JavaScript en la página, y la política de seguridad
   del sitio (`vercel.json`) no permite scripts sueltos. Servir el HTML hecho
   evita el archivo extra, evita el script y, de paso, evita que alguien se
   fabrique una pantalla de "pagado" cambiando la URL.

   OJO CON QUÉ SIGNIFICA ESTA PÁGINA: es lo que ve el comprador, y nada más. La
   venta la da por buena `pago-confirmado.js`, que es el aviso de servidor a
   servidor. Alguien puede cerrar la pestaña antes de volver y su pago sigue
   siendo válido. Acá no se avisa a nadie ni se registra ninguna venta.
   ========================================================================== */

import { PAGADA, estadoDelPago, hayLlaves, tokenValido } from './_flow.js'
import { escapar } from './_correo.js'
import { ipDe, pasaLosCupos, sinCache } from './_seguridad.js'

function sitio() {
  return (process.env.SITIO_URL || 'https://phoenixiamethod.cl').trim().replace(/\/$/, '')
}

/* Cada final tiene su mensaje. El de rechazo no culpa a nadie y ofrece la
   salida de siempre —escribir—, porque una tarjeta rechazada no es un cliente
   perdido si sabe qué hacer después. */
const FINALES = {
  pagado: {
    titulo: 'Listo.',
    enfasis: 'Recibí tu pago.',
    cuerpo:
      'Te llegó el comprobante de Flow a tu correo, y a mí me llegó el aviso. Te escribo hoy mismo para coordinar cuándo partimos.',
    tono: 'bien',
  },
  pendiente: {
    titulo: 'Tu pago',
    enfasis: 'está en camino.',
    cuerpo:
      'Algunos medios —la transferencia, sobre todo— tardan un rato en confirmarse. Cuando Flow me avise, te escribo. No hace falta que pagues de nuevo.',
    tono: 'espera',
  },
  rechazado: {
    titulo: 'El pago',
    enfasis: 'no se completó.',
    cuerpo:
      'No se te cobró nada. Puede haber sido la tarjeta, el banco o simplemente que te arrepentiste. Si quieres intentarlo de nuevo o prefieres coordinarlo conmigo directamente, escríbeme.',
    tono: 'alto',
  },
  desconocido: {
    titulo: 'No pude',
    enfasis: 'leer el resultado.',
    cuerpo:
      'Puede que el pago haya salido bien igual. No lo intentes otra vez todavía: escríbeme y lo reviso en el panel antes de que pagues dos veces.',
    tono: 'alto',
  },
}

/**
 * El formulario para la boleta, solo cuando el pago está hecho.
 *
 * Va acá y no en el checkout por una razón medible: RUT, dirección, región y
 * comuna son cuatro campos más justo en el momento en que la persona está
 * decidiendo si paga, y cada campo ahí cuesta ventas. En esta pantalla ya
 * pagó, así que si no lo llena no se pierde nada —la boleta se le pide
 * después por correo— y si lo llena, Nicolás tiene todo sin escribirle.
 *
 * Sin JavaScript a propósito: la política de seguridad del sitio no permite
 * scripts sueltos, y un formulario HTML de toda la vida hace exactamente lo
 * mismo. Por eso la validación del RUT ocurre en el servidor.
 */
function formularioBoleta(token) {
  if (!token) return ''
  return `
      <form class="bo" method="POST" action="/api/datos-boleta">
        <input type="hidden" name="token" value="${escapar(token)}" />
        <p class="bo-t">¿Necesitas boleta?</p>
        <p class="bo-d">Déjame tus datos y te la envío por correo. Si no la necesitas, puedes cerrar esta página tranquilo: tu pago ya está hecho.</p>
        <label>RUT<input name="rut" required placeholder="12.345.678-9" autocomplete="off" /></label>
        <label>Nombre o razón social<input name="nombre" required maxlength="120" autocomplete="organization" /></label>
        <label>Dirección<input name="direccion" required maxlength="160" autocomplete="street-address" /></label>
        <div class="bo-par">
          <label>Comuna<input name="comuna" required maxlength="80" autocomplete="address-level2" /></label>
          <label>Región<input name="region" maxlength="80" autocomplete="address-level1" /></label>
        </div>
        <button type="submit">Enviar mis datos</button>
      </form>`
}

function pagina(clave, orden, token = '') {
  const f = FINALES[clave] || FINALES.desconocido
  const url = sitio()
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#120B07" />
    <meta name="robots" content="noindex" />
    <title>${escapar(f.titulo)} ${escapar(f.enfasis)} — Phoenix IA Method</title>
    <style>
      :root {
        --brasa: #120B07; --arena: #F8F4F1; --humo: #B39C90;
        --fuego: #F26522; --ambar: #FFC46B;
        --linea: rgba(248, 244, 241, .14);
        --acento: var(--fuego);
      }
      [data-tono='bien']  { --acento: #2BE58F; }
      [data-tono='alto']  { --acento: var(--fuego); }
      [data-tono='espera']{ --acento: var(--ambar); }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; padding: 32px 24px;
        display: grid; place-items: center;
        background: var(--brasa); color: var(--arena);
        font-family: 'Calibri', 'Segoe UI', system-ui, -apple-system, sans-serif;
        -webkit-font-smoothing: antialiased;
      }
      main { width: min(560px, 100%); }
      .marca {
        font-size: 10px; letter-spacing: .34em; text-transform: uppercase;
        color: var(--acento); margin: 0 0 40px;
      }
      h1 {
        font-family: Georgia, 'Times New Roman', serif; font-weight: 400;
        font-size: clamp(30px, 8vw, 46px); line-height: 1.08;
        margin: 0 0 22px; letter-spacing: -.01em;
      }
      h1 em { font-style: italic; color: var(--acento); }
      p { color: var(--humo); line-height: 1.65; margin: 0 0 20px; max-width: 46ch; }
      .orden {
        display: inline-block; margin: 6px 0 28px; padding: 7px 13px;
        border: 1px solid var(--linea); border-radius: 4px;
        font-size: 11px; letter-spacing: .1em; color: var(--humo);
      }
      .orden b { color: var(--arena); font-weight: 500; }
      .salidas { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 12px; }
      a.btn {
        display: inline-block; padding: 13px 22px; text-decoration: none;
        font-size: 11px; letter-spacing: .2em; text-transform: uppercase;
        border: 1px solid var(--linea); color: var(--arena); border-radius: 4px;
        transition: border-color .3s, color .3s;
      }
      a.btn:hover, a.btn:focus-visible { border-color: var(--acento); color: var(--acento); }
      a.btn.solido { background: var(--acento); border-color: var(--acento); color: var(--brasa); font-weight: 600; }
      a.btn.solido:hover, a.btn.solido:focus-visible { color: var(--brasa); opacity: .88; }

      /* El formulario de la boleta */
      .bo { margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--linea); }
      .bo-t { font-family: Georgia, serif; font-size: 20px; color: var(--arena); margin: 0 0 8px; }
      .bo-d { font-size: 13px; margin-bottom: 20px; }
      .bo label { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px;
                  font-size: 9.5px; letter-spacing: .18em; text-transform: uppercase; color: var(--humo); }
      .bo input { width: 100%; padding: 11px 13px; border-radius: 3px;
                  background: rgba(248,244,241,.05); border: 1px solid var(--linea);
                  color: var(--arena); font-family: inherit; font-size: 14px; letter-spacing: normal;
                  text-transform: none; }
      .bo input:focus { outline: none; border-color: var(--acento); }
      .bo-par { display: flex; gap: 12px; }
      .bo-par label { flex: 1; }
      .bo button { width: 100%; margin-top: 6px; padding: 14px; cursor: pointer;
                   background: var(--acento); color: var(--brasa); border: none; border-radius: 4px;
                   font-family: inherit; font-size: 11px; font-weight: 600;
                   letter-spacing: .2em; text-transform: uppercase; }
      .bo button:hover { opacity: .88; }
      @media (max-width: 420px) { .bo-par { flex-direction: column; gap: 0; } }

      @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
    </style>
  </head>
  <body data-tono="${escapar(f.tono)}">
    <main>
      <p class="marca">Phoenix IA Method</p>
      <h1>${escapar(f.titulo)}<br /><em>${escapar(f.enfasis)}</em></h1>
      <p>${escapar(f.cuerpo)}</p>
      ${orden ? `<p class="orden">Tu número de orden: <b>${escapar(orden)}</b></p>` : ''}
      <div class="salidas">
        <a class="btn solido" href="${url}/">Volver al sitio</a>
        <a class="btn" href="${url}/#contacto">Escribirme</a>
      </div>
      ${clave === 'pagado' ? formularioBoleta(token) : ''}
    </main>
  </body>
</html>`
}

function responder(res, clave, orden = '', token = '') {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  return res.status(200).send(pagina(clave, orden, token))
}

export default async function handler(req, res) {
  sinCache(res)

  let token = ''
  const b = req.body
  if (typeof b === 'string') token = new URLSearchParams(b).get('token') || ''
  else if (b && typeof b === 'object') token = String(b.token || '')
  if (!token && req.query) token = String(req.query.token || '')

  if (!tokenValido(token) || !hayLlaves()) return responder(res, 'desconocido')
  // Cada visita consulta a Flow con la clave del comercio: sin tope, esta
  // página sirve para gastar la cuota de la API a punta de recargas.
  if (!pasaLosCupos([[`pago-listo:ip:${ipDe(req)}`, 20, 10 * 60000]])) return responder(res, 'desconocido')

  try {
    const pago = await estadoDelPago(token)
    if (Number(pago.status) === PAGADA) {
      /* El token viaja al formulario de la boleta: es lo que le permite al
         otro endpoint volver a preguntarle a Flow si ese pago existe, en vez
         de creerle a quien mande el formulario. */
      return responder(res, 'pagado', String(pago.commerceOrder || ''), token)
    }
    return responder(res, Number(pago.status) === 1 ? 'pendiente' : 'rechazado')
  } catch (e) {
    console.error('[pago-listo] no se pudo consultar →', e.message)
    return responder(res, 'desconocido')
  }
}
