# Klioso Safe Deployment Script for Windows
# PowerShell version with integrated versioning

param(
    [string]$Environment = "development",
    [string]$Version = "",
    [string]$Description = "",
    [switch]$SkipVersioning = $false
)

Write-Host "Starting Klioso Safe Deployment Process..." -ForegroundColor Green

# Versioning Logic
if (-not $SkipVersioning -and $Version -ne "") {
    Write-Host "Processing version update: $Version" -ForegroundColor Cyan
    
    # Check if version format is valid (semantic versioning)
    if ($Version -notmatch '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9\.-]+)?$') {
        Write-Host "ERROR: Invalid version format. Use semantic versioning (e.g., 1.0.0)" -ForegroundColor Red
        exit 1
    }
    
    # Update version.json
    if (Test-Path "version.json") {
        Write-Host "Updating version.json..." -ForegroundColor Yellow
        $versionData = Get-Content "version.json" | ConvertFrom-Json
        $versionData.version = $Version
        $versionData.release_date = Get-Date -Format "yyyy-MM-dd"
        $versionData.release_timestamp = [int]((Get-Date).ToUniversalTime() - (Get-Date "1970-01-01")).TotalSeconds
        
        if ($Description -ne "") {
            $versionData.description = $Description
        }
        
        # Determine release type
        if ($Version -match '-') {
            $versionData.type = "pre-release"
            $versionData.stability = "testing"
        } else {
            $versionData.type = "patch"
            $versionData.stability = "stable"
        }
        
        $versionData | ConvertTo-Json -Depth 3 | Set-Content "version.json"
        Write-Host "SUCCESS: version.json updated" -ForegroundColor Green
    }
    
    # Update package.json
    if (Test-Path "package.json") {
        Write-Host "Updating package.json..." -ForegroundColor Yellow
        $packageData = Get-Content "package.json" | ConvertFrom-Json
        $packageData.version = $Version
        $packageData | ConvertTo-Json -Depth 10 | Set-Content "package.json"
        Write-Host "SUCCESS: package.json updated" -ForegroundColor Green
    }
    
    # Create git tag
    Write-Host "Creating git tag..." -ForegroundColor Yellow
    & git tag -a "v$Version" -m "$Description"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "SUCCESS: Git tag v$Version created" -ForegroundColor Green
    } else {
        Write-Host "WARNING: Failed to create git tag (may already exist)" -ForegroundColor Yellow
    }
}

# Check if we're in the right directory
if (!(Test-Path "artisan")) {
    Write-Host "ERROR: artisan file not found. Are you in the Laravel project root?" -ForegroundColor Red
    exit 1
}

# Check current branch
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

# Backup current .env
if (Test-Path ".env") {
    Write-Host "Backing up current .env file..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    Copy-Item ".env" ".env.backup.$timestamp"
}

# Environment setup
Write-Host "Setting up environment..." -ForegroundColor Yellow
if ($Environment -eq "production") {
    Write-Host "Production deployment detected" -ForegroundColor Red
    if (Test-Path ".env.production") {
        Copy-Item ".env.production" ".env"
        Write-Host "SUCCESS: Production environment file copied" -ForegroundColor Green
    } else {
        Write-Host "ERROR: .env.production file not found" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "Development/staging deployment" -ForegroundColor Blue
}

# Install/update dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
& composer install --no-dev --optimize-autoloader --no-interaction
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Composer install failed" -ForegroundColor Red
    exit 1
}

& npm ci --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: NPM install failed" -ForegroundColor Red
    exit 1
}

# Clear and optimize caches
Write-Host "Clearing caches..." -ForegroundColor Yellow
& php artisan config:clear
& php artisan cache:clear
& php artisan route:clear
& php artisan view:clear

# Generate optimized files
Write-Host "Optimizing application..." -ForegroundColor Yellow
& php artisan config:cache
& php artisan route:cache
& php artisan view:cache

# Run database migrations
if ($Environment -eq "production") {
    Write-Host "Database migrations (production)..." -ForegroundColor Red
    $response = Read-Host "Run database migrations? This is PRODUCTION! (y/N)"
    if ($response -eq "y" -or $response -eq "Y") {
        & php artisan migrate --force
    } else {
        Write-Host "WARNING: Skipping database migrations" -ForegroundColor Yellow
    }
} else {
    Write-Host "Running database migrations..." -ForegroundColor Yellow
    & php artisan migrate
}

# Generate Ziggy routes
Write-Host "Generating Ziggy routes..." -ForegroundColor Yellow
& php artisan ziggy:generate

# Build frontend assets
Write-Host "Building frontend assets..." -ForegroundColor Yellow
& npm run build

# Health check
Write-Host "Running health checks..." -ForegroundColor Yellow
$routeCheck = & php artisan route:list | Select-String "dashboard"
if (!$routeCheck) {
    Write-Host "ERROR: Core routes not found" -ForegroundColor Red
    exit 1
}

Write-Host "SUCCESS: Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Post-deployment checklist:" -ForegroundColor Cyan
Write-Host "  1. Test core functionality (login, dashboard)"
Write-Host "  2. Verify feature flags are working"
Write-Host "  3. Check error logs"
Write-Host "  4. Monitor performance"

if ($Version -ne "" -and -not $SkipVersioning) {
    Write-Host ""
    Write-Host "VERSION INFORMATION:" -ForegroundColor Green
    Write-Host "  Version: $Version"
    Write-Host "  Description: $Description"
    Write-Host "  Git tag: v$Version created"
    Write-Host ""
    Write-Host "  NEXT STEPS:"
    Write-Host "  - Push tags to remote: git push origin --tags"
    Write-Host "  - Create GitHub release if needed"
    Write-Host "  - Update documentation if necessary"
}

Write-Host ""

if ($Environment -eq "production") {
    Write-Host "PRODUCTION DEPLOYMENT NOTES:" -ForegroundColor Red
    Write-Host "  - Monitor error logs closely"
    Write-Host "  - Have rollback plan ready"
    Write-Host "  - Test critical features immediately"
    Write-Host "  - Database backup should be recent"
}