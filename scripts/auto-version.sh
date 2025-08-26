#!/bin/bash

# Auto Version Increment Script for Klioso
# Automatically increments patch version based on commits since last tag
# Adds stability tags (alpha/beta/unstable) based on analysis

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Klioso Auto Version Increment${NC}"
echo "=================================="

# Get the last version tag
LAST_TAG=$(git tag --sort=-version:refname | head -n1)
if [ -z "$LAST_TAG" ]; then
    echo -e "${RED}❌ No previous version tags found${NC}"
    exit 1
fi

echo -e "${GREEN}📋 Last Version: $LAST_TAG${NC}"

# Count commits since last tag
COMMIT_COUNT=$(git rev-list --count $LAST_TAG..HEAD)
echo -e "${GREEN}📊 Commits since last release: $COMMIT_COUNT${NC}"

if [ $COMMIT_COUNT -eq 0 ]; then
    echo -e "${YELLOW}⚠️  No new commits since last release${NC}"
    exit 0
fi

# Extract version numbers
LAST_VERSION=$(echo $LAST_TAG | sed 's/^v//')
IFS='.' read -ra VERSION_PARTS <<< "$LAST_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]%%-*}  # Remove any existing suffixes

# Calculate new patch version
NEW_PATCH=$((PATCH + COMMIT_COUNT))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

echo -e "${GREEN}🎯 Calculated Version: $NEW_VERSION${NC}"

# Analyze commit types for stability determination
echo -e "${BLUE}🔍 Analyzing commit types...${NC}"

BREAKING_CHANGES=$(git log $LAST_TAG..HEAD --oneline | grep -E "(BREAKING|breaking|feat!|fix!)" | wc -l)
FEATURES=$(git log $LAST_TAG..HEAD --oneline | grep -E "^[a-f0-9]+ feat" | wc -l)
FIXES=$(git log $LAST_TAG..HEAD --oneline | grep -E "^[a-f0-9]+ fix" | wc -l)
REFACTORS=$(git log $LAST_TAG..HEAD --oneline | grep -E "^[a-f0-9]+ refactor" | wc -l)
DOCS=$(git log $LAST_TAG..HEAD --oneline | grep -E "^[a-f0-9]+ docs" | wc -l)

echo "  - Breaking changes: $BREAKING_CHANGES"
echo "  - New features: $FEATURES" 
echo "  - Bug fixes: $FIXES"
echo "  - Refactoring: $REFACTORS"
echo "  - Documentation: $DOCS"

# Determine stability suffix
STABILITY=""
if [ $BREAKING_CHANGES -gt 0 ] || [ $REFACTORS -gt 3 ]; then
    STABILITY="-alpha"
    echo -e "${RED}⚠️  Major changes detected - marking as ALPHA${NC}"
elif [ $FEATURES -gt 2 ] || [ $COMMIT_COUNT -gt 10 ]; then
    STABILITY="-beta"
    echo -e "${YELLOW}⚠️  Significant changes detected - marking as BETA${NC}"
elif [ $FIXES -gt 5 ]; then
    STABILITY="-unstable"
    echo -e "${YELLOW}⚠️  Many fixes detected - marking as UNSTABLE${NC}"
else
    echo -e "${GREEN}✅ Changes appear stable - no suffix needed${NC}"
fi

FINAL_VERSION="$NEW_VERSION$STABILITY"
echo -e "${GREEN}🎉 Final Version: $FINAL_VERSION${NC}"

# Ask for confirmation
echo ""
read -p "Update version to $FINAL_VERSION? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Version update cancelled${NC}"
    exit 0
fi

# Update version.json
echo -e "${BLUE}📝 Updating version.json...${NC}"
TIMESTAMP=$(date +%s)
DATE=$(date +%Y-%m-%d)

# Create temporary version.json with new values
cat > version.json.tmp << EOF
{
    "version": "$FINAL_VERSION",
    "release_date": "$DATE",
    "release_timestamp": $TIMESTAMP,
    "codename": "Auto-generated Release",
    "description": "Automated version increment with $COMMIT_COUNT commits",
    "type": "patch",
    "stability": "${STABILITY#-}"
}
EOF

mv version.json.tmp version.json

# Update package.json
echo -e "${BLUE}📝 Updating package.json...${NC}"
sed -i "s/\"version\": \".*\"/\"version\": \"$FINAL_VERSION\"/" package.json

echo -e "${GREEN}✅ Version files updated successfully${NC}"
echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Review the changes: git diff"
echo "2. Commit the version update: git add version.json package.json && git commit -m 'chore: bump version to $FINAL_VERSION'"
echo "3. Create git tag: git tag v$FINAL_VERSION"
echo "4. Push changes: git push origin dev --tags"

echo ""
echo -e "${GREEN}🎉 Auto-versioning complete!${NC}"
