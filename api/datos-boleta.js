/* ============================================================================
   LOS DATOS PARA LA BOLETA
   ----------------------------------------------------------------------------
   Quien acaba de pagar puede dejar acá su RUT y su dirección para que Nicolás
   le emita la boleta de honorarios.

   POR QUÉ DESPUÉS DEL PAGO Y NO ANTES. Pedir RUT, dirección, región y comuna
   en el formulario de compra son cuatro campos más justo en el momento en que
   la persona está decidiendo si paga o no, y cada campo extra ahí cuesta
   ventas. Acá ya pagó: si no llena nada, la venta sigue hecha y lo único que
   pasa es que la boleta se emite pidiéndole los datos por correo.

   ESTO NO EMITE LA BOLETA. La recibe Nicolás por correo y la emite él en el
   SII. El día que se enchufe una API de emisión —cuando el volumen lo
   justifique y haya un proveedor que no cobre mensualidad— estos son
   exactamente los campos que esa API necesita, así que no hay que rehacer
   nada.

   Y NO SE CONFÍA EN EL FORMULARIO. Cualquiera puede mandar un POST acá con
   datos inventados. Por eso el token viaja de vuelta a Flow: si ese pago no
   existe o no está pagado, no se registra nada. Lo único que este endpoint
   acepta es información sobre una venta que Flow confirma que ocurrió.
   ========================================================================== */

import { PAGADA, estadoDelPago, hayLlaves, tokenValido } from './_flow.js'
import { CORREO_NICOLAS, enviarCorreo, escapar } from './_correo.js'
import { PRECIOS } from './_precios.js'
import { formatearRut, rutValido } from './_rut.js'
import { hayAlmacen, redis } from './_estadisticas.js'
import { ipDe, limpiarLinea, pasaLosCupos, sinCache, vieneDeLaWeb } from './_seguridad.js'

const RETENCION = 0.1525

/** La misma piel que la pantalla de gracias, para que no parezca otro sitio. */
function pagina({ titulo, enfasis, cuerpo, tono = 'bien', volver }) {
  return `<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
    <meta name="theme-color" content="#120B07" />
    <meta name="robots" content="noindex" />
    <title>${escapar(titulo)} — Phoenix IA Method</title>
    <style>
      :root { --brasa:#120B07; --arena:#F8F4F1; --humo:#B39C90; --fuego:#F26522;
              --linea:rgba(248,244,241,.14); --acento:var(--fuego); }
      [data-tono='bien'] { --acento:#2BE58F; }
      * { box-sizing:border-box; }
      body { margin:0; min-height:100vh; padding:32px 24px; display:grid; place-items:center;
             background:var(--brasa); color:var(--arena);
             font-family:'Calibri','Segoe UI',system-ui,-apple-system,sans-serif;
             -webkit-font-smoothing:antialiased; }
      main { width:min(560px,100%); }
      .marca { font-size:10px; letter-spacing:.34em; text-transform:uppercase;
               color:var(--acento); margin:0 0 40px; }
      h1 { font-family:Georgia,'Times New Roman',serif; font-weight:400;
           font-size:clamp(28px,7vw,42px); line-height:1.1; margin:0 0 20px; }
      h1 em { font-style:italic; color:var(--acento); }
      p { color:var(--humo); line-height:1.65; margin:0 0 20px; max-width:46ch; }
      a.btn { display:inline-block; margin-top:8px; padding:13px 22px; text-decoration:none;
              font-size:11px; letter-spacing:.2em; text-transform:uppercase;
              background:var(--acento); color:var(--brasa); border-radius:4px; font-weight:600; }
    </style>
  </head>
  <body data-tono="${escapar(tono)}">
    <main>
      <p class="marca">Phoenix IA Method</p>
      <h1>${escapar(titulo)}<br /><em>${escapar(enfasis)}</em></h1>
      <p>${escapar(cuerpo)}</p>
      <a class="btn" href="${volver}">Volver al sitio</a>
    </main>
  </body>
</html>`
}

function sitio() {
  return (process.env.SITIO_URL || 'https://phoenixiamethod.cl').trim().replace(/\/$/, '')
}

function responder(res, estado, datos) {
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.setHeader('X-Robots-Tag', 'noindex, nofollow')
  return res.status(estado).send(pagina({ ...datos, volver: `${sitio()}/` }))
}

