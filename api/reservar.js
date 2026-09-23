/* ============================================================================
   RESERVAR UN HORARIO
   El cliente elige una hora en la página y esto la convierte en un evento real
   del calendario, con la invitación enviada a su correo.

   Se vuelve a comprobar que el hueco siga libre: entre que la página cargó y
   la persona eligió pueden haber pasado minutos, y alguien más pudo tomarlo.
   ========================================================================== */

import { tramosOcupados, crearEvento } from './_google.js'
import { contarDesdeServidor, equipoDe, lugar, navegadorDe, registrarCliente, sistemaDe } from './_estadisticas.js'
import { esHuecoValido, DURACION_MIN, partesEnChile } from './_agenda.js'
import { CORREO_NICOLAS, enviarCorreo, escapar, enlaceAgregarACalendario } from './_correo.js'
import {
  MAX_ENLACES,
  PRESUPUESTOS,
  RE_EMAIL,
  aplicarCors,
  correoValido,
  cuentaEnlaces,
  cuerpoDemasiadoGrande,
  esEnlaceSeguro,
  fallo,
  ipDe,
  limpiarLinea,
  limpiarTexto,
  pasaLosCuposCompartidos,
  sinCache,
  validarCampos,
  vieneDeLaWeb,
} from './_seguridad.js'

/** Igual que en api/evento.js: el identificador de sesión que arma el navegador. */
const RE_SESION = /^[A-Za-z0-9_-]{8,40}$/

export const config = { maxDuration: 20 }

/* Esta función escribe en el calendario real de Nicolás. Sin tope, cualquiera
   podía llenarle la agenda de reuniones falsas con las dos semanas que se
   ofrecen y dejarlo sin una sola hora libre que mostrar. */
const CUPO_IP = [4, 60 * 60000] // 4 reservas por hora desde una IP
const CUPO_CORREO = [2, 24 * 3600000] // 2 al día por dirección
const CUPO_TOTAL = [25, 24 * 3600000] // 25 al día en total

/** Un instante en formato ISO, para no darle a Google cualquier cosa. */
const RE_ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/

const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function enPalabras(inicio) {
  const p = partesEnChile(new Date(inicio))
  const hora = `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`
  return `${DIAS_LARGO[p.diaSemana]} ${p.dia} de ${MESES[p.mes - 1]}, ${hora} h`
}

