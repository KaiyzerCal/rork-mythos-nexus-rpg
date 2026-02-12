param(
  [string]$Root = "."
)

function Section($t) { "`n=== $t ===" | Write-Host }
function ShowHits($title, $pattern, $path=$Root) {
  Section $title
  $hits = Get-ChildItem -Path $path -Recurse -File -ErrorAction SilentlyContinue |
    Select-String -Pattern $pattern -ErrorAction SilentlyContinue |
    Select-Object Path, LineNumber, Line

  if ($hits) { $hits | Format-Table -AutoSize }
  else { "No matches." | Write-Host }
}

Section "Repo location"
(Get-Location).Path | Write-Host

ShowHits "AsyncStorage usage" "AsyncStorage\.(getItem|setItem|removeItem|mergeItem)"
ShowHits "SQLite openDatabase calls" "(openDatabase|openDatabaseAsync|SQLite\.openDatabase|expo-sqlite)"
ShowHits "json_store references" "json_store"
ShowHits "jsonStore helper usage" "jsonStore(Set|Get|Remove)"
ShowHits "Compression usage" "(deflate|inflate|base64|compress|decompress)"
ShowHits "Stop/Cancel refs" "(stopRequestedRef|cancelSendRef|requestStop\()"
ShowHits "Stop/Cancel guard lines" "if\s*\(\s*(stopRequestedRef|cancelSendRef)\.current\s*\)\s*return"
ShowHits "Possible module-scope hook calls" "^(export\s+)?(const|let|var)\s+.*=\s*use(State|Ref|Memo|Callback|Effect)\("

Section "DONE"
