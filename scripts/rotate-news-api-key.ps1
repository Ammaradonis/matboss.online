param(
  [string]$EnvFile = ".env",
  [string]$IssuedTo = "Make.com"
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$resolvedEnvFile = if ([System.IO.Path]::IsPathRooted($EnvFile)) {
  $EnvFile
} else {
  Join-Path $repoRoot $EnvFile
}

$apiKeyBytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $rng.GetBytes($apiKeyBytes)
} finally {
  $rng.Dispose()
}
$apiKey = [Convert]::ToBase64String($apiKeyBytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')

$sha256 = [System.Security.Cryptography.SHA256]::Create()
try {
  $hashBytes = $sha256.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($apiKey))
} finally {
  $sha256.Dispose()
}
$hash = ([System.BitConverter]::ToString($hashBytes)).Replace('-', '').ToLowerInvariant()

$existingLines = if (Test-Path -LiteralPath $resolvedEnvFile) {
  [string[]](Get-Content -LiteralPath $resolvedEnvFile)
} else {
  @()
}

$updatedLines = [System.Collections.Generic.List[string]]::new()
$replaced = $false

foreach ($line in $existingLines) {
  if ($line -match '^BLOG_INGEST_API_KEY_HASH=') {
    $updatedLines.Add("BLOG_INGEST_API_KEY_HASH=$hash")
    $replaced = $true
  } else {
    $updatedLines.Add($line)
  }
}

if (-not $replaced) {
  if ($updatedLines.Count -gt 0 -and $updatedLines[$updatedLines.Count - 1] -ne '') {
    $updatedLines.Add('')
  }

  $updatedLines.Add("BLOG_INGEST_API_KEY_HASH=$hash")
}

Set-Content -LiteralPath $resolvedEnvFile -Value $updatedLines -Encoding utf8

Write-Host ""
Write-Host "Blog ingestion API key rotated."
Write-Host "Issued to : $IssuedTo"
Write-Host "Env file  : $resolvedEnvFile"
Write-Host "Header    : x-api-key"
Write-Host "API key   : $apiKey"
Write-Host "Hash      : $hash"
Write-Host ""
Write-Host "Make.com HTTP module:"
Write-Host "  URL: https://matboss.online/api/news-posts"
Write-Host "  Method: POST"
Write-Host "  Header: x-api-key = $apiKey"
Write-Host "  Header: Content-Type = application/json"
Write-Host ""
Write-Host "The raw key is shown only in this output. Store it in Make.com now."
