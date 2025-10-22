#!/bin/bash

# Debug script to test composer commands locally
echo "Testing composer commands..."

echo "1. Checking composer version:"
composer --version

echo "2. Testing dump-autoload (correct command):"
composer dump-autoload --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ dump-autoload command exists"
else
    echo "❌ dump-autoload command failed"
fi

echo "3. Testing dump-autoloader (incorrect command):"
composer dump-autoloader --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "⚠️ dump-autoloader command exists (should not)"
else
    echo "✅ dump-autoloader command properly fails"
fi

echo "4. Listing available composer commands:"
composer list | grep -i dump

echo "5. Testing actual dump-autoload with dry run:"
composer dump-autoload --optimize --no-dev --dry-run