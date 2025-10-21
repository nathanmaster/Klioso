# Klioso Release Management

This directory contains tools and templates for managing Klioso releases in a consistent and automated way.

## 🎯 **Quick Start**

### Creating a New Release

**Option 1: Quick Release (Recommended for most releases)**
```bash
# Simple release with basic automation
./tools/release/quick-release.sh 0.9.47 "Bug fixes and performance improvements"
```

**Option 2: Full Release Management**
```bash
# Complete release with all documentation
php tools/release/release-manager.php create-release 0.9.47
```

**Option 3: Documentation Only**
```bash
# Generate docs without creating release
php tools/release/release-manager.php generate-docs 0.9.47
```

## 📁 **Directory Structure**

```
tools/release/
├── README.md                    # This file
├── config.json                  # Release configuration
├── release-manager.php          # Full-featured release tool
├── quick-release.sh            # Simple release script
└── templates/                  # Documentation templates
    ├── RELEASE_NOTES_TEMPLATE.md
    ├── CHANGELOG_TEMPLATE.md
    └── MIGRATION_GUIDE_TEMPLATE.md
```

## 🔧 **Tools Overview**

### `quick-release.sh`
**Best for**: Regular releases, bug fixes, minor features
- ✅ Updates version files automatically
- ✅ Creates changelog entry
- ✅ Generates basic release notes
- ✅ Creates git tag and commits
- ✅ Simple one-command operation

### `release-manager.php`
**Best for**: Major releases, complex changes, detailed documentation
- ✅ All features of quick-release
- ✅ Advanced documentation generation
- ✅ Template-based release notes
- ✅ Validation and verification
- ✅ Cleanup and organization tools

## 📋 **Release Process**

### 1. Preparation
```bash
# Ensure you're on the main branch with latest changes
git checkout main
git pull origin main

# Optional: Clean up old files
php tools/release/release-manager.php cleanup-old
```

### 2. Create Release
```bash
# For most releases - quick and simple
./tools/release/quick-release.sh 0.9.47 "Brief description"

# For major releases - comprehensive documentation
php tools/release/release-manager.php create-release 0.9.47
```

### 3. Review & Customize
```bash
# Edit the generated files as needed:
# - docs/releases/v0.9/RELEASE_NOTES_v0.9.47.md
# - CHANGELOG.md
# - Any other documentation
```

### 4. Publish
```bash
# Push the tag (triggers GitHub Actions)
git push origin v0.9.47
git push origin main

# GitHub Actions will automatically:
# - Build release artifacts
# - Create GitHub release
# - Publish packages
```

## 🎨 **Customization**

### Configuration
Edit `config.json` to customize:
- Project metadata
- Build targets
- Documentation requirements
- Archive rules

### Templates
Modify templates in `templates/` directory:
- `RELEASE_NOTES_TEMPLATE.md` - User-facing release notes
- `CHANGELOG_TEMPLATE.md` - Technical changelog format
- `MIGRATION_GUIDE_TEMPLATE.md` - Upgrade instructions

## 🔍 **Validation & Quality**

### Validate Release
```bash
# Check version consistency and required files
php tools/release/release-manager.php validate
```

### Project Status
```bash
# View current project status
php tools/release/release-manager.php status
```

### Build Testing
```bash
# Test build process without releasing
php tools/release/release-manager.php prepare-build 0.9.47
```

## 📖 **Examples**

### Patch Release (Bug Fixes)
```bash
./tools/release/quick-release.sh 0.9.47 "Fixed login issue and improved performance"
```

### Minor Release (New Features)
```bash
php tools/release/release-manager.php create-release 0.10.0
# Then customize the generated documentation
```

### Pre-release (Beta/Alpha)
```bash
./tools/release/quick-release.sh 0.10.0-beta.1 "Beta release for testing new features"
```

## 🚨 **Troubleshooting**

### Common Issues

**"Version mismatch" error:**
```bash
# Fix version inconsistencies
php tools/release/release-manager.php validate
# Edit the flagged files to match versions
```

**"Uncommitted changes" warning:**
```bash
# Commit your changes first
git add .
git commit -m "Your changes"
# Then run release script
```

**"Git tag already exists" error:**
```bash
# Delete existing tag if needed
git tag -d v0.9.47
git push origin :refs/tags/v0.9.47
# Then create release again
```

### Getting Help

1. **Validation**: Always run `validate` command first
2. **Status**: Check project status with `status` command  
3. **Documentation**: Review generated files before pushing
4. **Testing**: Test builds locally before releasing

## 🔄 **Maintenance**

### Cleanup Old Files
```bash
# Move old release files to archive
php tools/release/release-manager.php cleanup-old
```

### Update Templates
- Modify templates in `templates/` directory
- Templates use `{{variable}}` syntax for replacements
- Available variables: `{{version}}`, `{{date}}`, `{{year}}`, `{{codename}}`

### Archive Management
Old releases and deprecated files are automatically moved to:
- `archive/old-releases/` - Previous release documentation
- `archive/deprecated-files/` - Obsolete project files

## 🎯 **Best Practices**

1. **Version Numbers**: Follow semantic versioning (X.Y.Z)
2. **Descriptions**: Provide clear, concise release descriptions
3. **Testing**: Always test locally before pushing tags
4. **Documentation**: Update README.md and other docs as needed
5. **Consistency**: Use the tools to maintain consistent formatting

---

**Need Help?** 
- Check the troubleshooting section above
- Review existing releases for examples
- Ask in project discussions or issues
