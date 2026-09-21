/* ============================================================================
   EL RUT
   ----------------------------------------------------------------------------
   Validarlo de verdad, no solo mirar que tenga la forma. El dígito verificador
   existe justamente para que un número mal tecleado se note al instante, y un
   RUT equivocado en una boleta de honorarios no es un detalle cosmético: es un
   documento tributario emitido a nombre de otra persona, y corregirlo después
   significa anular y volver a emitir.
   ========================================================================== */

/** Saca puntos, guiones y espacios, y deja la K en mayúscula. */
export function limpiarRut(valor) {
  return String(valor || '')
    .replace(/[^0-9kK]/g, '')
    .toUpperCase()
}

/**
 * El dígito verificador que le corresponde a un número, por módulo 11.
 *
 * Se recorre el número de derecha a izquierda multiplicando por la serie
 * 2,3,4,5,6,7 que se repite; el resto de la división por 11 da el dígito.
 */
function digitoDe(cuerpo) {
  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const resto = 11 - (suma % 11)
  if (resto === 11) return '0'
  if (resto === 10) return 'K'
  return String(resto)
}

/** ¿Es un RUT real? Forma correcta y dígito verificador que calza. */
export function rutValido(valor) {
  const limpio = limpiarRut(valor)
  if (limpio.length < 8 || limpio.length > 9) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  if (!/^\d+$/.test(cuerpo)) return false
  return digitoDe(cuerpo) === dv
}

/** 12.345.678-9, que es como lo lee una persona. */
export function formatearRut(valor) {
  const limpio = limpiarRut(valor)
  if (limpio.length < 2) return limpio
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  return `${cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}-${dv}`
}
