# Klioso v0.8.0-beta.1 - Binary Package Testing Guide

This guide walks through testing each binary package on different platforms before the official release.

## 📦 Available Packages

After running `./scripts/prepare-release.sh 0.8.0-beta.1`, you'll have these packages:

1. **klioso-v0.8.0-beta.1-production.tar.gz** - General Linux production
2. **klioso-v0.8.0-beta.1-docker.tar.gz** - Docker container package  
3. **klioso-v0.8.0-beta.1-windows.zip** - Windows/Laragon package
4. **klioso-v0.8.0-beta.1-shared-hosting.zip** - Shared hosting package

## 🧪 Testing Matrix

### Platform Requirements
- **PHP**: 8.2+ (8.3 recommended)
- **Database**: MySQL 8+ or SQLite 3+
- **Web Server**: Apache 2.4+ or Nginx 1.18+
- **Node.js**: 18+ (for asset compilation if needed)

## 1. 🐧 Linux Production Package Testing

### Test Environment Setup
```bash
# Create test directory
mkdir klioso-test-linux
cd klioso-test-linux

# Extract package
tar -xzf ../releases/klioso-v0.8.0-beta.1-production.tar.gz
cd klioso/

# Set permissions
chmod -R 755 .
chmod -R 777 storage bootstrap/cache
```

### Database Setup
```bash
# MySQL setup
mysql -u root -p -e "CREATE DATABASE klioso_test;"
mysql -u root -p -e "CREATE USER 'klioso'@'localhost' IDENTIFIED BY 'secure_password';"
mysql -u root -p -e "GRANT ALL PRIVILEGES ON klioso_test.* TO 'klioso'@'localhost';"

# Or SQLite setup (simpler for testing)
touch database/database.sqlite
chmod 666 database/database.sqlite
```

### Configuration
```bash
# Copy and configure environment
cp .env.example .env

# Edit .env file:
# APP_NAME=Klioso
# APP_ENV=production
# APP_DEBUG=false
# APP_URL=http://your-test-domain.com
# 
# DB_CONNECTION=mysql  # or sqlite
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=klioso_test
# DB_USERNAME=klioso
# DB_PASSWORD=secure_password

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --force

# Optional: Seed with test data
php artisan db:seed --force
```

### Web Server Configuration

#### Apache (.htaccess method)
```bash
# Ensure public/.htaccess exists with:
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ index.php/$1 [QSA,L]
</IfModule>

# Start Apache and point document root to /path/to/klioso/public
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-test-domain.com;
    root /path/to/klioso/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Testing Checklist
- [ ] Application loads without errors
- [ ] Login/registration works
- [ ] Can create clients, websites, providers
- [ ] WordPress scanner functions
- [ ] Multi-service provider selection works
- [ ] Responsive design on mobile/desktop
- [ ] Database relationships work correctly
- [ ] File permissions are secure

## 2. 🐳 Docker Package Testing

### Docker Setup
```bash
# Extract Docker package
tar -xzf releases/klioso-v0.8.0-beta.1-docker.tar.gz
cd klioso-docker/

# Build image
docker build -t klioso:0.8.0-beta.1 .

# Run with Docker Compose
docker-compose up -d

# Check logs
docker-compose logs app
docker-compose logs db
```

### Testing Checklist
- [ ] Containers start without errors
- [ ] Database initializes correctly
- [ ] Application accessible on mapped port
- [ ] Persistent storage works (database, uploads)
- [ ] Environment variables respected
- [ ] Health checks pass
- [ ] Can restart containers without data loss

## 3. 🪟 Windows/Laragon Package Testing

### Laragon Setup
```powershell
# Extract to Laragon www directory
Expand-Archive -Path "klioso-v0.8.0-beta.1-windows.zip" -DestinationPath "C:\laragon\www\"
cd C:\laragon\www\klioso

# Copy environment file
Copy-Item .env.example .env

# Edit .env for Windows:
# APP_URL=http://klioso.test
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=klioso
# DB_USERNAME=root
# DB_PASSWORD=
```

### Database Setup in Laragon
```sql
-- Open HeidiSQL or phpMyAdmin
CREATE DATABASE klioso;
-- Import structure if provided, or run migrations
```

### PHP Setup
```powershell
# In Laragon terminal
php artisan key:generate
php artisan migrate
php artisan db:seed
```

### Testing Checklist
- [ ] Site loads at http://klioso.test
- [ ] SSL works if configured
- [ ] File uploads work
- [ ] Scheduled tasks can be configured
- [ ] PHP extensions available
- [ ] Error logging works

## 4. 🌐 Shared Hosting Package Testing

### Typical Shared Host Setup (cPanel example)
```bash
# Upload via File Manager or FTP
unzip klioso-v0.8.0-beta.1-shared-hosting.zip

