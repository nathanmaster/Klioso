# 🚀 Klioso Production Deployment Guide

## Pre-Deployment Checklist

### 🔍 Code Quality & Testing
- [ ] All syntax errors fixed (✅ HostingProviders/Index.jsx corrected)
- [ ] Build process completes without errors (✅ Verified)
- [ ] All feature flags configured for production safety
- [ ] No debug code or console.log statements in production files
- [ ] Route generation working properly (✅ Ziggy + safeRoute implemented)

### 🛡️ Security & Configuration
- [ ] APP_DEBUG=false in production environment
- [ ] Strong APP_KEY generated
- [ ] Database credentials secured
- [ ] Sensitive feature flags disabled (automated_scanning, debug features)
- [ ] CORS configured for production domain
- [ ] SSL/HTTPS enabled

### 🗄️ Database & Migrations
- [ ] Database backup completed
- [ ] All migrations tested in staging
- [ ] Rollback plan prepared
- [ ] Database performance indexes in place

## Safe Deployment Process

### Option 1: Automated Deployment with Versioning (Recommended)

**Windows (PowerShell) - With New Version:**
```powershell
.\scripts\deploy-safe.ps1 -Environment production -Version "0.10.2" -Description "Production release with routing fixes and feature flags"
```

**Windows (PowerShell) - Without Version Change:**
```powershell
.\scripts\deploy-safe.ps1 -Environment production -SkipVersioning
```

**Linux/Mac (Bash) - With New Version:**
```bash
chmod +x scripts/deploy-safe.sh
./scripts/deploy-safe.sh production --version "0.10.2" --description "Production release with routing fixes and feature flags"
```

**Linux/Mac (Bash) - Without Version Change:**
```bash
./scripts/deploy-safe.sh production --skip-versioning
```

### Option 2: Manual Deployment Steps

1. **Environment Setup**
   ```bash
   cp .env.production .env
   ```

2. **Dependencies**
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci --silent
   ```

3. **Cache & Optimization**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   php artisan ziggy:generate
   ```

4. **Database**
   ```bash
   php artisan migrate --force
   ```

5. **Frontend Build**
   ```bash
   npm run build
   ```

## 🏷️ Version Management

### Semantic Versioning

