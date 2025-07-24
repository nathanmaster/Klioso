#!/bin/bash

# Script to prepare package.json for different registries
# Usage: ./prepare-package.sh [npm|github]

REGISTRY=$1

if [ "$REGISTRY" = "npm" ]; then
    echo "📦 Preparing package for npm registry (unscoped)..."
    
    # Create package.json for npm registry
    cat package.json | sed 's/"@nathanmaster\/klioso"/"klioso"/' | sed '/publishConfig/,+2d' > package-temp.json
    mv package-temp.json package.json
    
    echo "✅ Package configured for npm registry as 'klioso'"
    
elif [ "$REGISTRY" = "github" ]; then
    echo "📦 Preparing package for GitHub Packages (scoped)..."
    
    # Ensure package.json has correct scoped name and publishConfig
    if ! grep -q "@nathanmaster/klioso" package.json; then
        echo "⚠️ Package name should be @nathanmaster/klioso for GitHub Packages"
    fi
    
    echo "✅ Package configured for GitHub Packages as '@nathanmaster/klioso'"
    
else
    echo "❌ Usage: ./prepare-package.sh [npm|github]"
    exit 1
fi

echo "Current package name: $(node -p "require('./package.json').name")"
