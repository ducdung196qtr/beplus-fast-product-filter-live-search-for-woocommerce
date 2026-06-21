# Local wrapper — same as: npm run composer -- install
# Usage from plugin root: .\composer.ps1 install
& node "$PSScriptRoot/scripts/composer.mjs" @args
exit $LASTEXITCODE
