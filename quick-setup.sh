#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "================================================================"
echo "                    Klioso Quick Setup"
echo "        WordPress Management System - Optimized Installation"
echo "================================================================"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo -e "${RED}ERROR: artisan file not found. Please run this script from the Klioso root directory.${NC}"
    exit 1
fi

# Function to check command success
check_success() {
    if [ $? -ne 0 ]; then
        echo -e "${RED}ERROR: $1 failed!${NC}"
        exit 1
    fi
}

echo -e "${YELLOW}[1/6]${NC} Installing Composer dependencies..."
composer install
check_success "Composer installation"

echo
echo -e "${YELLOW}[2/6]${NC} Installing NPM dependencies..."
npm install
check_success "NPM installation"

echo
echo -e "${YELLOW}[3/6]${NC} Setting up environment configuration..."
if [ ! -f ".env" ]; then
    cp ".env.example" ".env"
    echo -e "${GREEN}Environment file created from .env.example${NC}"
else
    echo -e "${GREEN}Environment file already exists${NC}"
fi

echo
echo -e "${YELLOW}[4/6]${NC} Generating application key..."
php artisan key:generate
check_success "Application key generation"

echo
echo -e "${YELLOW}[5/6]${NC} Setting up database with optimized schema..."
echo "Choose installation type:"
echo "1. Fresh installation (Recommended - Fast, clean setup)"
echo "2. Incremental installation (For existing installations)"
echo
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo -e "${GREEN}Running fresh installation...${NC}"
        php artisan klioso:install --fresh --force
        ;;
    2)
        echo -e "${GREEN}Running incremental installation...${NC}"
        php artisan klioso:install
        ;;
    *)
        echo -e "${YELLOW}Invalid choice. Using fresh installation as default...${NC}"
        php artisan klioso:install --fresh --force
        ;;
esac

if [ $? -ne 0 ]; then
    echo -e "${RED}ERROR: Database setup failed!${NC}"
    echo
    echo "Common solutions:"
    echo "- Check your database connection in .env file"
    echo "- Ensure your database server is running"
    echo "- Verify database credentials"
    exit 1
fi

echo
echo -e "${YELLOW}[6/6]${NC} Building frontend assets..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}WARNING: Frontend build failed, but installation can continue${NC}"
    echo "You may need to run 'npm run dev' for development"
fi

echo
echo -e "${GREEN}"
echo "================================================================"
echo "                    🎉 Setup Complete! 🎉"
echo "================================================================"
echo -e "${NC}"
echo
echo -e "${GREEN}✅ Klioso has been successfully installed!${NC}"
echo
echo "Next steps:"
echo "1. Configure your .env file with:"
echo "   - Database connection details"
echo "   - WPScan API key (for security scanning)"
echo "   - Mail configuration (optional)"
echo
echo "2. Start the development server:"
echo "   php artisan serve"
echo
echo "3. Visit: http://localhost:8000"
echo
echo "📚 Documentation available in docs/ folder"
echo "🔧 For production setup, see docs/setup/COMPLETE_INSTALLATION_GUIDE.md"
echo

# Ask if user wants to start the development server
read -p "Start the development server now? (y/n): " start_server

if [[ $start_server =~ ^[Yy]$ ]]; then
    echo
    echo -e "${GREEN}Starting Klioso development server...${NC}"
    echo "Visit: http://localhost:8000"
    echo "Press Ctrl+C to stop the server"
    echo
    php artisan serve --host=0.0.0.0 --port=8000
else
    echo
    echo -e "${BLUE}To start the server later, run: php artisan serve${NC}"
fi