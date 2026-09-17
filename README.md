# PHOENIX IA METHOD — sitio

Sitio del negocio en React + Vite + TypeScript. Sin scroll: ocho escenas a
pantalla completa que se recorren con flechas y teclado.

**Dominio:** `phoenixiamethod.cl` desde el 16/09/2026, con los nameservers de
Vercel (`ns1/ns2.vercel-dns.com`). `www.phoenixiamethod.cl` y
`phoenixiamethod.vercel.app` redirigen ahí (ver `redirects` en `vercel.json`);
las rutas `/api/` del `.vercel.app` NO se redirigen, para no romper llamadas
automáticas que todavía usen esa dirección. Antes: `elgolott.vercel.app`.

---

## Las dos marcas

Esto no es un portafolio con una sección comercial pegada: son dos marcas en un
mismo recorrido, y casi todas las decisiones del proyecto salen de ahí.

| | Bloque **negocio** | Bloque **marketing** |
|---|---|---|
| Marca | **Phoenix IA Method** | **ElGolott** |
| Qué es | El negocio: IA y automatización aplicadas | La marca personal de Nicolás |
| Escenas | Inicio · Soluciones · Contacto · Método | Sobre mí · Redes · Galería · Destacados |
| Paleta | Brasa y fuego, del isotipo de la identidad | Esmeralda "La Cámara", extraída de una foto |
| Dónde se edita | Primera mitad de `src/data/site.ts` | Segunda mitad del mismo archivo |

Phoenix va primero **a propósito**: es lo primero que ve cualquiera que llegue.
La persona detrás se presenta después, cuando ya se sabe qué se ofrece.

El cambio de piel entre bloques se hace con **un solo atributo**: `App.tsx`
escribe `data-bloque` en `<html>` y `global.css` redefine los valores de los
mismos tokens. Ni un componente sabe en qué bloque está — por eso agregar una
escena a cualquiera de los dos lados no obliga a tocar nada más.

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

**Todo el contenido vive en un solo archivo: `src/data/site.ts`,** partido en
dos mitades bien marcadas. Arriba Phoenix —nombre, propósito, método, contacto—
y abajo ElGolott —quién está detrás, galería, historias, redes—. No hay que
tocar componentes para cambiar textos.

**Los casos van aparte, en `src/data/proyectos.ts`.** Regla de la marca: ahí solo
entra lo que ya se construyó y se puede comprobar. Un servicio que suena bien
pero todavía no se ha hecho no es un caso, es una promesa.

**Los servicios van en `src/data/servicios.ts`.** Son el mapa de lo que se sabe
hacer (sacado de la lámina "¿Qué es el Método Fénix con IA?") y se muestran en la
misma escena de Soluciones, en una vista aparte de los casos: botón *Servicios* /
*Casos reales*. Los íconos están dibujados a trazo en `components/ServicioIcono.tsx`.

**El isotipo está en `src/components/Isotipo.tsx`,** con los trazados copiados
tal cual del archivo de identidad
(`02_Fenix_IA_Method/Identidad/creacion de marca/isotipo.svg`). Si la marca
cambia, se cambia allá y se copia acá, nunca al revés.

**Las fotos van en `public/images/`** con los nombres que indica
`docs/LEEME-imagenes.md`. Mientras falte una, esa ranura dibuja por CSS la
atmósfera de la foto original y muestra en pequeño el nombre del archivo que
espera — así el sitio nunca se ve roto.

---

## El concepto

Hay dos, uno por bloque.

**Phoenix — LA BRASA.** El emblema de la identidad manda: una llama de tres
lenguas sobre un fondo de brasa apagada. Naranjo que sube desde el ladrillo
hasta el ámbar, y ni un solo color frío salvo el mínimo que sostiene el naranjo.
Es la piel del negocio: la portada, las soluciones, el método y el contacto.

**ElGolott — LA CÁMARA.** La fotografía de referencia manda: una figura sola, de
pie, dentro de un pasillo de piedra atravesado por luz esmeralda que viene de
atrás. Contraluz duro, sombras negras absolutas, azul medianoche en el cuerpo,
latón en los bordes.

Lo que sigue —el sin scroll, la cortina, la atmósfera, la gota— es común a los
dos: es la puesta en escena del sitio, no de una de las marcas.

El sitio no se comporta como una página, sino como una sucesión de salas. En
cada sección se entra; no es un bloque por el que se pasa scrolleando. De ahí
salen las cuatro decisiones estructurales:

- **Sin scroll.** Se avanza, no se desliza. La navegación por escenas obliga a
  componer cada pantalla como un plano cerrado, con un solo foco.
