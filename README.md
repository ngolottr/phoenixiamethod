# ELGOLOTT — Portfolio "La Cámara"

Portfolio de marca personal en React + Vite + TypeScript. Sin scroll: siete
escenas a pantalla completa que se recorren con botones, flechas y teclado.

---

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre `http://localhost:5173`.

Otros comandos:

| Comando | Qué hace |
|---|---|
| `npm run build` | Revisa tipos y genera `dist/` listo para publicar |
| `npm run preview` | Sirve el `dist/` ya construido |
| `npm run typecheck` | Solo la revisión de tipos |

---

## Qué editar

**Todo el contenido vive en un solo archivo: `src/data/site.ts`.** Nombre, rol,
frase, email, redes, proyectos, versos del manifiesto y rutas de imágenes. No
hay que tocar componentes para cambiar textos.

**Las fotos van en `public/images/`** con los nombres que indica
`public/images/LEEME.md`. Mientras falte una, esa ranura dibuja por CSS la
atmósfera de la foto original y muestra en pequeño el nombre del archivo que
espera — así el sitio nunca se ve roto.

---

## El concepto: LA CÁMARA

La fotografía de referencia manda: una figura sola, de pie, dentro de un pasillo
de piedra atravesado por luz esmeralda que viene de atrás. Contraluz duro,
sombras negras absolutas, azul medianoche en el cuerpo, latón en los bordes.

El sitio no se comporta como una página, sino como ese pasillo. Cada sección es
una sala en la que se entra, no un bloque por el que se pasa scrolleando. De ahí
salen las tres decisiones estructurales:

- **Sin scroll.** Se avanza, no se desliza. La navegación por escenas obliga a
  componer cada pantalla como un plano cerrado, con un solo foco.
- **Cortina de luz.** Entre escena y escena barre lateralmente una cortina
  verde en cuatro franjas desfasadas: el corte queda escondido detrás del
  barrido, como en un montaje de cine.
- **Atmósfera constante.** Grano analógico, viñeta profunda y un halo esmeralda
  que respira detrás del contenido, siempre presentes. Es la iluminación de la
  sala, no un efecto decorativo.
- **La gota.** Cada pulsación deja ondas: tres anillos concéntricos que nacen
  del punto exacto del clic con retardo creciente, más un destello que marca el
  impacto. Se dibujan por debajo del grano para que la textura los cubra y
  parezcan parte de la escena, no un elemento pegado encima.

## La paleta

Seis colores muestreados directamente de la fotografía:

| HEX | Nombre | De dónde sale | Para qué |
|---|---|---|---|
| `#040D0A` | Negro Cripta | sombras del piso y las paredes | fondo, sombra absoluta |
| `#0C2B1F` | Verde Sepulcro | piedra en medios tonos | superficies, profundidad |
| `#2BE58F` | Verde Veneno | la luz esmeralda del fondo | acento primario, foco, hover |
| `#1A2035` | Azul Medianoche | la camisa | paneles y superficies frías |
| `#C8A05A` | Latón Antorcha | los mangos dorados de las antorchas | detalle fino, cifras, numeración |
| `#EFE7D5` | Hueso | el beige de las zapatillas | tipografía y apoyos |

La regla de uso: el verde veneno **nunca** rellena áreas grandes, solo marca lo
vivo (un hover, un foco, una palabra del manifiesto). El latón aparece en dosis
mínimas. Todo lo demás es negro y hueso.

## La tipografía

- **Titulares — serif de alto contraste.** Didot / Bodoni MT / Playfair Display,
  con Georgia como respaldo. Es la voz que grita: tamaño grande, interlineado
  cerrado (0.84), tracking negativo. La cursiva se reserva para la palabra
  acentuada, siempre en verde veneno.
- **Interfaz — sans neo-grotesca.** Neue Haas Grotesk / Inter / Helvetica, con
  la pila del sistema como respaldo. Es la voz que instruye: siempre en
  mayúsculas, cuerpo pequeño y tracking muy abierto (0.3em).

