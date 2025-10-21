#!/bin/bash

# Klioso Release Script Launcher
# Simple interface for creating releases with the enhanced release manager

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

print_header() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════╗"
    echo "║                    🚀 Klioso Release Manager                     ║"
    echo "║                        Enhanced Edition                          ║"
    echo "╚══════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_usage() {
    echo -e "${YELLOW}Usage:${NC}"
    echo "  $0 VERSION \"DESCRIPTION\" [OPTIONS]"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo "  $0 0.9.47 \"Bug fixes and performance improvements\""
    echo "  $0 0.10.0 \"Major architecture overhaul\" --major"
    echo "  $0 1.0.0 \"Production ready release\" --stable"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo "  --major     Major release with breaking changes"
    echo "  --minor     Minor release with new features (default)"
    echo "  --patch     Patch release with bug fixes only"
    echo "  --stable    Stable production release"
    echo "  --beta      Beta pre-release"
    echo "  --dry-run   Preview changes without executing"
    echo "  --help      Show this help message"
    echo ""
}

validate_version() {
    local version="$1"
    if ! echo "$version" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9]+(\.[0-9]+)?)?$'; then
        echo -e "${RED}❌ Invalid version format. Use semantic versioning (X.Y.Z)${NC}"
        return 1
    fi
    return 0
}

check_git_status() {
    echo -e "${BLUE}🔍 Checking git status...${NC}"
    
    if ! git status --porcelain | grep -q .; then
        echo -e "${GREEN}✅ Working directory is clean${NC}"
    else
        echo -e "${YELLOW}⚠️  Working directory has uncommitted changes:${NC}"
        git status --porcelain
        echo ""
        read -p "Continue anyway? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Release cancelled${NC}"
            exit 1
        fi
    fi
}

check_current_branch() {
    local current_branch
    current_branch=$(git branch --show-current)
    
    if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
        echo -e "${YELLOW}⚠️  Currently on branch: $current_branch${NC}"
        echo -e "${YELLOW}   Recommended to release from main/master branch${NC}"
        echo ""
        read -p "Continue anyway? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Release cancelled${NC}"
            exit 1
        fi
    fi
}

run_pre_release_checks() {
    echo -e "${BLUE}🔍 Running pre-release checks...${NC}"
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/version.json" ]]; then
        echo -e "${RED}❌ version.json not found. Are you in the right directory?${NC}"
        exit 1
    fi
    
    # Check git status
    check_git_status
    
    # Check current branch
    check_current_branch
    
    # Check if tag already exists
    local version="$1"
    if git tag -l | grep -q "^v$version$"; then
        echo -e "${RED}❌ Tag v$version already exists${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ All pre-release checks passed${NC}"
    echo ""
}

run_release() {
    local version="$1"
    local description="$2"
    shift 2
    local options=("$@")
    
    echo -e "${BLUE}🚀 Starting release process...${NC}"
    echo -e "${BLUE}   Version: $version${NC}"
    echo -e "${BLUE}   Description: $description${NC}"
    echo -e "${BLUE}   Options: ${options[*]}${NC}"
    echo ""
    
    # Change to project root
    cd "$PROJECT_ROOT"
    
    # Run the enhanced release manager
    php "$SCRIPT_DIR/enhanced-release.php" "$version" "$description" "${options[@]}"
    
    if [[ $? -eq 0 ]]; then
        echo ""
        echo -e "${GREEN}🎉 Release completed successfully!${NC}"
        echo ""
        echo -e "${YELLOW}📋 Next steps:${NC}"
        echo -e "  1. Review the generated files"
        echo -e "  2. Push to remote: ${BLUE}git push origin main && git push origin v$version${NC}"
        echo -e "  3. Monitor GitHub Actions for automatic release creation"
        echo ""
        echo -e "${BLUE}🔗 Quick links:${NC}"
        echo -e "  📄 Release notes: docs/releases/v$(echo $version | cut -d. -f1-2)/RELEASE_NOTES_v$version.md"
        echo -e "  🌐 Repository: https://github.com/nathanmaster/Klioso"
    else
        echo -e "${RED}❌ Release failed${NC}"
        exit 1
    fi
}

main() {
    print_header
    
    # Check arguments
    if [[ $# -lt 2 ]] || [[ "$1" == "--help" ]] || [[ "$1" == "-h" ]]; then
        print_usage
        exit 0
    fi
    
    local version="$1"
    local description="$2"
    shift 2
    local options=("$@")
    
    # Validate version format
    if ! validate_version "$version"; then
        exit 1
    fi
    
    # Validate description
    if [[ -z "$description" ]] || [[ "$description" == " " ]]; then
        echo -e "${RED}❌ Description cannot be empty${NC}"
        exit 1
    fi
    
    # Run pre-release checks
    run_pre_release_checks "$version"
    
    # Confirm release
    echo -e "${YELLOW}📋 Release Summary:${NC}"
    echo -e "   Version: $version"
    echo -e "   Description: $description"
    echo -e "   Options: ${options[*]}"
    echo ""
    
    if [[ ! " ${options[*]} " =~ " --dry-run " ]]; then
        read -p "Proceed with release? [y/N] " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${RED}❌ Release cancelled${NC}"
            exit 0
        fi
    fi
    
    # Run the release
    run_release "$version" "$description" "${options[@]}"
}

# Run main function with all arguments
main "$@"
