# Script to rename character files in hinh_compress folder
# Format: nam bs level5.png -> nam_bs_level5.png

$folderPath = "D:\linh tinh\web_for_FaSol\hinh_compress"

if (-not (Test-Path $folderPath)) {
    Write-Host "Folder khong ton tai: $folderPath" -ForegroundColor Red
    exit
}

Write-Host "Dang rename files trong: $folderPath" -ForegroundColor Green
Write-Host ""

$renamedCount = 0
$skippedCount = 0

Get-ChildItem -Path $folderPath -File | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName
    $renamed = $false
    
    # nam bs levelX.png -> nam_bs_levelX.png
    if ($oldName -match '^nam bs level(\d+)\.png$') {
        $newName = $oldName -replace '^nam bs level(\d+)\.png$', 'nam_bs_level$1.png'
        $renamed = $true
    }
    # nu bs levelX.png -> nu_bs_levelX.png
    elseif ($oldName -match '^nu bs level(\d+)\.png$') {
        $newName = $oldName -replace '^nu bs level(\d+)\.png$', 'nu_bs_level$1.png'
        $renamed = $true
    }
    # nam ch levelX.png -> nam_ch_levelX.png
    elseif ($oldName -match '^nam ch level(\d+)\.png$') {
        $newName = $oldName -replace '^nam ch level(\d+)\.png$', 'nam_ch_level$1.png'
        $renamed = $true
    }
    # nu ch levelX.png -> nu_ch_levelX.png
    elseif ($oldName -match '^nu ch level(\d+)\.png$') {
        $newName = $oldName -replace '^nu ch level(\d+)\.png$', 'nu_ch_level$1.png'
        $renamed = $true
    }
    # nam cs level X.png -> nam_cs_levelX.png (co space trong "level 5")
    elseif ($oldName -match '^nam cs level (\d+)\.png$') {
        $newName = $oldName -replace '^nam cs level (\d+)\.png$', 'nam_cs_level$1.png'
        $renamed = $true
    }
    # nam cs levelX.png -> nam_cs_levelX.png
    elseif ($oldName -match '^nam cs level(\d+)\.png$') {
        $newName = $oldName -replace '^nam cs level(\d+)\.png$', 'nam_cs_level$1.png'
        $renamed = $true
    }
    # nu cs levelX.png -> nu_cs_levelX.png
    elseif ($oldName -match '^nu cs level(\d+)\.png$') {
        $newName = $oldName -replace '^nu cs level(\d+)\.png$', 'nu_cs_level$1.png'
        $renamed = $true
    }
    
    if ($renamed -and $newName -ne $oldName) {
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
Write-Host "Da rename: $renamedCount files" -ForegroundColor Cyan
Write-Host "Da bo qua: $skippedCount files" -ForegroundColor Yellow
