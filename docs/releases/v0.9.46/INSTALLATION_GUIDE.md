# Klioso v0.9.46 - Installation & Upgrade Guide

**Version**: 0.9.46  
**Release Date**: July 31, 2025  
**Codename**: Enhanced Scanning & Dark Mode

---

## 📋 **Pre-Installation Requirements**

### **System Requirements**
- **PHP**: 8.2+ (8.3 recommended for optimal performance)
- **Database**: MySQL 8.0+ or SQLite 3.35+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Node.js**: 18+ (for asset compilation)
- **Memory**: 512MB minimum, 1GB recommended
- **Storage**: 500MB available disk space

### **PHP Extensions Required**
```bash
# Verify required extensions
php -m | grep -E "(pdo|pdo_mysql|openssl|mbstring|tokenizer|xml|ctype|json|bcmath|fileinfo)"
```

Required extensions:
- `pdo` and `pdo_mysql` (for database)
- `openssl` (for encryption)
- `mbstring` (for string handling)
- `tokenizer` and `xml` (for Laravel)
- `ctype` and `json` (for data processing)
- `bcmath` (for calculations)
- `fileinfo` (for file uploads)

---

## 🚀 **Fresh Installation**

### **Option 1: Download Release Package**

1. **Download appropriate package**:
   - **Production**: `klioso-v0.9.46-production.zip`
   - **Windows/Laragon**: `klioso-v0.9.46-windows.zip`
   - **Shared Hosting**: `klioso-v0.9.46-shared-hosting.zip`

2. **Extract and setup**:
   ```bash
   # Extract package
   unzip klioso-v0.9.46-production.zip
   cd klioso-v0.9.46
   
   # Set permissions (Linux/macOS)
   chmod -R 755 .
   chmod -R 777 storage bootstrap/cache
   
   # Install dependencies
   composer install --no-dev --optimize-autoloader
   ```

3. **Environment configuration**:
   ```bash
   # Copy environment file
   cp .env.example .env
   
   # Generate application key
   php artisan key:generate
   
   # Configure database in .env file
   nano .env
   ```

4. **Database setup**:
   ```bash
   # Run migrations
   php artisan migrate
   
   # Seed database (optional)
   php artisan db:seed
   ```

5. **Optimize application**:
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

### **Option 2: Git Clone Installation**

```bash
# Clone repository
git clone https://github.com/nathanmaster/Klioso.git
cd Klioso

# Checkout specific version
git checkout v0.9.46

# Install PHP dependencies
composer install

# Install Node.js dependencies
npm install

# Build assets
npm run build

# Follow steps 3-5 from Option 1
```

---

## ⬆️ **Upgrading from Previous Versions**

### **Backup First (CRITICAL)**
```bash
# Backup database
php artisan backup:create

# Or manual backup
mysqldump -u username -p database_name > klioso_backup_$(date +%Y%m%d).sql

# Backup application files
tar -czf klioso_files_backup_$(date +%Y%m%d).tar.gz .
```

### **From v0.9.20 to v0.9.46**

This upgrade includes **26 substantial enhancements** and requires careful attention to new features:

1. **Pull latest changes**:
   ```bash
   # Backup current state
   git stash push -m "Pre-upgrade backup"
   
   # Fetch and checkout new version
   git fetch origin
   git checkout v0.9.46
   ```

2. **Update dependencies**:
   ```bash
   # Update PHP dependencies
   composer install --no-dev --optimize-autoloader
   
   # Update Node.js dependencies
   npm install
   
   # Rebuild assets with new dark mode styles
   npm run build
   ```

3. **Database migrations**:
   ```bash
   # Run new migrations for enhanced tracking
   php artisan migrate
   
   # Verify migration status
   php artisan migrate:status
   ```

4. **Clear caches**:
   ```bash
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

5. **Verify upgrade**:
   ```bash
   # Check application version
   php artisan --version
   
   # Test key functionality
   php artisan tinker
   >>> App\Models\User::count()
   >>> exit
   ```

### **From Older Versions (v0.8.x or earlier)**

For major version jumps, additional steps may be required:

1. **Review breaking changes** in CHANGELOG.md
2. **Update configuration files** if needed
3. **Test custom modifications** for compatibility
4. **Update any custom components** to use new dark mode classes

---

## 🔧 **Configuration Guide**

### **Environment Variables (.env)**

#### **Essential Configuration**
```env
# Application
APP_NAME="Klioso"
APP_ENV=production
APP_KEY=base64:YOUR_32_CHARACTER_KEY_HERE
APP_DEBUG=false
APP_URL=https://your-domain.com

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=klioso
DB_USERNAME=your_username
DB_PASSWORD=your_secure_password

