# Auto Version Increment Script for Klioso (PowerShell)
# Automatically increments patch version based on commits since last tag
# Adds stability tags (alpha/beta/unstable) based on analysis

Write-Host "🚀 Klioso Auto Version Increment" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue

# Get the last version tag
$LastTag = git tag --sort=-version:refname | Select-Object -First 1
if (-not $LastTag) {
    Write-Host "❌ No previous version tags found" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Last Version: $LastTag" -ForegroundColor Green

# Count commits since last tag
$CommitCount = git rev-list --count "$LastTag..HEAD"
Write-Host "📊 Commits since last release: $CommitCount" -ForegroundColor Green

if ($CommitCount -eq 0) {
    Write-Host "⚠️  No new commits since last release" -ForegroundColor Yellow
    exit 0
}

# Extract version numbers
$LastVersion = $LastTag -replace '^v', ''
$VersionParts = $LastVersion -split '\.'
$Major = $VersionParts[0]
$Minor = $VersionParts[1]
$Patch = ($VersionParts[2] -split '-')[0]  # Remove any existing suffixes

# Calculate new patch version
$NewPatch = [int]$Patch + [int]$CommitCount
$NewVersion = "$Major.$Minor.$NewPatch"

Write-Host "🎯 Calculated Version: $NewVersion" -ForegroundColor Green

# Analyze commit types for stability determination
Write-Host "🔍 Analyzing commit types..." -ForegroundColor Blue

$BreakingChanges = (git log "$LastTag..HEAD" --oneline | Select-String -Pattern "(BREAKING|breaking|feat!|fix!)" | Measure-Object).Count
$Features = (git log "$LastTag..HEAD" --oneline | Select-String -Pattern "^[a-f0-9]+ feat" | Measure-Object).Count
$Fixes = (git log "$LastTag..HEAD" --oneline | Select-String -Pattern "^[a-f0-9]+ fix" | Measure-Object).Count
$Refactors = (git log "$LastTag..HEAD" --oneline | Select-String -Pattern "^[a-f0-9]+ refactor" | Measure-Object).Count
$Docs = (git log "$LastTag..HEAD" --oneline | Select-String -Pattern "^[a-f0-9]+ docs" | Measure-Object).Count

Write-Host "  - Breaking changes: $BreakingChanges"
Write-Host "  - New features: $Features"
Write-Host "  - Bug fixes: $Fixes"
Write-Host "  - Refactoring: $Refactors"
Write-Host "  - Documentation: $Docs"

# Determine stability suffix
$Stability = ""
$StabilityName = "stable"
if ($BreakingChanges -gt 0 -or $Refactors -gt 3) {
    $Stability = "-alpha"
    $StabilityName = "alpha"
    Write-Host "⚠️  Major changes detected - marking as ALPHA" -ForegroundColor Red
} elseif ($Features -gt 2 -or $CommitCount -gt 10) {
    $Stability = "-beta"
    $StabilityName = "beta"
    Write-Host "⚠️  Significant changes detected - marking as BETA" -ForegroundColor Yellow
} elseif ($Fixes -gt 5) {
    $Stability = "-unstable"
    $StabilityName = "unstable"
    Write-Host "⚠️  Many fixes detected - marking as UNSTABLE" -ForegroundColor Yellow
} else {
    Write-Host "✅ Changes appear stable - no suffix needed" -ForegroundColor Green
}

$FinalVersion = "$NewVersion$Stability"
Write-Host "🎉 Final Version: $FinalVersion" -ForegroundColor Green

# Ask for confirmation
$Confirmation = Read-Host "Update version to $FinalVersion? (y/N)"
if ($Confirmation -ne 'y' -and $Confirmation -ne 'Y') {
    Write-Host "❌ Version update cancelled" -ForegroundColor Yellow
    exit 0
}

# Update version.json
Write-Host "📝 Updating version.json..." -ForegroundColor Blue
$Timestamp = [int][double]::Parse((Get-Date -UFormat %s))
$Date = Get-Date -Format "yyyy-MM-dd"

$VersionJson = @{
    version = $FinalVersion
    release_date = $Date
    release_timestamp = $Timestamp
    codename = "Auto-generated Release"
    description = "Automated version increment with $CommitCount commits"
    type = "patch"
    stability = $StabilityName
} | ConvertTo-Json -Depth 10

$VersionJson | Out-File -FilePath "version.json" -Encoding UTF8

# Update package.json
Write-Host "📝 Updating package.json..." -ForegroundColor Blue
$PackageContent = Get-Content "package.json" -Raw
$PackageContent = $PackageContent -replace '"version": ".*"', "`"version`": `"$FinalVersion`""
$PackageContent | Out-File -FilePath "package.json" -Encoding UTF8 -NoNewline

Write-Host "✅ Version files updated successfully" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Blue
Write-Host "1. Review the changes: git diff"
Write-Host "2. Commit the version update: git add version.json package.json && git commit -m 'chore: bump version to $FinalVersion'"
Write-Host "3. Create git tag: git tag v$FinalVersion"
Write-Host "4. Push changes: git push origin dev --tags"

Write-Host ""
Write-Host "🎉 Auto-versioning complete!" -ForegroundColor Green
