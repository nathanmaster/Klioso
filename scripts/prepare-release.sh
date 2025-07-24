#!/bin/bash

# Klioso Release Preparation Script
# Version: 0.8.0

set -e

VERSION="0.8.0"
APP_NAME="klioso"
BUILD_DIR="build"
RELEASE_DIR="releases/v${VERSION}"

echo "🚀 Preparing Klioso v${VERSION} for release..."

# Create build directories
mkdir -p ${BUILD_DIR}
mkdir -p ${RELEASE_DIR}

# 1. Production Build
echo "📦 Creating production build..."
cp -r . ${BUILD_DIR}/production
cd ${BUILD_DIR}/production

# Remove development files
rm -rf .git
rm -rf node_modules
rm -rf tests
rm -rf storage/logs/*
rm -f .env
rm -f .env.example

# Install production dependencies
composer install --optimize-autoloader --no-dev --quiet
npm ci --production
npm run build

# Laravel optimizations
php artisan config:cache
php artisan route:cache  
php artisan view:cache

# Create production archive
cd ..
zip -r "../${RELEASE_DIR}/${APP_NAME}-v${VERSION}-production.zip" production/ -q

echo "✅ Production build created"

# 2. Source Code Archive
echo "📁 Creating source code archive..."
cd ..
git archive --format=zip --prefix="${APP_NAME}-v${VERSION}/" HEAD > "${RELEASE_DIR}/${APP_NAME}-v${VERSION}-source.zip"

echo "✅ Source archive created"

# 3. Docker Build
echo "🐳 Creating Docker image..."
docker build -t "${APP_NAME}:v${VERSION}" .
docker save "${APP_NAME}:v${VERSION}" | gzip > "${RELEASE_DIR}/${APP_NAME}-v${VERSION}-docker.tar.gz"

echo "✅ Docker image created"

# 4. Windows Package
echo "🪟 Creating Windows package..."
cp -r ${BUILD_DIR}/production ${BUILD_DIR}/windows
cd ${BUILD_DIR}/windows

# Add Windows-specific files
cat > README-WINDOWS.txt << 'EOF'
Klioso v0.8.0 - Windows Installation

Requirements:
- PHP 8.2+ (Laragon recommended)
- MySQL 8+ or SQLite
- Composer

Installation:
1. Extract this archive to your web directory
2. Copy .env.example to .env and configure database
3. Run: php artisan key:generate
4. Run: php artisan migrate
5. Access via browser: http://localhost/klioso

For support: https://github.com/nathanmaster/laravel12
EOF

cd ..
zip -r "../${RELEASE_DIR}/${APP_NAME}-v${VERSION}-windows.zip" windows/ -q

echo "✅ Windows package created"

# 5. Shared Hosting Package
echo "🌐 Creating shared hosting package..."
cp -r ${BUILD_DIR}/production ${BUILD_DIR}/shared-hosting
cd ${BUILD_DIR}/shared-hosting

# Create .htaccess for shared hosting
cat > public/.htaccess << 'EOF'
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php/$1 [QSA,L]
</IfModule>
EOF

# Add shared hosting installation guide
cat > SHARED-HOSTING-INSTALL.txt << 'EOF'
Klioso v0.8.0 - Shared Hosting Installation

1. Upload all files to your hosting account
2. Point your domain to the 'public' directory
3. Create a MySQL database
4. Copy .env.example to .env and configure database
5. Run database migrations via hosting control panel or contact support

Note: Some shared hosts may require additional configuration.
EOF

cd ..
zip -r "../${RELEASE_DIR}/${APP_NAME}-v${VERSION}-shared-hosting.zip" shared-hosting/ -q

echo "✅ Shared hosting package created"

# Cleanup
cd ..
rm -rf ${BUILD_DIR}

echo ""
echo "🎉 Release v${VERSION} prepared successfully!"
echo "📦 Release packages created in: ${RELEASE_DIR}/"
echo ""
echo "Files created:"
echo "  - ${APP_NAME}-v${VERSION}-production.zip (Production ready)"
echo "  - ${APP_NAME}-v${VERSION}-source.zip (Source code)"  
echo "  - ${APP_NAME}-v${VERSION}-docker.tar.gz (Docker image)"
echo "  - ${APP_NAME}-v${VERSION}-windows.zip (Windows optimized)"
echo "  - ${APP_NAME}-v${VERSION}-shared-hosting.zip (Shared hosting)"
echo ""
echo "Next steps:"
echo "1. Test each package in appropriate environments"
echo "2. Create GitHub release with these binaries"
echo "3. Update documentation with installation instructions"
echo "4. Announce release to users"
