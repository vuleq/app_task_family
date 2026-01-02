# Script to upload files to Cloudinary using API
# Requires: Cloudinary credentials in .env.local

$folderPath = "D:\linh tinh\web_for_FaSol\hinh_compress"
$cloudName = $env:NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
$uploadPreset = $env:NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
$apiKey = $env:NEXT_PUBLIC_CLOUDINARY_API_KEY

if (-not $cloudName -or -not $uploadPreset) {
    Write-Host "Chua cau hinh Cloudinary!" -ForegroundColor Red
    Write-Host "Vui long doc file .env.local de lay thong tin:" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" -ForegroundColor Yellow
    Write-Host "  - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Hoac upload thu cong qua Cloudinary Dashboard:" -ForegroundColor Cyan
    Write-Host "  https://cloudinary.com/console" -ForegroundColor Cyan
    exit
}

Write-Host "Dang upload files len Cloudinary..." -ForegroundColor Green
Write-Host "Cloud Name: $cloudName" -ForegroundColor Cyan
Write-Host ""

# Upload chest files
$chestFiles = @(
    @{ File = "wood_chest_closed.png"; Folder = "family-tasks/chests/wood" }
    @{ File = "silver_chest_closed.png"; Folder = "family-tasks/chests/silver" }
    @{ File = "gold_chest_closed.png"; Folder = "family-tasks/chests/gold" }
    @{ File = "mystery_chest_closed.png"; Folder = "family-tasks/chests/mystery" }
    @{ File = "legendary_chest_closed.png"; Folder = "family-tasks/chests/legendary" }
)

$uploadedCount = 0
$failedCount = 0

foreach ($chest in $chestFiles) {
    $filePath = Join-Path $folderPath $chest.File
    
    if (-not (Test-Path $filePath)) {
        Write-Host "File khong ton tai: $($chest.File)" -ForegroundColor Yellow
        $failedCount++
        continue
    }
    
    try {
        $formData = @{
            file = Get-Item $filePath
            upload_preset = $uploadPreset
            folder = $chest.Folder
        }
        
        $response = Invoke-RestMethod -Uri "https://api.cloudinary.com/v1_1/$cloudName/image/upload" -Method Post -Form $formData
        
        Write-Host "OK: $($chest.File) -> $($response.secure_url)" -ForegroundColor Green
        $uploadedCount++
    } catch {
        Write-Host "Loi khi upload: $($chest.File) - $($_.Exception.Message)" -ForegroundColor Red
        $failedCount++
    }
}

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "Da upload: $uploadedCount files" -ForegroundColor Cyan
Write-Host "Loi: $failedCount files" -ForegroundColor $(if ($failedCount -gt 0) { "Red" } else { "Green" })

