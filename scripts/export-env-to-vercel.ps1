# Script để export danh sách Environment Variables từ .env.local
# Sử dụng để thêm vào Vercel Dashboard

Write-Host "🔍 Đang đọc file .env.local..." -ForegroundColor Cyan

$envFile = ".env.local"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ Không tìm thấy file .env.local" -ForegroundColor Red
    Write-Host "   Vui lòng đảm bảo file .env.local tồn tại trong thư mục app_task_family" -ForegroundColor Yellow
    exit 1
}

$envVars = @{}
$lines = Get-Content $envFile

foreach ($line in $lines) {
    # Bỏ qua comment và dòng trống
    if ($line -match '^\s*#' -or $line -match '^\s*$') {
        continue
    }
    
    # Parse key=value
    if ($line -match '^([^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        
        # Remove quotes nếu có
        if ($value -match '^["''](.*)["'']$') {
            $value = $matches[1]
        }
        
        $envVars[$key] = $value
    }
}

Write-Host "✅ Đã đọc được $($envVars.Count) environment variables" -ForegroundColor Green
Write-Host ""

# Tạo checklist
Write-Host "📋 DANH SÁCH ENVIRONMENT VARIABLES CẦN THÊM VÀO VERCEL:" -ForegroundColor Cyan
Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""

$index = 1
foreach ($key in $envVars.Keys | Sort-Object) {
    $value = $envVars[$key]
    $maskedValue = if ($value.Length -gt 20) { 
        $value.Substring(0, 10) + "..." + $value.Substring($value.Length - 5)
    } else {
        "***" * [math]::Floor($value.Length / 3)
    }
    
    Write-Host "$index. $key" -ForegroundColor Yellow
    Write-Host "   Value: $maskedValue" -ForegroundColor Gray
    Write-Host ""
    $index++
}

Write-Host ("=" * 80) -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 HƯỚNG DẪN THÊM VÀO VERCEL:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Vào Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "2. Chọn project của bạn" -ForegroundColor White
Write-Host "3. Vào Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Thêm từng biến với:" -ForegroundColor White
Write-Host "   - Name: Tên biến (copy từ danh sách trên)" -ForegroundColor Gray
Write-Host "   - Value: Giá trị từ file .env.local của bạn" -ForegroundColor Gray
Write-Host "   - Environment: Chọn cả 3 (Production, Preview, Development)" -ForegroundColor Gray
Write-Host "5. Click Save" -ForegroundColor White
Write-Host "6. Redeploy project" -ForegroundColor White
Write-Host ""

# Export ra file text để dễ copy
$outputFile = "vercel-env-vars-checklist.txt"
$output = @()
$output += ("=" * 80)
$output += "DANH SÁCH ENVIRONMENT VARIABLES CẦN THÊM VÀO VERCEL"
$output += ("=" * 80)
$output += ""
$output += "Tổng số: $($envVars.Count) biến"
$output += ""
$output += "Danh sách:"
$output += ""

foreach ($key in $envVars.Keys | Sort-Object) {
    $output += "$key"
}

$output += ""
$output += ("=" * 80)
$output += "HƯỚNG DẪN:"
$output += "1. Vào Vercel Dashboard → Project → Settings → Environment Variables"
$output += "2. Thêm từng biến với Name và Value từ file .env.local"
$output += "3. Chọn cả 3 môi trường: Production, Preview, Development"
$output += "4. Redeploy project"
$output += ("=" * 80)

$output | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host "✅ Đã tạo file checklist: $outputFile" -ForegroundColor Green
Write-Host "   Bạn có thể mở file này để xem danh sách đầy đủ" -ForegroundColor Gray
Write-Host ""
