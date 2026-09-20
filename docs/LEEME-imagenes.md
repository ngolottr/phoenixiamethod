# Tus fotos van aquí

Deja los archivos con **exactamente estos nombres** y el sitio los toma solo.
Mientras falte alguno, esa ranura muestra un fondo procedural con la misma
atmósfera de la foto original y el nombre del archivo que espera.

| Archivo | Dónde aparece | Formato recomendado |
|---|---|---|
| `hero.jpg` | Escena 01 — pantalla completa | vertical u horizontal, 2000 px de lado largo |
| `about-1.jpg` | Escena 02 — retrato grande | vertical 3:4 |
| `about-2.jpg` | Escena 02 — retrato pequeño superpuesto | cuadrado 1:1 |
| `gallery-01.jpg` … `gallery-06.jpg` | Escena 03 — galería y visor | vertical 3:4 |

**Los casos ya no llevan foto.** El marco de la escena de Soluciones se dibuja
solo: son láminas en SVG (`src/components/GraficoCaso.tsx`) que muestran el
trabajo —la curva de seguidores, el flujo de n8n, la tienda— en vez de una
fotografía que no decía nada de él. La única excepción es Neurona, que usa la
captura de Obsidian que ya está en `images/herramientas/`. No hay que preparar
ningún archivo para esa escena.

## Recomendaciones

- **Peso:** deja cada archivo bajo ~350 KB. Exporta a JPG calidad 78-82.
- **Formato moderno:** si conviertes a `.webp`, cambia también la extensión en
  `src/data/site.ts` — el sitio lee las rutas desde ahí, no de una lista fija.
- **Cantidad:** puedes tener más o menos de 6 fotos en la galería. Agrega o quita
  entradas del array `gallery` en `src/data/site.ts` y la tira se reajusta sola.
- **Dirección de arte:** las fotos funcionan mejor si mantienen el contraluz verde,
  las sombras profundas y el encuadre con aire alrededor del sujeto.
