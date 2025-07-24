# Klioso v0.8.0-beta.1 Release Preparation (PowerShell)
# Usage: .\scripts\prepare-release-windows.ps1

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
    
    Write-Host "📄 Copying base application files to $DestDir..." -ForegroundColor Yellow
    
    # Create destination directory
    New-Item -ItemType Directory -Path $DestDir -Force | Out-Null
    
    # Copy main application directories
    $DirsTocp = @("app", "bootstrap", "config", "database", "public", "resources", "routes", "storage")
    foreach ($Dir in $DirsTocp) {
        if (Test-Path (Join-Path $ProjectRoot $Dir)) {
            Copy-Item -Path (Join-Path $ProjectRoot $Dir) -Destination $DestDir -Recurse -Force
        }
    }
    
    # Copy root files
    $FilesToCopy = @(
        "artisan", "composer.json", "composer.lock", "package.json", 
        "vite.config.js", "tailwind.config.js", "postcss.config.js", 
        "phpunit.xml", "README.md", "CHANGELOG.md", ".env.example"
    )
    
    foreach ($File in $FilesToCopy) {
        $SourceFile = Join-Path $ProjectRoot $File
        if (Test-Path $SourceFile) {
            Copy-Item -Path $SourceFile -Destination $DestDir -Force
        }
    }
    
    # Copy documentation if exists
    $DocsDir = Join-Path $ProjectRoot "docs"
    if (Test-Path $DocsDir) {
        Copy-Item -Path $DocsDir -Destination $DestDir -Recurse -Force
    }
    
    # Clean up development files
    $CleanupPaths = @(
        (Join-Path $DestDir "storage\logs\*.log"),
        (Join-Path $DestDir "storage\framework\cache\data\*"),
        (Join-Path $DestDir "storage\framework\sessions\*"),
        (Join-Path $DestDir "storage\framework\views\*")
    )
    
    foreach ($Path in $CleanupPaths) {
        if (Test-Path $Path) {
            Remove-Item $Path -Force -ErrorAction SilentlyContinue
        }
    }
    
    # Ensure storage directories exist
    $StorageDirs = @(
        "storage\app\public",
        "storage\framework\cache\data", 
        "storage\framework\sessions",
        "storage\framework\views",
        "storage\logs"
    )
    
    foreach ($Dir in $StorageDirs) {
        $FullPath = Join-Path $DestDir $Dir
        if (-not (Test-Path $FullPath)) {
            New-Item -ItemType Directory -Path $FullPath -Force | Out-Null
        }
        # Create .gitkeep file
        New-Item -ItemType File -Path (Join-Path $FullPath ".gitkeep") -Force | Out-Null
    }
}

# 1. Windows/Laragon Package (Primary for current environment)
Write-Host "🪟 Creating Windows/Laragon package..." -ForegroundColor Cyan
$WindowsDir = Join-Path $TempDir "klioso-windows"
Copy-BaseFiles -DestDir $WindowsDir

# Change to Windows directory for dependency installation
Push-Location $WindowsDir

Write-Host "📦 Installing production dependencies..." -ForegroundColor Yellow

# Test PHP and Laravel
& $PHPPath (Join-Path $WindowsDir "artisan") --version | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ PHP and Laravel working" -ForegroundColor Green
}

# Run composer install
if (Get-Command "composer" -ErrorAction SilentlyContinue) {
    composer install --no-dev --optimize-autoloader --no-interaction
    Write-Host "✅ Composer dependencies installed" -ForegroundColor Green
} else {
    Write-Host "⚠️ Composer not found in PATH, skipping dependency installation" -ForegroundColor Yellow
}

# Install NPM dependencies and build
if (Get-Command "npm" -ErrorAction SilentlyContinue) {
    npm ci --production 2>$null
    npm run build
    Write-Host "✅ Assets compiled" -ForegroundColor Green
} else {
    Write-Host "⚠️ NPM not found, skipping asset compilation" -ForegroundColor Yellow
}

# Laravel optimizations
& $PHPPath artisan config:cache
& $PHPPath artisan route:cache  
& $PHPPath artisan view:cache
Write-Host "✅ Laravel optimizations applied" -ForegroundColor Green

Pop-Location

# Create Windows installation batch file
$InstallBat = @"
@echo off
echo 🪟 Klioso Windows Installation

echo Setting up environment...
if not exist .env copy .env.example .env

echo Generating application key...
"$PHPPath" artisan key:generate --force

echo Running database migrations...
"$PHPPath" artisan migrate --force

