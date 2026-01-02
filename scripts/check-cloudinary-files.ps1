# Script kiem tra files da upload len Cloudinary
# Su dung Cloudinary API de list files trong cac folder

Write-Host "`nKiem tra files tren Cloudinary..." -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Load .env.local
$envPath = Join-Path $PSScriptRoot "..\.env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "Khong tim thay file .env.local" -ForegroundColor Red
    exit 1
}

# Doc .env.local
$cloudName = $null
$apiKey = $null
$apiSecret = $null

Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        
        switch ($key) {
            "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" { $cloudName = $value }
            "NEXT_PUBLIC_CLOUDINARY_API_KEY" { $apiKey = $value }
            "CLOUDINARY_API_SECRET" { $apiSecret = $value }
        }
    }
}

if (-not $cloudName -or -not $apiKey -or -not $apiSecret) {
    Write-Host "Thieu thong tin trong .env.local" -ForegroundColor Red
    if (-not $cloudName) { Write-Host "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" -ForegroundColor Yellow }
    if (-not $apiKey) { Write-Host "   - NEXT_PUBLIC_CLOUDINARY_API_KEY" -ForegroundColor Yellow }
    if (-not $apiSecret) { Write-Host "   - CLOUDINARY_API_SECRET" -ForegroundColor Yellow }
    exit 1
}

Write-Host "Cloud Name: $cloudName" -ForegroundColor Green
Write-Host ""

# Danh sach cac chest types can kiem tra
$chestTypes = @("wood", "silver", "gold", "mystery", "legendary")

Write-Host "Kiem tra tung loai ruong:" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$foundCount = 0
$missingCount = 0
$amp = [char]38

foreach ($type in $chestTypes) {
    Write-Host "`nfamily-tasks/chests/$type/" -ForegroundColor Cyan
    
    try {
        # List resources trong folder
        $folderPath = "family-tasks/chests/$type"
        $apiUrl = "https://api.cloudinary.com/v1_1/$cloudName/resources/image/upload"
        
        # Tao signature cho request
        $requestTimestamp = [Math]::Floor([decimal](Get-Date -UFormat %s))
        $requestString = "folder=$folderPath" + $amp + "timestamp=$requestTimestamp" + $apiSecret
        $requestSignature = [System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($requestString))
        $requestSignatureHex = ($requestSignature | ForEach-Object { $_.ToString("x2") }) -join ""
        
        $params = @{
            folder = $folderPath
            timestamp = $requestTimestamp
            api_key = $apiKey
            signature = $requestSignatureHex
        }
        
        $queryParts = @()
        foreach ($key in $params.Keys) {
            $queryParts += "$key=$($params[$key])"
        }
        $queryString = $queryParts -join $amp
        $fullUrl = "$apiUrl?$queryString"
        
        $response = Invoke-RestMethod -Uri $fullUrl -Method Get
        
        if ($response.resources -and $response.resources.Count -gt 0) {
            Write-Host "   Tim thay $($response.resources.Count) file(s):" -ForegroundColor Green
            foreach ($resource in $response.resources) {
                $fileName = Split-Path $resource.public_id -Leaf
                Write-Host "      - $fileName" -ForegroundColor White
                
                # Kiem tra ten file co dung format khong
                $expectedName = "${type}_chest_closed.png"
                if ($fileName -eq $expectedName -or $fileName -eq "closed.png") {
                    Write-Host "         Ten file dung format" -ForegroundColor Green
                    Write-Host "         URL: $($resource.secure_url)" -ForegroundColor Gray
                    $foundCount++
                } else {
                    Write-Host "         Ten file khong dung format (mong doi: $expectedName hoac closed.png)" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "   Chua co file nao trong folder nay" -ForegroundColor Red
            Write-Host "      Can upload: ${type}_chest_closed.png" -ForegroundColor Yellow
            $missingCount++
        }
    } catch {
        Write-Host "   Khong the kiem tra folder nay" -ForegroundColor Yellow
        Write-Host "      Loi: $($_.Exception.Message)" -ForegroundColor Red
        $missingCount++
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "Tong ket:" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "Tim thay: $foundCount file(s)" -ForegroundColor Green
Write-Host "Thieu: $missingCount file(s)" -ForegroundColor $(if ($missingCount -gt 0) { "Red" } else { "Green" })

if ($missingCount -gt 0) {
    Write-Host "`nHuong dan upload:" -ForegroundColor Yellow
    Write-Host "1. Mo Cloudinary extension trong Cursor" -ForegroundColor White
    Write-Host "2. Upload cac file con thieu vao dung folder" -ForegroundColor White
    Write-Host "3. Dam bao ten file: {type}_chest_closed.png" -ForegroundColor White
    Write-Host "4. Chay lai script nay de kiem tra" -ForegroundColor White
} else {
    Write-Host "`nTat ca files da duoc upload dung!" -ForegroundColor Green
}

Write-Host "`nMo Cloudinary Dashboard de xem chi tiet:" -ForegroundColor Cyan
Start-Process "https://cloudinary.com/console/media_library/folders/family-tasks"

