$ErrorActionPreference = 'Stop'
$path = 'd:\Kerjaan Web\SpaceOS\src\i18n\translations.ts'
$lines = Get-Content $path -Encoding UTF8

# Find section boundaries
$idStart = 0; $deStart = 0
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match '^\s*id:\s*\{') { $idStart = $i }
    if ($lines[$i] -match '^\s*de:\s*\{') { $deStart = $i }
}
Write-Output "id section starts at line $($idStart + 1)"
Write-Output "de section starts at line $($deStart + 1)"

function Get-Keys($start, $end) {
    $keys = @{}
    for ($i = $start; $i -lt $end; $i++) {
        if ($lines[$i] -match "^\s*'([a-z0-9_]+)'\s*:") {
            $keys[$Matches[1]] = ($Matches[1] + ' @line ' + ($i + 1))
        }
    }
    return $keys
}

$idKeys = Get-Keys $idStart $deStart
$deKeys = Get-Keys $deStart $lines.Count

Write-Output ""
Write-Output "=== Total keys: id=$($idKeys.Count) de=$($deKeys.Count) ==="
Write-Output ""
Write-Output "=== MISSING in de (present in id) ==="
$missing = $idKeys.Keys | Where-Object { -not $deKeys.ContainsKey($_) }
$missing | ForEach-Object { Write-Output ("MISSING-DE: " + $idKeys[$_]) }
Write-Output ""
Write-Output "=== EXTRA in de (not in id) ==="
$extra = $deKeys.Keys | Where-Object { -not $idKeys.ContainsKey($_) }
$extra | ForEach-Object { Write-Output ("EXTRA-DE: " + $deKeys[$_]) }