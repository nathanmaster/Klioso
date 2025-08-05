# Release Documentation Structure

## 📁 Directory Organization

```
docs/
├── releases/
│   ├── README.md                    # This file - release documentation guide
│   ├── templates/
│   │   ├── RELEASE_NOTES_TEMPLATE.md
│   │   ├── CHANGELOG_TEMPLATE.md
│   │   └── PRE_RELEASE_TEMPLATE.md
│   ├── v0.8.x/
│   │   ├── v0.8.0-beta.1.md
│   │   ├── v0.8.0-beta.2.md
│   │   └── ...
│   ├── v0.9.x/
│   │   ├── v0.9.0-beta.1.md
│   │   └── v0.9.1-planned.md
│   └── archived/
│       └── legacy-releases.md
```

## 📋 Release Documentation Standards

### **File Naming Convention**
- **Release Notes**: `vX.Y.Z[-pre-release].md`
- **Changelogs**: Use main `CHANGELOG.md` with sections per version
- **Planning Docs**: `vX.Y.Z-planned.md` for future releases

### **Documentation Types**

#### 1. **Release Notes** (`docs/releases/vX.Y.Z/`)
- **Audience**: End users, administrators
- **Content**: New features, breaking changes, installation instructions
- **Format**: User-friendly language, screenshots, examples

#### 2. **Technical Changelog** (`CHANGELOG.md`)
- **Audience**: Developers, maintainers
- **Content**: Code changes, API updates, technical details
- **Format**: Structured, links to commits/PRs

#### 3. **GitHub Releases**
- **Audience**: GitHub users, package managers
- **Content**: Automated from release notes + binaries
- **Format**: Markdown with downloadable assets

#### 4. **API Documentation** (`docs/api/`)
- **Audience**: Developers using the API
- **Content**: Endpoint documentation, examples
- **Format**: OpenAPI/Swagger specs

## 🔄 Release Process Integration

### **Pre-Release (Beta/Alpha)**
1. Create `docs/releases/vX.Y.Z-beta.N.md`
2. Update `CHANGELOG.md` with unreleased section
3. GitHub Actions creates release with `prerelease: true`

### **Stable Release**
1. Move beta docs to final version
2. Update `CHANGELOG.md` released section
3. GitHub Actions creates release with `prerelease: false`

### **Post-Release**
1. Archive old release docs to `archived/`
2. Update main `README.md` with latest version
3. Create next version planning document

## 📊 Current Status

### **Scattered Files** (need consolidation):
- `RELEASE_NOTES_v0.9.0-beta.1.md` → `docs/releases/v0.9.x/v0.9.0-beta.1.md`
- `releases/v0.8.0-beta.1-release-notes.md` → `docs/releases/v0.8.x/v0.8.0-beta.1.md`
- `DEPLOYMENT_SUMMARY_v0.9.0-beta.1.md` → integrate into release notes

### **Well-Organized Files**:
- ✅ `CHANGELOG.md` - main changelog (keep)
- ✅ `docs/PRE_RELEASE_CHECKLIST.md` - process documentation
- ✅ `docs/TESTING_GUIDE.md` - testing procedures

## 🎯 Recommended Actions

1. **Reorganize existing release docs** into version-specific folders
2. **Create release note templates** for consistency
3. **Update GitHub Actions** to use organized structure
4. **Archive legacy release files** to clean up root directory
5. **Standardize versioning** (consider v0.8.1 instead of v0.9.0)

## 📝 Template Usage

Each release should use standardized templates:
- **New features** get minor version bump (0.8.0 → 0.9.0)
- **Bug fixes/patches** get patch version bump (0.8.0 → 0.8.1)
- **Breaking changes** get major version bump (0.9.0 → 1.0.0)

This structure provides clear organization while maintaining backward compatibility with existing tooling.