/** Confirma al cliente y avisa a Nicolás. */
async function avisar({ nombre, email, tema: temaCompleto, presupuesto, cuando, enlaceReunion, revision }) {
  /* El correo de confirmación va al correo que escribió el visitante, que puede
     ser el de cualquiera. Si repitiera un texto con enlaces, esta web serviría
     para mandarle phishing a un tercero desde tu remitente. Tu copia interna
     sí lo lleva completo. */
  const tema = cuentaEnlaces(temaCompleto) ? '' : temaCompleto
  const agregar = enlaceAgregarACalendario({
    titulo: 'Reunión con Nicolás Golott — Phoenix IA Method',
    inicio: revision.inicio,
    fin: revision.termino,
    detalle: `Reunión 1:1 por videollamada.${enlaceReunion ? `\nEnlace: ${enlaceReunion}` : ''}`,
    lugar: enlaceReunion || 'Videollamada',
  })

  const texto = `Hola, ${nombre.split(/\s+/)[0]},

Tu reunión quedó agendada para el ${cuando} (hora de Chile).

Es una reunión 1:1 por videollamada.${enlaceReunion ? `\n\nEnlace: ${enlaceReunion}` : '\n\nTe hago llegar el enlace antes de la reunión.'}
${tema ? `\nEsto fue lo que me contaste:\n"${tema}"\n` : ''}
Agrégala a tu calendario acá:
${agregar}

Si necesitas moverla o no puedes llegar, responde este correo.

Nos vemos,

Nicolás Golott
Phoenix IA Method

Política de privacidad: https://phoenixiamethod.cl/privacidad`

  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#120B07;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#120B07;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#071711;border:1px solid rgba(239,231,213,.14);">
  <tr><td style="padding:30px 32px 0;"><p style="margin:0;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.42em;color:#F26522;text-transform:uppercase;">Reunión confirmada</p></td></tr>
  <tr><td style="padding:20px 32px 0;"><p style="margin:0;font:400 26px/1.25 Georgia,serif;color:#F8F4F1;">Nos vemos el<br>${escapar(cuando)}.</p></td></tr>
  <tr><td style="padding:18px 32px 0;"><p style="margin:0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#D8C7BC;">Es una reunión 1:1 por videollamada, hora de Chile.</p></td></tr>
  ${
    enlaceReunion
      ? `<tr><td style="padding:22px 32px 0;"><a href="${escapar(enlaceReunion)}" style="display:inline-block;background:#F26522;color:#120B07;text-decoration:none;padding:16px 30px;font:400 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;">Entrar a la reunión</a></td></tr>`
      : `<tr><td style="padding:22px 32px 0;"><p style="margin:0;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#B39C90;">Te hago llegar el enlace de la videollamada antes de la reunión.</p></td></tr>`
  }
  ${
    tema
      ? `<tr><td style="padding:22px 32px 0;">
    <p style="margin:0 0 6px;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.2em;color:#B39C90;text-transform:uppercase;">Esto fue lo que me contaste</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td style="border-left:2px solid #F26522;padding:4px 0 4px 16px;">
        <p style="margin:0;font:italic 400 15px/1.6 Georgia,serif;color:#F8F4F1;">${escapar(tema).replace(/\n/g, '<br>')}</p>
      </td></tr></table>
  </td></tr>`
      : ''
  }
  <tr><td style="padding:18px 32px 0;"><a href="${escapar(agregar)}" style="font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#F26522;">Agregar a mi calendario →</a></td></tr>
  <tr><td style="padding:26px 32px 32px;"><p style="margin:0;padding-top:20px;border-top:1px solid rgba(248,244,241,.12);font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#B39C90;">¿Necesitas moverla? Responde este correo.<br><br>Nicolás Golott<br><span style="color:#FFC46B;">Phoenix IA Method</span><br><a href="https://phoenixiamethod.cl/privacidad" style="color:#F26522;">Política de privacidad</a></p></td></tr>
</table></td></tr></table></body></html>`

  await enviarCorreo({
    para: email,
    nombrePara: nombre,
    asunto: `Reunión confirmada — ${cuando}`,
    texto,
    html,
    // Este correo dice "¿Necesitas moverla? Responde este correo". Como el
    // remitente es el subdominio de Brevo, sin esto la respuesta no llegaría
    // a ninguna parte.
    responderA: { email: CORREO_NICOLAS, name: 'Nicolás Golott' },
  })

  const aviso = `Nueva reunión agendada desde la web

Cuándo:       ${cuando}
Quién:        ${nombre}
Correo:       ${email}
Presupuesto:  ${presupuesto || 'No indicado'}
${temaCompleto ? `\nQué quiere resolver:\n${temaCompleto}\n` : ''}
Ya está en tu calendario de clientes.${enlaceReunion ? `\nEnlace: ${enlaceReunion}` : '\n\nOJO: el evento no tiene enlace de videollamada. Agrégalo antes de la reunión.'}`

  await enviarCorreo({
    para: CORREO_NICOLAS,
    nombrePara: 'Nicolás',
    asunto: `Reunión agendada — ${nombre}`,
    texto: aviso,
    html: `<pre style="font:14px/1.6 monospace;color:#111;">${escapar(aviso)}</pre>`,
    responderA: { email, name: nombre },
  })
}

export default async function handler(req, res) {
  sinCache(res)
  if (aplicarCors(req, res, 'POST')) return

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  if (!vieneDeLaWeb(req)) {
    return fallo(res, 403, 'Reserva no permitida desde aquí.')
  }

  // Igual que en el formulario: por tamaño se descarta antes de convertir nada.
  if (cuerpoDemasiadoGrande(req)) {
    return fallo(res, 413, 'La reserva trae demasiado texto.')
  }

  let cuerpo
  try {
    cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}
  } catch {
    return fallo(res, 400, 'No pude leer la reserva.')
  }

  const malos = validarCampos(cuerpo, { nombre: 80, email: 254, tema: 2000, presupuesto: 80, inicio: 40, web: 200, sesion: 40 })
  if (malos.length) return fallo(res, 400, 'Revisa los datos de la reserva.', `campos raros: ${malos}`)

  const nombre = limpiarLinea(cuerpo.nombre, 80)
  const email = correoValido(cuerpo.email)
  const tema = limpiarTexto(cuerpo.tema, 1000)
  const presupuesto = limpiarLinea(cuerpo.presupuesto, 80)
  const inicioISO = limpiarLinea(cuerpo.inicio, 40)

  if (nombre.length < 2) return res.status(400).json({ ok: false, error: 'Falta tu nombre.' })
  if (!RE_EMAIL.test(email)) return res.status(400).json({ ok: false, error: 'Ese correo no es válido.' })
  if (!PRESUPUESTOS.has(String(cuerpo.presupuesto ?? '').trim())) return res.status(400).json({ ok: false, error: 'Elige un presupuesto de la lista.' })

  // Antes se le pasaba a Google cualquier cosa que llegara: una fecha ilegible
  // reventaba la función y devolvía el error interno como respuesta.
  if (!RE_ISO.test(inicioISO) || !Number.isFinite(new Date(inicioISO).getTime())) {
    return res.status(400).json({ ok: false, error: 'Ese horario no se entiende. Elige otro.' })
  }

  if (limpiarTexto(cuerpo.web, 10)) return res.status(200).json({ ok: true })

  // El tema queda escrito en la descripción del evento y en el correo interno:
  // no es un lugar para que un desconocido deje enlaces.
  if (cuentaEnlaces(tema) > MAX_ENLACES) {
    return res.status(400).json({ ok: false, error: 'Cuéntamelo con palabras, sin tantos enlaces.' })
  }

  const ip = ipDe(req)
  const permitido = await pasaLosCuposCompartidos([
    [`reservar:ip:${ip}`, ...CUPO_IP],
    [`reservar:mail:${email.toLowerCase()}`, ...CUPO_CORREO],
    ['reservar:total', ...CUPO_TOTAL],
  ])
  if (!permitido) {
    res.setHeader('Retry-After', '3600')
    return res
      .status(429)
      .json({ ok: false, error: 'Ya tienes una reunión pedida. Escríbeme si necesitas otra.' })
  }

  try {
    const margen = 3 * 3600000
    const ocupados = await tramosOcupados({
      desde: new Date(new Date(inicioISO).getTime() - margen).toISOString(),
      hasta: new Date(new Date(inicioISO).getTime() + margen).toISOString(),
    })

    const revision = esHuecoValido({ inicioISO, ocupados })
    if (!revision.ok) return res.status(409).json({ ok: false, error: revision.motivo })

    const evento = await crearEvento({
      resumen: `Phoenix · ${nombre}`,
      descripcion: [
        `Reunión 1:1 agendada desde phoenixiamethod.cl`,
        '',
        `Contacto: ${email}`,
        presupuesto ? `Presupuesto: ${presupuesto}` : '',
        tema ? `\nQué quiere resolver:\n${tema}` : '',
      ].join('\n'),
      inicioISO: new Date(revision.inicio).toISOString(),
      finISO: new Date(revision.termino).toISOString(),
    })

    const cuando = enPalabras(revision.inicio)
    // Solo se pasa adelante si es una dirección web de verdad: este valor
    // termina dentro de un href del correo y del enlace que ve el cliente.
    const bruto = evento.hangoutLink || evento.location || ''
    const enlaceReunion = esEnlaceSeguro(bruto) ? bruto : ''

    // El evento ya está en la agenda. Los correos son deseables, pero si Brevo
    // falla la reserva sigue siendo válida: no se le dice que no a la persona.
    await avisar({ nombre, email, tema, presupuesto, cuando, enlaceReunion, revision }).catch(() => {})
    await contarDesdeServidor(req, 'reserva_hecha')

    const sesion = RE_SESION.test(String(cuerpo.sesion || '')) ? String(cuerpo.sesion) : ''
    const ua = String(req.headers['user-agent'] || '')
    await registrarCliente({
      tipo: 'reserva',
      nombre,
      email,
      detalle: tema,
      presupuesto,
      sesion,
      ...lugar(req),
      equipo: equipoDe(ua),
      navegador: navegadorDe(ua),
      sistema: sistemaDe(ua),
    })

    return res.status(200).json({ ok: true, cuando, enlace: enlaceReunion })
  } catch (e) {
    // Los errores de Google traen el identificador del calendario y el correo de
    // la cuenta de servicio. Eso se queda en el registro, no en la respuesta.
    return fallo(res, 500, 'No pude agendar la reunión. Intenta con otro horario.', e.message)
  }
}
