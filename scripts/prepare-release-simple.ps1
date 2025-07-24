# Klioso v0.8.0-beta.1 Release Preparation (PowerShell)
param(
    [string]$Version = "0.8.0-beta.1",
    [string]$PHPPath = "C:\laragon\bin\php\php-8.3.16-Win32-vs16-x64\php.exe"
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Preparing Klioso v$Version release packages..." -ForegroundColor Green

# Set paths
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ReleasesDir = Join-Path $ProjectRoot "releases"
$TempDir = Join-Path $ProjectRoot "temp-release"

# Clean and create directories
Write-Host "📁 Setting up directories..." -ForegroundColor Yellow
if (Test-Path $ReleasesDir) { Remove-Item $ReleasesDir -Recurse -Force }
if (Test-Path $TempDir) { Remove-Item $TempDir -Recurse -Force }
New-Item -ItemType Directory -Path $ReleasesDir -Force | Out-Null
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

# Function to copy base files
function Copy-BaseFiles {
    param([string]$DestDir)
    
    Write-Host "📄 Copying base application files..." -ForegroundColor Yellow
    
    # Create destination directory
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    
    # Copy main directories
    $DirsTocp = @("app", "bootstrap", "config", "database", "public", "resources", "routes", "storage")
    foreach ($Dir in $DirsTocp) {
        $SourcePath = Join-Path $ProjectRoot $Dir
        if (Test-Path $SourcePath) {
            Copy-Item -Path $SourcePath -Destination $DestDir -Recurse -Force
        }
    }
    
    # Copy important files
    $FilesToCopy = @("artisan", "composer.json", "composer.lock", "package.json", "vite.config.js", "tailwind.config.js", "postcss.config.js", "phpunit.xml", "README.md", "CHANGELOG.md", ".env.example")
    
    foreach ($File in $FilesToCopy) {
        $SourceFile = Join-Path $ProjectRoot $File
        if (Test-Path $SourceFile) {
            Copy-Item -Path $SourceFile -Destination $DestDir -Force
        }
    }
    
    # Copy docs if exists
    $DocsDir = Join-Path $ProjectRoot "docs"
    if (Test-Path $DocsDir) {
        Copy-Item -Path $DocsDir -Destination $DestDir -Recurse -Force
    }
    
    # Clean storage directories
    $StorageCleanup = @(
        (Join-Path $DestDir "storage\logs\*.log"),
        (Join-Path $DestDir "storage\framework\cache\data\*"),
        (Join-Path $DestDir "storage\framework\sessions\*"),
        (Join-Path $DestDir "storage\framework\views\*")
    )
    
    foreach ($Path in $StorageCleanup) {
        if (Test-Path $Path) {
            Remove-Item $Path -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Ensure storage structure
    $StorageDirs = @("storage\app\public", "storage\framework\cache\data", "storage\framework\sessions", "storage\framework\views", "storage\logs")
    
    foreach ($Dir in $StorageDirs) {
        $FullPath = Join-Path $DestDir $Dir
        if (-not (Test-Path $FullPath)) {
            New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
        }
        New-Item -ItemType File -Path (Join-Path $FullPath ".gitkeep") -Force | Out-Null
    }
}

# 1. Windows Package
Write-Host "🪟 Creating Windows package..." -ForegroundColor Cyan
$WindowsDir = Join-Path $TempDir "klioso-windows"
Copy-BaseFiles -DestDir $WindowsDir

# Create install.bat
$InstallBat = @'
@echo off
echo 🪟 Klioso Windows Installation

echo Setting up environment...
if not exist .env copy .env.example .env

echo Generating application key...
php artisan key:generate --force

echo Running database migrations...
php artisan migrate --force

echo Optimizing application...
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo ✅ Installation complete!
echo Configure your web server to point to the public directory.
pause
'@

Set-Content -Path (Join-Path $WindowsDir "install.bat") -Value $InstallBat -Encoding UTF8

# Create Windows README
$WindowsReadme = @'
# Klioso for Windows/Laragon

## Quick Start
1. Extract this archive to your web directory
2. Run install.bat as Administrator  
3. Edit .env file with your database settings
4. Access via your web server

## Requirements
- PHP 8.2+ (Laragon recommended)
- MySQL 8+ or SQLite
- Composer and Node.js (optional)

## Support
Visit: https://github.com/nathanmaster/laravel12
'@

Set-Content -Path (Join-Path $WindowsDir "README-WINDOWS.md") -Value $WindowsReadme -Encoding UTF8

# Package Windows version
$WindowsZip = Join-Path $ReleasesDir "klioso-v$Version-windows.zip"
Compress-Archive -Path "$WindowsDir\*" -DestinationPath $WindowsZip -Force
Write-Host "✅ Windows package created" -ForegroundColor Green

# 2. Production Package
Write-Host "🐧 Creating production package..." -ForegroundColor Cyan
$ProductionDir = Join-Path $TempDir "klioso-production"
Copy-BaseFiles -DestDir $ProductionDir

# Create install.sh
$InstallSh = @'
#!/bin/bash
echo "🐧 Klioso Linux Installation"
chmod -R 755 .
chmod -R 777 storage bootstrap/cache
php artisan key:generate --force
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
echo "✅ Installation complete!"
'@

Set-Content -Path (Join-Path $ProductionDir "install.sh") -Value $InstallSh -Encoding UTF8

$ProductionZip = Join-Path $ReleasesDir "klioso-v$Version-production.zip"
Compress-Archive -Path "$ProductionDir\*" -DestinationPath $ProductionZip -Force
Write-Host "✅ Production package created" -ForegroundColor Green

# 3. Shared Hosting Package
Write-Host "🌐 Creating shared hosting package..." -ForegroundColor Cyan
$HostingDir = Join-Path $TempDir "klioso-hosting"
Copy-BaseFiles -DestDir $HostingDir

# Create .htaccess
$Htaccess = @'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php/$1 [QSA,L]
</IfModule>
'@

New-Item -ItemType Directory -Path (Join-Path $HostingDir "public") -Force -ErrorAction SilentlyContinue
Set-Content -Path (Join-Path $HostingDir "public" ".htaccess") -Value $Htaccess -Encoding UTF8

$HostingZip = Join-Path $ReleasesDir "klioso-v$Version-shared-hosting.zip"
Compress-Archive -Path "$HostingDir\*" -DestinationPath $HostingZip -Force
Write-Host "✅ Shared hosting package created" -ForegroundColor Green

# 4. Generate checksums
Write-Host "🔐 Generating checksums..." -ForegroundColor Yellow
$ChecksumFile = Join-Path $ReleasesDir "checksums.txt"
$ChecksumContent = @()

Get-ChildItem -Path $ReleasesDir -Filter "klioso-v$Version-*.zip" | ForEach-Object {
    $Hash = Get-FileHash -Path $_.FullName -Algorithm SHA256
    $ChecksumContent += "$($Hash.Hash.ToLower())  $($_.Name)"
}

Set-Content -Path $ChecksumFile -Value $ChecksumContent -Encoding UTF8
Write-Host "✅ Checksums generated" -ForegroundColor Green

# 5. Create release notes
$ReleaseNotes = @'
# Klioso Release Notes

## Major Features
- Multi-service provider system
- Optional client relationships
- Responsive interface
- Enhanced WordPress scanner

## Packages
- Windows/Laragon package
- Linux production package  
- Shared hosting package

## Requirements
- PHP 8.2+
- MySQL 8+ or SQLite
- Modern web browser

Visit: https://github.com/nathanmaster/laravel12
'@

Set-Content -Path (Join-Path $ReleasesDir "v$Version-notes.md") -Value $ReleaseNotes -Encoding UTF8
Write-Host "✅ Release notes created" -ForegroundColor Green

# Cleanup
Remove-Item $TempDir -Recurse -Force

# Summary
Write-Host ""
Write-Host "Release packages created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Packages created:" -ForegroundColor White
Get-ChildItem -Path $ReleasesDir | ForEach-Object {
    $SizeMB = [math]::Round($_.Length / 1MB, 2)
    $SizeText = "$($SizeMB) MB"
    Write-Host "  - $($_.Name) ($SizeText)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Test Windows package in current environment" -ForegroundColor Yellow
Write-Host "2. Test other packages on target platforms" -ForegroundColor Yellow  
Write-Host "3. Create GitHub release with these assets" -ForegroundColor Yellow
Write-Host ""
Write-Host "Ready for GitHub pre-release!" -ForegroundColor Green
