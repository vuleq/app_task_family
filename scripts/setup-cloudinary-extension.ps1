# Script tạo file environments.json cho Cloudinary Extension
# Chạy script này để tự động tạo file cấu hình

Write-Host "`n🔧 Setup Cloudinary Extension Configuration" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Đường dẫn file environments.json
$cloudinaryDir = Join-Path $env:USERPROFILE ".cloudinary"
$envFile = Join-Path $cloudinaryDir "environments.json"

# Tạo thư mục nếu chưa có
if (-not (Test-Path $cloudinaryDir)) {
    New-Item -ItemType Directory -Path $cloudinaryDir -Force | Out-Null
    Write-Host "✅ Đã tạo thư mục: $cloudinaryDir" -ForegroundColor Green
}

# Load .env.local để lấy thông tin
$envLocalPath = Join-Path $PSScriptRoot "..\.env.local"
if (-not (Test-Path $envLocalPath)) {
    Write-Host "❌ Không tìm thấy file .env.local" -ForegroundColor Red
    Write-Host "   Path: $envLocalPath" -ForegroundColor Yellow
    Write-Host "`n💡 Vui lòng tạo file .env.local trước với các thông tin:" -ForegroundColor Yellow
    Write-Host "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_CLOUDINARY_API_KEY" -ForegroundColor White
    Write-Host "   - CLOUDINARY_API_SECRET" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (optional)" -ForegroundColor White
    exit 1
}

# Đọc .env.local
$cloudName = $null
$apiKey = $null
$apiSecret = $null
$uploadPreset = $null

Get-Content $envLocalPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        
        switch ($key) {
            "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" { $cloudName = $value }
            "NEXT_PUBLIC_CLOUDINARY_API_KEY" { $apiKey = $value }
            "CLOUDINARY_API_SECRET" { $apiSecret = $value }
            "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET" { $uploadPreset = $value }
        }
    }
}

# Kiểm tra thông tin
if (-not $cloudName -or -not $apiKey -or -not $apiSecret) {
    Write-Host "❌ Thiếu thông tin trong .env.local:" -ForegroundColor Red
    if (-not $cloudName) { Write-Host "   - NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME" -ForegroundColor Yellow }
    if (-not $apiKey) { Write-Host "   - NEXT_PUBLIC_CLOUDINARY_API_KEY" -ForegroundColor Yellow }
    if (-not $apiSecret) { Write-Host "   - CLOUDINARY_API_SECRET" -ForegroundColor Yellow }
    exit 1
}

# Tạo JSON object
$config = @{
    $cloudName = @{
        apiKey = $apiKey
        apiSecret = $apiSecret
    }
}

# Thêm uploadPreset nếu có
if ($uploadPreset) {
    $config[$cloudName].uploadPreset = $uploadPreset
}

# Convert to JSON và lưu file
$jsonContent = $config | ConvertTo-Json -Depth 10

# Kiểm tra file đã tồn tại chưa
if (Test-Path $envFile) {
    Write-Host "⚠️  File đã tồn tại: $envFile" -ForegroundColor Yellow
    $overwrite = Read-Host "Bạn có muốn ghi đè không? (y/n)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "❌ Đã hủy" -ForegroundColor Red
        exit 0
    }
}

# Lưu file
$jsonContent | Out-File -FilePath $envFile -Encoding UTF8 -Force

Write-Host "`n✅ Đã tạo file cấu hình thành công!" -ForegroundColor Green
Write-Host "   File: $envFile" -ForegroundColor Cyan
Write-Host "`n📋 Thông tin cấu hình:" -ForegroundColor Yellow
Write-Host "   Cloud Name: $cloudName" -ForegroundColor White
Write-Host "   API Key: $($apiKey.Substring(0, [Math]::Min(10, $apiKey.Length)))..." -ForegroundColor White
Write-Host "   API Secret: $($apiSecret.Substring(0, [Math]::Min(10, $apiSecret.Length)))..." -ForegroundColor White
if ($uploadPreset) {
    Write-Host "   Upload Preset: $uploadPreset" -ForegroundColor White
}

Write-Host "`n🎯 Bước tiếp theo:" -ForegroundColor Cyan
Write-Host "1. Restart Cursor để extension load cấu hình mới" -ForegroundColor White
Write-Host "2. Mở Cloudinary extension trong Cursor" -ForegroundColor White
Write-Host "3. Bắt đầu upload files!" -ForegroundColor White
Write-Host ""