- **Cortina de luz.** Entre escena y escena barre lateralmente una cortina en
  cuatro franjas desfasadas, del color del acento en curso: el corte queda
  escondido detrás del barrido, como en un montaje de cine. Es también donde se
  esconde el cambio de piel al pasar de una marca a la otra.
- **Atmósfera constante.** Grano analógico, viñeta profunda y un halo que
  respira detrás del contenido, siempre presentes. Es la iluminación de la
  sala, no un efecto decorativo.
- **La gota.** Cada pulsación deja ondas: tres anillos concéntricos que nacen
  del punto exacto del clic con retardo creciente, más un destello que marca el
  impacto. Se dibujan por debajo del grano para que la textura los cubra y
  parezcan parte de la escena, no un elemento pegado encima.

## Las paletas

**Ambas usan los mismos nombres de token.** Lo que cambia son los valores, y los
cambia `data-bloque`. Por eso ningún componente lleva un color escrito a mano:
si lo llevara, se quedaría clavado en una de las dos marcas.

Phoenix — sale del degradado del isotipo, no de una foto:

| Token | Phoenix | De dónde sale | Para qué |
|---|---|---|---|
| `--brasa` | `#120B07` | brasa apagada | fondo y sombras |
| `--brasa-2` | `#1D120C` | un paso arriba | superficies |
| `--rescoldo` | `#3A1B0B` | el rescoldo con calor | medios tonos |
| `--fuego` | `#F26522` | el naranjo del isotipo | acento primario, foco, hover |
| `--noche` | `#241726` | el único frío del sistema | paneles fríos |
| `--ambar` | `#FFC46B` | la punta clara de la llama | detalle fino, cifras |
| `--arena` | `#F8F4F1` | el papel de la marca | tipografía |

ElGolott — los seis colores muestreados sobre la fotografía, punto por punto
(la medición está publicada en el caso 04 del sitio):

| Token | ElGolott | De dónde sale |
|---|---|---|
| `--brasa` | `#040D0A` | sombras del piso y las paredes |
| `--rescoldo` | `#0C2B1F` | piedra en medios tonos |
| `--fuego` | `#2BE58F` | la luz esmeralda del fondo |
| `--noche` | `#1A2035` | la camisa |
| `--ambar` | `#C8A05A` | los mangos dorados de las antorchas |
| `--arena` | `#EFE7D5` | el beige de las zapatillas |

La regla de uso es la misma en las dos: el acento **nunca** rellena áreas
grandes, solo marca lo vivo (un hover, un foco, una palabra del método). El
ámbar aparece en dosis mínimas. Todo lo demás es fondo y arena.

En modo claro no se dan vuelta los colores: el acento se apaga hasta contrastar
sobre papel (`#C2410C` en Phoenix, `#0B7346` en ElGolott) y la tipografía pasa
al ink de cada marca. Son cuatro combinaciones y las cuatro están definidas.

## La tipografía

- **Titulares — Cambria,** la serif de la identidad de Phoenix, con Bodoni MT y
  Georgia como respaldo. Es la voz que grita: tamaño grande, interlineado
  cerrado (0.84), tracking negativo. La cursiva se reserva para la palabra
  acentuada, siempre en el color del acento.
- **Interfaz — Calibri,** la sans de la identidad, con Segoe UI y la pila del
  sistema como respaldo. Es la voz que instruye: siempre en mayúsculas, cuerpo
  pequeño y tracking muy abierto (0.3em).

Las dos nunca se mezclan en la misma línea. **No se descarga ninguna fuente de
un servidor externo:** Cambria y Calibri vienen con Windows y con Office en Mac,
y quien no las tenga cae en el respaldo sin que el sitio se descomponga.

---

## Estructura

```
08_Web/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── public/
│   └── images/            ← tus fotos van aquí (ver docs/LEEME-imagenes.md)
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
    │   ├── Intro.tsx           ← telón de apertura, con el isotipo
    │   ├── Isotipo.tsx         ← el emblema de Phoenix, copiado de la identidad
    │   ├── Lightbox.tsx        ← visor de galería (portal, foco atrapado)
    │   ├── MagneticButton.tsx  ← botón que responde al cursor
    │   ├── Nav.tsx             ← firma, flechas e indicador de escena
    │   ├── Ripples.tsx         ← ondas de agua al pulsar
    │   └── SmartImage.tsx      ← imagen con respaldo procedural
    └── scenes/
        ├── Home.tsx        01 · Inicio        ┐
        ├── Work.tsx        02 · Soluciones    │ PHOENIX IA METHOD
        ├── Contact.tsx     03 · Contacto      │ (bloque negocio)
        ├── Manifesto.tsx   04 · Método        ┘
        ├── About.tsx       05 · Sobre mí      ┐
        ├── Social.tsx      06 · Redes         │ ELGOLOTT
        ├── Gallery.tsx     07 · Galería       │ (bloque marketing)
        └── Highlights.tsx  08 · Destacados    ┘
```

