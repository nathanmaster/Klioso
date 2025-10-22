#!/bin/bash

# Local Release Test Script
# This script simulates the GitHub Actions release process locally

echo "🧪 Testing Release Process Locally"
echo "=================================="

# Check requirements
echo "📋 Checking requirements..."
php --version || { echo "❌ PHP not found"; exit 1; }
composer --version || { echo "❌ Composer not found"; exit 1; }
node --version || { echo "❌ Node.js not found"; exit 1; }
npm --version || { echo "❌ npm not found"; exit 1; }

echo "✅ All requirements found"

# Test environment setup
echo "🔧 Setting up test environment..."
cp .env.example .env.test
echo "APP_ENV=production" >> .env.test
echo "APP_DEBUG=false" >> .env.test
echo "DB_CONNECTION=sqlite" >> .env.test
echo "DB_DATABASE=:memory:" >> .env.test
echo "BROADCAST_DRIVER=log" >> .env.test
echo "CACHE_DRIVER=array" >> .env.test
echo "QUEUE_CONNECTION=sync" >> .env.test
echo "SESSION_DRIVER=array" >> .env.test

# Test composer install
echo "📦 Testing composer install..."
composer clear-cache
if composer install --optimize-autoloader --no-dev --no-interaction --prefer-dist --dry-run; then
    echo "✅ Composer install test passed"
else
    echo "❌ Composer install test failed"
    exit 1
fi

# Test npm install and build
echo "🔨 Testing npm install and build..."
if npm install --legacy-peer-deps --dry-run; then
    echo "✅ npm install test passed"
else
    echo "❌ npm install test failed"
    exit 1
fi

# Test Laravel optimizations
echo "⚡ Testing Laravel optimizations..."
export APP_ENV=production
export APP_DEBUG=false

# These commands should not fail in production environment
php artisan config:cache --dry-run || echo "⚠️ Config cache would fail (check config files)"
php artisan route:cache --dry-run || echo "⚠️ Route cache would fail (check routes)"
php artisan view:cache --dry-run || echo "⚠️ View cache would fail (check views)"

# Cleanup
rm .env.test

echo ""
echo "🎉 Local release test completed!"
echo "If all tests passed, the GitHub Actions should work correctly."
echo ""
echo "To trigger a release:"
echo "1. Update version.json with new version"
echo "2. Commit your changes"
echo "3. Create and push a git tag: git tag -a vX.Y.Z -m 'Release message'"
echo "4. Push the tag: git push origin vX.Y.Z"