import type { IconoServicio } from '../data/servicios'

/**
 * Los íconos de la lámina de servicios, redibujados a trazo.
 *
 * Toman el color del acento vía CSS, así que siguen al tema claro/oscuro y al
 * teñido de las fotos igual que el resto del sitio.
 */
const TRAZOS: Record<IconoServicio, JSX.Element> = {
  /* El diagnóstico: una lupa con un pulso adentro. Se mira el negocio y lo que
     se busca son los signos vitales, no un defecto estético. */
  lupa: (
    <>
      <circle cx="10.5" cy="10.5" r="6.8" />
      <path d="M15.4 15.4L21 21" />
      <path d="M7 10.8h1.7l1.2-2.6 1.6 4.4 1-1.8h1.4" />
    </>
  ),
  ia: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="1.6" />
      <path d="M9 2v3M12 2v3M15 2v3M9 19v3M12 19v3M15 19v3M2 9h3M2 12h3M2 15h3M19 9h3M19 12h3M19 15h3" />
      <path d="M8.4 15l1.8-6 1.8 6M9 13.2h2.4M15 9v6" />
    </>
  ),
  web: <path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4.5l-4 15" />,
  video: (
    <>
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M10 8.2v5.6l4.8-2.8z" />
    </>
  ),
  megafono: (
    <>
      <path d="M3 9.5v5h3.5L14 19V5L6.5 9.5z" />
      <path d="M6.5 14.5L8 20h2.6l-1-5.5" />
      <path d="M17.5 9a4 4 0 0 1 0 6M19.8 6.8a7 7 0 0 1 0 10.4" />
    </>
  ),
  barras: (
    <>
      <path d="M3 20.5h18" />
      <path d="M5 20.5V14h3v6.5M10.5 20.5V10h3v10.5M16 20.5V6h3v14.5" />
      <path d="M4 10l5-4 3 2 6-5M15 3h3v3" />
    </>
  ),
  paleta: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.8 1.8-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4c0-4.4-4-8-9-8z" />
      <circle cx="7.5" cy="11.5" r="1.1" />
      <circle cx="10" cy="7.3" r="1.1" />
      <circle cx="14.7" cy="7.3" r="1.1" />
    </>
  ),
  carro: (
    <>
      <path d="M2 4h3l2.4 10.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.8L20.5 8H6" />
      <circle cx="9" cy="19" r="1.5" />
      <circle cx="17" cy="19" r="1.5" />
    </>
  ),
  personas: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="16.5" cy="9" r="2.5" />
      <path d="M16.2 14.5c2.8.2 4.8 2.2 4.8 5.5" />
    </>
  ),
  engranaje: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" />
    </>
  ),
  /* El CRM: la ficha de un cliente. No un embudo —un embudo dice "ventas" y
     este servicio se trata de que cada persona tenga su historia guardada. */
  fichero: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="8.8" cy="10" r="2.3" />
      <path d="M5.5 16.4c.6-1.8 1.8-2.8 3.3-2.8s2.7 1 3.3 2.8" />
      <path d="M14.5 9h4M14.5 12.2h4M14.5 15.4h2.4" />
    </>
  ),
  asesor: (
    <>
      <circle cx="10" cy="8" r="4" />
      <path d="M2.5 21c0-4.2 3.4-7 7.5-7 1.6 0 3 .4 4.2 1.1" />
      <path d="M15 19.5l2.2 2L21.5 17" />
    </>
  ),
  cohete: (
    <>
      <path d="M9.5 14.5l-3-3C8 7.5 11.5 3.5 20.5 3.5c0 9-4 12.5-8 14z" />
      <circle cx="15" cy="9" r="1.7" />
      <path d="M7 11.5H3.5L6.5 8H11M12.5 17v3.5L16 17.5V13" />
      <path d="M6 15.5c-1.6 1-2.5 3-2.5 5 2 0 4-.9 5-2.5" />
    </>
  ),
  cerebro: (
    <>
      <path d="M11 5.2A3 3 0 0 0 6 6.8a3 3 0 0 0-2 5.2 3 3 0 0 0 2 5.2 3 3 0 0 0 5 1.6z" />
      <path d="M13 5.2a3 3 0 0 1 5 1.6 3 3 0 0 1 2 5.2 3 3 0 0 1-2 5.2 3 3 0 0 1-5 1.6z" />
      <path d="M7.5 10.5h2M14.5 13.5h2M8 14.5l1.5-1M16 9.5l-1.5 1" />
    </>
  ),
}

export function ServicioIcono({ nombre }: { nombre: IconoServicio }) {
  return (
    <svg className="srv-icono" viewBox="0 0 24 24" aria-hidden="true">
      {TRAZOS[nombre]}
    </svg>
  )
}
