# El video del lanzamiento

Cuando termines de editarlo, deja el archivo aquí con este nombre exacto:

```
public/lanzamiento/lanzamiento.mp4
```

Una vez desplegado, ese archivo queda disponible en una URL pública:

```
https://<tu-dominio>.vercel.app/lanzamiento/lanzamiento.mp4
```

Esa es la dirección que le pasamos a la API de Instagram para que sus servidores
vayan a buscar el video y lo publiquen.

## Requisitos que pide Instagram para historias en video

| Punto | Valor |
|---|---|
| Formato | MP4 (códec de video H.264, audio AAC) |
| Duración | hasta 60 segundos |
| Proporción | vertical 9:16 |
| Resolución | 1080 × 1920 recomendada |
| Peso | idealmente bajo 50 MB |

Si el video pasa de 60 segundos, Instagram lo rechaza para historias. Para el
feed (reel) el límite es más largo, pero conviene mantenerlo corto igual.

## Ojo con el peso

Este archivo se sube junto con la web. Si el video pesa mucho, el despliegue se
vuelve lento. Si supera los ~50 MB, conviene moverlo a Supabase Storage en vez
de dejarlo aquí — el resultado para Instagram es exactamente el mismo, solo
cambia dónde vive el archivo.
