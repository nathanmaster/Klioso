# Klioso Git Workflow & Branch Strategy

## 🌳 Branch Structure

### Main Branches

**`main`** - Stable Release Branch
- ✅ **Stable minor/major releases** only (v0.12.0, v1.0.0, etc.)
- ✅ **Production ready** - extensively tested
- ✅ **Protected branch** - requires pull request reviews
- ✅ **Tagged stable releases** with comprehensive documentation
- ❌ **No patch releases** - only significant stable releases
- ❌ **No direct commits** - only via approved PRs from `dev`

**`dev`** - Development & Patch Release Branch
- 🔄 **Active development** and patch releases (v0.11.1, v0.11.2, etc.)
- 🔄 **All features enabled** for testing and development
- 🔄 **Unstable releases** marked with `-dev` or `-beta` suffixes
- 🔄 **Regular development** and bug fixes
- 🔄 **Patch version releases** deployed from here
- ➡️ **Source for stable releases** (PRs to `main` for major/minor versions)

### Feature Branches

**`feature/[description]`** - Individual Features
- 🔧 **Branch from**: `dev`
- 🔧 **Merge to**: `dev` via Pull Request
- 🔧 **Naming**: `feature/routing-fixes`, `feature/scanner-improvements`
- 🔧 **Lifespan**: Until feature is complete and merged

**`hotfix/[description]`** - Emergency Production Fixes
- 🚨 **Branch from**: `main` 
- 🚨 **Merge to**: Both `main` AND `dev`
- 🚨 **Naming**: `hotfix/critical-security-patch`
- 🚨 **Immediate deployment** after testing

## 🚀 Release Workflow

### Current Situation Analysis
**Issue**: We've been developing and releasing from `dev` branch
**Problem**: Production releases should come from `main` branch
**Solution**: Establish proper promotion workflow

### Recommended Release Process

#### 1. Development Phase (Daily)
```bash
# Work on features
git checkout dev
git checkout -b feature/new-feature
# ... develop feature ...
git commit -m "feat: implement new feature"
git push origin feature/new-feature
# Create PR: feature/new-feature → dev
```

#### 2. Integration Testing (Weekly)
```bash
# Test in dev environment
git checkout dev
# All features working? Ready for release candidate
```

#### 3. Release Preparation (When ready)
```bash
# Create release PR from dev to main
git checkout main
git pull origin main
git checkout -b release/v0.10.4
git merge dev
# Update version numbers, finalize CHANGELOG
git commit -m "chore: prepare release v0.10.4"
git push origin release/v0.10.4
# Create PR: release/v0.10.4 → main
```

#### 4. Production Deployment (After approval)
```bash
# Deploy from main branch only
git checkout main
git pull origin main
git tag v0.10.4
./scripts/deploy-safe.sh production --version "0.10.4"
git push origin --tags
```

## 🛠️ Environment Configuration

### Development (`dev` branch)
```bash
APP_ENV=local
APP_DEBUG=true
APP_URL=http://laravel12.test

# All features enabled for testing
FEATURE_BULK_SCANNING=true
FEATURE_AUTOMATED_SCANNING=true
FEATURE_DEBUG_TOOLBAR=true
# ... etc
```

### Staging (`release/` branches)
```bash
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging.klioso.com

# Production-like feature settings
FEATURE_BULK_SCANNING=false
FEATURE_DEBUG_TOOLBAR=false
# Conservative settings for final testing
```

### Production (`main` branch)
```bash
APP_ENV=production
APP_DEBUG=false
APP_URL=https://klioso.com

# Production-safe features only
FEATURE_BULK_SCANNING=false
FEATURE_AUTOMATED_SCANNING=false
FEATURE_DEBUG_TOOLBAR=false
# Ultra-conservative settings
```

## 📋 Current State Fix

### Immediate Actions Needed

1. **Fix Current Release Tags**
   ```bash
   # Our v0.10.3 was created on dev, should be on main
   # Option 1: Move the work to main properly
   git checkout main
   git merge dev  # Bring all dev changes to main
   git tag -d v0.10.3  # Delete existing tag
   git tag v0.10.3     # Recreate on main
   git push origin main --force-with-lease
   git push origin --tags --force
   ```

2. **Establish Branch Protection**
   ```bash
   # On GitHub, protect main branch:
   # - Require PR reviews
   # - Require status checks
   # - No force pushes
   # - No deletions
   ```

## 🎯 Deployment Strategy by Branch

### Development Deployments (dev branch)
```bash
# Use development environment
./scripts/deploy-safe.sh development --skip-versioning
# Features: All enabled for testing
# Purpose: Development and feature testing
```

### Staging Deployments (release branches)
```bash
# Use staging environment with production-like settings
./scripts/deploy-safe.sh staging --version "0.10.4-rc.1"
# Features: Production-safe settings
# Purpose: Final testing before production
```

### Production Deployments (main branch ONLY)
```bash
# Use production environment with conservative settings
./scripts/deploy-safe.sh production --version "0.10.4"
# Features: Ultra-conservative, proven stable only
# Purpose: Live user environment
```

## 🔄 Hotfix Workflow

### Emergency Production Fix
```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Fix the issue
git commit -m "hotfix: resolve critical security issue"

# 3. Deploy hotfix immediately
./scripts/deploy-safe.sh production --version "0.10.4-hotfix.1"

# 4. Merge to both main and dev
git checkout main
git merge hotfix/critical-fix
git push origin main

git checkout dev
git merge hotfix/critical-fix
git push origin dev

# 5. Tag and cleanup
git tag v0.10.4-hotfix.1
git push origin --tags
git branch -d hotfix/critical-fix
```

## 📊 Branch Comparison

| Branch | Purpose | Stability | Feature Flags | Deployment |
|--------|---------|-----------|---------------|------------|
| `main` | Production | 🟢 Highest | Conservative | Production only |
| `dev` | Development | 🟡 Medium | All enabled | Dev/Staging |
| `feature/*` | Features | 🔴 Experimental | Feature-specific | Local only |
| `hotfix/*` | Emergency | 🟢 Critical fixes | Production settings | Immediate |

## 🎯 Next Steps for Your Project

1. **Immediate**: Fix current environment (done above)
2. **Short-term**: Create proper release PR from `dev` to `main`
3. **Long-term**: Establish branch protection and workflows

This strategy ensures:
- ✅ **Stable production** releases from `main`
- ✅ **Active development** in `dev`
- ✅ **Feature isolation** in feature branches
- ✅ **Emergency response** capability
- ✅ **Proper versioning** and deployment tracking