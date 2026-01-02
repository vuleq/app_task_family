# Script to copy files from hinh_compress to project folders

$sourcePath = "D:\linh tinh\web_for_FaSol\hinh_compress"
$targetPath = "D:\linh tinh\web_for_FaSol\app_task_family\public\pic-avatar"

if (-not (Test-Path $sourcePath)) {
    Write-Host "Source folder khong ton tai: $sourcePath" -ForegroundColor Red
    exit
}

if (-not (Test-Path $targetPath)) {
    New-Item -ItemType Directory -Path $targetPath -Force | Out-Null
    Write-Host "Da tao folder: $targetPath" -ForegroundColor Green
}

Write-Host "Dang copy files tu: $sourcePath" -ForegroundColor Green
Write-Host "Den: $targetPath" -ForegroundColor Green
Write-Host ""

$copiedCount = 0
$skippedCount = 0

# Copy character files (nam1, nam2, nu1, nu2, nam_bs_levelX, etc.)
Get-ChildItem -Path $sourcePath -File | Where-Object {
    $_.Name -match '^(nam[12]|nu[12]|nam_(bs|ch|cs)_level\d+|nu_(bs|ch|cs)_level\d+)\.png$'
} | ForEach-Object {
    $sourceFile = $_.FullName
    $targetFile = Join-Path $targetPath $_.Name
    
    if (Test-Path $targetFile) {
        Write-Host "File da ton tai, bo qua: $($_.Name)" -ForegroundColor Yellow
        $skippedCount++
    } else {
        try {
            Copy-Item -Path $sourceFile -Destination $targetFile -ErrorAction Stop
            Write-Host "OK: $($_.Name)" -ForegroundColor Green
            $copiedCount++
        } catch {
            Write-Host "Loi khi copy: $($_.Name)" -ForegroundColor Red
            $skippedCount++
        }
    }
}

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "Da copy: $copiedCount character files" -ForegroundColor Cyan
Write-Host "Da bo qua: $skippedCount files" -ForegroundColor Yellow
Write-Host ""
Write-Host "Luu y: Chest files se duoc upload len Cloudinary, khong can copy vao project." -ForegroundColor Yellow

