/* ============================================================================
   EL ISOTIPO DE PHOENIX IA METHOD

   Los trazados son exactamente los del archivo de identidad guardado en
   Neurona (02_Fenix_IA_Method/Identidad/creacion de marca/isotipo.svg). No se
   redibujaron ni se "mejoraron": si la marca cambia, se cambia allá y se copia
   acá, no al revés.

   Lo único que se añadió es el comportamiento. Va como componente y no como
   <img src="isotipo.svg"> por tres razones concretas:

   · no cuesta una petición más ni puede llegar tarde a la primera pantalla;
   · el degradado sale de los tokens de la marca, así que en modo claro se
     apaga solo en vez de quedar fosforescente sobre papel;
   · las tres lenguas de fuego pueden respirar por separado, que es lo que
     hace que se lea como llama y no como un triángulo naranjo.

   El único identificador interno es el del degradado. Se repite si hay varios
   isotipos en pantalla, y da igual: todos quieren pintar con el mismo.
   ========================================================================== */

export function Isotipo({
  className,
  /** el emblema es decorativo salvo que se le dé un nombre */
  titulo,
}: {
  className?: string
  titulo?: string
}) {
  return (
    <svg
      className={`isotipo${className ? ` ${className}` : ''}`}
      viewBox="0 0 100 100"
      role={titulo ? 'img' : undefined}
      aria-label={titulo}
      aria-hidden={titulo ? undefined : true}
    >
      <defs>
        <linearGradient id="isotipo-llama" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--llama-0)" />
          <stop offset="38%" stopColor="var(--llama-1)" />
          <stop offset="72%" stopColor="var(--llama-2)" />
          <stop offset="100%" stopColor="var(--llama-3)" />
        </linearGradient>
      </defs>

      {/* Las dos alas van detrás y desfasadas: cuando una sube, la otra baja.
          Con las tres piezas moviéndose a la vez el conjunto solo se agranda;
          desfasadas, arde. */}
      <path
        className="isotipo-ala isotipo-ala-i"
        d="M48 94 C 32 74 19 48 17 14 C 33 33 44 58 48 79 Z"
        fill="url(#isotipo-llama)"
        opacity="0.45"
      />
      <path
        className="isotipo-ala isotipo-ala-d"
        d="M52 94 C 68 74 81 48 83 14 C 67 33 56 58 52 79 Z"
        fill="url(#isotipo-llama)"
        opacity="0.72"
      />
      <path
        className="isotipo-nucleo"
        d="M50 26 C 60 46 63 58 59 70 C 55 80 51 86 50 98 C 49 86 45 80 41 70 C 37 58 40 46 50 26 Z"
        fill="url(#isotipo-llama)"
      />
    </svg>
  )
}
