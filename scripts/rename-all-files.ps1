# Script to rename all remaining files in hinh_compress folder

$folderPath = "D:\linh tinh\web_for_FaSol\hinh_compress"

if (-not (Test-Path $folderPath)) {
    Write-Host "Folder khong ton tai: $folderPath" -ForegroundColor Red
    exit
}

Write-Host "Dang rename tat ca files trong: $folderPath" -ForegroundColor Green
Write-Host ""

$renamedCount = 0
$skippedCount = 0

Get-ChildItem -Path $folderPath -File | ForEach-Object {
    $oldName = $_.Name
    $newName = $oldName
    $renamed = $false
    
    # Bo do ruong (chest items)
    if ($oldName -match '^bo do ruong (.+)\.png$') {
        $content = $matches[1]
        # bo do ruong go.png -> chest_item_wood.png
        # bo do ruong go nam.png -> chest_item_wood_nam.png
        # bo do ruong go nu.png -> chest_item_wood_nu.png
        if ($content -match '^go$') {
            $newName = 'chest_item_wood.png'
            $renamed = $true
        }
        elseif ($content -match '^go nam$') {
            $newName = 'chest_item_wood_nam.png'
            $renamed = $true
        }
        elseif ($content -match '^go nu$') {
            $newName = 'chest_item_wood_nu.png'
            $renamed = $true
        }
        elseif ($content -match '^bac$') {
            $newName = 'chest_item_silver.png'
            $renamed = $true
        }
        elseif ($content -match '^bac nu$') {
            $newName = 'chest_item_silver_nu.png'
            $renamed = $true
        }
        elseif ($content -match '^vang$') {
            $newName = 'chest_item_gold.png'
            $renamed = $true
        }
        elseif ($content -match '^vang nam$') {
            $newName = 'chest_item_gold_nam.png'
            $renamed = $true
        }
        elseif ($content -match '^mystery$') {
            $newName = 'chest_item_mystery.png'
            $renamed = $true
        }
        elseif ($content -match '^mystery nam$') {
            $newName = 'chest_item_mystery_nam.png'
            $renamed = $true
        }
        elseif ($content -match '^legendary nam$') {
            $newName = 'chest_item_legendary_nam.png'
            $renamed = $true
        }
        elseif ($content -match '^legendary nu$') {
            $newName = 'chest_item_legendary_nu.png'
            $renamed = $true
        }
        elseif ($content -match '^legendary nu 2$') {
            $newName = 'chest_item_legendary_nu2.png'
            $renamed = $true
        }
    }
    # do do ruong vang nu.png -> chest_item_gold_nu.png
    elseif ($oldName -match '^do do ruong vang nu\.png$') {
        $newName = 'chest_item_gold_nu.png'
        $renamed = $true
    }
    # bo bo ruong mystery nu.png -> chest_item_mystery_nu.png
    elseif ($oldName -match '^bo bo ruong mystery nu\.png$') {
        $newName = 'chest_item_mystery_nu.png'
        $renamed = $true
    }
    # Coin files
    elseif ($oldName -match '^Coin-pounch-small\.png$') {
        $newName = 'coin_pouch_small.png'
        $renamed = $true
    }
    elseif ($oldName -match '^Coin-pouch-medium\.png$') {
        $newName = 'coin_pouch_medium.png'
        $renamed = $true
    }
    elseif ($oldName -match '^Gold-coin\.png$') {
        $newName = 'coin_gold.png'
        $renamed = $true
    }
    elseif ($oldName -match '^legendary-coin\.png$') {
        $newName = 'coin_legendary.png'
        $renamed = $true
    }
    elseif ($oldName -match '^mystery-coin\.png$') {
        $newName = 'coin_mystery.png'
        $renamed = $true
    }
    # XP files
    elseif ($oldName -match '^gold-XP\.png$') {
        $newName = 'xp_gold.png'
        $renamed = $true
    }
    elseif ($oldName -match '^mystery-XP\.png$') {
        $newName = 'xp_mystery.png'
        $renamed = $true
    }
    elseif ($oldName -match '^lagendary-xp\.png$') {
        $newName = 'xp_legendary.png'
        $renamed = $true
    }
    elseif ($oldName -match '^Small-star-XP\.png$') {
        $newName = 'xp_star_small.png'
        $renamed = $true
    }
    elseif ($oldName -match '^medium-star-XP\.png$') {
        $newName = 'xp_star_medium.png'
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

