# Script kiểm tra files đã upload lên Cloudinary
# Sử dụng Cloudinary API để list files trong các folder

Write-Host "`n🔍 Kiểm tra files trên Cloudinary..." -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Load .env.local
$envPath = Join-Path $PSScriptRoot "..\.env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Không tìm thấy file .env.local" -ForegroundColor Red
    exit 1
}

# Đọc .env.local
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
    Write-Host "❌ Thiếu thông tin trong .env.local" -ForegroundColor Red
    if (-not $cloudName) { Write-Host "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" -ForegroundColor Yellow }
    if (-not $apiKey) { Write-Host "   - NEXT_PUBLIC_CLOUDINARY_API_KEY" -ForegroundColor Yellow }
    if (-not $apiSecret) { Write-Host "   - CLOUDINARY_API_SECRET" -ForegroundColor Yellow }
    exit 1
}

Write-Host "✅ Cloud Name: $cloudName" -ForegroundColor Green
Write-Host ""

# Danh sách các chest types cần kiểm tra
$chestTypes = @("wood", "silver", "gold", "mystery", "legendary")

# Tạo timestamp và signature cho API request (không dùng ở đây nhưng giữ lại để tham khảo)

Write-Host "📋 Kiểm tra từng loại rương:" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow

$foundCount = 0
$missingCount = 0

foreach ($type in $chestTypes) {
    Write-Host "`n📁 family-tasks/chests/$type/" -ForegroundColor Cyan
    
    try {
        # List resources trong folder
        $folderPath = "family-tasks/chests/$type"
        $apiUrl = "https://api.cloudinary.com/v1_1/$cloudName/resources/image/upload"
        
        # Tạo signature cho request này
        $requestTimestamp = [Math]::Floor([decimal](Get-Date -UFormat %s))
        $amp = [char]38  # & character
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
        $queryString = $queryParts -join [char]38  # & character
        $fullUrl = "$apiUrl?$queryString"
        
        $response = Invoke-RestMethod -Uri $fullUrl -Method Get
        
        if ($response.resources -and $response.resources.Count -gt 0) {
            Write-Host "   ✅ Tìm thấy $($response.resources.Count) file(s):" -ForegroundColor Green
            foreach ($resource in $response.resources) {
                $fileName = Split-Path $resource.public_id -Leaf
                Write-Host "      - $fileName" -ForegroundColor White
                
                # Kiểm tra tên file có đúng format không
                $expectedName = "${type}_chest_closed.png"
                if ($fileName -eq $expectedName -or $fileName -eq "closed.png") {
                    Write-Host "         ✅ Tên file đúng format" -ForegroundColor Green
                    Write-Host "         🔗 URL: $($resource.secure_url)" -ForegroundColor Gray
                    $foundCount++
                } else {
                    Write-Host "         ⚠️  Tên file không đúng format (mong đợi: $expectedName hoặc closed.png)" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "   ❌ Chưa có file nào trong folder này" -ForegroundColor Red
            Write-Host "      💡 Cần upload: ${type}_chest_closed.png" -ForegroundColor Yellow
            $missingCount++
        }
    } catch {
        Write-Host "   ⚠️  Không thể kiểm tra folder này" -ForegroundColor Yellow
        Write-Host "      Lỗi: $($_.Exception.Message)" -ForegroundColor Red
        $missingCount++
    }
}

Write-Host "`n" -ForegroundColor White
Write-Host "📊 Tổng kết:" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan
Write-Host "✅ Đã tìm thấy: $foundCount file(s)" -ForegroundColor Green
Write-Host "❌ Thiếu: $missingCount file(s)" -ForegroundColor $(if ($missingCount -gt 0) { "Red" } else { "Green" })

if ($missingCount -gt 0) {
    Write-Host "`n💡 Hướng dẫn upload:" -ForegroundColor Yellow
    Write-Host "1. Mở Cloudinary extension trong Cursor" -ForegroundColor White
    Write-Host "2. Upload các file còn thiếu vào đúng folder" -ForegroundColor White
    Write-Host "3. Đảm bảo tên file: {type}_chest_closed.png" -ForegroundColor White
    Write-Host "4. Chạy lại script này để kiểm tra" -ForegroundColor White
} else {
    Write-Host "`n🎉 Tất cả files đã được upload đúng!" -ForegroundColor Green
}

Write-Host "`nMo Cloudinary Dashboard de xem chi tiet:" -ForegroundColor Cyan
Start-Process "https://cloudinary.com/console/media_library/folders/family-tasks"

