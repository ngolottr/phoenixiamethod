/* Los tipos de `_precios.js`, para que el sitio pueda importarlo.
   El archivo de verdad es el .js, porque el servidor no lee TypeScript; esto
   solo describe su forma. Si se agrega un paquete allá, se agrega acá. */

export declare const PARTE_ANTICIPO: number

export declare const PRECIOS: Record<
  'diagnostico' | 'sitio' | 'tienda' | 'automatizacion' | 'acompanamiento',
  { nombre: string; total: number; cobra: 'completo' | 'anticipo' }
>

export declare function anticipoDe(total: number): number

export declare function cobroDe(
  id: string,
): { id: string; monto: number; concepto: string; nombre: string; total: number; cobra: string } | null