Las dos nunca se mezclan en la misma línea. No se descarga ninguna fuente de un
servidor externo. Si quieres las tipografías exactas en vez de las del sistema:

```bash
npm i @fontsource/playfair-display @fontsource/inter
```

e impórtalas en `src/main.tsx`, añadiéndolas al principio de `--serif` y
`--sans` en `src/styles/global.css`.

---

## Estructura

```
08_Web/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── images/            ← tus fotos van aquí (ver LEEME.md)
├── mockup/
│   └── index.html         ← storyboard de dirección de arte (abrir en el navegador)
└── src/
    ├── main.tsx
    ├── App.tsx            ← ensamblado, atajos de teclado, cambio de escena
    ├── data/site.ts       ← TODO EL CONTENIDO EDITABLE
    ├── styles/global.css  ← paleta, tipografía y sistema visual completo
    ├── hooks/
    │   ├── usePreferences.ts   ← reducir movimiento, cursor, altura real en móvil
    │   ├── useSceneRouter.ts   ← navegación por estado + sincronía con la URL
    │   └── useCopy.ts          ← copiar al portapapeles con respaldo
    ├── components/
    │   ├── Atmosphere.tsx      ← grano, viñeta, halo y cortina de transición
    │   ├── Cursor.tsx          ← cursor personalizado
    │   ├── Intro.tsx           ← telón de apertura
    │   ├── Lightbox.tsx        ← visor de galería (portal, foco atrapado)
    │   ├── MagneticButton.tsx  ← botón que responde al cursor
    │   ├── Nav.tsx             ← menú, flechas e indicador de escena
    │   ├── Ripples.tsx         ← ondas de agua al pulsar
    │   └── SmartImage.tsx      ← imagen con respaldo procedural
    └── scenes/
        ├── Home.tsx        01 · Inicio
        ├── About.tsx       02 · Sobre mí
        ├── Gallery.tsx     03 · Galería
        ├── Work.tsx        04 · Proyectos y servicios
        ├── Manifesto.tsx   05 · Manifiesto
        ├── Contact.tsx     06 · Contacto
        └── Social.tsx      07 · Redes
```

---

## Navegación

| Acción | Cómo |
|---|---|
| Cambiar de escena | Botones del menú, flechas ← → de la barra inferior, teclas ← → |
| Ir a una escena directa | Teclas `1` a `7` |
| Volver al inicio | Tecla `Esc` o el logotipo |
| Primera / última escena | `Inicio` / `Fin` |
| Abrir una foto | Clic, o `Tab` + `Enter` |
| Dentro del visor | ← → cambian de foto, `Esc` cierra |

La URL se sincroniza con la escena (`#galeria`, `#contacto`…), así que se puede
compartir un enlace directo a una sección y el botón atrás del navegador funciona.

## Accesibilidad

- Enlace "ir al contenido", foco visible en verde en todo elemento interactivo.
- Anuncios con `aria-live` al cambiar de escena, de foto y al copiar el email.
- El visor de galería es un `dialog` modal: atrapa el foco mientras está abierto
  y lo devuelve al botón de origen al cerrarse; la navegación se retira para no
  competir con él.
- Formulario con `aria-invalid`, errores asociados por `aria-describedby` y
  `role="alert"`.
- **Reducir movimiento:** se respeta `prefers-reduced-motion` del sistema como
  valor inicial y hay un interruptor propio en la barra superior. Con él
  activado desaparecen la cortina, el telón, las ondas al pulsar, el imán de los
  botones y todas las animaciones de entrada; el sitio queda completamente
  estático y usable.

## Notas técnicas

- **Sin dependencias más allá de React.** Ninguna librería de animación ni de
  rutas: las transiciones son CSS y la navegación es estado.
- **Sin llamadas externas.** Ni fuentes, ni APIs, ni analíticas, ni claves.
- **Formulario local.** Valida en el navegador y, al confirmar, arma un `mailto:`
  con los datos. No hay backend ni se envía nada a ningún servidor.
