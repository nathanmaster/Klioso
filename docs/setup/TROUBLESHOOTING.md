# Troubleshooting Guide

This guide helps resolve common issues when setting up and running Klioso.

## 🔧 Installation Issues

### PHP Extension Missing

**Error**: `ext-curl is missing from your system`

**Solution**:
```bash
# Ubuntu/Debian
sudo apt install php8.2-curl php8.2-xml php8.2-mbstring php8.2-zip

# Windows (XAMPP/Laragon)
# Enable extensions in php.ini:
extension=curl
extension=mbstring
extension=xml
extension=zip

# macOS (Homebrew)
brew install php@8.2 --with-curl
```

### Composer Install Fails

**Error**: `Your requirements could not be resolved to an installable set of packages`

**Solution**:
```bash
# Update Composer
composer self-update

# Clear cache
composer clear-cache

# Install with specific PHP version
composer install --ignore-platform-reqs

# Force update
composer update --with-dependencies
```

### Node.js Version Issues

**Error**: `Node Sass does not yet support your current environment`

**Solution**:
```bash
# Check Node version
node --version

# Install correct Node version (use Node 18+)
nvm install 18
nvm use 18

# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 🗄️ Database Issues

### Connection Refused

**Error**: `SQLSTATE[HY000] [2002] Connection refused`

**Solution**:
1. **Check MySQL Status**:
   ```bash
   # Linux
   sudo systemctl status mysql
   sudo systemctl start mysql
   
   # macOS
   brew services list | grep mysql
   brew services start mysql@8.0
   
   # Windows (via services.msc or Laragon)
   ```

2. **Verify Connection Details**:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=klioso
   DB_USERNAME=root
   DB_PASSWORD=your_password
   ```

3. **Test Connection**:
   ```bash
   mysql -u root -p
   SHOW DATABASES;
   ```

### Database Does Not Exist

**Error**: `SQLSTATE[42000]: Unknown database 'klioso'`

**Solution**:
```sql
# Connect to MySQL
mysql -u root -p

# Create database
CREATE DATABASE klioso CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Verify creation
SHOW DATABASES;
```

### Migration Fails

**Error**: `Syntax error or access violation`

**Solution**:
```bash
# Check database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Run migrations step by step
php artisan migrate:status
php artisan migrate --step

# Reset and retry
php artisan migrate:fresh
```

## 🌐 Server Issues

### Laravel Serve Fails

**Error**: `Failed to listen on 127.0.0.1:8000`

**Solution**:
```bash
# Check if port is in use
netstat -tulpn | grep :8000

# Use different port
php artisan serve --port=8080

# Kill process using port
sudo kill -9 $(lsof -t -i:8000)
```

### Permission Denied

**Error**: `Permission denied` on storage or cache directories

**Solution**:
```bash
# Linux/macOS - Fix permissions
sudo chown -R $USER:$USER storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Windows - Run as Administrator or check folder permissions
```

### 500 Internal Server Error

**Common Causes & Solutions**:

1. **Check Laravel Logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Clear Caches**:
   ```bash
   php artisan config:clear
   php artisan cache:clear
   php artisan view:clear
   php artisan route:clear
   ```

3. **Check .env File**:
   ```bash
   # Ensure APP_KEY is set
   php artisan key:generate
   
   # Verify all required variables are set
   APP_NAME=Klioso
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost:8000
   ```

## 🔍 Scanner Issues

### WPScan API Not Working

**Error**: `WPScan API token invalid or not configured`

