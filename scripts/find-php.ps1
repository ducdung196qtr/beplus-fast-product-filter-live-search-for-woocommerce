# Find php.exe for Local WP / Laragon / XAMPP (Windows).
# Run from plugin root: npm run find-php

$script:paths = @()

function Add-PhpFromLightningRoot($root) {
	if (-not (Test-Path $root)) {
		return
	}

	Get-ChildItem $root -Directory -Filter 'php-*' -ErrorAction SilentlyContinue |
		ForEach-Object {
			$phpExe = Join-Path $_.FullName 'bin\win64\php.exe'
			if (Test-Path $phpExe) {
				$script:paths += $phpExe
			}
		}
}

if ($env:APPDATA) {
	Add-PhpFromLightningRoot (Join-Path $env:APPDATA 'Local\lightning-services')
}

if ($env:LOCALAPPDATA) {
	Add-PhpFromLightningRoot (Join-Path $env:LOCALAPPDATA 'Programs\Local\lightning-services')
	Add-PhpFromLightningRoot (Join-Path $env:LOCALAPPDATA 'Programs\Local\resources\extraResources\lightning-services')
}

$extras = @(
	'C:\laragon\bin\php\php.exe',
	'C:\xampp\php\php.exe'
)

foreach ($extra in $extras) {
	if (Test-Path $extra) {
		$script:paths += $extra
	}
}

try {
	$global = (Get-Command php -ErrorAction Stop).Source
	$script:paths = @($global) + $script:paths
} catch {
	# php not on PATH
}

$paths = $script:paths | Select-Object -Unique

if (-not $paths.Count) {
	Write-Host 'No php.exe found.'
	Write-Host ''
	Write-Host 'Try one of these:'
	Write-Host '  1. Start the "plugin" site in Local WP, then rerun npm run find-php'
	Write-Host '  2. winget install PHP.PHP.8.2'
	Write-Host '  3. Set PHP_BIN manually in .env (see .env.example)'
	exit 1
}

Write-Host 'Found PHP:'
foreach ($p in $paths) {
	Write-Host "  $p"
}

Write-Host ''
Write-Host 'Add to .env (pick one path):'
Write-Host "PHP_BIN=$($paths[0])"
