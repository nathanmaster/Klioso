#!/bin/bash

# Klioso Safe Deployment Script with Versioning
# This script ensures a safe production deployment with optional version management

set -e  # Exit on any error

# Parse command line arguments
ENVIRONMENT="development"
VERSION=""
DESCRIPTION=""
SKIP_VERSIONING=false

while [[ $# -gt 0 ]]; do
    case $1 in
        production|staging|development)
            ENVIRONMENT="$1"
            shift
            ;;
        --version)
            VERSION="$2"
            shift 2
            ;;
        --description)
            DESCRIPTION="$2"
            shift 2
            ;;
        --skip-versioning)
            SKIP_VERSIONING=true
            shift
            ;;
        *)
            echo "Unknown option $1"
            echo "Usage: $0 [production|staging|development] [--version <version>] [--description <description>] [--skip-versioning]"
            exit 1
            ;;
    esac
done

echo "🚀 Starting Klioso Safe Deployment Process..."

# Versioning Logic
if [ "$SKIP_VERSIONING" = false ] && [ -n "$VERSION" ]; then
    echo "📦 Processing version update: $VERSION"
    
    # Validate version format (semantic versioning)
    if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9\.-]+)?$ ]]; then
        echo "❌ Invalid version format. Use semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)"
        exit 1
    fi
    
    # Update version.json
    if [ -f "version.json" ]; then
        echo "📝 Updating version.json..."
        
        # Use python/node to update JSON, fallback to sed
        if command -v node >/dev/null 2>&1; then
            node -e "
                const fs = require('fs');
                const data = JSON.parse(fs.readFileSync('version.json', 'utf8'));
                data.version = '$VERSION';
                data.release_date = new Date().toISOString().split('T')[0];
                data.release_timestamp = Math.floor(Date.now() / 1000);
                if ('$DESCRIPTION') data.description = '$DESCRIPTION';
                
                // Determine release type
                if ('$VERSION'.includes('-')) {
                    data.type = 'pre-release';
                    data.stability = 'testing';
                } else {
                    const newParts = '$VERSION'.split('.');
                    const oldParts = data.version ? data.version.split('.') : ['0','0','0'];
                    if (newParts[0] !== oldParts[0]) data.type = 'major';
                    else if (newParts[1] !== oldParts[1]) data.type = 'minor';
                    else data.type = 'patch';
                    data.stability = 'stable';
                }
                
                fs.writeFileSync('version.json', JSON.stringify(data, null, 4));
            "
            echo "✅ version.json updated"
        else
            echo "⚠️  Node.js not found, manual version update required"
        fi
    fi
    
    # Update package.json
    if [ -f "package.json" ] && command -v node >/dev/null 2>&1; then
        echo "📝 Updating package.json..."
        node -e "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            data.version = '$VERSION';
            fs.writeFileSync('package.json', JSON.stringify(data, null, 2));
        "
        echo "✅ package.json updated"
    fi
    
    # Create git tag
    echo "🏷️ Creating git tag..."
    if git tag -a "v$VERSION" -m "${DESCRIPTION:-Release v$VERSION}"; then
        echo "✅ Git tag v$VERSION created"
    else
        echo "⚠️  Failed to create git tag (may already exist)"
    fi
fi

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: artisan file not found. Are you in the Laravel project root?"
    exit 1
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📂 Current branch: $CURRENT_BRANCH"

# Backup current .env
if [ -f ".env" ]; then
    echo "💾 Backing up current .env file..."
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
fi

# Environment setup
echo "🔧 Setting up environment..."
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🏭 Production deployment detected"
    if [ -f ".env.production" ]; then
        cp .env.production .env
        echo "✅ Production environment file copied"
    else
        echo "❌ Error: .env.production file not found"
        exit 1
    fi
else
    echo "🧪 Development/staging deployment"
fi

# Install/update dependencies
echo "📦 Installing dependencies..."
composer install --no-dev --optimize-autoloader --no-interaction
npm ci --silent

# Clear and optimize caches
echo "🧹 Clearing caches..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Generate optimized files
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run database migrations (with confirmation in production)
if [ "$ENVIRONMENT" = "production" ]; then
    echo "🗄️  Database migrations (production)..."
    read -p "Run database migrations? This is PRODUCTION! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        php artisan migrate --force
    else
        echo "⚠️  Skipping database migrations"
    fi
else
    echo "🗄️  Running database migrations..."
    php artisan migrate
fi

# Generate Ziggy routes
echo "🛣️  Generating Ziggy routes..."
php artisan ziggy:generate

# Build frontend assets
echo "🎨 Building frontend assets..."
if [ "$ENVIRONMENT" = "production" ]; then
    npm run build
else
    npm run build
fi

# Set proper permissions (Linux/Mac only)
if [[ "$OSTYPE" != "msys"* ]] && [[ "$OSTYPE" != "win"* ]]; then
    echo "🔐 Setting file permissions..."
    chmod -R 755 storage bootstrap/cache
    chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || echo "⚠️  Could not set ownership (may need sudo)"
fi

# Verify feature flags
echo "🏁 Verifying feature configuration..."
php artisan tinker --execute="dump(config('features'));" | head -20

# Health check
echo "🏥 Running health checks..."
if ! php artisan route:list | grep -q "dashboard"; then
    echo "❌ Error: Core routes not found"
    exit 1
fi

echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Post-deployment checklist:"
echo "  1. Test core functionality (login, dashboard)"
echo "  2. Verify feature flags are working"
echo "  3. Check error logs"
echo "  4. Monitor performance"

if [ "$SKIP_VERSIONING" = false ] && [ -n "$VERSION" ]; then
    echo ""
    echo "🏷️ VERSION INFORMATION:"
    echo "  Version: $VERSION"
    echo "  Description: $DESCRIPTION"
    echo "  Git tag: v$VERSION created"
    echo ""
    echo "  NEXT STEPS:"
    echo "  - Push tags to remote: git push origin --tags"
    echo "  - Create GitHub release if needed"
    echo "  - Update documentation if necessary"
fi

echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🔴 PRODUCTION DEPLOYMENT NOTES:"
    echo "  - Monitor error logs closely"
    echo "  - Have rollback plan ready"
    echo "  - Test critical features immediately"
    echo "  - Database backup should be recent"
fi