**Solution**:
1. **Get API Token**:
   - Register at [https://wpscan.com/register](https://wpscan.com/register)
   - Get your API token from profile

2. **Configure in .env**:
   ```env
   WPSCAN_API_TOKEN=your_actual_token_here
   ```

3. **Test API Connection**:
   ```bash
   php artisan tinker
   >>> app(\App\Services\WordPressScanService::class)->testWpScanApi();
   ```

### Scanning Timeouts

**Error**: `cURL error 28: Operation timed out`

**Solution**:
1. **Increase Timeout in .env**:
   ```env
   SCANNER_TIMEOUT=120
   SCANNER_MAX_REDIRECTS=5
   ```

2. **Check Network Connectivity**:
   ```bash
   curl -I https://target-website.com
   ```

3. **Use Queue for Large Scans**:
   ```bash
   # Start queue worker
   php artisan queue:work
   ```

### Plugin Detection Fails

**Issue**: Scanner doesn't detect installed plugins

**Solution**:
1. **Check Website Accessibility**:
   - Ensure website allows external requests
   - Check for security plugins blocking requests

2. **Update Detection Patterns**:
   ```php
   // In WordPressScanService, add new detection methods
   protected function detectPluginByPath($url, $slug)
   {
       // Custom detection logic
   }
   ```

## 🎨 Frontend Issues

### Vite Build Fails

**Error**: `Build failed with errors`

**Solution**:
```bash
# Check Node version (needs 16+)
node --version

# Clear cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Build with verbose output
npm run build -- --debug
```

### React Component Not Loading

**Common Issues**:

1. **Import Path Errors**:
   ```jsx
   // Incorrect
   import Component from '../Component';
   
   // Correct (with @/ alias)
   import Component from '@/Components/Component';
   ```

2. **Missing Prop Types**:
   ```jsx
   // Add default props
   export default function Component({ data = [], auth }) {
       // Component logic
   }
   ```

3. **Inertia Route Issues**:
   ```jsx
   // Use safeRoute helper
   import { safeRoute } from '@/Utils/safeRoute';
   
   href={safeRoute('route.name', params)}
   ```

### CSS Not Loading

**Issue**: Styles not applying correctly

**Solution**:
1. **Check Build Process**:
   ```bash
   npm run dev
   # In another terminal
   php artisan serve
   ```

2. **Clear Browser Cache**:
   - Hard refresh (Ctrl+F5)
   - Clear browser cache
   - Check developer tools console

3. **Verify Asset Links**:
   ```php
   // In Blade template
   @vite(['resources/css/app.css', 'resources/js/app.js'])
   ```

## 📧 Email Issues

### Email Not Sending

**Error**: `Swift_TransportException: Connection could not be established`

**Solution**:
1. **Test Email Configuration**:
   ```bash
   php artisan tinker
   >>> Mail::raw('Test email', function($msg) { $msg->to('test@example.com'); });
   ```

2. **Common SMTP Settings**:
   ```env
   # Gmail
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your-email@gmail.com
   MAIL_PASSWORD=your-app-password
   MAIL_ENCRYPTION=tls
   
   # Mailgun
   MAIL_MAILER=mailgun
   MAILGUN_DOMAIN=your-domain.com
   MAILGUN_SECRET=your-mailgun-secret
   ```

3. **Check Firewall/Port Access**:
   ```bash
   telnet smtp.gmail.com 587
   ```

## 🔄 Update Issues

### Git Pull Conflicts

**Error**: `Your local changes would be overwritten by merge`

**Solution**:
```bash
# Stash local changes
git stash

# Pull latest changes
git pull origin main

# Apply stashed changes
git stash pop

# Resolve conflicts if any
git mergetool
```

### Composer Update Fails

**Error**: `Package conflicts or dependency issues`

**Solution**:
```bash
# Check what's outdated
composer outdated

# Update specific packages
composer update vendor/package

# Force update with conflicts
composer update --with-dependencies --ignore-platform-reqs
```

### Migration Issues After Update

**Error**: `Migration file not found or already exists`

**Solution**:
```bash
# Check migration status
php artisan migrate:status

# Rollback problematic migration
php artisan migrate:rollback --step=1

# Fresh migrate (WARNING: loses data)
php artisan migrate:fresh --seed
```

## 🚀 Performance Issues

### Slow Database Queries

**Issue**: Application loading slowly

**Solution**:
1. **Enable Query Logging**:
   ```env
   DB_LOG_QUERIES=true
   LOG_LEVEL=debug
   ```

2. **Check Slow Queries**:
   ```bash
   tail -f storage/logs/laravel.log | grep "select"
   ```

3. **Add Database Indexes**:
   ```php
   Schema::table('websites', function (Blueprint $table) {
       $table->index(['client_id']);
       $table->index(['status']);
   });
   ```

### High Memory Usage

**Issue**: PHP memory exhausted

**Solution**:
1. **Increase Memory Limit**:
   ```ini
   ; In php.ini
   memory_limit = 512M
   ```

2. **Optimize Eloquent Queries**:
   ```php
   // Instead of loading all data
   $websites = Website::all();
   
   // Use pagination
   $websites = Website::paginate(50);
   
   // Use chunking for large datasets
   Website::chunk(100, function ($websites) {
       // Process in batches
   });
   ```

## 🛠️ Development Issues

### Code Format Issues

**Error**: Laravel Pint formatting errors

**Solution**:
```bash
# Fix formatting automatically
./vendor/bin/pint

# Check specific files
./vendor/bin/pint app/Http/Controllers/
```

### Test Failures

**Error**: Tests failing after changes

**Solution**:
```bash
# Run specific test
php artisan test --filter=WebsiteTest

# Reset test database
php artisan migrate:fresh --env=testing

# Clear test cache
php artisan config:clear --env=testing
```

## 🔍 Debugging Tools

### Laravel Telescope

Install for advanced debugging:
```bash
composer require laravel/telescope --dev
php artisan telescope:install
php artisan migrate
```

### Debug Bar

For development debugging:
```bash
composer require barryvdh/laravel-debugbar --dev
```

### Logging

Add custom logging:
```php
// In your code
Log::info('Debug information', ['data' => $someVariable]);
Log::error('Error occurred', ['error' => $exception->getMessage()]);

// View logs
tail -f storage/logs/laravel.log
```

## 📞 Getting Help

### Before Asking for Help

1. **Check the logs**:
   ```bash
   tail -f storage/logs/laravel.log
   ```

2. **Search existing issues**:
   - Check [GitHub Issues](https://github.com/nathanmaster/Klioso/issues)
   - Search closed issues for solutions

3. **Provide details**:
   - Error messages (full stack trace)
   - Environment details (OS, PHP version, etc.)
   - Steps to reproduce the issue

### Resources

- **Documentation**: `/docs` folder in repository
- **Laravel Docs**: [https://laravel.com/docs](https://laravel.com/docs)
- **GitHub Issues**: [https://github.com/nathanmaster/Klioso/issues](https://github.com/nathanmaster/Klioso/issues)
- **Discord/Slack**: Check repository for community links

### Creating Bug Reports

Include this information:
```
**Bug Description**
Clear description of what's wrong

**Environment**
- OS: Windows 11 / macOS 12.6 / Ubuntu 20.04
- PHP: 8.2.1
- Laravel: 10.x
- Node: 18.x
- MySQL: 8.0

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error...

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Error Logs**
```
Paste error logs here
```

**Additional Context**
Any other relevant information
```

---

**Still having issues?** Create a [GitHub Issue](https://github.com/nathanmaster/Klioso/issues/new) with the above information.