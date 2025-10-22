# 🚀 Release Management Scripts

This directory contains scripts to help with release management and testing.

## Scripts

### `test-release.sh`
**Purpose**: Test the release process locally before pushing to GitHub Actions

**Usage**:
```bash
# Make executable (Linux/macOS)
chmod +x scripts/test-release.sh

# Run the test
./scripts/test-release.sh
```

**What it tests**:
- ✅ PHP, Composer, Node.js, npm availability
- ✅ Composer install process (dry run)
- ✅ npm install process (dry run)  
- ✅ Laravel optimization commands
- ✅ Environment configuration

### `prepare-release.sh` (Legacy)
Various older release preparation scripts. Use the new workflow instead.

## Release Process

### 1. Prepare Release
- Update `version.json` with new version
- Update `package.json` version to match
- Create/update release notes in `docs/releases/vX.Y.Z/`
- Test locally with `test-release.sh`

### 2. Commit and Tag
```bash
# Commit changes
git add .
git commit -m "release: vX.Y.Z - Release description"

# Create annotated tag
git tag -a vX.Y.Z -m "Release vX.Y.Z: Description of changes"

# Push to repository
git push origin main
git push origin vX.Y.Z
```

### 3. GitHub Actions
The tag push automatically triggers:
- ✅ Dependency installation (PHP + Node.js)
- ✅ Asset compilation (Vite build)
- ✅ Production package creation
- ✅ Release binary generation
- ✅ GitHub release creation with artifacts

### 4. Verify Release
- Check GitHub Actions completed successfully
- Verify release artifacts are available
- Test download and installation of release packages

## Troubleshooting

### Common Issues

**Composer Install Fails**:
- Check `composer.lock` is committed
- Verify PHP extensions in `.github/workflows/release.yml`
- Check for version conflicts in `composer.json`

**npm Build Fails**:
- Verify `package-lock.json` is excluded (conflict resolution)
- Check for peer dependency issues
- Ensure `vite.config.js` is properly configured

**Laravel Optimizations Fail**:
- Check config files for syntax errors
- Verify routes don't have closures (prevents caching)
- Ensure views compile correctly

### Debug GitHub Actions
1. Check the Actions tab in GitHub repository
2. Review logs for specific error messages
3. Compare with successful previous runs
4. Test locally with `test-release.sh` first

## Configuration Files

### `.github/workflows/release.yml`
Main release workflow configuration:
- PHP 8.3 with required extensions
- Node.js 18 with npm caching
- Production-optimized build process
- Multi-platform package creation

### Version Files
- `version.json` - Main version configuration
- `package.json` - npm version (should match)
- Release notes in `docs/releases/vX.Y.Z/`

---

*For detailed release documentation, see `docs/releases/README.md`*