El orden de las escenas y a qué bloque pertenece cada una se decide en un solo
sitio: la lista `SCENES` de `src/hooks/useSceneRouter.ts`. Los identificadores
(`#trabajo`, `#manifiesto`…) **no cambian** aunque cambien las etiquetas: son lo
que va en la URL y lo que ya está compartido por ahí.

---

## Navegación

| Acción | Cómo |
|---|---|
| Cambiar de escena | Botones del menú, flechas ← → de la barra inferior, teclas ← → |
| Ir a una escena directa | Teclas `1` a `8` |
| Volver al inicio | Tecla `Esc` o la firma de la esquina |
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
- **Formulario conectado de verdad.** Valida en el navegador y envía a las
  funciones de `api/`: sale un correo por Brevo, llega la copia interna y la
  reserva escribe en Google Calendar. El `mailto:` quedó solo como salida de
  emergencia si la función no responde. (Esta línea decía lo contrario y llevaba
  tiempo mintiendo: el backend existe desde que se agregó `api/`.)
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

- [x] **Hecho el 2026-09-07.** Vercel → proyecto `phoenixiamethod` (entonces `elgolott`) → **Firewall** →
      **Reglas** → regla `Límite de la API`: si la ruta empieza con `/api`,
      ventana fija de 60 segundos, 20 solicitudes por dirección IP, y responde
      *Demasiadas peticiones (429)*. Comprobada en producción: las 20 primeras
      pasan y de la 21 en adelante devuelve 429. El plan Hobby permite **una
      sola** regla de límite de velocidad, así que esa es la que hay.
- [ ] Vercel → **Firewall** → activar **Attack Challenge Mode** si alguna vez ves
      tráfico raro en los registros. Es un interruptor, no hay que configurarlo.

## El correo: por dónde sale y qué mirar cuando no llega

Todo el correo del sitio —la respuesta al formulario, la copia interna y la
confirmación de reuniones— sale por Brevo desde
`contacto.nicolaspk@12068809.brevosend.com`, el subdominio que Brevo firma por su
cuenta. Se puede cambiar con `REMITENTE_EMAIL`.

**Nunca poner una dirección gratuita como remitente.** Hasta el 09/09 Brevo
reescribía solo el `@gmail.com` por su subdominio. Desde el 10/09 dejó de
hacerlo y marca esos envíos como **Bloqueado**: la API contesta que sí, el sitio
muestra "revisa tu correo" y no llega nada, ni al visitante ni a Nicolás. Así se
perdió la solicitud de un cliente real el 11/09, y no había forma de notarlo
desde afuera.

**El campo trampa del formulario es de solo lectura a propósito.** El
autocompletado del teléfono llena campos aunque digan `autocomplete="off"`, y
cuando llenaba la trampa el servidor descartaba la solicitud en silencio. Si
alguna vez se saca ese `readOnly`, vuelve el problema. Hoy, además, una solicitud
marcada como robot ya no desaparece: llega igual la copia con el motivo escrito.

**Dónde mirar cuando alguien dice que no le llegó el correo:**

1. **Brevo → Transaccional → Email → Logs.** Cada envío tiene su evento
   (Enviado, Entregado, Bloqueado, Soft bounce) y el ojito de la izquierda
   muestra el motivo. Ahí se ve si el correo salió y qué pasó después.
2. **Registro del servidor:** `npx vercel logs <url del despliegue>`, o el panel
   de Vercel. Aparecen `[contacto] filtrada como robot: …` cuando el filtro
   antirrobots actúa y `[contacto] no llegó la copia interna → …` cuando falla
   el aviso interno.
3. **El Gmail de quien reclama**, buscando `in:anywhere brevosend`. Si no está
   ahí, el correo nunca entró a esa casilla.

**Pendiente conocido, y asumido a propósito.** La copia interna al propio Gmail
de Nicolás: Brevo la da por entregada y Gmail no la deja en ninguna carpeta, ni
siquiera en spam o en la papelera. El correo del visitante, con la misma cuenta,
el mismo remitente y el mismo segundo, sí llega. Se descartaron las dos
diferencias que tenía —iba sin maquetar y con el `replyTo` apuntando al propio
destinatario— y siguió pasando, así que la causa está en cómo trata Gmail un
correo automático que uno se manda a sí mismo desde un servicio externo.