echo Optimizing application...
"$PHPPath" artisan config:cache
"$PHPPath" artisan route:cache
"$PHPPath" artisan view:cache

echo ✅ Installation complete!
echo Configure your web server to point to the 'public' directory.
echo For Laragon, this directory should work automatically.
pause
"@

Set-Content -Path (Join-Path $WindowsDir "install.bat") -Value $InstallBat -Encoding UTF8

# Create Windows README
$WindowsReadme = @"
# Klioso v$Version for Windows/Laragon

## Quick Start

1. Extract this archive to your web directory (e.g., `C:\laragon\www\klioso`)
2. Run `install.bat` as Administrator  
3. Edit `.env` file with your database settings
4. Access via `http://klioso.test` in Laragon

## Requirements

- **PHP**: 8.2+ (8.3 recommended) - Laragon includes this
- **Database**: MySQL 8+ or SQLite 3+ - Included with Laragon
- **Web Server**: Apache or Nginx - Included with Laragon
- **Composer**: For dependency management
- **Node.js**: 18+ for development (optional for production)

## Laragon Configuration

Laragon should auto-configure the site. If not:

1. Open Laragon control panel
2. Right-click -> Apache -> sites-enabled -> Edit
3. Add virtual host configuration if needed

## Database Setup

### Using Laragon's MySQL:
1. Open HeidiSQL (included with Laragon)
2. Create database: `klioso`  
3. Update `.env` file:
   - `DB_CONNECTION=mysql`
   - `DB_HOST=127.0.0.1`
   - `DB_PORT=3306`
   - `DB_DATABASE=klioso`
   - `DB_USERNAME=root`
   - `DB_PASSWORD=` (empty for default Laragon)

### Using SQLite (simpler option):
1. Update `.env` file:
   - `DB_CONNECTION=sqlite`
   - `DB_DATABASE=C:\laragon\www\klioso\database\database.sqlite`
2. The install script will create the SQLite file

## Troubleshooting

### Site not loading:
- Ensure Laragon is running
- Check that PHP extensions are enabled
- Verify file permissions

### Database errors:
- Check database credentials in `.env`
- Ensure database exists
- Run migrations: `php artisan migrate`

### Asset issues:
- Run: `npm run build` (if Node.js installed)
- Clear cache: `php artisan cache:clear`

## Features

- Multi-service provider management
- WordPress site scanning
- Responsive mobile-friendly interface  
- Optional client relationships
- Advanced filtering and sorting

## Support

- GitHub: https://github.com/nathanmaster/laravel12
- Documentation: See `docs/` folder
- Issues: Report via GitHub Issues

---

**Klioso v$Version** - Professional WordPress management made simple.
"@

Set-Content -Path (Join-Path $WindowsDir "README-WINDOWS.md") -Value $WindowsReadme -Encoding UTF8

# Package Windows version
Write-Host "📦 Creating Windows package archive..." -ForegroundColor Yellow
$WindowsZip = Join-Path $ReleasesDir "klioso-v$Version-windows.zip"
Compress-Archive -Path "$WindowsDir\*" -DestinationPath $WindowsZip -Force
Write-Host "✅ Windows package created: $WindowsZip" -ForegroundColor Green

# 2. Production Linux Package (Source-based)
Write-Host "🐧 Creating production package..." -ForegroundColor Cyan
$ProductionDir = Join-Path $TempDir "klioso-production"
Copy-BaseFiles -DestDir $ProductionDir

$InstallSh = @'
#!/bin/bash
echo "🐧 Klioso Linux Installation"

echo "Setting up file permissions..."
chmod -R 755 .
chmod -R 777 storage bootstrap/cache

echo "Installing dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --production
npm run build

echo "Generating application key..."
php artisan key:generate --force

echo "Running database migrations..."
php artisan migrate --force

echo "Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ Installation complete!"
echo "Configure your web server to point to the 'public' directory."
'@

Set-Content -Path (Join-Path $ProductionDir "install.sh") -Value $InstallSh -Encoding UTF8

# Package production version  
$ProductionZip = Join-Path $ReleasesDir "klioso-v$Version-production.zip"
Compress-Archive -Path "$ProductionDir\*" -DestinationPath $ProductionZip -Force
Write-Host "✅ Production package created: $ProductionZip" -ForegroundColor Green

# 3. Shared Hosting Package
Write-Host "🌐 Creating shared hosting package..." -ForegroundColor Cyan
$HostingDir = Join-Path $TempDir "klioso-hosting"
Copy-BaseFiles -DestDir $HostingDir

