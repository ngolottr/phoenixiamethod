/* ===========================================================================
   Extracción del color dominante de una fotografía.

   No hay colores escritos a mano en ninguna parte: el sitio muestrea la imagen
   real en un canvas y deriva de ahí toda la paleta ambiente. Así, cualquier
   foto nueva que se agregue funciona sola.
   =========================================================================== */

export type Ambient = {
  /** fondo profundo teñido con el color de la foto */
  bg: string
  /** un paso más claro, para superficies */
  bg2: string
  /** color vivo para acentos, bordes y foco */
  accent: string
  /** halo translúcido */
  glow: string
  /** color legible sobre el fondo */
  ink: string
  hue: number
  sat: number
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h: number
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h * 360, s, l]
}

const HUE_BUCKETS = 24

/**
 * Muestrea la imagen y devuelve la paleta ambiente.
 * Descarta los píxeles casi negros y casi blancos, y pondera cada uno por su
 * saturación y por lo cerca que esté de una luminancia media: así gana el color
 * que de verdad "manda" en la foto y no el fondo apagado.
 */
export function ambientFromImage(img: HTMLImageElement): Ambient {
  const SIZE = 64
  const canvas = document.createElement('canvas')
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return neutralAmbient(160)

  ctx.drawImage(img, 0, 0, SIZE, SIZE)

  let data: Uint8ClampedArray
  try {
    data = ctx.getImageData(0, 0, SIZE, SIZE).data
  } catch {
    // canvas contaminado (imagen de otro origen): no se puede leer
    return neutralAmbient(160)
  }

  const weight = new Float64Array(HUE_BUCKETS + 1) // el último es el cubo neutro
  const vx = new Float64Array(HUE_BUCKETS + 1)
  const vy = new Float64Array(HUE_BUCKETS + 1)
  const satSum = new Float64Array(HUE_BUCKETS + 1)
  const ligSum = new Float64Array(HUE_BUCKETS + 1)

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2])
    if (l < 0.08 || l > 0.95) continue

    // los píxeles vivos y de luminancia media pesan mucho más
    const midness = 1 - Math.abs(l - 0.5) * 2
    const w = (0.12 + s * 1.6) * (0.35 + 0.65 * midness)
    const bucket = s < 0.10 ? HUE_BUCKETS : Math.floor((h / 360) * HUE_BUCKETS) % HUE_BUCKETS

    weight[bucket] += w
    const rad = (h * Math.PI) / 180
    vx[bucket] += Math.cos(rad) * w
    vy[bucket] += Math.sin(rad) * w
    satSum[bucket] += s * w
    ligSum[bucket] += l * w
  }

  let best = 0
  for (let i = 1; i <= HUE_BUCKETS; i++) if (weight[i] > weight[best]) best = i
  if (weight[best] <= 0) return neutralAmbient(160)

  let hue = (Math.atan2(vy[best], vx[best]) * 180) / Math.PI
  if (hue < 0) hue += 360
  const sat = satSum[best] / weight[best]

  // Fotografía en blanco y negro o casi: se conserva el matiz apenas insinuado
  if (best === HUE_BUCKETS || sat < 0.12) return neutralAmbient(hue)

  return buildAmbient(hue, sat)
}

function buildAmbient(hue: number, sat: number): Ambient {
  const h = Math.round(hue)
  const bgSat = Math.round(Math.min(sat, 0.62) * 100)
  const accSat = Math.round(Math.max(Math.min(sat * 1.25, 0.92), 0.5) * 100)
  return {
    bg: `hsl(${h} ${bgSat}% 7%)`,
    bg2: `hsl(${h} ${Math.round(bgSat * 0.9)}% 14%)`,
    accent: `hsl(${h} ${accSat}% 63%)`,
    glow: `hsl(${h} ${accSat}% 48% / 0.28)`,
    ink: `hsl(${h} 22% 93%)`,
    hue: h,
    sat,
  }
}

function neutralAmbient(hue: number): Ambient {
  const h = Math.round(hue)
  return {
    bg: `hsl(${h} 8% 7%)`,
    bg2: `hsl(${h} 7% 14%)`,
    accent: `hsl(${h} 10% 78%)`,
    glow: `hsl(${h} 10% 60% / 0.20)`,
    ink: `hsl(${h} 6% 94%)`,
    hue: h,
    sat: 0.08,
  }
}

const cache = new Map<string, Ambient>()

/** Carga la imagen (o la toma de caché) y devuelve su paleta ambiente. */
export function ambientFromSrc(src: string): Promise<Ambient> {
  const hit = cache.get(src)
  if (hit) return Promise.resolve(hit)

  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      const amb = ambientFromImage(img)
      cache.set(src, amb)
      resolve(amb)
    }
    img.onerror = () => resolve(neutralAmbient(160))
    img.src = src
  })
}
