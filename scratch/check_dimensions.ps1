Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("c:\Users\arire\Documents\web jss\public\hero-promo.jpg")
Write-Host "Width:" $img.Width "Height:" $img.Height
$img.Dispose()
