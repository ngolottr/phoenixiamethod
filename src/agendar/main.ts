/* ============================================================================
   PÁGINA DE RESERVA
   El cliente llega acá desde el correo, ve los horarios que de verdad están
   libres y elige uno. Al confirmar, el evento queda en el calendario y le llega
   la invitación.

   Va sin React a propósito: es una sola pantalla y así carga en un parpadeo,
   incluso con datos móviles malos.
   ========================================================================== */

import '../styles/global.css'
import './agendar.css'

type Hora = { inicio: string; fin: string; etiqueta: string }
type Dia = { fecha: string; diaSemana: number; horas: Hora[] }

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
const MESES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

const raiz = document.getElementById('agenda')!
const params = new URLSearchParams(location.search)

const estado = {
  dias: [] as Dia[],
  diaActivo: 0,
  elegida: null as Hora | null,
  enviando: false,
}

const escapar = (t: string) =>
  String(t ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

/**
 * Un enlace que se va a poner en un href tiene que ser una dirección web.
 * Escapar no basta: "javascript:…" no lleva ni comillas ni signos raros y
 * escrito en un href se ejecuta igual.
 */
const enlaceSeguro = (url: unknown) => {
  try {
    return ['https:', 'http:'].includes(new URL(String(url)).protocol) ? String(url) : ''
  } catch {
    return ''
  }
}

function tituloDia(d: Dia) {
  const [, m, dia] = d.fecha.split('-').map(Number)
  return { nombre: DIAS[d.diaSemana], numero: `${dia} ${MESES[m - 1].slice(0, 3)}` }
}

/* --- Pantallas ------------------------------------------------------------ */

function pintarCargando() {
  raiz.innerHTML = `
    <main class="ag">
      <p class="eyebrow">PHOENIX IA METHOD</p>
      <h1 class="display h-md ag-title">Buscando horas
libres…</h1>
      <div class="ag-skeleton"></div>
    </main>`
}

function pintarError(msg: string) {
  raiz.innerHTML = `
    <main class="ag">
      <p class="eyebrow brass">Algo falló</p>
      <h1 class="display h-md ag-title">No pude cargar
la agenda.</h1>
      <p class="body">${escapar(msg)}</p>
      <p class="body" style="margin-top:14px">
        Escríbeme directo a <a class="ag-link" href="mailto:contacto.nicolaspk@gmail.com">contacto.nicolaspk@gmail.com</a>
        y lo coordinamos a mano.
      </p>
    </main>`
}

function pintarListo(cuando: string, enlaceCrudo: string) {
  const enlace = enlaceSeguro(enlaceCrudo)
  raiz.innerHTML = `
    <main class="ag">
      <p class="eyebrow">Reunión confirmada</p>
      <h1 class="display h-md ag-title">Nos vemos el
${escapar(cuando)}.</h1>
      <p class="body" style="margin-top:16px">
        Te llegó la invitación al correo. Ábrela y acéptala para que te quede en tu calendario.
      </p>
      ${enlace ? `<a class="btn solid ag-cta" href="${escapar(enlace)}" target="_blank" rel="noopener">Ver el enlace de la reunión →</a>` : ''}
      <p class="form-note" style="margin-top:22px">Si necesitas moverla, responde el correo y la cambiamos.</p>
    </main>`
}

function pintar() {
  const dia = estado.dias[estado.diaActivo]

  raiz.innerHTML = `
    <main class="ag">
      <p class="eyebrow">Agenda tu reunión</p>
      <h1 class="display h-md ag-title">Elige cuándo
conversamos.</h1>
      <p class="body ag-intro">30 minutos por videollamada. Los horarios están en hora de Chile y son los que tengo realmente libres.</p>

      <div class="ag-dias" role="tablist" aria-label="Días disponibles">
        ${estado.dias
          .map((d, i) => {
            const t = tituloDia(d)
            return `<button class="ag-dia" role="tab" aria-selected="${i === estado.diaActivo}" data-dia="${i}">
              <span class="ag-dia-n">${escapar(t.nombre)}</span>
              <span class="ag-dia-f">${escapar(t.numero)}</span>
              <span class="ag-dia-c">${d.horas.length | 0}</span>
            </button>`
          })
          .join('')}
      </div>

      <div class="ag-horas" role="group" aria-label="Horarios del día elegido">
        ${
          dia
            ? dia.horas
                .map(
                  (h) =>
                    `<button class="ag-hora${estado.elegida?.inicio === h.inicio ? ' on' : ''}" data-inicio="${escapar(h.inicio)}">${escapar(h.etiqueta)}</button>`,
                )
                .join('')
            : '<p class="body">No quedan horas libres en los próximos días.</p>'
        }
      </div>

      <form class="form ag-form" id="ag-form" ${estado.elegida ? '' : 'hidden'}>
        <p class="ag-elegida">Reunión el <strong>${
          estado.elegida ? escapar(resumenElegida()) : ''
        }</strong></p>

        <div class="field">
          <label for="ag-nombre">Tu nombre</label>
          <input id="ag-nombre" name="nombre" required value="${escapar(params.get('nombre') || '')}" placeholder="Cómo te llamas" autocomplete="name" />
        </div>

        <div class="field">
          <label for="ag-email">Tu correo</label>
          <input id="ag-email" name="email" type="email" required value="${escapar(params.get('email') || '')}" placeholder="tu@correo.com" autocomplete="email" />
        </div>

        <div class="field">
          <label for="ag-tema">Qué quieres resolver <span class="ag-opt">(opcional)</span></label>
          <textarea id="ag-tema" name="tema" placeholder="Así llego con contexto a la reunión"></textarea>
        </div>

        <input type="text" id="ag-web" class="sr-only" tabindex="-1" autocomplete="off" aria-hidden="true" />

        <div class="form-foot">
          <button type="submit" class="btn solid" ${estado.enviando ? 'disabled' : ''}>
            ${estado.enviando ? 'Confirmando…' : 'Confirmar reunión'} <span class="arrow">→</span>
          </button>
          <p class="field-error" id="ag-error" hidden></p>
        </div>
      </form>
    </main>`

  raiz.querySelectorAll<HTMLButtonElement>('.ag-dia').forEach((b) =>
    b.addEventListener('click', () => {
      estado.diaActivo = Number(b.dataset.dia)
      estado.elegida = null
      pintar()
    }),
  )

  raiz.querySelectorAll<HTMLButtonElement>('.ag-hora').forEach((b) =>
    b.addEventListener('click', () => {
      const dia = estado.dias[estado.diaActivo]
      estado.elegida = dia.horas.find((h) => h.inicio === b.dataset.inicio) || null
      pintar()
      document.getElementById('ag-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }),
  )

  document.getElementById('ag-form')?.addEventListener('submit', confirmar)
}

function resumenElegida() {
  const h = estado.elegida
  if (!h) return ''
  const d = estado.dias[estado.diaActivo]
  const t = tituloDia(d)
  return `${t.nombre} ${t.numero}, ${h.etiqueta} h`
}

/* --- Acciones ------------------------------------------------------------- */

async function confirmar(e: Event) {
  e.preventDefault()
  if (estado.enviando || !estado.elegida) return

  const nombre = (document.getElementById('ag-nombre') as HTMLInputElement).value.trim()
  const email = (document.getElementById('ag-email') as HTMLInputElement).value.trim()
  const tema = (document.getElementById('ag-tema') as HTMLTextAreaElement).value.trim()
  const web = (document.getElementById('ag-web') as HTMLInputElement).value
  const error = document.getElementById('ag-error') as HTMLParagraphElement

  if (nombre.length < 2 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
    error.textContent = 'Revisa tu nombre y tu correo.'
    error.hidden = false
    return
  }

  estado.enviando = true
  pintar()

  try {
    const r = await fetch('/api/reservar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, email, tema, web, inicio: estado.elegida.inicio }),
    })
    const datos = await r.json()

    if (!r.ok || !datos.ok) {
      estado.enviando = false
      pintar()
      const err = document.getElementById('ag-error') as HTMLParagraphElement
      err.textContent = datos.error || 'No se pudo confirmar. Intenta con otro horario.'
      err.hidden = false
      if (r.status === 409) cargar()
      return
    }

    pintarListo(datos.cuando, datos.enlace)
  } catch {
    estado.enviando = false
    pintar()
    const err = document.getElementById('ag-error') as HTMLParagraphElement
    err.textContent = 'Se cortó la conexión. Vuelve a intentar.'
    err.hidden = false
  }
}

async function cargar() {
  pintarCargando()
  try {
    const r = await fetch('/api/disponibilidad')
    const datos = await r.json()
    if (!r.ok || !datos.ok) return pintarError(datos.error || 'La agenda no respondió.')
    estado.dias = datos.dias
    estado.diaActivo = 0
    estado.elegida = null
    pintar()
  } catch (e) {
    pintarError((e as Error).message)
  }
}

cargar()
