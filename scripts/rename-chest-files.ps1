# Script to rename chest files in hinh_compress folder
# Format: wood chest new.png -> wood_chest_closed.png

$folderPath = "D:\linh tinh\web_for_FaSol\hinh_compress"

if (-not (Test-Path $folderPath)) {
    Write-Host "Folder khong ton tai: $folderPath" -ForegroundColor Red
    exit
}

Write-Host "Dang rename chest files trong: $folderPath" -ForegroundColor Green
Write-Host ""

$renamedCount = 0
$skippedCount = 0

# Mapping chest names
$chestMapping = @{
    'wood chest new.png' = 'wood_chest_closed.png'
    'silver chest new.png' = 'silver_chest_closed.png'
    'gold chest new.png' = 'gold_chest_closed.png'
    'mystery chest new.png' = 'mystery_chest_closed.png'
    'legendary chest new.png' = 'legendary_chest_closed.png'
}

Get-ChildItem -Path $folderPath -File | ForEach-Object {
    $oldName = $_.Name
    
    if ($chestMapping.ContainsKey($oldName)) {
        $newName = $chestMapping[$oldName]
        $oldPath = $_.FullName
        $newPath = Join-Path $folderPath $newName
        
        if (Test-Path $newPath) {
            Write-Host "File da ton tai, bo qua: $newName" -ForegroundColor Yellow
            $skippedCount++
        } else {
            try {
                Rename-Item -Path $oldPath -NewName $newName -ErrorAction Stop
                Write-Host "OK: $oldName -> $newName" -ForegroundColor Green
                $renamedCount++
            } catch {
                Write-Host "Loi khi rename: $oldName" -ForegroundColor Red
                $skippedCount++
            }
        }
    } else {
        $skippedCount++
    }
}

Write-Host ""
Write-Host "Hoan thanh!" -ForegroundColor Green
Write-Host "Da rename: $renamedCount chest files" -ForegroundColor Cyan
Write-Host "Da bo qua: $skippedCount files" -ForegroundColor Yellow