$Htaccess = @'
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Block access to sensitive files
<Files .env>
    Order allow,deny
    Deny from all
</Files>

<Files composer.json>
    Order allow,deny  
    Deny from all
</Files>
'@

Set-Content -Path (Join-Path $HostingDir "public" ".htaccess") -Value $Htaccess -Encoding UTF8

# Package shared hosting version
$HostingZip = Join-Path $ReleasesDir "klioso-v$Version-shared-hosting.zip"
Compress-Archive -Path "$HostingDir\*" -DestinationPath $HostingZip -Force
Write-Host "✅ Shared hosting package created: $HostingZip" -ForegroundColor Green

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

$ReleaseNotes = @'
# Klioso v{0} Release Notes

## 🎉 What's New in v{0}

### Multi-Service Provider System
- Providers can now offer multiple services (hosting, DNS, email, domain registration)
- Service-specific checkboxes for flexible provider management
- Filtered dropdowns show only relevant providers per service type
- Service badges display provider capabilities clearly

### Optional Client Relationships  
- Websites no longer require assigned clients
- Support for internal and development sites
- Flexible client assignment for better organization

### Enhanced User Interface
- Responsive table layout with mobile card view
- Click-to-sort functionality on all table columns
- Improved pagination with page size options
- Removed sidebar navigation for cleaner interface

### WordPress Scanner Improvements
- Better error handling for unreachable sites
- Enhanced plugin and theme detection
- SSL/non-SSL site compatibility
- More reliable scanning results

## 📦 Available Packages

- **klioso-v{0}-windows.zip** - Windows/Laragon optimized package
- **klioso-v{0}-production.zip** - Linux production deployment
- **klioso-v{0}-shared-hosting.zip** - Shared hosting deployment

## ⚠️ Beta Release Warning

This is a beta release with significant architectural changes:

- **Database migrations required** - Backup your data first!
- **Multi-service provider system** changes how providers work
- **Optional relationships** may affect existing workflows
- **Test thoroughly** before using in production

## 🔧 Installation

### Windows/Laragon (Recommended for development)
1. Extract klioso-v{0}-windows.zip to C:\laragon\www\klioso
2. Run install.bat as Administrator
3. Configure database in .env file
4. Access via http://klioso.test

### Linux Production
1. Extract klioso-v{0}-production.zip to your server
2. Run chmod +x install.sh && ./install.sh
3. Configure web server to point to public/ directory
4. Update .env with production settings

### Shared Hosting
1. Extract klioso-v{0}-shared-hosting.zip
2. Upload files to your hosting account
3. Move public/ contents to document root
4. Configure database via hosting control panel

## 📋 System Requirements

- **PHP**: 8.2+ (8.3 recommended)
- **Database**: MySQL 8+ or SQLite 3+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Node.js**: 18+ (for development/asset compilation)

## 📞 Support

- **Documentation**: See README files in each package
- **Issues**: https://github.com/nathanmaster/laravel12/issues
- **Discussions**: https://github.com/nathanmaster/laravel12/discussions

---

**Full Changelog**: https://github.com/nathanmaster/laravel12/blob/main/CHANGELOG.md
'@ -f $Version

Set-Content -Path (Join-Path $ReleasesDir "v$Version-notes.md") -Value $ReleaseNotes -Encoding UTF8
Write-Host "✅ Release notes created" -ForegroundColor Green

# Clean up temporary directory
Write-Host "🧹 Cleaning up..." -ForegroundColor Yellow
Remove-Item $TempDir -Recurse -Force

# Final summary
Write-Host ""
Write-Host "🎉 Release packages created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Packages created:" -ForegroundColor White
Get-ChildItem -Path $ReleasesDir | ForEach-Object {
    $Size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  - $($_.Name) ($Size MB)" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. Test Windows package in current environment" -ForegroundColor Yellow
Write-Host "2. Test other packages on target platforms" -ForegroundColor Yellow  
Write-Host "3. Review release notes in releases/v$Version-notes.md" -ForegroundColor Yellow
Write-Host "4. Verify checksums match generated hashes" -ForegroundColor Yellow
Write-Host "5. Create GitHub release with these assets" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Ready for GitHub pre-release!" -ForegroundColor Green

# Test current installation
Write-Host ""
Write-Host "🧪 Quick test of current installation:" -ForegroundColor White
& $PHPPath artisan --version
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Laravel application working" -ForegroundColor Green
} else {
    Write-Host "❌ Laravel application test failed" -ForegroundColor Red
}