- **Peso:** ~55 kB de JavaScript y ~6 kB de CSS comprimidos.
- **`base: './'`** en `vite.config.ts`: el `dist/` funciona tal cual en Netlify,
  Vercel, GitHub Pages o abierto desde una carpeta.

## Seguridad

Las funciones de `api/` están abiertas a internet y hacen cosas que cuestan
dinero o reputación: mandan correo con el remitente de Nicolás y escriben en su
Google Calendar. Todo lo que hay en `api/_seguridad.js` existe por eso.

**Qué protege qué**

| Riesgo | Defensa |
|---|---|
| Usar el formulario para mandar phishing a terceros desde una dirección con buena reputación | Tope de enlaces en el mensaje (`MAX_ENLACES`), cupo por correo y cupo global diario |
| Vaciar los 300 envíos diarios de Brevo | Cupos por IP, por correo y global en `api/contacto.js` |
| Llenar la agenda de reuniones falsas | Cupos en `api/reservar.js` + validación estricta del horario |
| Inyección de cabeceras de correo (colar destinatarios ocultos con un salto de línea en el nombre) | `limpiarLinea()` en todo lo que va a un asunto o a un remitente |
| Que un error de Google delate el identificador del calendario o la cuenta de servicio | `fallo()`: el detalle va al registro de Vercel, nunca a la respuesta |
| XSS en la página de reserva | Escapado en todo lo que entra por `innerHTML` + `Content-Security-Policy` |
| Que la web sea incrustada en otro sitio para engañar a alguien | `frame-ancestors 'none'` y `X-Frame-Options: DENY` |
| Que la llave de publicación quede escrita en registros e historial | `api/publicar.js` solo acepta la cabecera `Authorization`, y compara en tiempo constante |

**Los cupos, en números**

- Contacto: 3 por IP cada 15 minutos, 2 al día por dirección, 40 al día en total.
- Reserva: 4 por IP cada hora, 2 al día por dirección, 25 al día en total.
- Disponibilidad: 40 por IP cada 5 minutos.

**Lo que estos cupos NO son.** Viven en la memoria de la función. Una función sin
servidor puede arrancar en varias máquinas a la vez y reiniciarse cuando quiera,
así que frenan el abuso corriente —un bot repitiendo el formulario— pero no a
alguien decidido repartiendo la carga entre muchas IP. Para eso está el firewall
de Vercel, que es una casilla en el panel:

- [ ] Vercel → proyecto `elgolott` → **Firewall** → **Rate Limiting**: una regla
      sobre `/api/*` de unas 20 peticiones por minuto por IP.
- [ ] Vercel → **Firewall** → activar **Attack Challenge Mode** si alguna vez ves
      tráfico raro en los registros.

**Mantención**

- [ ] Rotar `BREVO_API_KEY` y `CRON_SECRET` si alguna vez se pegan en un chat, en
      una captura o en un correo.
- [ ] Mantener la restricción de IP de Brevo desactivada solo mientras haga falta;
      si Brevo vuelve a ofrecer una lista de IP fijas de Vercel, activarla.
- [ ] La clave privada de la cuenta de servicio de Google vive **solo** en las
      variables de entorno de Vercel. Nunca en el repositorio, nunca en un chat.
- [ ] Si el calendario deja de funcionar, revisar en Google Cloud que la cuenta de
      servicio siga teniendo solo el permiso sobre el calendario de clientes y
      nada más.

Para disparar la publicación a mano:

```bash
curl -X POST -H "Authorization: Bearer TU_CRON_SECRET" https://elgolott.vercel.app/api/publicar
```

## Un aviso sobre OneDrive

Esta carpeta está dentro de OneDrive. `node_modules` tiene miles de archivos
pequeños y sincronizarlo hace lento el equipo. Está excluido en `.gitignore`,
pero OneDrive no lee ese archivo: conviene marcar `08_Web/node_modules` como
"disponible solo en línea" o mover el proyecto fuera de OneDrive si notas que la
sincronización se pone pesada.
