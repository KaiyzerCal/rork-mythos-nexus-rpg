Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$RepoRoot = (Get-Location).Path
$MavisFile = Join-Path $RepoRoot "app\(tabs)\mavis.tsx"

function Backup-File($path) {
  if (Test-Path $path) {
    $ts = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item -Force $path "$path.bak.$ts"
  }
}

function Write-TextFileUtf8NoBom($path, $content) {
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
}

function Read-Raw($path) { Get-Content $path -Raw }

function Insert-ImportIfMissing($filePath, $importLine) {
  $raw = Read-Raw $filePath
  if ($raw -match [regex]::Escape($importLine.Trim())) { return $false }

  $imports = [regex]::Matches($raw, '(?m)^import .*?;\s*$')
  if ($imports.Count -eq 0) { throw "No import block found in $filePath" }

  $last = $imports[$imports.Count - 1]
  $insertPos = $last.Index + $last.Length

  $newRaw = $raw.Insert($insertPos, "`n$importLine`n")
  Backup-File $filePath
  Write-TextFileUtf8NoBom $filePath $newRaw
  return $true
}

function Ensure-StopScaffold($filePath) {
  $raw = Read-Raw $filePath
  if ($raw -match 'function\s+requestStop\s*\(' -and $raw -match 'stopRequestedRef\.current') {
    Write-Host "Stop scaffold already present." -ForegroundColor Green
    return
  }

  $scaffold = @'

/** --- Stop/Cancel send scaffold (Vantara) --- */
const stopRequestedRef = (typeof React !== "undefined" && React.useRef) ? React.useRef(false) : useRef(false);
const activeRunIdRef = (typeof React !== "undefined" && React.useRef) ? React.useRef<string | null>(null) : useRef<string | null>(null);

type SendState = "idle" | "sending" | "streaming" | "stopping";
const [sendState, setSendState] =
  (typeof React !== "undefined" && React.useState) ? React.useState<SendState>("idle") : useState<SendState>("idle");

function requestStop() {
  stopRequestedRef.current = true;
  activeRunIdRef.current = null;
  setSendState("idle");
}
/** ----------------------------------------- */

'@

  $m = [regex]::Match($raw, '(?s)(\{\s*)(.*?)(\n\s*return\s*\()')
  if (-not $m.Success) { throw "Could not find safe insertion point for stop scaffold." }

  $insertPos = $m.Groups[1].Index + $m.Groups[1].Length
  $newRaw = $raw.Insert($insertPos, $scaffold)

  Backup-File $filePath
  Write-TextFileUtf8NoBom $filePath $newRaw
  Write-Host "Inserted Stop scaffold." -ForegroundColor Green
}

function Try-ExtractTextInputSetter($raw) {
  $m1 = [regex]::Match($raw, 'onChangeText\s*=\s*\{\s*\(\s*\w+\s*\)\s*=>\s*(\w+)\s*\(\s*\w+\s*\)\s*\}', 'Singleline')
  if ($m1.Success) { return $m1.Groups[1].Value }

  $m2 = [regex]::Match($raw, 'onChangeText\s*=\s*\{\s*(\w+)\s*\}', 'Singleline')
  if ($m2.Success) { return $m2.Groups[1].Value }

  return $null
}

function Find-SendButtonAnchor($raw) {
  # Try common patterns: onPress={...} near Text "Send" or icon, or calling a function that uses draft/input
  # We'll just match the first Pressable/TouchableOpacity with onPress= that appears AFTER the TextInput.
  $ti = [regex]::Match($raw, '(?s)<TextInput\b.*?\/?>')
  if (-not $ti.Success) { return $null }

  $after = $raw.Substring($ti.Index + $ti.Length)
  $m = [regex]::Match($after, '(?s)(\s*)(<(Pressable|TouchableOpacity)[^>]*onPress\s*=\s*\{.*?\}\s*[^>]*>)')
  if (-not $m.Success) { return $null }

  # Return index in original string
  return @{ Index = ($ti.Index + $ti.Length + $m.Index); Indent = $m.Groups[1].Value }
}

function Insert-PasteAndStopButtons($filePath) {
  $raw = Read-Raw $filePath

  $setter = Try-ExtractTextInputSetter $raw
  if (-not $setter) { throw "Could not find TextInput onChangeText setter in mavis.tsx" }

  $anchor = Find-SendButtonAnchor $raw
  if (-not $anchor) { throw "Could not find a Pressable/TouchableOpacity onPress after TextInput (Send button anchor)." }

  $indent = $anchor.Indent

  if ($raw -notmatch 'getClipboardText\(\)') {
    $pasteBlock = @"
$indent<Pressable
$indent  onPress={async () => {
$indent    const t = await getClipboardText();
$indent    const text = (t ?? "").trim();
$indent    if (!text) return;
$indent    $setter((prev: any) => (prev ? String(prev) + "`n" + text : text));
$indent  }}
$indent>
$indent  <Text>Paste</Text>
$indent</Pressable>

"@
    $newRaw = $raw.Insert($anchor.Index, $pasteBlock)
    Backup-File $filePath
    Write-TextFileUtf8NoBom $filePath $newRaw
    $raw = $newRaw
    Write-Host "Inserted Paste button." -ForegroundColor Green
  } else {
    Write-Host "Paste already appears wired." -ForegroundColor Green
  }

  # Add Stop button if requestStop exists
  $raw2 = Read-Raw $filePath
  if ($raw2 -match 'requestStop' -and $raw2 -notmatch 'onPress=\{requestStop\}') {
    $anchor2 = Find-SendButtonAnchor $raw2
    if ($anchor2) {
      $indent2 = $anchor2.Indent
      $stopBlock = @"
$indent2{sendState !== "idle" && (
$indent2  <Pressable onPress={requestStop}>
$indent2    <Text>Stop</Text>
$indent2  </Pressable>
$indent2)}

"@
      $newRaw2 = $raw2.Insert($anchor2.Index, $stopBlock)
      Backup-File $filePath
      Write-TextFileUtf8NoBom $filePath $newRaw2
      Write-Host "Inserted Stop button (conditional)." -ForegroundColor Green
    } else {
      Write-Host "Could not re-find anchor for Stop button insertion; add manually." -ForegroundColor Yellow
    }
  } else {
    Write-Host "Stop button already present or requestStop missing." -ForegroundColor Yellow
  }
}

