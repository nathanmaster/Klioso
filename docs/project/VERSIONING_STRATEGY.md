# Klioso Versioning Strategy

## 🎯 **Recommended Release Strategy**

### **Dev Branch Workflow:**
```bash
# 1. DEVELOPMENT COMMITS (No version bumps)
git commit -m "feat: add new scanner functionality"
git commit -m "fix: resolve auth issue"
git commit -m "refactor: improve code structure"
git commit -m "test: add unit tests"

# 2. RELEASE BUNDLE (Version bump when ready)
git commit -m "v0.9.71-beta: Enhanced Scanner Features
- Add new vulnerability detection
- Fix authentication edge cases  
- Improve code maintainability
- Add comprehensive test coverage"
```

### **Release Triggers (When to increment version):**

#### ✅ **PATCH Increment (0.9.X):**
- Bug fixes bundle (3-5 related fixes)
- Security patches
- Performance improvements
- Documentation updates
- Quality improvements (like debug cleanup)

#### ✅ **MINOR Increment (0.X.0):**
- New feature completion
- API additions (backward compatible)
- Major UI/UX improvements
- Significant architectural changes

#### ✅ **MAJOR Increment (X.0.0):**
- Breaking changes
- Complete rewrites
- New platform support
- Public API changes

### **Recommended Schedule:**

#### **Option A: Feature-Bundle Releases (RECOMMENDED)**
```
🎯 Release when meaningful changes accumulate:
- 3-5 commits of related work = 1 patch version
- 1 major feature completion = 1 minor version
- Weekly/bi-weekly release cadence
- Quality gates before version bumps
```

#### **Option B: Time-Based Releases**
```
📅 Scheduled releases:
- Daily: Development builds (no version bump)
- Weekly: Beta releases (patch increment)
- Monthly: Feature releases (minor increment)
- Quarterly: Major releases
```

## 🔧 **Implementation:**

### **Development Workflow:**
```bash
# Work normally on dev branch
git commit -m "feat: implement new feature"
git commit -m "fix: resolve edge case"
git commit -m "refactor: improve performance"

# When ready to "release" (bundle)
git add .
git commit -m "v0.9.71-beta: Feature Bundle Name
- Summary of 3-5 commits bundled
- User-facing changes highlighted
- Technical improvements noted"

# Update version files
# Create release documentation if needed
# Tag only for major milestones
```

### **Version File Updates:**
- Update `version.json` and `package.json` only on release commits
- Include commit count or date in pre-release metadata if needed
- Use semantic versioning strictly

### **Tagging Strategy:**
```bash
# Tag only significant releases
git tag v0.9.71-beta  # Minor feature releases
git tag v0.9.80-beta  # Release candidates
git tag v1.0.0        # Stable releases

# Skip tags for small patches unless critical
```

## 📊 **Current State Analysis:**

**Recent Pattern:**
- v0.9.69-beta → v0.9.70-beta (debug cleanup)
- Good use of descriptive commit messages
- Inconsistent version bumping

**Recommendation:**
- Continue current feature-bundle approach
- Standardize on 3-5 commits per version bump
- Use beta suffix until v1.0.0 stable
- Reserve tags for release candidates and stable versions

## 🎯 **Next Steps:**

1. **Continue current approach** - bundle 3-5 related commits
2. **Version bump** when feature/improvement is complete
3. **Tag releases** only for major milestones
4. **Document changes** in comprehensive commit messages
5. **Quality gate** - ensure build success before version bump

**Example Next Release:**
```bash
v0.9.71-beta: Performance & Quality Improvements
- Optimize database queries for scanner
- Add loading indicators for better UX  
- Implement caching for frequent requests
- Add error boundary for React components
- Update dependencies to latest versions
```

## 🚀 **Benefits of This Approach:**

✅ **Flexibility:** Multiple dev commits without version pollution
✅ **Meaningful versions:** Each version represents real user value
✅ **Rollback safety:** Can revert to previous stable version easily
✅ **Clear communication:** Version changes signal actual improvements
✅ **Professional:** Follows industry best practices
✅ **Scalable:** Works for small and large development teams

---

**Current Version:** v0.9.70-beta "Production Quality"
**Next Planned:** v0.9.71-beta "Feature Bundle TBD"
**Target Stable:** v1.0.0 (when quality analysis complete)
