# Script kiểm tra cấu trúc folder và file trên Cloudinary
# Yêu cầu: Đã có Cloudinary credentials trong .env.local

Write-Host "`n🔍 Kiểm tra cấu trúc Cloudinary..." -ForegroundColor Cyan
Write-Host "=====================================`n" -ForegroundColor Cyan

# Load .env.local
$envPath = Join-Path $PSScriptRoot "..\.env.local"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ Không tìm thấy file .env.local" -ForegroundColor Red
    Write-Host "   Path: $envPath" -ForegroundColor Yellow
    exit 1
}

# Đọc .env.local
Get-Content $envPath | ForEach-Object {
    if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim().Trim('"').Trim("'")
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
}

$cloudName = $env:NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
$apiKey = $env:NEXT_PUBLIC_CLOUDINARY_API_KEY
$apiSecret = $env:CLOUDINARY_API_SECRET

if (-not $cloudName) {
    Write-Host "❌ Không tìm thấy NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME trong .env.local" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cloud Name: $cloudName" -ForegroundColor Green
Write-Host ""

# Danh sách các chest types cần kiểm tra
$chestTypes = @("wood", "silver", "gold", "mystery", "legendary")

Write-Host "📋 Cấu trúc folder và file cần có:" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
foreach ($type in $chestTypes) {
    Write-Host "`n📁 family-tasks/chests/$type/" -ForegroundColor Cyan
    Write-Host "   ✅ Cần có file: ${type}_chest_closed.png" -ForegroundColor Green
    Write-Host "   ✅ Hoặc: closed.png" -ForegroundColor Green
    Write-Host "   🔗 URL sẽ là:" -ForegroundColor Yellow
    Write-Host "      https://res.cloudinary.com/$cloudName/image/upload/family-tasks/chests/$type/${type}_chest_closed.png" -ForegroundColor Gray
}

Write-Host "`n" -ForegroundColor White
Write-Host "📝 Hướng dẫn kiểm tra trên Cloudinary:" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Yellow
Write-Host "1. Mở: https://cloudinary.com/console/media_library" -ForegroundColor White
Write-Host "2. Tìm folder: family-tasks/chests/" -ForegroundColor White
Write-Host "3. Kiem tra tung subfolder (wood, silver, gold, mystery, legendary)" -ForegroundColor White
Write-Host "4. Xác nhận tên file đúng format" -ForegroundColor White
Write-Host ""

Write-Host "💡 Lưu ý:" -ForegroundColor Yellow
Write-Host "- Code đang tìm file với format: {type}_chest_closed.png" -ForegroundColor White
Write-Host "- Nếu file có tên khác, cần đổi tên trên Cloudinary hoặc cập nhật code" -ForegroundColor White
Write-Host ""

Write-Host "🔗 Mở Cloudinary Media Library..." -ForegroundColor Cyan
Start-Process "https://cloudinary.com/console/media_library/folders/family-tasks"