function Patch-CopyOnLongPress($filePath) {
  $raw = Read-Raw $filePath

  if (($raw -match 'copyToClipboard\(') -and ($raw -match 'onLongPress=')) {
    Write-Host "Copy already appears wired." -ForegroundColor Green
    return
  }

  $matches = [regex]::Matches($raw, '\b(\w+)\.content\b')
  if ($matches.Count -eq 0) {
    Write-Host "Could not detect message.content usage. Copy patch skipped." -ForegroundColor Yellow
    return
  }

  $counts = @{}
  foreach ($m in $matches) {
    $v = $m.Groups[1].Value
    if (-not $counts.ContainsKey($v)) { $counts[$v] = 0 }
    $counts[$v]++
  }
  $msgVar = ($counts.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key

  $blockPattern = "(?s)<(Pressable|TouchableOpacity)([^>]*?)>(?:(?!<\/\1>).)*?\b$([regex]::Escape($msgVar))\.content\b(?:(?!<\/\1>).)*?<\/\1>"
  $mBlock = [regex]::Match($raw, $blockPattern)
  if (-not $mBlock.Success) {
    Write-Host "Could not find a Pressable/TouchableOpacity wrapping $msgVar.content. Copy patch skipped." -ForegroundColor Yellow
    return
  }

  $open = [regex]::Match($mBlock.Value, "<(Pressable|TouchableOpacity)([^>]*?)>")
  if (-not $open.Success) {
    Write-Host "Could not parse message container opening tag. Copy patch skipped." -ForegroundColor Yellow
    return
  }

  if ($open.Value -match 'onLongPress\s*=') {
    Write-Host "Message container already has onLongPress; skipping." -ForegroundColor Yellow
    return
  }

  # IMPORTANT: PowerShell-safe string (no \" escaping). Use single quotes in PS string, double quotes inside JSX.
  $newOpen = $open.Value.TrimEnd(">")
  $newOpen += ' onLongPress={async () => copyToClipboard(String(' + $msgVar + '.content ?? ""))}>'

  $patched = $mBlock.Value.Replace($open.Value, $newOpen)
  $newRaw = $raw.Replace($mBlock.Value, $patched)

  Backup-File $filePath
  Write-TextFileUtf8NoBom $filePath $newRaw
  Write-Host "Added Copy-on-long-press (uses $msgVar.content)." -ForegroundColor Green
}

function Patch-StopCheckInStreamLoop($filePath) {
  $raw = Read-Raw $filePath

  if ($raw -notmatch 'stopRequestedRef\.current') {
    Write-Host "No stopRequestedRef scaffold found; skipping stream loop patch." -ForegroundColor Yellow
    return
  }
  if ($raw -match 'if\s*\(\s*stopRequestedRef\.current\s*\)') {
    Write-Host "Stop check already present." -ForegroundColor Green
    return
  }

  $forAwait = [regex]::Match($raw, '(?s)(for\s+await\s*\(\s*const\s+\w+\s+of\s+[^)]+\)\s*\{\s*)')
  if ($forAwait.Success) {
    $newRaw = $raw.Insert($forAwait.Index + $forAwait.Length, "if (stopRequestedRef.current) { break; }`n")
    Backup-File $filePath
    Write-TextFileUtf8NoBom $filePath $newRaw
    Write-Host "Inserted stop check into for-await loop." -ForegroundColor Green
    return
  }

  $whileTrue = [regex]::Match($raw, '(?s)(while\s*\(\s*true\s*\)\s*\{\s*)')
  if ($whileTrue.Success) {
    $newRaw = $raw.Insert($whileTrue.Index + $whileTrue.Length, "if (stopRequestedRef.current) { break; }`n")
    Backup-File $filePath
    Write-TextFileUtf8NoBom $filePath $newRaw
    Write-Host "Inserted stop check into while(true) loop." -ForegroundColor Green
    return
  }

  Write-Host "No recognizable stream loop found; add `if (stopRequestedRef.current) break;` inside your chunk loop manually." -ForegroundColor Yellow
}

# ----------------------------
# RUN
# ----------------------------
if (!(Test-Path $MavisFile)) { throw "Target not found: $MavisFile" }

Write-Host "Patching: $MavisFile" -ForegroundColor Cyan

Insert-ImportIfMissing $MavisFile 'import { copyToClipboard, getClipboardText } from "../src/utils/clipboard";' | Out-Null

Ensure-StopScaffold $MavisFile
Insert-PasteAndStopButtons $MavisFile
Patch-CopyOnLongPress $MavisFile
Patch-StopCheckInStreamLoop $MavisFile

Write-Host "`nDONE. Backups created as *.bak.* next to mavis.tsx" -ForegroundColor Green
Write-Host "Reminder: install clipboard if needed: npx expo install expo-clipboard" -ForegroundColor Cyan

