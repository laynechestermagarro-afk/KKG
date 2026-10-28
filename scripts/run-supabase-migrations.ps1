param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z0-9]{20}$')]
    [string] $ProjectRef,

    [switch] $Apply
)

$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$supabaseConfig = Join-Path $repositoryRoot 'supabase\config.toml'

if (-not (Test-Path -LiteralPath $supabaseConfig)) {
    throw "Supabase config not found at '$supabaseConfig'. Run this script from a repository checkout."
}

$npxCommand = Get-Command npx.cmd -ErrorAction SilentlyContinue
if ($null -eq $npxCommand) {
    throw 'npx.cmd was not found. Install Node.js LTS and reopen PowerShell.'
}

Push-Location $repositoryRoot
try {
    Write-Host "Linking this checkout to Supabase project $ProjectRef..."
    & $npxCommand.Source supabase link --project-ref $ProjectRef
    if ($LASTEXITCODE -ne 0) {
        throw "Supabase link failed with exit code $LASTEXITCODE."
    }

    Write-Host 'Current migration history:'
    & $npxCommand.Source supabase migration list
    if ($LASTEXITCODE -ne 0) {
        throw "Could not read migration history (exit code $LASTEXITCODE)."
    }

    if ($Apply) {
        Write-Warning 'This applies every pending migration to the linked hosted database.'
        & $npxCommand.Source supabase db push
        if ($LASTEXITCODE -ne 0) {
            throw "Supabase db push failed with exit code $LASTEXITCODE."
        }
    }
    else {
        Write-Host 'Preview only; no database changes were applied.'
        & $npxCommand.Source supabase db push --dry-run
        if ($LASTEXITCODE -ne 0) {
            throw "Supabase migration preview failed with exit code $LASTEXITCODE."
        }
        Write-Host 'Review the preview with your team. Add -Apply only when approved.'
    }
}
finally {
    Pop-Location
}
