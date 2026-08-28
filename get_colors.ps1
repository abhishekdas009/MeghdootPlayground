Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile('C:\Users\Abhishek\.gemini\antigravity\brain\a97217df-d6a6-4b95-b5dd-f426d4809b62\.user_uploaded\media_1787940927023.png')
$bmp = new-object System.Drawing.Bitmap($img)
$w = $bmp.Width
$h = $bmp.Height
Write-Host "Width: $w, Height: $h"
Write-Host "Pixel 10,10: #$($bmp.GetPixel(10, 10).R.ToString('X2'))$($bmp.GetPixel(10, 10).G.ToString('X2'))$($bmp.GetPixel(10, 10).B.ToString('X2'))"
Write-Host "Pixel W/2, H/2: #$($bmp.GetPixel($w/2, $h/2).R.ToString('X2'))$($bmp.GetPixel($w/2, $h/2).G.ToString('X2'))$($bmp.GetPixel($w/2, $h/2).B.ToString('X2'))"
Write-Host "Pixel W-10, H-10: #$($bmp.GetPixel($w-10, $h-10).R.ToString('X2'))$($bmp.GetPixel($w-10, $h-10).G.ToString('X2'))$($bmp.GetPixel($w-10, $h-10).B.ToString('X2'))"
