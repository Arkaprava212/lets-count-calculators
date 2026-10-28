# Tiny local web server for previewing the site (works like Vercel: /pace-calculator -> pace-calculator.html).
# Usage: powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 4173
param([int]$Port = 4173)
$root = Split-Path -Parent $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8';
            '.svg'='image/svg+xml'; '.xml'='application/xml'; '.txt'='text/plain; charset=utf-8'; '.json'='application/json'; '.png'='image/png' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Serving $root at http://localhost:$Port/"
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $path = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath).TrimEnd('/')
  $rel = $path.TrimStart('/')
  $file = Join-Path $root $rel
  if ($rel -eq '' ) { $file = Join-Path $root 'index.html' }
  elseif (Test-Path $file -PathType Container) { $file = Join-Path $file 'index.html' }
  elseif (-not (Test-Path $file -PathType Leaf) -and (Test-Path "$file.html" -PathType Leaf)) { $file = "$file.html" }
  $res = $ctx.Response
  if ((Test-Path $file -PathType Leaf) -and ($file.StartsWith($root))) {
    $bytes = [IO.File]::ReadAllBytes($file)
    $ext = [IO.Path]::GetExtension($file).ToLower()
    $res.ContentType = if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' }
    $res.StatusCode = 200
  } else {
    $nf = Join-Path $root '404.html'
    $bytes = if (Test-Path $nf) { [IO.File]::ReadAllBytes($nf) } else { [Text.Encoding]::UTF8.GetBytes('Not found') }
    $res.ContentType = 'text/html; charset=utf-8'
    $res.StatusCode = 404
  }
  $res.ContentLength64 = $bytes.Length
  $res.OutputStream.Write($bytes, 0, $bytes.Length)
  $res.OutputStream.Close()
}
