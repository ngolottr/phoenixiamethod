# Renovar las frases del Método

El banco de frases (`src/data/citas.ts`) se acaba: con las que hay, la primera vuelta
dura hasta el **23 de enero de 2027**. Después el sitio empieza a repetirlas y deja de
decir que no se repiten. `npm run citas` dice cuántos días quedan, y avisa fuerte
cuando son menos de 30. **Estas herramientas existen para renovarlo sin volver a
empezar de cero.**

## La regla que no se negocia

Una cita mal atribuida en la sección que existe para dar credibilidad es **peor que
no tener sección**. Internet está lleno de frases falsas con nombre de autor famoso, y
Wikiquote, Goodreads y la memoria de quien escribe (incluida la de Claude) se equivocan
a menudo. Por eso **ninguna frase entra por "suena a Drucker"**: entra si aparece,
palabra por palabra, dentro de un libro escrito por esa misma persona.

Casos reales que este proceso atajó la primera vez, para no volver a caer:

| Parecía | Resultó ser |
|---|---|
| Frankl: *«quien tiene un porqué para vivir…»* | Es de **Nietzsche**; Frankl solo lo cita |
| Kahneman: *«la intuición no es más que reconocimiento»* | Es de **Herbert Simon**, citado por Kahneman |
| Dweck: *«convertirse es mejor que ser»* | Ella lo presenta como *«un dicho de los años 60»* |
| Sinek: *«los grandes líderes son los que confían»* | Era un pedazo: el libro dice *«…confían **en su instinto**»* |
| Catmull: *«una gran idea… un gran equipo»* | El libro dice *«equipo **brillante**»* |
| Napoleon Hill: *«todo lo que la mente puede concebir…»* | Aparecía solo en un libro de **poemas**, no en *Think and Grow Rich* |
| Covey (2 citas) | Salieron del libro para **adolescentes** de Sean Covey, no del de Stephen |
| Drucker: *«crear un cliente»* | Salió de una **antología** y de un libro *sobre* Drucker; el original es *The Practice of Management* |
| Jim Collins | No hay foto libre suya en Commons (la que sale al buscar es de otro Jim Collins) |

## El proceso, en orden

1. **Candidatas.** Escribir las frases que se quieran probar como una lista JSON:
   `{ id, autor, apellido, libro, clave, anio, cat, en }`. `apellido` se compara con el
   autor del libro (`"covey stephen"` si hay otro Covey); `clave` es una expresión regular
   sobre el título (`"^think and grow rich"`); `en` es la frase en el idioma del libro.
2. **Verificar en el libro.** `node scripts/citas/verificar-ol.mjs candidatas.json salida.json`
   busca la frase en el texto completo de libros reales (Open Library / Internet Archive)
   y pide que el autor y el título coincidan. Solo cuenta `VERIFICADA`.
3. **Comprobar el final.** `node scripts/citas/vet.mjs entrada.json salida.json` exige que
   el **principio, el medio y el final** de la frase estén en el mismo ejemplar y en la
   misma página. Un `PARCIAL` casi siempre es un guion de fin de línea o un error de OCR
   (`cur- rent`, `mare` por `more`), y se revisa a mano con una búsqueda del final.
4. **Leer el contexto.** Antes de aceptar, mirar el fragmento que devuelve: si está entre
   comillas o dice «como dijo X», la frase es de otro. Si es una frase que empieza a
   mitad de oración, se cita entera o se descarta.
5. **Clásicos de dominio público.** `gutenberg.mjs <id> "<expresión>"` baja el libro entero
   de Project Gutenberg y muestra la frase con su capítulo. Se cita **con la traducción
   inglesa que se nombra** (`traductor`), y se dice.
6. **Foto.** `fotos.mjs` (editar el mapa `A`) baja la foto principal de Wikipedia desde
   Commons y **exige licencia libre** (dominio público, CC0, CC BY o CC BY-SA), sin marca
   de derechos de personalidad. Después hay que **mirarla**: comprobar que es la persona.
   `procesar-fotos.ps1` la convierte a JPEG de 320 px.
7. **Escribir la entrada.** AL FINAL de `citas` en `src/data/citas.ts`, con traducción
   propia, la palabra que se resalta y el original a la vista. Si el autor es nuevo, va
   en `autores` con su crédito.
8. **Fijar el orden.** `npm run citas -- --fijar`.

## Lo que hay que cuidar al agregar

- **Siempre al final.** La frase de cada día sale de una cuenta sobre la lista. Insertar en
  medio, reordenar o borrar una ya publicada corre todas las siguientes y sale una repetida.
  `npm run citas` lo detecta y **frena el build**.
- **Una frase, no un párrafo.** Es derecho de cita: corta, con su autor y su libro. El
  script avisa sobre lo que pase de 260 caracteres.
- **Español chileno neutro** en las traducciones, tuteo, sin voseo. `libroEs` solo cuando el
  título en castellano se conoce con certeza; ante la duda, se deja el original.
- **Crédito de la foto a la vista.** Es lo que exige la licencia.
- **Sin autores polémicos** cuya foto junto a una web comercial pueda leerse como respaldo.
  Ya hay un aviso en pantalla («su autor no patrocina ni respalda este sitio»), pero no
  reemplaza el criterio.

## Qué hacer con las carpetas de trabajo

`fotos/` y `gutenberg/` son cachés de descarga y están en `.gitignore`.
