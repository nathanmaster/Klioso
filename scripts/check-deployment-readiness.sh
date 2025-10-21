#!/bin/bash

# Klioso Deployment Readiness Checker
# Run this script to verify your application is ready for production deployment

echo "🔍 Klioso Deployment Readiness Check"
echo "===================================="

ERRORS=0

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Not in Laravel project root"
    exit 1
fi

echo "✅ Laravel project detected"

# Check for required files
echo ""
echo "📁 Checking required files..."

required_files=(
    ".env.production"
    "config/features.php" 
    "app/Services/FeatureService.php"
    "app/Http/Middleware/CheckFeature.php"
    "resources/js/Hooks/useFeatures.js"
    "resources/js/Components/FeatureWrapper.jsx"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
        ERRORS=$((ERRORS + 1))
    fi
done

# Check build process
echo ""
echo "🔨 Testing build process..."
if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    ERRORS=$((ERRORS + 1))
fi

# Check for syntax errors
echo ""
echo "🔍 Checking for syntax errors..."
if php artisan route:list > /dev/null 2>&1; then
    echo "✅ No PHP syntax errors"
else
    echo "❌ PHP syntax errors detected"
    ERRORS=$((ERRORS + 1))
fi

# Check feature configuration
echo ""
echo "⚙️ Checking feature configuration..."
if php -r "
try {
    require 'vendor/autoload.php';
    \$app = require_once 'bootstrap/app.php';
    \$features = \$app['config']['features'];
    echo 'Features loaded: ' . count(\$features, COUNT_RECURSIVE) . ' settings' . PHP_EOL;
} catch (Exception \$e) {
    echo 'Error: ' . \$e->getMessage() . PHP_EOL;
    exit(1);
}
"; then
    echo "✅ Feature configuration valid"
else
    echo "❌ Feature configuration invalid"
    ERRORS=$((ERRORS + 1))
fi

# Check for development dependencies in composer.lock
echo ""
echo "📦 Checking dependencies..."
if grep -q '"dev":' composer.lock; then
    echo "⚠️  Development dependencies detected (use --no-dev in production)"
else
    echo "✅ Production dependencies only"
fi

# Check environment variables
echo ""
echo "🌍 Checking environment variables..."
if [ -f ".env" ]; then
    if grep -q "APP_DEBUG=true" .env; then
        echo "⚠️  APP_DEBUG is true (should be false in production)"
    else
        echo "✅ APP_DEBUG configuration looks good"
    fi
    
    if grep -q "APP_URL=http://localhost" .env; then
        echo "⚠️  APP_URL still set to localhost"
    else
        echo "✅ APP_URL configuration looks good"
    fi
else
    echo "❌ No .env file found"
    ERRORS=$((ERRORS + 1))
fi

# Security checks
echo ""
echo "🔒 Security checks..."
if [ -f ".env" ] && [ -n "$(grep 'APP_KEY=' .env | cut -d'=' -f2)" ]; then
    echo "✅ APP_KEY is set"
else
    echo "❌ APP_KEY not set"
    ERRORS=$((ERRORS + 1))
fi

# Performance checks
echo ""
echo "⚡ Performance checks..."
if [ -d "bootstrap/cache" ] && [ "$(ls -A bootstrap/cache)" ]; then
    echo "✅ Bootstrap cache exists"
else
    echo "⚠️  No bootstrap cache (run config:cache)"
fi

# Final summary
echo ""
echo "📊 DEPLOYMENT READINESS SUMMARY"
echo "==============================="

if [ $ERRORS -eq 0 ]; then
    echo "🎉 READY FOR DEPLOYMENT!"
    echo ""
    echo "✅ All critical checks passed"
    echo "✅ Application appears stable"
    echo "✅ Feature flags configured"
    echo "✅ Build process working"
    echo ""
    echo "🚀 You can proceed with deployment using:"
    echo "   ./scripts/deploy-safe.sh production"
else
    echo "❌ NOT READY FOR DEPLOYMENT"
    echo ""
    echo "Found $ERRORS critical issues that need to be resolved."
    echo "Please fix the issues marked with ❌ before deploying."
fi

exit $ERRORS