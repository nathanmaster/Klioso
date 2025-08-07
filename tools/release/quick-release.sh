#!/bin/bash

# Klioso Quick Release Script
# A simplified script for creating releases quickly
# Usage: ./quick-release.sh 0.9.47 "Brief description of changes"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if version is provided
if [ -z "$1" ]; then
    print_error "Version number is required"
    echo "Usage: ./quick-release.sh <version> [description]"
    echo "Example: ./quick-release.sh 0.9.47 \"Bug fixes and improvements\""
    exit 1
fi

VERSION=$1
DESCRIPTION=${2:-"Release v$VERSION"}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

print_status "🚀 Starting quick release for v$VERSION"

# Validate version format
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9\.-]+)?$ ]]; then
    print_error "Invalid version format. Use semantic versioning (e.g., 1.0.0 or 1.0.0-beta.1)"
    exit 1
fi

# Change to project root
cd "$PROJECT_ROOT"

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    print_error "Not in a git repository"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    print_warning "You have uncommitted changes. Please commit or stash them first."
    git status --short
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Release cancelled"
        exit 1
    fi
fi

# Update version files
print_status "📝 Updating version files..."

# Update version.json
if [ -f "version.json" ]; then
    # Use PHP to properly update JSON
    php -r "
    \$data = json_decode(file_get_contents('version.json'), true);
    \$data['version'] = '$VERSION';
    \$data['release_date'] = date('Y-m-d');
    file_put_contents('version.json', json_encode(\$data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . PHP_EOL);
    "
    print_success "Updated version.json"
fi

# Update package.json
if [ -f "package.json" ]; then
    # Use Node.js to update package.json
    node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.version = '$VERSION';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
    print_success "Updated package.json"
fi

# Create simple changelog entry
print_status "📝 Creating changelog entry..."

CHANGELOG_ENTRY="## [v$VERSION] - $(date +%Y-%m-%d)

### Release Notes
$DESCRIPTION

### Changes
- [Add specific changes here]

---

"

# Add entry to CHANGELOG.md
if [ -f "CHANGELOG.md" ]; then
    # Create temporary file with new entry + existing changelog
    echo "$CHANGELOG_ENTRY" > temp_changelog.md
    tail -n +2 CHANGELOG.md >> temp_changelog.md
    mv temp_changelog.md CHANGELOG.md
    print_success "Updated CHANGELOG.md"
else
    # Create new CHANGELOG.md
    echo "# Changelog" > CHANGELOG.md
    echo "" >> CHANGELOG.md
    echo "$CHANGELOG_ENTRY" >> CHANGELOG.md
    print_success "Created CHANGELOG.md"
fi

# Create simple release notes
print_status "📖 Creating release notes..."
RELEASE_DIR="docs/releases/v$(echo $VERSION | cut -d. -f1-2)"
mkdir -p "$RELEASE_DIR"

RELEASE_NOTES="# Klioso v$VERSION Release Notes

**Release Date**: $(date +"%B %d, %Y")  
**Version**: $VERSION  
**Stability**: Stable

## Overview

$DESCRIPTION

## Changes

- [List major changes here]

## Bug Fixes

- [List bug fixes here]

## Installation

\`\`\`bash
# Download the latest release
wget https://github.com/nathanmaster/Klioso/releases/download/v$VERSION/klioso-v$VERSION.zip

# Extract and install
unzip klioso-v$VERSION.zip
cd klioso-v$VERSION
composer install --no-dev --optimize-autoloader
npm ci --production
npm run build
\`\`\`

## Migration

\`\`\`bash
# Run database migrations
php artisan migrate

# Clear caches
php artisan config:cache
php artisan route:cache
php artisan view:cache
\`\`\`

## Support

- 🐛 [Report Issues](https://github.com/nathanmaster/Klioso/issues)
- 💬 [Discussions](https://github.com/nathanmaster/Klioso/discussions)
- 📖 [Documentation](https://github.com/nathanmaster/Klioso/wiki)

---

For technical details, see [CHANGELOG.md](../../CHANGELOG.md)
"

echo "$RELEASE_NOTES" > "$RELEASE_DIR/RELEASE_NOTES_v$VERSION.md"
print_success "Created release notes"

# Commit changes
print_status "📝 Committing changes..."
git add .
git commit -m "chore: prepare release v$VERSION

- Update version to $VERSION
- Update changelog
- Add release notes

$DESCRIPTION"
print_success "Committed changes"

# Create git tag
print_status "🏷️ Creating git tag..."
git tag -a "v$VERSION" -m "Release v$VERSION

$DESCRIPTION"
print_success "Created git tag v$VERSION"

# Show summary
print_success "🎉 Release v$VERSION prepared successfully!"
echo ""
echo "Summary of changes:"
echo "- ✅ Updated version files (version.json, package.json)"
echo "- ✅ Updated CHANGELOG.md"
echo "- ✅ Created release notes"
echo "- ✅ Committed changes"
echo "- ✅ Created git tag v$VERSION"
echo ""
print_status "Next steps:"
echo "1. Review the changes: git show v$VERSION"
echo "2. Push the tag: git push origin v$VERSION"
echo "3. Push the commits: git push"
echo "4. GitHub Actions will automatically create the release"
echo ""
print_warning "Remember to:"
echo "- Edit CHANGELOG.md to add specific changes"
echo "- Update release notes with detailed information"
echo "- Test the release before publishing"

# Ask if user wants to push
echo ""
read -p "Push tag and commits to remote now? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "🚀 Pushing to remote..."
    git push origin main
    git push origin "v$VERSION"
    print_success "Pushed to remote repository"
    echo ""
    print_success "🎉 Release v$VERSION is now live!"
    echo "Check GitHub for automated release creation: https://github.com/nathanmaster/Klioso/releases"
fi
