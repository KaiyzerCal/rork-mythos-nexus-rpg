Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Set-Location "C:\src\mythos"

Write-Host "== Typecheck ==" -ForegroundColor Cyan
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { throw "TypeScript typecheck failed." }

Write-Host "== Grep: chat/networking ==" -ForegroundColor Cyan
Get-ChildItem -Recurse -File .\app .\lib -Include *.ts,*.tsx |
  ForEach-Object {
    Select-String -LiteralPath $_.FullName -Pattern 'fetch\(|AbortController|OpenAI|stream|AsyncStorage|expo-sqlite|threadStore|initThreadStore' -ErrorAction SilentlyContinue
  } | Select-Object Path,LineNumber,Line | Format-Table -AutoSize

Write-Host "== Audit ==" -ForegroundColor Cyan
npm audit