export default async function handler(req, res) {
  sinCache(res)
  if (req.method !== 'POST') return res.status(405).end()

  /* El formulario va sin JavaScript —la política de seguridad del sitio no
     permite scripts sueltos— así que llega como formulario clásico. */
  const b = typeof req.body === 'string' ? Object.fromEntries(new URLSearchParams(req.body)) : req.body || {}

  if (!vieneDeLaWeb(req)) {
    return responder(res, 403, {
      titulo: 'No pude',
      enfasis: 'recibir tus datos.',
      cuerpo: 'Escríbeme y los tomo por correo. Tu pago está hecho igual.',
      tono: 'alto',
    })
  }

  const ip = ipDe(req)
  if (!pasaLosCupos([[`boleta:ip:${ip}`, 10, 30 * 60000], ['boleta:total', 60, 60 * 60000]])) {
    return responder(res, 429, {
      titulo: 'Demasiados',
      enfasis: 'intentos.',
      cuerpo: 'Prueba en un rato, o escríbeme y tomo los datos por correo.',
      tono: 'alto',
    })
  }

  /* El pago tiene que ser real. Sin esta vuelta a Flow, cualquiera podría
     llenar la casilla de Nicolás con ventas que nunca ocurrieron. */
  const token = String(b.token || '')
  if (!tokenValido(token) || !hayLlaves()) {
    return responder(res, 400, {
      titulo: 'No pude',
      enfasis: 'verificar tu pago.',
      cuerpo: 'Escríbeme con tu número de orden y lo resolvemos.',
      tono: 'alto',
    })
  }

  let pago
  try {
    pago = await estadoDelPago(token)
  } catch (e) {
    console.error('[datos-boleta] no se pudo consultar el pago →', e.message)
    return responder(res, 502, {
      titulo: 'No pude',
      enfasis: 'verificar tu pago.',
      cuerpo: 'Escríbeme con tu número de orden y lo resolvemos.',
      tono: 'alto',
    })
  }

  if (Number(pago.status) !== PAGADA) {
    return responder(res, 400, {
      titulo: 'Ese pago',
      enfasis: 'no está confirmado.',
      cuerpo: 'Si crees que sí pagaste, escríbeme con tu número de orden.',
      tono: 'alto',
    })
  }

  if (!rutValido(b.rut)) {
    return responder(res, 400, {
      titulo: 'Ese RUT',
      enfasis: 'no me cuadra.',
      cuerpo:
        'El dígito verificador no calza. Vuelve atrás y revísalo: un RUT equivocado en una boleta obliga a anularla y emitirla de nuevo.',
      tono: 'alto',
    })
  }

  const datos = {
    rut: formatearRut(b.rut),
    nombre: limpiarLinea(b.nombre, 120),
    direccion: limpiarLinea(b.direccion, 160),
    comuna: limpiarLinea(b.comuna, 80),
    region: limpiarLinea(b.region, 80),
  }
  if (!datos.nombre || !datos.direccion || !datos.comuna) {
    return responder(res, 400, {
      titulo: 'Faltan',
      enfasis: 'algunos datos.',
      cuerpo: 'Necesito nombre, dirección y comuna para emitir la boleta. Vuelve atrás y complétalos.',
      tono: 'alto',
    })
  }

  const orden = String(pago.commerceOrder || '')
  const bruto = Number(pago.amount || 0)
  const retencion = Math.round(bruto * RETENCION)

  let extras = {}
  try {
    extras = typeof pago.optional === 'string' ? JSON.parse(pago.optional) : pago.optional || {}
  } catch {
    extras = {}
  }
  const paquete = PRECIOS[extras.paquete]?.nombre || extras.paquete || 'sin identificar'

  /* Queda guardado además del correo: el día que se enchufe la emisión
     automática, estos son los datos que necesita, y un correo no se consulta
     desde un programa. */
  if (hayAlmacen()) {
    try {
      await redis([
        ['SET', `boleta:${orden}`, JSON.stringify({ ...datos, bruto, paquete, cuando: Date.now() })],
        ['EXPIRE', `boleta:${orden}`, 60 * 60 * 24 * 365],
      ])
    } catch (e) {
      console.error('[datos-boleta] no se pudo guardar →', e.message)
    }
  }

  const lineas = [
    `Orden: ${orden}`,
    `Paquete: ${paquete}`,
    '',
    '--- Para emitir la boleta ---',
    `RUT: ${datos.rut}`,
    `Nombre: ${datos.nombre}`,
    `Dirección: ${datos.direccion}`,
    `Comuna: ${datos.comuna}`,
    `Región: ${datos.region || '(no indicó)'}`,
    '',
    `Monto bruto: $${bruto.toLocaleString('es-CL')}`,
    `Retención ${(RETENCION * 100).toFixed(2).replace('.', ',')} %: $${retencion.toLocaleString('es-CL')}`,
    `Líquido: $${(bruto - retencion).toLocaleString('es-CL')}`,
    '',
    'Como el pago entró completo por Flow, el cliente no retuvo nada:',
    'la retención la declaras tú en el F29 del mes.',
  ]

  try {
    await enviarCorreo({
      para: CORREO_NICOLAS,
      nombrePara: 'Nicolás Golott',
      asunto: `🧾 Datos para la boleta: ${datos.nombre} — $${bruto.toLocaleString('es-CL')}`,
      texto: lineas.join('\n'),
      html: `<p>${lineas.map(escapar).join('<br />')}</p>`,
    })
  } catch (e) {
    /* El cliente ya hizo su parte: no se le muestra un error por algo que
       falló del lado de acá, y los datos quedaron guardados igual. */
    console.error('[datos-boleta] el correo falló →', e.message)
  }

  // Sin el RUT: el registro de Vercel no es lugar para un dato de identidad.
  console.log(`[datos-boleta] ✅ ${orden}`)

  return responder(res, 200, {
    titulo: 'Gracias.',
    enfasis: 'Te emito la boleta.',
    cuerpo:
      'Ya tengo tus datos. Te va a llegar la boleta de honorarios al mismo correo con el que pagaste, junto con el detalle de cuándo partimos.',
  })
}
