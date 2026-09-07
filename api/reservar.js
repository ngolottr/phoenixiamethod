/* ============================================================================
   RESERVAR UN HORARIO
   El cliente elige una hora en la página y esto la convierte en un evento real
   del calendario, con la invitación enviada a su correo.

   Se vuelve a comprobar que el hueco siga libre: entre que la página cargó y
   la persona eligió pueden haber pasado minutos, y alguien más pudo tomarlo.
   ========================================================================== */

import { tramosOcupados, crearEvento } from './_google.js'
import { esHuecoValido, DURACION_MIN, partesEnChile } from './_agenda.js'
import { enviarCorreo, escapar, enlaceAgregarACalendario } from './_correo.js'

export const config = { maxDuration: 20 }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i
const limpiar = (v, max) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max)

const DIAS_LARGO = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function enPalabras(inicio) {
  const p = partesEnChile(new Date(inicio))
  const hora = `${String(p.hora).padStart(2, '0')}:${String(p.minuto).padStart(2, '0')}`
  return `${DIAS_LARGO[p.diaSemana]} ${p.dia} de ${MESES[p.mes - 1]}, ${hora} h`
}

/** Confirma al cliente y avisa a Nicolás. */
async function avisar({ nombre, email, tema, cuando, enlaceReunion, revision }) {
  const agregar = enlaceAgregarACalendario({
    titulo: 'Reunión con Nicolás Golott — NeuraIA',
    inicio: revision.inicio,
    fin: revision.termino,
    detalle: `Reunión de ${DURACION_MIN} minutos.${enlaceReunion ? `\nEnlace: ${enlaceReunion}` : ''}`,
    lugar: enlaceReunion || 'Videollamada',
  })

  const texto = `Hola, ${nombre.split(/\s+/)[0]},

Tu reunión quedó agendada para el ${cuando} (hora de Chile).

Son 30 minutos por videollamada.${enlaceReunion ? `\n\nEnlace: ${enlaceReunion}` : '\n\nTe hago llegar el enlace antes de la reunión.'}

Agrégala a tu calendario acá:
${agregar}

Si necesitas moverla o no puedes llegar, responde este correo.

Nos vemos,

Nicolás Golott
NeuraIA`

  const html = `<!doctype html><html lang="es"><body style="margin:0;padding:0;background:#040D0A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#040D0A;padding:32px 16px;"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#071711;border:1px solid rgba(239,231,213,.14);">
  <tr><td style="padding:30px 32px 0;"><p style="margin:0;font:400 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.42em;color:#2BE58F;text-transform:uppercase;">Reunión confirmada</p></td></tr>
  <tr><td style="padding:20px 32px 0;"><p style="margin:0;font:400 26px/1.25 Georgia,serif;color:#EFE7D5;">Nos vemos el<br>${escapar(cuando)}.</p></td></tr>
  <tr><td style="padding:18px 32px 0;"><p style="margin:0;font:400 15px/1.7 Helvetica,Arial,sans-serif;color:#B9C9C0;">Son 30 minutos por videollamada, hora de Chile.</p></td></tr>
  ${
    enlaceReunion
      ? `<tr><td style="padding:22px 32px 0;"><a href="${escapar(enlaceReunion)}" style="display:inline-block;background:#2BE58F;color:#040D0A;text-decoration:none;padding:16px 30px;font:400 12px/1 Helvetica,Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;">Entrar a la reunión</a></td></tr>`
      : `<tr><td style="padding:22px 32px 0;"><p style="margin:0;font:400 14px/1.6 Helvetica,Arial,sans-serif;color:#8FA79B;">Te hago llegar el enlace de la videollamada antes de la reunión.</p></td></tr>`
  }
  <tr><td style="padding:18px 32px 0;"><a href="${escapar(agregar)}" style="font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#2BE58F;">Agregar a mi calendario →</a></td></tr>
  <tr><td style="padding:26px 32px 32px;"><p style="margin:0;padding-top:20px;border-top:1px solid rgba(239,231,213,.12);font:400 13px/1.6 Helvetica,Arial,sans-serif;color:#8FA79B;">¿Necesitas moverla? Responde este correo.<br><br>Nicolás Golott<br><span style="color:#C8A05A;">NeuraIA</span></p></td></tr>
</table></td></tr></table></body></html>`

  await enviarCorreo({
    para: email,
    nombrePara: nombre,
    asunto: `Reunión confirmada — ${cuando}`,
    texto,
    html,
  })

  const aviso = `Nueva reunión agendada desde la web

Cuándo:   ${cuando}
Quién:    ${nombre}
Correo:   ${email}
${tema ? `\nQué quiere resolver:\n${tema}\n` : ''}
Ya está en tu calendario NeuraIA · Clientes.${enlaceReunion ? `\nEnlace: ${enlaceReunion}` : '\n\nOJO: el evento no tiene enlace de videollamada. Agrégalo antes de la reunión.'}`

  await enviarCorreo({
    para: process.env.CONTACTO_EMAIL || 'contacto.nicolaspk@gmail.com',
    nombrePara: 'Nicolás',
    asunto: `Reunión agendada — ${nombre}`,
    texto: aviso,
    html: `<pre style="font:14px/1.6 monospace;color:#111;">${escapar(aviso)}</pre>`,
    responderA: { email, name: nombre },
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Método no permitido' })
  }

  const cuerpo = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

  const nombre = limpiar(cuerpo.nombre, 80)
  const email = limpiar(cuerpo.email, 160)
  const tema = limpiar(cuerpo.tema, 1000)
  const inicioISO = limpiar(cuerpo.inicio, 40)

  if (nombre.length < 2) return res.status(400).json({ ok: false, error: 'Falta tu nombre.' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ ok: false, error: 'Ese correo no es válido.' })
  if (limpiar(cuerpo.web, 10)) return res.status(200).json({ ok: true })

  try {
    const margen = 3 * 3600000
    const ocupados = await tramosOcupados({
      desde: new Date(new Date(inicioISO).getTime() - margen).toISOString(),
      hasta: new Date(new Date(inicioISO).getTime() + margen).toISOString(),
    })

    const revision = esHuecoValido({ inicioISO, ocupados })
    if (!revision.ok) return res.status(409).json({ ok: false, error: revision.motivo })

    const evento = await crearEvento({
      resumen: `NeuraIA · ${nombre}`,
      descripcion: [
        `Reunión de ${DURACION_MIN} minutos agendada desde elgolott.vercel.app`,
        '',
        `Contacto: ${email}`,
        tema ? `\nQué quiere resolver:\n${tema}` : '',
      ].join('\n'),
      inicioISO: new Date(revision.inicio).toISOString(),
      finISO: new Date(revision.termino).toISOString(),
    })

    const cuando = enPalabras(revision.inicio)
    const enlaceReunion = evento.hangoutLink || evento.location || ''

    // El evento ya está en la agenda. Los correos son deseables, pero si Brevo
    // falla la reserva sigue siendo válida: no se le dice que no a la persona.
    await avisar({ nombre, email, tema, cuando, enlaceReunion, revision }).catch(() => {})

    return res.status(200).json({ ok: true, cuando, enlace: enlaceReunion })
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message })
  }
}
