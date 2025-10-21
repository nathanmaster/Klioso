# Klioso Versioned Deployment Examples

This document provides practical examples of how to deploy Klioso with proper versioning.

## 🚀 Quick Deployment Commands

### Current Release (v0.10.1 → v0.10.2)
For the current state with routing fixes and feature flags:

**Windows PowerShell:**
```powershell
# Deploy with version increment (recommended)
.\scripts\deploy-safe.ps1 -Environment production -Version "0.10.2" -Description "Routing fixes, feature flags, and production safety improvements"

# Deploy without version change (if already versioned)
.\scripts\deploy-safe.ps1 -Environment production -SkipVersioning
```

**Linux/Mac Bash:**
```bash
# Deploy with version increment (recommended)
./scripts/deploy-safe.sh production --version "0.10.2" --description "Routing fixes, feature flags, and production safety improvements"

# Deploy without version change (if already versioned)
./scripts/deploy-safe.sh production --skip-versioning
```

## 📋 What The Versioned Deployment Does

### 1. Version Management
- ✅ Updates `version.json` with new version info
- ✅ Updates `package.json` version field
- ✅ Creates git tag (e.g., `v0.10.2`)
- ✅ Sets release metadata (date, type, stability)

### 2. Safe Deployment Process
- ✅ Backs up current `.env` file
- ✅ Switches to production environment
- ✅ Installs production dependencies
- ✅ Builds optimized frontend assets
- ✅ Runs database migrations (with confirmation)
- ✅ Generates Ziggy routes with correct URLs
- ✅ Caches configuration for performance

### 3. Feature Flag Integration
- ✅ Applies production-safe feature settings
- ✅ Disables experimental/debug features
- ✅ Enables stable core functionality

## 🎯 Recommended Next Steps

### For Production Release (v0.10.2)

1. **Test Current Changes**:
   ```bash
   # Test locally first
   npm run build
   php artisan serve
   # Verify routing works, no CORS errors
   ```

2. **Deploy with Version**:
   ```powershell
   .\scripts\deploy-safe.ps1 -Environment production -Version "0.10.2" -Description "Production-ready release with routing fixes and feature flags"
   ```

3. **Push Version Tags**:
   ```bash
   git push origin --tags
   ```

4. **Create GitHub Release** (optional):
   - Go to GitHub repository
   - Create new release from tag `v0.10.2`
   - Add release notes

## 🔄 Version Strategy Going Forward

### Patch Releases (0.10.x)
For bug fixes and minor improvements:
```bash
./scripts/deploy-safe.sh production --version "0.10.3" --description "Bug fixes and stability improvements"
```

### Minor Releases (0.x.0)
For new features:
```bash
./scripts/deploy-safe.sh production --version "0.11.0" --description "New scanner features and UI improvements"
```

### Major Releases (x.0.0)
For breaking changes:
```bash
./scripts/deploy-safe.sh production --version "1.0.0" --description "First stable release with breaking API changes"
```

### Beta/Testing Releases
For pre-release testing:
```bash
./scripts/deploy-safe.sh staging --version "0.11.0-beta.1" --description "Beta testing for new features"
```

## 🛡️ Safety Features

### Automatic Rollback
If deployment fails, restore previous state:
```bash
# Restore environment
cp .env.backup.[timestamp] .env

# Remove bad tag
git tag -d v0.10.2

# Rebuild
npm run build
php artisan config:cache
```

### Feature Toggle Safety
If a feature causes issues after deployment:
```bash
# Disable feature via environment variable
FEATURE_BULK_SCANNING=false

# Recache configuration
php artisan config:cache
```

## 📊 Version Information

After successful versioned deployment, you'll see:

```
🏷️ VERSION INFORMATION:
  Version: 0.10.2
  Description: Production-ready release with routing fixes and feature flags
  Git tag: v0.10.2 created
  
  NEXT STEPS:
  - Push tags to remote: git push origin --tags
  - Create GitHub release if needed
  - Update documentation if necessary
```

This ensures full traceability and proper version management for your production deployments!