# Cache & Sessions
CACHE_DRIVER=file
SESSION_DRIVER=file
SESSION_LIFETIME=120

# Mail Configuration
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@your-domain.com
MAIL_FROM_NAME="Klioso"
```

#### **New v0.9.46 Configuration Options**
```env
# Scanning System
SCAN_TIMEOUT=300
SCAN_MAX_CONCURRENT=3
SCAN_PROGRESS_UPDATE_INTERVAL=1000

# UI Preferences
DEFAULT_THEME=system
THEME_PERSISTENCE=true
DARK_MODE_ENABLED=true
```

### **Web Server Configuration**

#### **Apache (.htaccess)**
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

#### **Nginx**
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name your-domain.com;
    root /var/www/klioso/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.3-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 🧪 **Post-Installation Testing**

### **Functional Tests**
```bash
# Test basic functionality
curl -I http://your-domain.com

# Test database connection
php artisan tinker
>>> DB::connection()->getPdo()
>>> exit

# Test scheduled scans (new in v0.9.46)
php artisan schedule:list
php artisan queue:work --once
```

### **Feature Verification Checklist**
- [ ] **User Authentication**: Login/logout functionality
- [ ] **Dashboard Access**: Main dashboard loads correctly
- [ ] **Dark Mode Toggle**: Theme switching works properly
- [ ] **WordPress Scanner**: Scan functionality operational
- [ ] **Scheduled Scans**: New progress tracking system functional
- [ ] **Navigation**: Dropdown menus aligned and functional
- [ ] **Mobile Responsive**: Interface works on mobile devices
- [ ] **Database**: All migrations applied successfully

### **Performance Verification**
```bash
# Check page load times
curl -w "@curl-format.txt" -o /dev/null -s http://your-domain.com

# Monitor resource usage
htop
# or
top

# Check disk space
df -h

# Verify PHP memory limit
php -i | grep memory_limit
```

---

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. White Screen of Death**
```bash
# Enable debug mode temporarily
APP_DEBUG=true in .env

# Check logs
tail -f storage/logs/laravel.log

# Common causes:
# - Missing APP_KEY
# - Incorrect file permissions
# - Missing PHP extensions
```

#### **2. Database Connection Errors**
```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo()

# Check database credentials in .env
# Verify database exists and user has permissions
```

#### **3. Asset Loading Issues**
```bash
# Rebuild assets
npm run build

# Clear browser cache
# Check public/build directory exists
# Verify web server serves static files
```

#### **4. Permission Errors**
```bash
# Fix storage permissions
chmod -R 775 storage
chmod -R 775 bootstrap/cache

# On some systems:
sudo chown -R www-data:www-data storage bootstrap/cache
```

#### **5. Dark Mode Not Working**
```bash
# Verify assets are built with dark mode support
npm run build

# Clear application cache
php artisan optimize:clear

# Check browser dev tools for CSS loading
```

### **Getting Help**

If you encounter issues not covered here:

1. **Check Logs**: Always start with `storage/logs/laravel.log`
2. **Search Issues**: [GitHub Issues](https://github.com/nathanmaster/Klioso/issues)
3. **Community Help**: [GitHub Discussions](https://github.com/nathanmaster/Klioso/discussions)
4. **Documentation**: [Project Wiki](https://github.com/nathanmaster/Klioso/wiki)

---

## 📊 **Performance Optimization**

### **Production Optimizations**
```bash
# Optimize autoloader
composer install --optimize-autoloader --no-dev

# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Enable OPcache in php.ini
opcache.enable=1
opcache.memory_consumption=256
opcache.max_accelerated_files=20000
```

### **Database Optimizations**
```sql
-- Optimize tables
OPTIMIZE TABLE scheduled_scans, scan_histories, websites;

-- Add indexes for better performance
CREATE INDEX idx_scheduled_scans_status ON scheduled_scans(status);
CREATE INDEX idx_scan_histories_created_at ON scan_histories(created_at);
```

---

**Installation Complete!** 🎉

Your Klioso v0.9.46 installation is now ready with enhanced scanning capabilities, comprehensive dark mode support, and improved navigation. Enjoy the 26 substantial improvements in this release!
