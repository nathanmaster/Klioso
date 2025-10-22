# Complete Installation & Setup Guide

This comprehensive guide will walk you through setting up Klioso from scratch on Windows, macOS, and Linux systems.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Prerequisites Installation](#prerequisites-installation)
- [Environment Setup](#environment-setup)
- [Database Configuration](#database-configuration)
- [External Services Setup](#external-services-setup)
- [Application Installation](#application-installation)
- [Development Tools](#development-tools)
- [Troubleshooting](#troubleshooting)
- [First-Time User Guide](#first-time-user-guide)

## 🖥️ System Requirements

### Minimum Requirements
- **OS**: Windows 10+, macOS 10.15+, Ubuntu 18.04+
- **RAM**: 4GB (8GB recommended)
- **Storage**: 2GB free space
- **Internet**: Broadband connection for external API calls

### Recommended Development Environment
- **OS**: Windows 11, macOS 12+, Ubuntu 20.04+
- **RAM**: 16GB
- **Storage**: SSD with 10GB free space
- **Internet**: High-speed connection for rapid development

## 🔧 Prerequisites Installation

### 1. PHP 8.2+ Installation

#### Windows (Using XAMPP or Laragon)
**Option A: Laragon (Recommended)**
1. Download Laragon Full from [https://laragon.org/download/](https://laragon.org/download/)
2. Install with default settings
3. Start Laragon and verify PHP version:
   ```bash
   php --version
   ```

**Option B: XAMPP**
1. Download XAMPP from [https://www.apachefriends.org/](https://www.apachefriends.org/)
2. Ensure PHP 8.2+ is selected during installation
3. Add PHP to system PATH: `C:\xampp\php`

#### macOS
**Using Homebrew:**
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PHP 8.2
brew install php@8.2
brew link php@8.2 --force

# Verify installation
php --version
```

#### Linux (Ubuntu/Debian)
```bash
# Update package lists
sudo apt update

# Install PHP 8.2 and required extensions
sudo apt install software-properties-common
sudo add-apt-repository ppa:ondrej/php
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-curl php8.2-mbstring php8.2-xml php8.2-zip php8.2-mysql php8.2-sqlite3 php8.2-gd

# Verify installation
php --version
```

### 2. Composer Installation

#### Windows
1. Download from [https://getcomposer.org/download/](https://getcomposer.org/download/)
2. Run the installer (composer-setup.exe)
3. Verify installation:
   ```bash
   composer --version
   ```

#### macOS/Linux
```bash
# Download and install globally
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Make executable (Linux only)
sudo chmod +x /usr/local/bin/composer

# Verify installation
composer --version
```

### 3. Node.js & NPM Installation

#### Windows
1. Download LTS version from [https://nodejs.org/](https://nodejs.org/)
2. Run installer with default settings
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### macOS
```bash
# Using Homebrew
brew install node@18

# Verify installation
node --version
npm --version
```

#### Linux
```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

### 4. MySQL 8+ Installation

#### Windows (via Laragon)
- MySQL is included with Laragon Full
- Start MySQL via Laragon control panel

#### Windows (Standalone)
1. Download MySQL Community Server from [https://dev.mysql.com/downloads/mysql/](https://dev.mysql.com/downloads/mysql/)
2. Run MySQL Installer
3. Choose "Developer Default" setup type
4. Set root password during installation

#### macOS
```bash
# Using Homebrew
brew install mysql@8.0
brew services start mysql@8.0

# Secure installation
mysql_secure_installation
```

#### Linux
```bash
# Update package lists
sudo apt update

# Install MySQL Server
sudo apt install mysql-server-8.0

# Secure installation
sudo mysql_secure_installation

# Start MySQL service
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 5. Git Installation

#### Windows
1. Download Git for Windows from [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. Install with recommended settings
3. Configure Git:
   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

#### macOS
```bash
# Git is usually pre-installed, or install via Homebrew
brew install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

#### Linux
```bash
# Install Git
sudo apt install git

# Configure Git
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 🔐 External Services Setup

### WPScan API Key (Required for Security Scanning)

1. **Create WPScan Account**
   - Visit [https://wpscan.com/register](https://wpscan.com/register)
   - Sign up for a free account (25 API requests/day) or paid plan

2. **Generate API Key**
   - Log into your WPScan account
   - Navigate to "Profile" → "API Token"
   - Copy your API token

3. **Configure in Klioso**
   - Add to your `.env` file:
     ```env
     WPSCAN_API_TOKEN=your_wpscan_api_token_here
     ```

### Email Configuration (Optional)

#### Using Gmail SMTP
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-gmail@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your-gmail@gmail.com
MAIL_FROM_NAME="${APP_NAME}"
```

#### Using Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=your-mailgun-domain.com
MAILGUN_SECRET=your-mailgun-secret
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="${APP_NAME}"
```

## 🚀 Application Installation

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/nathanmaster/Klioso.git
cd Klioso

# Or if you forked it
git clone https://github.com/your-username/Klioso.git
cd Klioso
```

### 2. Install Dependencies

```bash
# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 3. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate application key
php artisan key:generate
```

### 4. Database Setup

#### Create Database
```sql
-- Connect to MySQL and create database
CREATE DATABASE klioso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Configure .env File
```env
APP_NAME=Klioso
APP_ENV=local
APP_KEY=base64:generated_key_here
APP_DEBUG=true
APP_URL=http://localhost:8000

LOG_CHANNEL=stack
LOG_DEPRECATIONS_CHANNEL=null
LOG_LEVEL=debug

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=klioso
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

BROADCAST_DRIVER=log
CACHE_DRIVER=file
FILESYSTEM_DISK=local
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
SESSION_LIFETIME=120

# WPScan API Configuration
WPSCAN_API_TOKEN=your_wpscan_api_token

# Email Configuration (optional)
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### 5. Database Migration & Seeding

```bash
# Run database migrations
php artisan migrate

# Seed database with sample data (optional)
php artisan db:seed

# Or run migrations with seeding in one command
php artisan migrate:fresh --seed
```

### 6. Storage & Permissions

```bash
# Create storage link for file uploads
php artisan storage:link

# Set proper permissions (Linux/macOS only)
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 7. Build Frontend Assets

```bash
# Development build
npm run dev

# Production build
npm run build

# Development with file watching (for active development)
npm run watch
```

## 🔧 Development Tools Setup

### VS Code Extensions (Recommended)

Install these extensions for optimal development experience:

1. **PHP Intelephense** - PHP language support
2. **Laravel Extension Pack** - Laravel-specific tools
3. **ES7+ React/Redux/React-Native snippets** - React development
4. **Tailwind CSS IntelliSense** - Tailwind CSS support
5. **GitLens** - Enhanced Git capabilities
6. **Thunder Client** - API testing (alternative to Postman)

### Laravel Development Tools

```bash
# Install Laravel debugbar for development
composer require barryvdh/laravel-debugbar --dev

# Install IDE helper for better autocomplete
composer require --dev barryvdh/laravel-ide-helper
php artisan ide-helper:generate
php artisan ide-helper:models
php artisan ide-helper:meta
```

### Quality Assurance Tools

```bash
# Install PHP code formatting (Laravel Pint)
composer require laravel/pint --dev

# Install static analysis (PHPStan)
composer require --dev phpstan/phpstan

# Format code
./vendor/bin/pint

# Run static analysis
./vendor/bin/phpstan analyse
```

## 🏃‍♂️ Running the Application

### Development Server

```bash
# Start PHP development server
php artisan serve

# In another terminal, start frontend build process
npm run dev

# Access application at http://localhost:8000
```

### Using Laragon (Windows)

1. Start Laragon
2. Click "Start All"
3. Place project in `C:\laragon\www\`
4. Access via `http://klioso.test` (auto-configured virtual host)

### Production Deployment

```bash
# Install production dependencies only
composer install --optimize-autoloader --no-dev

# Build production assets
npm run build

# Optimize Laravel for production
php artisan config:cache
php artisan event:cache
php artisan route:cache
php artisan view:cache
```

## 🧪 Testing the Installation

### 1. Register First User

1. Visit `http://localhost:8000/register`
2. Create an admin account
3. Verify email functionality (if configured)

### 2. Test Core Features

1. **Dashboard**: Check if statistics load correctly
2. **Client Management**: Add a test client
3. **Website Management**: Add a test website
4. **Scanner**: Test URL scanning functionality
5. **Groups**: Create and manage website groups

### 3. Test Scanner Functionality

```bash
# Test WPScan API connection
php artisan tinker
>>> App\Services\WordPressScanService::testConnection()
```

## ❗ Troubleshooting

### Common Issues

#### 1. Permission Errors (Linux/macOS)
```bash
sudo chown -R $USER:$USER storage bootstrap/cache
chmod -R 775 storage bootstrap/cache
```

#### 2. MySQL Connection Failed
- Verify MySQL is running: `sudo systemctl status mysql`
- Check credentials in `.env` file
- Ensure database exists: `mysql -u root -p` → `SHOW DATABASES;`

#### 3. NPM Install Fails
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Composer Install Fails
```bash
# Update Composer
composer self-update

# Clear Composer cache
composer clear-cache

# Install with verbose output
composer install -v
```

#### 5. PHP Extensions Missing
```bash
# Ubuntu/Debian - install missing extensions
sudo apt install php8.2-{extension-name}

# Verify loaded extensions
php -m | grep {extension-name}
```

### Performance Issues

#### 1. Slow Database Queries
```bash
# Add database indexes
php artisan migrate

# Enable query logging in .env
DB_LOG_QUERIES=true
```

#### 2. Frontend Build Slow
```bash
# Use faster build tool
npm install --save-dev @vitejs/plugin-react

# Increase Node.js memory limit
export NODE_OPTIONS="--max_old_space_size=4096"
npm run build
```

## 🎯 First-Time User Guide

### Initial Configuration Steps

1. **Set WPScan API Key**
   - Navigate to Settings → API Configuration
   - Enter your WPScan API token

2. **Configure Email Settings**
   - Go to Settings → Email Configuration
   - Test email functionality

3. **Add Your First Client**
   - Navigate to Clients → Add Client
   - Fill in company details

4. **Add Your First Website**
   - Navigate to Websites → Add Website
   - Link to the client you created
   - Test URL scanning

5. **Explore Scanner Features**
   - Try scanning a WordPress website
   - Review security vulnerability reports
   - Check plugin detection accuracy

### Recommended Workflow

1. **Client Onboarding**: Add client details first
2. **Website Registration**: Add all client websites
3. **Initial Scanning**: Run comprehensive scans on all sites
4. **Group Organization**: Organize websites into logical groups
5. **Regular Monitoring**: Set up scheduled scans and monitoring

## 📚 Additional Resources

- **Laravel Documentation**: [https://laravel.com/docs](https://laravel.com/docs)
- **React Documentation**: [https://reactjs.org/docs](https://reactjs.org/docs)
- **Inertia.js Guide**: [https://inertiajs.com](https://inertiajs.com)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **WPScan Documentation**: [https://github.com/wpscanteam/wpscan](https://github.com/wpscanteam/wpscan)

## 🔗 Helpful Links & Resources

### Required Program Downloads
- **PHP**: [https://www.php.net/downloads.php](https://www.php.net/downloads.php)
- **Composer**: [https://getcomposer.org/download/](https://getcomposer.org/download/)
- **Node.js**: [https://nodejs.org/en/download/](https://nodejs.org/en/download/)
- **MySQL**: [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/)
- **Git**: [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **VS Code**: [https://code.visualstudio.com/download](https://code.visualstudio.com/download)

### Development Tools
- **Laragon** (Windows): [https://laragon.org/](https://laragon.org/)
- **XAMPP** (Cross-platform): [https://www.apachefriends.org/](https://www.apachefriends.org/)
- **TablePlus** (Database GUI): [https://tableplus.com/](https://tableplus.com/)
- **Postman** (API Testing): [https://www.postman.com/downloads/](https://www.postman.com/downloads/)

### External Services
- **WPScan**: [https://wpscan.com/](https://wpscan.com/) - WordPress security scanning
- **Mailgun**: [https://www.mailgun.com/](https://www.mailgun.com/) - Email delivery service
- **GitHub**: [https://github.com/](https://github.com/) - Code repository hosting

---

**Need help?** Check our [Troubleshooting Guide](../TROUBLESHOOTING.md) or create an issue on [GitHub](https://github.com/nathanmaster/Klioso/issues).