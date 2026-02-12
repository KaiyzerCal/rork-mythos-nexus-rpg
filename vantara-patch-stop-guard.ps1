# ============================================================
# VANTARA PATCH — Add stopRequestedRef guard after sendMessage()
# Target: app\(tabs)\mavis.tsx
#
# What it does:
# 1) Makes a timestamped backup of mavis.tsx
# 2) Finds:  const result = await sendMessage({ text: fullMessage });
# 3) Ensures these guards exist immediately after it:
#       if (stopRequestedRef.current) return;
#       if (cancelSendRef.current) return;
#
# Run from repo root:
#   cd C:\src\mythos
#   powershell -ExecutionPolicy Bypass -File .\vantara-patch-stop-guard.ps1
# ============================================================

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot  = (Get-Location).Path
$MavisFile = Join-Path $RepoRoot "app\(tabs)\mavis.tsx"

function Backup-File($path) {
  $ts = Get-Date -Format "yyyyMMdd_HHmmss"
  Copy-Item -Force $path "$path.bak.$ts"
  return "$path.bak.$ts"
}

function Write-Utf8NoBom($path, $content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

if (!(Test-Path $MavisFile)) {
  throw "Target file not found: $MavisFile"
}

$raw = Get-Content $MavisFile -Raw

# Pattern we anchor on (tight enough to avoid random matches)
$anchorPattern = 'const\s+result\s*=\s*await\s+sendMessage\s*\(\s*\{\s*text\s*:\s*fullMessage\s*\}\s*\)\s*;'

if (-not ([regex]::IsMatch($raw, $anchorPattern))) {
  throw "Could not find anchor line: const result = await sendMessage({ text: fullMessage });"
}

# If already patched, exit cleanly
if ($raw -match 'if\s*\(\s*stopRequestedRef\.current\s*\)\s*return\s*;' ) {
  Write-Host "stopRequestedRef guard already present. No changes made." -ForegroundColor Green
  exit 0
}

# Replace: anchor + (optional existing cancel guard) -> anchor + stop guard + keep/ensure cancel guard
# We will:
# - Insert stop guard immediately after the anchor
# - Preserve any existing cancelSendRef guard; if missing, add it too
$replacement = {
  param($m)
  $anchorLine = $m.Value

  # Check if cancel guard exists immediately after anchor (within next ~200 chars)
  # We'll inspect the following text separately after replacement if needed.
  return $anchorLine + "`r`n`r`nif (stopRequestedRef.current) return;`r`n"
}

# First, insert stop guard after anchor
$newRaw = [regex]::Replace($raw, $anchorPattern, $replacement, 1)

# Now ensure cancelSendRef guard exists AFTER the newly inserted stop guard (or somewhere right after anchor)
# We only add it if not present anywhere in the send handler area. If you want it *strictly* adjacent,
# we can do a stricter patch—this is the safe version.
if ($newRaw -notmatch 'if\s*\(\s*cancelSendRef\.current\s*\)\s*return\s*;' ) {
  # Insert cancel guard immediately after the stop guard we just inserted
  $newRaw = $newRaw -replace 'if\s*\(\s*stopRequestedRef\.current\s*\)\s*return\s*;\s*', "if (stopRequestedRef.current) return;`r`nif (cancelSendRef.current) return;`r`n"
}

# Backup + write
$bak = Backup-File $MavisFile
Write-Utf8NoBom $MavisFile $newRaw

Write-Host "Patched: $MavisFile" -ForegroundColor Green
Write-Host "Backup:  $bak" -ForegroundColor Cyan
Write-Host "Inserted guard(s) after: const result = await sendMessage({ text: fullMessage });" -ForegroundColor Green
