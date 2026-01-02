# Script để tạo placeholder icons cho PWA
# Chạy: .\scripts\create-placeholder-icons.ps1

$iconSizes = @(72, 96, 128, 144, 152, 192, 384, 512)
$iconsDir = "public\icons"

# Tạo thư mục nếu chưa có
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force | Out-Null
}

Write-Host "📝 Đang tạo placeholder icons..." -ForegroundColor Cyan

foreach ($size in $iconSizes) {
    $iconPath = Join-Path $iconsDir "icon-${size}x${size}.png"
    
    if (Test-Path $iconPath) {
        Write-Host "⏭️  Đã có: icon-${size}x${size}.png" -ForegroundColor Gray
        continue
    }
    
    # Tạo file text placeholder (sẽ được thay thế bằng icon thật sau)
    $content = "# Placeholder icon - ${size}x${size}`n# Vui lòng thay thế file này bằng icon thật`n# Có thể tạo tại: https://www.pwabuilder.com/imageGenerator"
    Set-Content -Path $iconPath -Value $content
    Write-Host "📝 Đã tạo placeholder: icon-${size}x${size}.png" -ForegroundColor Yellow
}

Write-Host "`n✅ Hoàn thành!" -ForegroundColor Green
Write-Host "`n📝 Lưu ý:" -ForegroundColor Cyan
Write-Host "   - Các file này là placeholder, bạn cần tạo icon thật" -ForegroundColor Yellow
Write-Host "   - Có thể dùng: https://www.pwabuilder.com/imageGenerator" -ForegroundColor Yellow
Write-Host "   - Hoặc tạo icon 512x512 và resize thành các kích thước khác" -ForegroundColor Yellow
