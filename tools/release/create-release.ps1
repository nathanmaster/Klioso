# Klioso Release Script Launcher - PowerShell Edition
# Simple interface for creating releases with the enhanced release manager

param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$Version,
    
    [Parameter(Mandatory=$true, Position=1)]
    [string]$Description,
    
    [switch]$Major,
    [switch]$Minor,
    [switch]$Patch,
    [switch]$Stable,
    [switch]$Beta,
    [switch]$DryRun,
    [switch]$Help
)

# Colors are directly used with Write-Host -ForegroundColor parameter

function Write-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║                    🚀 Klioso Release Manager                     ║" -ForegroundColor Blue
    Write-Host "║                        Enhanced Edition                          ║" -ForegroundColor Blue
    Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

function Write-Usage {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\create-release.ps1 VERSION `"DESCRIPTION`" [OPTIONS]"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\create-release.ps1 0.9.47 `"Bug fixes and performance improvements`""
    Write-Host "  .\create-release.ps1 0.10.0 `"Major architecture overhaul`" -Major"
    Write-Host "  .\create-release.ps1 1.0.0 `"Production ready release`" -Stable"
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -Major      Major release with breaking changes"
    Write-Host "  -Minor      Minor release with new features (default)"
    Write-Host "  -Patch      Patch release with bug fixes only"
    Write-Host "  -Stable     Stable production release"
    Write-Host "  -Beta       Beta pre-release"
    Write-Host "  -DryRun     Preview changes without executing"
    Write-Host "  -Help       Show this help message"
    Write-Host ""
}

function Test-VersionFormat {
    param([string]$Version)
    
    if ($Version -notmatch '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+(\.[0-9]+)?)?$') {
        Write-Host "❌ Invalid version format. Use semantic versioning (X.Y.Z)" -ForegroundColor Red
        return $false
    }
    return $true
}

function Test-GitStatus {
    Write-Host "🔍 Checking git status..." -ForegroundColor Blue
    
    $gitStatus = git status --porcelain 2>$null
    if (-not $gitStatus) {
        Write-Host "✅ Working directory is clean" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Working directory has uncommitted changes:" -ForegroundColor Yellow
        git status --porcelain
        Write-Host ""
        $continue = Read-Host "Continue anyway? [y/N]"
        if ($continue -notmatch '^[Yy]$') {
            Write-Host "❌ Release cancelled" -ForegroundColor Red
            exit 1
        }
    }
}

function Test-CurrentBranch {
    $currentBranch = git branch --show-current 2>$null
    
    if ($currentBranch -notin @('main', 'master')) {
        Write-Host "⚠️  Currently on branch: $currentBranch" -ForegroundColor Yellow
        Write-Host "   Recommended to release from main/master branch" -ForegroundColor Yellow
        Write-Host ""
        $continue = Read-Host "Continue anyway? [y/N]"
        if ($continue -notmatch '^[Yy]$') {
            Write-Host "❌ Release cancelled" -ForegroundColor Red
            exit 1
        }
    }
}

function Start-PreReleaseChecks {
    param([string]$Version)
    
    Write-Host "🔍 Running pre-release checks..." -ForegroundColor Blue
    
    # Check if we're in the right directory
    $scriptDir = Split-Path -Parent $MyInvocation.ScriptName
    $projectRoot = Split-Path -Parent (Split-Path -Parent $scriptDir)
    
    if (-not (Test-Path "$projectRoot\version.json")) {
        Write-Host "❌ version.json not found. Are you in the right directory?" -ForegroundColor Red
        exit 1
    }
    
    # Check git status
    Test-GitStatus
    
    # Check current branch
    Test-CurrentBranch
    
    # Check if tag already exists
    $existingTag = git tag -l "v$Version" 2>$null
    if ($existingTag) {
        Write-Host "❌ Tag v$Version already exists" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ All pre-release checks passed" -ForegroundColor Green
    Write-Host ""
    
    return $projectRoot
}

function Start-Release {
    param(
        [string]$Version,
        [string]$Description,
        [string]$ProjectRoot,
        [array]$Options
    )
    
    Write-Host "🚀 Starting release process..." -ForegroundColor Blue
    Write-Host "   Version: $Version" -ForegroundColor Blue
    Write-Host "   Description: $Description" -ForegroundColor Blue
    Write-Host "   Options: $($Options -join ' ')" -ForegroundColor Blue
    Write-Host ""
    
    # Change to project root
    Push-Location $ProjectRoot
    
    try {
        # Build PHP command arguments
        $phpArgs = @("$ProjectRoot\tools\release\enhanced-release.php", $Version, $Description) + $Options
        
        # Run the enhanced release manager
        $result = Start-Process -FilePath "php" -ArgumentList $phpArgs -Wait -PassThru -NoNewWindow
        
        if ($result.ExitCode -eq 0) {
            Write-Host ""
            Write-Host "🎉 Release completed successfully!" -ForegroundColor Green
            Write-Host ""
            Write-Host "📋 Next steps:" -ForegroundColor Yellow
            Write-Host "  1. Review the generated files"
            Write-Host "  2. Push to remote: " -NoNewline; Write-Host "git push origin main && git push origin v$Version" -ForegroundColor Blue
            Write-Host "  3. Monitor GitHub Actions for automatic release creation"
            Write-Host ""
            Write-Host "🔗 Quick links:" -ForegroundColor Blue
            $majorMinor = ($Version -split '\.')[0..1] -join '.'
            Write-Host "  📄 Release notes: docs/releases/v$majorMinor/RELEASE_NOTES_v$Version.md"
            Write-Host "  🌐 Repository: https://github.com/nathanmaster/Klioso"
        } else {
            Write-Host "❌ Release failed" -ForegroundColor Red
            exit 1
        }
    } finally {
        Pop-Location
    }
}

function Main {
    Write-Header
    
    # Show help if requested
    if ($Help) {
        Write-Usage
        return
    }
    
    # Validate inputs
    if (-not $Version -or -not $Description) {
        Write-Host "❌ Version and description are required" -ForegroundColor Red
        Write-Usage
        return
    }
    
    # Validate version format
    if (-not (Test-VersionFormat $Version)) {
        return
    }
    
    # Validate description
    if ([string]::IsNullOrWhiteSpace($Description)) {
        Write-Host "❌ Description cannot be empty" -ForegroundColor Red
        return
    }
    
    # Build options array
    $options = @()
    if ($Major) { $options += '--major' }
    if ($Minor) { $options += '--minor' }
    if ($Patch) { $options += '--patch' }
    if ($Stable) { $options += '--stable' }
    if ($Beta) { $options += '--beta' }
    if ($DryRun) { $options += '--dry-run' }
    
    # Run pre-release checks
    $projectRoot = Start-PreReleaseChecks $Version
    
    # Confirm release
    Write-Host "📋 Release Summary:" -ForegroundColor Yellow
    Write-Host "   Version: $Version"
    Write-Host "   Description: $Description"
    Write-Host "   Options: $($options -join ' ')"
    Write-Host ""
    
    if (-not $DryRun) {
        $proceed = Read-Host "Proceed with release? [y/N]"
        if ($proceed -notmatch '^[Yy]$') {
            Write-Host "❌ Release cancelled" -ForegroundColor Red
            return
        }
    }
    
    # Run the release
    Start-Release $Version $Description $projectRoot $options
}

# Run main function
Main
