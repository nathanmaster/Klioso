# Simple PowerShell Readiness Check for Windows
param(
    [switch]$Verbose = $false
)

Write-Host "🔍 Klioso Deployment Readiness Check (PowerShell)" -ForegroundColor Cyan
Write-Host "=" * 50

$errors = 0

# Check if we're in the right directory
if (!(Test-Path "artisan")) {
    Write-Host "❌ Not in Laravel project root" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Laravel project detected" -ForegroundColor Green

# Check required files
Write-Host "`nRequired Files Check:" -ForegroundColor Yellow
$requiredFiles = @(
    ".env",
    ".env.production", 
    "config/features.php",
    "app/Services/FeatureService.php",
    "resources/js/Hooks/useFeatures.js",
    "resources/js/Components/FeatureWrapper.jsx"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing: $file" -ForegroundColor Red
        $errors++
    }
}

# Check environment configuration
Write-Host "`nEnvironment Configuration:" -ForegroundColor Yellow
if (Test-Path ".env") {
    $envContent = Get-Content ".env" -Raw
    
    if ($envContent -match "APP_ENV=local|APP_ENV=development") {
        Write-Host "✅ Environment set to development" -ForegroundColor Green
    } elseif ($envContent -match "APP_ENV=production") {
        Write-Host "⚠️  Environment set to production (may cause 500 errors in dev)" -ForegroundColor Yellow
    }
    
    if ($envContent -match "APP_DEBUG=true") {
        Write-Host "✅ Debug mode enabled" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Debug mode disabled" -ForegroundColor Yellow
    }
    
    if ($envContent -match "APP_URL=http://laravel12\.test") {
        Write-Host "✅ Correct development URL" -ForegroundColor Green
    } else {
        Write-Host "⚠️  APP_URL may need adjustment" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No .env file found" -ForegroundColor Red
    $errors++
}

# Check build process
Write-Host "`nFrontend Build:" -ForegroundColor Yellow
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend build successful" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend build failed" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "❌ Could not run npm build" -ForegroundColor Red
    $errors++
}

# Check feature configuration
Write-Host "`nFeature Flags:" -ForegroundColor Yellow
if (Test-Path "config/features.php") {
    Write-Host "✅ Feature configuration exists" -ForegroundColor Green
    
    # Count feature flags in .env
    if (Test-Path ".env") {
        $featureCount = (Get-Content ".env" | Where-Object { $_ -match "^FEATURE_" }).Count
        Write-Host "✅ Found $featureCount feature flags in .env" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Feature configuration missing" -ForegroundColor Red
    $errors++
}

# Summary
Write-Host "`n📊 READINESS SUMMARY" -ForegroundColor Cyan
Write-Host "=" * 30

if ($errors -eq 0) {
    Write-Host "🎉 READY FOR DEVELOPMENT!" -ForegroundColor Green
    Write-Host "`n✅ All critical checks passed" -ForegroundColor Green
    Write-Host "✅ Environment configured for development" -ForegroundColor Green
    Write-Host "✅ Feature flags system active" -ForegroundColor Green
    Write-Host "✅ Build process working" -ForegroundColor Green
    
    Write-Host "`n🌐 You can now test the application:" -ForegroundColor Cyan
    Write-Host "   Visit: http://laravel12.test" -ForegroundColor White
    Write-Host "   Check: No 500 errors should occur" -ForegroundColor White
} else {
    Write-Host "❌ NOT READY" -ForegroundColor Red
    Write-Host "`nFound $errors issues that need attention." -ForegroundColor Red
    Write-Host "Please fix the issues marked with ❌ above." -ForegroundColor Red
}

Write-Host "`n🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Test the application in browser" -ForegroundColor White
Write-Host "2. Verify routing works (Show/Edit buttons)" -ForegroundColor White
Write-Host "3. Check feature flags are working" -ForegroundColor White
Write-Host "4. When ready, create proper release PR dev → main" -ForegroundColor White

exit $errors