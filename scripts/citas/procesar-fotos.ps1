# Convierte las fotos descargadas por fotos.mjs (carpeta fotos/) en JPEG livianos dentro de public/images/autores/.
# Solo procesa a los autores que figuran en src/data/citas.ts: una foto sin frase es peso muerto.
#
#   powershell -File scripts/citas/procesar-fotos.ps1
Add-Type -AssemblyName System.Drawing

$aqui = $PSScriptRoot
$raiz = Resolve-Path (Join-Path $aqui '..\..')
$destino = Join-Path $raiz 'public\images\autores'
New-Item -ItemType Directory -Force $destino | Out-Null

# Los autores que usa el banco, tal como los declara citas.ts
$ts = Get-Content (Join-Path $raiz 'src\data\citas.ts') -Raw -Encoding UTF8
$usados = [regex]::Matches($ts, 'images/autores/([a-z0-9-]+)\.jpg') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique

$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$ancho = 320   # el círculo más grande mide 84 px: 320 alcanza para pantallas de alta densidad
$hechas = 0
foreach ($slug in $usados) {
  $origen = Get-ChildItem (Join-Path $aqui 'fotos') -Filter "$slug.*" -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $origen) { continue }   # ya estaba procesada, o no se descargó
  $img = [System.Drawing.Image]::FromFile($origen.FullName)
  $r = [Math]::Min(1.0, $ancho / $img.Width)
  $w = [int]($img.Width * $r); $h = [int]($img.Height * $r)
  $bmp = New-Object System.Drawing.Bitmap $w, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.DrawImage($img, 0, 0, $w, $h)
  $p = New-Object System.Drawing.Imaging.EncoderParameters 1
  $p.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), 82L
  $bmp.Save((Join-Path $destino "$slug.jpg"), $codec, $p)
  $g.Dispose(); $bmp.Dispose(); $img.Dispose()
  $hechas++
}
Write-Host "$hechas foto(s) procesada(s) en public/images/autores/ ($($usados.Count) autores en el banco)"