Klioso follows [Semantic Versioning (SemVer)](https://semver.org/):

- **MAJOR** (1.0.0): Breaking changes
- **MINOR** (0.1.0): New features, backward compatible
- **PATCH** (0.0.1): Bug fixes, backward compatible
- **PRE-RELEASE** (0.1.0-beta.1): Testing versions

### Version Update Process

1. **Determine Version Type**:
   - Bug fixes only: Patch (0.10.1 → 0.10.2)
   - New features: Minor (0.10.2 → 0.11.0)
   - Breaking changes: Major (0.11.0 → 1.0.0)
   - Testing/beta: Pre-release (0.11.0-beta.1)

2. **Update Version Files**:
   The deployment script automatically updates:
   - `version.json` - Main version configuration
   - `package.json` - NPM package version
   - Creates git tag `v<version>`

3. **Version-Based Deployment Examples**:

   **For Bug Fixes (Patch):**
   ```bash
   ./scripts/deploy-safe.sh production --version "0.10.2" --description "Fixed routing issues and improved stability"
   ```

   **For New Features (Minor):**
   ```bash
   ./scripts/deploy-safe.sh production --version "0.11.0" --description "Added feature flags and enhanced scanner capabilities"
   ```

   **For Beta Testing:**
   ```bash
   ./scripts/deploy-safe.sh staging --version "0.11.0-beta.1" --description "Beta testing for new features"
   ```

### Post-Version Steps

After successful deployment with versioning:

1. **Push Git Tags**:
   ```bash
   git push origin --tags
   ```

2. **Create GitHub Release** (if using GitHub):
   - Go to repository → Releases → Create new release
   - Select the created tag
   - Add release notes based on changes

3. **Update Documentation**:
   - Update README.md if needed
   - Add to CHANGELOG.md
   - Update API documentation for breaking changes

### Version Rollback

If a version deployment fails:

1. **Immediate Rollback**:
   ```bash
   git reset --hard HEAD~1  # Remove last commit if needed
   git tag -d v0.10.2       # Remove bad tag
   ```

2. **Deploy Previous Version**:
   ```bash
   ./scripts/deploy-safe.sh production --version "0.10.1" --description "Rollback to stable version"
   ```

## Feature Flag Configuration

### 🟢 Production-Safe Features (Enabled)
- ✅ Client Management
- ✅ Website Management  
- ✅ Plugin Management
- ✅ Hosting Providers
- ✅ WordPress Scanner (basic)
- ✅ Vulnerability Scanning
- ✅ Security Dashboard

### 🟡 Cautionary Features (Consider Disabling)
- ⚠️ Bulk Scanning (resource intensive)
- ⚠️ Automated Scanning (can impact performance)
- ⚠️ Bulk Actions (potential for user errors)

### 🔴 Development Features (Must Disable)
- ❌ Debug Toolbar
- ❌ Query Logging
- ❌ Test Endpoints
- ❌ Template Management (experimental)
- ❌ Advanced Analytics (beta)

## Post-Deployment Verification

### Critical Tests
1. **Login & Authentication**
   - [ ] User can log in successfully
   - [ ] Session management working
   - [ ] Password reset functional

2. **Core Functionality**
   - [ ] Dashboard loads without errors
   - [ ] Client CRUD operations work
   - [ ] Website management functional
   - [ ] Plugin listing and management work

3. **Routing & Navigation**
   - [ ] All Show/Edit buttons work (no 404s)
   - [ ] URL parameters properly handled
   - [ ] No CORS errors in browser console

4. **Scanner Features**
   - [ ] Basic WordPress scanning works
   - [ ] Vulnerability detection functional
   - [ ] Security dashboard displays correctly

### Performance Checks
- [ ] Page load times acceptable (<3 seconds)
- [ ] Database queries optimized
- [ ] No memory leaks or excessive resource usage
- [ ] Frontend assets loading correctly

### Error Monitoring
- [ ] Check `storage/logs/laravel.log` for errors
- [ ] Monitor browser console for JavaScript errors
- [ ] Verify no broken images or assets
- [ ] Test error pages (404, 500) display correctly

## Rollback Plan

If issues are detected:

1. **Immediate Rollback**
   ```bash
   # Restore previous environment
   cp .env.backup.[timestamp] .env
   
   # Revert to previous git commit
   git checkout [previous-stable-commit]
   
   # Rebuild
   npm run build
   php artisan config:cache
   ```

2. **Database Rollback** (if migrations were run)
   ```bash
   # Restore database backup
   mysql -u username -p database_name < backup_file.sql
   ```

## Monitoring & Maintenance

### Daily Checks
- Monitor error logs
- Check application performance
- Verify scanner functionality
- Review security scan results

### Weekly Tasks
- Database performance analysis
- Feature flag optimization
- User feedback review
- Security updates

## Feature Toggle Examples

### In Laravel Controllers
```php
use App\Services\FeatureService;

public function index()
{
    if (FeatureService::disabled('scanner.bulk_scanning')) {
        abort(404, 'Bulk scanning is currently disabled');
    }
    // ... controller logic
}
```

### In React Components
```jsx
import { useFeatures } from '@/Hooks/useFeatures';
import FeatureWrapper from '@/Components/FeatureWrapper';

function ScannerPage() {
    const { isEnabled } = useFeatures();
    
    return (
        <div>
            <FeatureWrapper feature="scanner_wordpress_scanner">
                <WordPressScanner />
            </FeatureWrapper>
            
            <FeatureWrapper 
                feature="scanner_bulk_scanning"
                fallback={<div>Bulk scanning temporarily disabled</div>}
            >
                <BulkScanner />
            </FeatureWrapper>
        </div>
    );
}
```

## Emergency Contacts & Resources

- **Production URL**: Update in .env.production
- **Database Admin**: Configure access details
- **Backup Location**: Document backup storage
- **Monitoring Tools**: Set up error tracking (Sentry, Bugsnag, etc.)

---

## Notes for Team

This deployment configuration prioritizes **stability over features**. 

- **Conservative approach**: Some features are disabled by default in production
- **Easy rollback**: Multiple safety nets in place
- **Monitoring ready**: Feature flags allow quick disabling of problematic features
- **Scalable**: Can gradually enable features as they're proven stable

Remember: **It's better to launch with fewer features that work perfectly than many features that are unstable.**