# Move files to public_html
mv klioso/* public_html/
mv klioso/.* public_html/ 2>/dev/null || true

# Set permissions
chmod -R 755 public_html/
chmod -R 777 public_html/storage public_html/bootstrap/cache
```

### Database Setup (cPanel MySQL)
```sql
-- Create database via cPanel
-- Create user and assign to database
-- Note credentials for .env setup
```

### Configuration
```bash
# Edit .env file via File Manager:
# DB_CONNECTION=mysql
# DB_HOST=localhost
# DB_DATABASE=yourusername_klioso
# DB_USERNAME=yourusername_klioso
# DB_PASSWORD=your_db_password

# Run setup commands if SSH available
php artisan key:generate
php artisan migrate --force
```

### Testing Checklist
- [ ] Site loads via shared hosting domain
- [ ] .htaccess rules work correctly
- [ ] File permissions allow operation
- [ ] Database connects successfully
- [ ] File uploads work within hosting limits
- [ ] Email configuration works
- [ ] HTTPS redirects if SSL enabled

## 5. 📱 Cross-Platform Frontend Testing

### Desktop Browsers
- [ ] **Chrome** (latest): Full functionality
- [ ] **Firefox** (latest): All features work
- [ ] **Safari** (latest): Mac compatibility
- [ ] **Edge** (latest): Windows compatibility

### Mobile Testing
- [ ] **Mobile Chrome**: Responsive design
- [ ] **Mobile Safari**: iOS compatibility
- [ ] **Samsung Internet**: Android compatibility
- [ ] **Touch interactions**: Tap, swipe, scroll

### Responsive Design Testing
```bash
# Test these viewport sizes:
- [ ] Mobile: 375×667 (iPhone SE)
- [ ] Tablet: 768×1024 (iPad)
- [ ] Desktop: 1920×1080 (Full HD)
- [ ] Large: 2560×1440 (2K)
```

## 6. 🔍 Performance Testing

### Load Testing
```bash
# Install Apache Bench (ab) or use online tools
ab -n 100 -c 10 http://your-test-site.com/

# Test key pages:
- [ ] Homepage load time < 2s
- [ ] Login/dashboard < 1s
- [ ] Website listing page < 3s
- [ ] WordPress scanner < 10s per site
```

### Resource Usage
```bash
# Monitor during testing:
- [ ] Memory usage stays under 512MB per process
- [ ] Database queries optimized (< 50 per page)
- [ ] Asset sizes reasonable (< 5MB total)
- [ ] No memory leaks during extended use
```

## 7. 🔒 Security Testing

### Basic Security Checks
- [ ] Debug mode disabled in production
- [ ] Sensitive files not accessible
- [ ] CSRF protection working
- [ ] SQL injection protection
- [ ] XSS protection active
- [ ] File upload restrictions

### Authentication Testing
- [ ] Password requirements enforced
- [ ] Session management secure
- [ ] Remember me functionality
- [ ] Logout works properly
- [ ] Password reset functional

## 8. 📊 Feature Testing

### Core Functionality
- [ ] **Client Management**: CRUD operations work
- [ ] **Website Management**: All provider types selectable
- [ ] **Provider Management**: Service checkboxes functional
- [ ] **WordPress Scanner**: Detects plugins/themes correctly
- [ ] **Search/Filter**: Works across all data types
- [ ] **Pagination**: Navigation and page sizing
- [ ] **Sorting**: Click-to-sort on tables

### Multi-Service Provider System
- [ ] Can create provider with multiple services
- [ ] Websites can use different providers per service
- [ ] Service badges display correctly
- [ ] Provider filtering works in dropdowns
- [ ] Optional relationships save properly

## 9. 📝 Documentation Testing

### Installation Guides
- [ ] README.md instructions accurate
- [ ] Environment setup clear
- [ ] Troubleshooting section helpful
- [ ] API documentation current

### User Guide Testing
- [ ] Feature documentation matches actual behavior
- [ ] Screenshots current and accurate
- [ ] Examples work as described
- [ ] Migration guides accurate

## 10. ⚡ Quick Test Script

Create this test script for rapid verification:

```bash
#!/bin/bash
# quick-test.sh - Rapid functionality test

echo "🚀 Klioso Quick Test"

# Test database connection
php artisan tinker --execute="DB::connection()->getPdo(); echo 'DB: ✅';"

# Test model creation
php artisan tinker --execute="
use App\Models\HostingProvider;
\$p = HostingProvider::create(['name' => 'Test'.time(), 'provides_hosting' => true]);
echo 'Provider: ✅ ID:' . \$p->id;
\$p->delete();
"

# Test WordPress scanner
php artisan tinker --execute="
\$service = new App\Services\WordPressScanService();
\$result = \$service->scanUrl('https://demo.wp-api.org');
echo 'Scanner: ' . (empty(\$result) ? '❌' : '✅');
"

# Test routes
echo "Testing key routes..."
curl -s -o /dev/null -w "Login: %{http_code}\n" http://localhost/login
curl -s -o /dev/null -w "Dashboard: %{http_code}\n" http://localhost/dashboard

echo "✅ Quick test complete!"
```

## 📋 Test Results Template

Document results for each platform:

```markdown
## Test Results - [Package Name] on [Platform]

**Tester**: [Your Name]  
**Date**: [Test Date]  
**Environment**: [OS, PHP version, Web server]

### ✅ Passed Tests
- [ ] Installation completed without errors
- [ ] Core functionality works
- [ ] Responsive design functional
- [ ] Performance acceptable

### ❌ Failed Tests
- [ ] Issue description
- [ ] Steps to reproduce
- [ ] Expected vs actual behavior

### 🔧 Issues Found
1. **Issue Title**: Description
   - **Severity**: High/Medium/Low
   - **Impact**: User experience/functionality/cosmetic
   - **Workaround**: If available

### 📊 Performance Metrics
- **Load Time**: Homepage in Xs
- **Memory Usage**: XXX MB peak
- **Database Queries**: XX per page average

### 📝 Notes
Additional observations, compatibility notes, suggestions for improvement.
```

## 🎯 Sign-off Criteria

Each package must pass:
- [ ] ✅ Clean installation without errors
- [ ] ✅ All core features functional
- [ ] ✅ Responsive design works on mobile/desktop
- [ ] ✅ Performance within acceptable limits
- [ ] ✅ Security checks pass
- [ ] ✅ No critical bugs found

Once all packages pass testing, they're ready for the GitHub release! 🚀