**Decisión del 11/09: se deja así.** No se pierde ninguna solicitud —el visitante
recibe su correo y, si agenda, la reunión entra igual al calendario—, y el CRM va
a tomar ese rol. Si alguna vez molesta, hay dos salidas: definir `CONTACTO_EMAIL`
en Vercel con otra dirección, o verificar un dominio propio en Brevo.

**Cuando haya dominio propio** (por ejemplo `neuraia.cl`): verificarlo en Brevo
con su DKIM y cambiar `REMITENTE_EMAIL`. Los correos se ven más serios y entran
mejor que desde un subdominio compartido.

**Mantención**

- [ ] Rotar `BREVO_API_KEY` y `CRON_SECRET` si alguna vez se pegan en un chat, en
      una captura o en un correo.
- [ ] Mirar el registro de Brevo después de cada cambio en el remitente o en las
      plantillas de correo: un envío puede quedar "Bloqueado" sin que el sitio
      dé ningún error.
- [ ] Mantener la restricción de IP de Brevo desactivada solo mientras haga falta;
      si Brevo vuelve a ofrecer una lista de IP fijas de Vercel, activarla.
- [ ] La clave privada de la cuenta de servicio de Google vive **solo** en las
      variables de entorno de Vercel. Nunca en el repositorio, nunca en un chat.
- [ ] Si el calendario deja de funcionar, revisar en Google Cloud que la cuenta de
      servicio siga teniendo solo el permiso sobre el calendario de clientes y
      nada más.

Para disparar la publicación a mano:

```bash
curl -X POST -H "Authorization: Bearer TU_CRON_SECRET" https://phoenixiamethod.cl/api/publicar
```

## Estadísticas propias y botón de llamada

**Botón "Llamar ahora"** en la barra superior, en todas las escenas: enlace
`tel:+56920596120`. El número está en `src/data/site.ts` (`phoenix.telefono`).

**Estadísticas** sin Google Analytics ni cookies. Tres piezas:

| Pieza | Qué hace |
|---|---|
| `src/lib/analitica.ts` | En el navegador: manda cada escena vista, los clics que importan (llamar, WhatsApp, correo, agenda, redes, y cualquier botón con `data-evento="…"`) y el tiempo en el sitio al salir |
| `api/evento.js` | Recibe eso, descarta robots y guarda contadores por día en Upstash Redis |
| `api/estadisticas.js` + `panel.html` | El panel privado con contraseña |

`api/contacto.js` y `api/reservar.js` cuentan por su cuenta el formulario
enviado y la reunión reservada, porque son ellas las que saben que de verdad pasó.

**Entrar al panel:** en el sitio, Ajustes (⚙) → *Estadísticas · acceso privado*,
o directo en `/panel.html`. La contraseña es la variable `ESTADISTICAS_CLAVE` de
Vercel (una copia está en `CLAVE-ESTADISTICAS.txt`, que no se sube a git). Al
entrar se puede marcar "no contar mis visitas" para ese dispositivo.

**Privacidad:** no se guarda la IP. Cada visitante es una huella anónima que
cambia cada día; sirve para contar personas distintas, no para seguir a nadie.
Los contadores se borran solos a los ~13 meses.

**Base de datos:** Upstash Redis, plan gratis, conectado desde Vercel → Storage.
Sin conectar, el sitio funciona igual, no registra nada y el panel lo avisa.
El plan gratis tiene cupo mensual de comandos: por eso el panel refresca lo
"en vivo" cada 20 s y el periodo completo solo cada 5 min o al pedirlo.

**Probar en local con las funciones:** dos servidores a la vez (están en
`.claude/launch.json` de Neurona): `phoenix-con-api` (`vercel dev` en el 3000)
y `phoenix-local-completo` (Vite en el 5173 con `--mode conapi`, que le pasa
`/api` al 3000). En local la base es un archivo temporal, la contraseña es
`local`, y el contador no manda nada salvo que la dirección lleve `?contar=1`.

## Un aviso sobre OneDrive

Esta carpeta está dentro de OneDrive. `node_modules` tiene miles de archivos
pequeños y sincronizarlo hace lento el equipo. Está excluido en `.gitignore`,
pero OneDrive no lee ese archivo: conviene marcar `08_Web/node_modules` como
"disponible solo en línea" o mover el proyecto fuera de OneDrive si notas que la
sincronización se pone pesada.
