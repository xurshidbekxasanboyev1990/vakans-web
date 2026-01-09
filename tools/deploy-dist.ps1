[CmdletBinding()]
param(
  [string]$ServerHost = "77.237.239.235",
  [string]$User = "root",
  [int]$Port = 22,

  # aaPanel Nginx root. O'zingizdagi real path bilan moslang.
  [string]$RemotePath = "/www/wwwroot/77.237.239.235",

  # Ixtiyoriy: lokal build ham qilinsin
  [switch]$Build,

  # Ixtiyoriy: nginx reload qilinsin
  [switch]$ReloadNginx,

  # Ixtiyoriy: old fayllarni /tmp ga backup qilib qo'ysin
  [switch]$Backup
)

$ErrorActionPreference = "Stop"

function Require-Cmd([string]$Name) {
  if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
    throw "`"$Name`" topilmadi. Windows OpenSSH Client o'rnatilganini tekshiring (ssh/scp)."
  }
}

Require-Cmd ssh
Require-Cmd scp

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot ".."))
$DistPath = Join-Path $RepoRoot "dist"

if ($Build) {
  Push-Location $RepoRoot
  npm run build
  Pop-Location
}

if (-not (Test-Path $DistPath)) {
  throw "`"dist`" topilmadi: $DistPath. Avval `npm run build` qiling."
}

$Stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$TmpDir = "/tmp/vakans-dist-$Stamp"
$BackupDir = "/tmp/vakans-backup-$Stamp"

$SshTarget = "$User@$ServerHost"
$SshArgs = @("-p", "$Port", $SshTarget)
$ScpArgs = @("-P", "$Port")

Write-Host "== Deploy dist ==" -ForegroundColor Cyan
Write-Host "Host: $($SshTarget):$Port"
Write-Host "RemotePath: $RemotePath"
Write-Host "TmpDir: $TmpDir"

# 1) Remote tmp dir
& ssh @SshArgs "set -e; mkdir -p $TmpDir" | Out-Host

# 2) Upload dist/* to tmp
$LocalSources = Get-ChildItem -LiteralPath $DistPath -Force | ForEach-Object { $_.FullName }
if (-not $LocalSources -or $LocalSources.Count -eq 0) {
  throw "`"dist`" ichi bo'sh: $DistPath"
}

& scp @ScpArgs -r @LocalSources ("$SshTarget`:$TmpDir/") | Out-Host

$BackupFlag = if ($Backup.IsPresent) { "1" } else { "0" }
$ReloadFlag = if ($ReloadNginx.IsPresent) { "1" } else { "0" }

# 3) Swap files on server
$RemoteCmd = @"
set -e

if [ ! -d \"$RemotePath\" ]; then
  echo \"[ERROR] RemotePath topilmadi: $RemotePath\" >&2
  exit 1
fi

if [ \"$BackupFlag\" = \"1\" ]; then
  mkdir -p \"$BackupDir\"
  cp -a \"$RemotePath/.\" \"$BackupDir/\" 2>/dev/null || true
  echo \"[OK] Backup: $BackupDir\"
fi

# Old hashed assets qolib ketmasligi uchun
rm -rf \"$RemotePath/assets\" \"$RemotePath/icons\" 2>/dev/null || true

# dist ichidagi hammasini web rootga ko'chiramiz
cp -a \"$TmpDir/.\" \"$RemotePath/\"

# tmp ni tozalash
rm -rf \"$TmpDir\" 2>/dev/null || true

# Permissions (root bo'lmasa xatoni yutib yuboramiz)
chown -R www:www \"$RemotePath\" 2>/dev/null || true
chmod -R 755 \"$RemotePath\" 2>/dev/null || true

if [ \"$ReloadFlag\" = \"1\" ]; then
  nginx -t && (systemctl reload nginx || service nginx reload || true)
  echo \"[OK] nginx reloaded\"
fi

echo \"[DONE] dist deployed to $RemotePath\"
"@

# SSH orqali yuboriladigan bash skript CRLF bo'lib ketmasin
$RemoteCmd = $RemoteCmd -replace "`r`n", "`n"
$RemoteCmd = $RemoteCmd -replace "`r", ""

& ssh @SshArgs $RemoteCmd | Out-Host

Write-Host "\nEslatma: brauzerda eski build qolsa, DevTools -> Application -> Service Workers -> Unregister + Clear site data qiling." -ForegroundColor Yellow
