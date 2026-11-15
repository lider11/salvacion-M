param([int]$Port = 8088)
$ErrorActionPreference = 'Stop'
$phpCommand = Get-Command php -ErrorAction SilentlyContinue
if ($phpCommand) { $phpBinary = $phpCommand.Source }
elseif (Test-Path -LiteralPath 'C:\xampp\php\php.exe') { $phpBinary = 'C:\xampp\php\php.exe' }
else { throw 'PHP no encontrado. Instala PHP 8.2+ con pdo_sqlite y mbstring o agrega PHP al PATH.' }
& $phpBinary (Join-Path $PSScriptRoot 'backend/serve-local.php') $Port
exit $LASTEXITCODE
