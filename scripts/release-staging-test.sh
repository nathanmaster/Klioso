#!/bin/bash

# Klioso v0.8.0-beta.1 Staging Release Test Script
# Tests the release preparation in a staging environment

set -e

APP_NAME="klioso"
VERSION="0.8.0-beta.1"
BUILD_DIR="build-staging"
TEST_DB="klioso_staging_test"

echo "🧪 Klioso v${VERSION} - Staging Release Test"
echo "============================================="

# 1. Environment Checks
echo "📋 Running environment checks..."

# Check PHP version
PHP_VERSION=$(php -r "echo PHP_VERSION;")
echo "✅ PHP Version: $PHP_VERSION"

# Check Node version
NODE_VERSION=$(node --version)
echo "✅ Node Version: $NODE_VERSION"

# Check Composer
COMPOSER_VERSION=$(composer --version)
echo "✅ $COMPOSER_VERSION"

# Check database connection
echo "🗄️ Testing database connection..."
php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connection successful';"

# 2. Code Quality Tests
echo "🔍 Running code quality tests..."

# Run PHP tests
echo "Running PHP tests..."
php artisan test --parallel

# Run linting
echo "Running PHP linting..."
./vendor/bin/pint --test

# Run static analysis if available
if [ -f "./vendor/bin/phpstan" ]; then
    echo "Running static analysis..."
    ./vendor/bin/phpstan analyse --memory-limit=1G
fi

# 3. Build Tests
echo "🏗️ Testing build process..."

# Clean previous builds
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# Test production build
echo "Testing frontend build..."
npm run build

# Test asset compilation
echo "Verifying compiled assets..."
if [ ! -f "public/build/manifest.json" ]; then
    echo "❌ Build manifest not found!"
    exit 1
fi

echo "✅ Build assets verified"

# 4. Database Migration Tests
echo "🗄️ Testing database migrations..."

# Create test database
mysql -e "CREATE DATABASE IF NOT EXISTS $TEST_DB;" 2>/dev/null || echo "Using SQLite for testing"

# Test fresh migration
cp .env .env.backup
sed "s/DB_DATABASE=.*/DB_DATABASE=$TEST_DB/" .env > .env.test
mv .env.test .env

php artisan migrate:fresh --seed --force
echo "✅ Fresh migration successful"

# Test migration rollback
php artisan migrate:rollback --step=3 --force
php artisan migrate --force
echo "✅ Migration rollback/forward test successful"

# Restore original env
mv .env.backup .env

# 5. Feature Tests
echo "🎯 Running feature tests..."

# Test WordPress scanner
echo "Testing WordPress scanner..."
php artisan tinker --execute='
$service = new App\Services\WordPressScanService();
$result = $service->scanUrl("https://demo.wp-api.org");
if (empty($result["plugins"]) && empty($result["themes"])) {
    echo "Warning: Scanner test returned empty results\n";
} else {
    echo "✅ WordPress scanner working\n";
}
'

# Test provider management
echo "Testing provider creation..."
php artisan tinker --execute='
use App\Models\HostingProvider;
$provider = HostingProvider::create([
    "name" => "Test Provider " . time(),
    "provides_hosting" => true,
    "provides_dns" => true
]);
echo "✅ Provider created with ID: " . $provider->id . "\n";
$provider->delete();
echo "✅ Provider cleanup successful\n";
'

# 6. Performance Tests
echo "⚡ Running performance tests..."

# Test page load times
echo "Testing application boot time..."
time php artisan route:list >/dev/null
echo "✅ Route compilation test passed"

# Test asset sizes
ASSET_SIZE=$(du -sh public/build 2>/dev/null | cut -f1 || echo "N/A")
echo "📊 Built assets size: $ASSET_SIZE"

# 7. Security Tests
echo "🔒 Running security checks..."

# Check for debug mode in production
if grep -q "APP_DEBUG=true" .env.example; then
    echo "⚠️  Warning: Debug mode enabled in example env"
fi

# Check for exposed sensitive files
SENSITIVE_FILES=(".env" "storage/logs/laravel.log")
for file in "${SENSITIVE_FILES[@]}"; do
    if [ -f "public/$file" ]; then
        echo "❌ Sensitive file exposed: public/$file"
        exit 1
    fi
done
echo "✅ No sensitive files exposed"

# 8. Package Integrity Tests
echo "📦 Testing package integrity..."

# Verify composer dependencies
composer validate --strict
echo "✅ Composer configuration valid"

# Verify npm dependencies
npm audit --audit-level moderate
echo "✅ NPM security audit passed"

# 9. Release Package Test
echo "📋 Creating test release package..."

# Create minimal release structure
mkdir -p $BUILD_DIR/test-release
cp -r app $BUILD_DIR/test-release/
cp -r database $BUILD_DIR/test-release/
cp -r public $BUILD_DIR/test-release/
cp -r resources $BUILD_DIR/test-release/
cp -r routes $BUILD_DIR/test-release/
cp -r bootstrap $BUILD_DIR/test-release/
cp -r config $BUILD_DIR/test-release/
cp -r storage $BUILD_DIR/test-release/
cp composer.json composer.lock package.json artisan .env.example $BUILD_DIR/test-release/

# Test package size
PACKAGE_SIZE=$(du -sh $BUILD_DIR/test-release | cut -f1)
echo "📊 Test package size: $PACKAGE_SIZE"

# 10. Final Staging Report
echo ""
echo "🎉 Staging Tests Complete!"
echo "=========================="
echo "Version: $VERSION"
echo "Package Size: $PACKAGE_SIZE"
echo "Asset Size: $ASSET_SIZE"
echo "PHP Version: $PHP_VERSION"
echo "Node Version: $NODE_VERSION"
echo ""
echo "✅ All staging tests passed!"
echo "Ready for production release creation."

# Cleanup
rm -rf $BUILD_DIR
mysql -e "DROP DATABASE IF EXISTS $TEST_DB;" 2>/dev/null || true

echo ""
echo "📝 Next Steps:"
echo "1. Review test results above"
echo "2. Run './scripts/prepare-release.sh' to create release packages"
echo "3. Test each binary package on target platforms"
echo "4. Create GitHub release with generated packages"
echo "5. Update documentation and announce release"
