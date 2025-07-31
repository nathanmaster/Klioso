# Klioso v0.9.46 - Developer Migration Guide

**Target Audience**: Developers, System Administrators, DevOps Engineers  
**Version**: 0.9.46  
**Migration Complexity**: Medium  
**Estimated Time**: 30-60 minutes

---

## 🎯 **Migration Overview**

This guide covers migrating from any previous Klioso version to v0.9.46, with special attention to the **26 substantial enhancements** that may affect custom implementations or integrations.

### **What's Changed**
- **Database Schema**: New fields for enhanced scan tracking
- **Frontend Components**: Updated props and styling for dark mode
- **API Endpoints**: New routes for progress tracking
- **Configuration**: New environment variables for scan settings

---

## 📋 **Pre-Migration Checklist**

### **1. Environment Assessment**
```bash
# Check current version
php artisan --version
cat version.json

# Check database status
php artisan migrate:status

# Check custom modifications
git status
git diff HEAD~10 --name-only
```

### **2. Backup Strategy**
```bash
# Database backup
mysqldump -u $DB_USERNAME -p$DB_PASSWORD $DB_DATABASE > backup_$(date +%Y%m%d_%H%M%S).sql

# Application backup
tar -czf klioso_backup_$(date +%Y%m%d_%H%M%S).tar.gz . --exclude=node_modules --exclude=vendor

# Git backup (if using version control)
git branch backup_before_v0.9.46
git checkout -b migration_v0.9.46
```

### **3. Dependencies Check**
```bash
# Check PHP version
php -v

# Check Node.js version
node -v
npm -v

# Check disk space
df -h

# Check memory
free -h
```

---

## 🗄️ **Database Migration Details**

### **New Tables & Fields**

#### **Scheduled Scans Enhancements**
```sql
-- New fields added to scheduled_scans table
ALTER TABLE scheduled_scans ADD COLUMN status VARCHAR(20) DEFAULT 'pending';
ALTER TABLE scheduled_scans ADD COLUMN started_at TIMESTAMP NULL;
ALTER TABLE scheduled_scans ADD COLUMN current_stage VARCHAR(100) NULL;
ALTER TABLE scheduled_scans ADD COLUMN progress_percent INT DEFAULT 0;
ALTER TABLE scheduled_scans ADD COLUMN last_error TEXT NULL;
ALTER TABLE scheduled_scans ADD COLUMN estimated_duration INT NULL;
ALTER TABLE scheduled_scans ADD COLUMN actual_duration INT NULL;

-- Add indexes for performance
CREATE INDEX idx_scheduled_scans_status ON scheduled_scans(status);
CREATE INDEX idx_scheduled_scans_progress ON scheduled_scans(progress_percent);
```

#### **Scan History Enhancements**
```sql
-- New fields for enhanced tracking
ALTER TABLE scan_histories ADD COLUMN scheduled_scan_id BIGINT UNSIGNED NULL;
ALTER TABLE scan_histories ADD COLUMN scan_trigger VARCHAR(50) DEFAULT 'manual';
ALTER TABLE scan_histories ADD COLUMN scan_started_at TIMESTAMP NULL;
ALTER TABLE scan_histories ADD COLUMN scan_completed_at TIMESTAMP NULL;
ALTER TABLE scan_histories ADD COLUMN scan_duration INT NULL;

-- Add foreign key constraint
ALTER TABLE scan_histories ADD CONSTRAINT fk_scan_histories_scheduled_scan 
FOREIGN KEY (scheduled_scan_id) REFERENCES scheduled_scans(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX idx_scan_histories_trigger ON scan_histories(scan_trigger);
CREATE INDEX idx_scan_histories_scheduled_scan ON scan_histories(scheduled_scan_id);
```

### **Migration Execution**
```bash
# Run migrations
php artisan migrate

# If you have custom migrations, check for conflicts
php artisan migrate:status

# Rollback if needed (be cautious in production)
php artisan migrate:rollback --step=1
```

---

## 🎨 **Frontend Component Changes**

### **Updated Components**

#### **ScanProgressBar Component**
```jsx
// OLD: Simple progress bar
<div className="w-full bg-gray-200 rounded-full h-2.5">
    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
</div>

// NEW: Enhanced progress bar with dark mode and time tracking
<ScanProgressBar
    progress={scanProgress}
    isRunning={isScanning}
    timeElapsed={elapsed}
    estimatedTotal={estimate}
    currentStage={stage}
    size="lg" // 'sm', 'md', 'lg'
    showTime={true}
    className="mb-4"
/>
```

#### **Navigation Dropdown**
```jsx
// OLD: Basic dropdown with alignment issues
<div className="relative">
    <Dropdown>
        <Dropdown.Trigger>
            <button>WP Scanner</button>
        </Dropdown.Trigger>
    </Dropdown>
</div>

// NEW: Properly aligned dropdown with consistent styling
<div className="relative inline-flex items-center">
    <Dropdown>
        <Dropdown.Trigger>
            <button className="inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none">
                WP Scanner
                <ChevronDownIcon className="ml-1 h-4 w-4" />
            </button>
        </Dropdown.Trigger>
    </Dropdown>
</div>
```

#### **Dark Mode Classes**
```jsx
// Add dark mode support to custom components
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
    <button className="bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 px-4 py-2 rounded">
        Save
    </button>
</div>
```

### **Custom Component Migration**

If you have custom components, update them to support dark mode:

```jsx
// Before
const CustomCard = ({ children }) => (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
        {children}
    </div>
);

// After
const CustomCard = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4">
        <div className="text-gray-900 dark:text-gray-100">
            {children}
        </div>
    </div>
);
```

---

## 🔧 **API Changes & New Endpoints**

### **New Routes**
```php
// Progress tracking endpoints
Route::patch('/scheduled-scans/{scheduledScan}/reset-progress', [ScheduledScanController::class, 'resetProgress'])
    ->name('scheduled-scans.reset-progress');

Route::get('/scheduled-scans/{scheduledScan}/progress', [ScheduledScanController::class, 'getProgress'])
    ->name('scheduled-scans.progress');

Route::post('/scheduled-scans/{scheduledScan}/start', [ScheduledScanController::class, 'startScan'])
    ->name('scheduled-scans.start');
```

### **Updated Controller Methods**

#### **ScheduledScanController**
```php
// New method: resetProgress()
public function resetProgress(ScheduledScan $scheduledScan)
{
    $scheduledScan->update([
        'status' => 'pending',
        'progress_percent' => 0,
        'current_stage' => null,
        'started_at' => null,
        'last_error' => null,
    ]);

    return response()->json(['message' => 'Progress reset successfully']);
}

// New method: getProgress()
public function getProgress(ScheduledScan $scheduledScan)
{
    return response()->json([
        'progress' => $scheduledScan->progress_percent,
        'stage' => $scheduledScan->current_stage,
        'status' => $scheduledScan->status,
        'started_at' => $scheduledScan->started_at,
        'estimated_completion' => $this->calculateEstimatedCompletion($scheduledScan),
    ]);
}
```

### **API Response Changes**

If you're consuming the API, note these response structure updates:

```json
// Old scan response
{
    "id": 1,
    "name": "Daily Scan",
    "frequency": "daily",
    "created_at": "2025-07-31T10:00:00Z"
}

// New scan response (additional fields)
{
    "id": 1,
    "name": "Daily Scan",
    "frequency": "daily",
    "status": "running",
    "progress_percent": 65,
    "current_stage": "Scanning plugins",
    "started_at": "2025-07-31T10:00:00Z",
    "estimated_completion": "2025-07-31T10:08:30Z",
    "created_at": "2025-07-31T10:00:00Z"
}
```

---

## ⚙️ **Configuration Updates**

### **Environment Variables**

Add these new configuration options to your `.env` file:

```env
# Scanning Configuration
SCAN_TIMEOUT=300
SCAN_MAX_CONCURRENT=3
SCAN_PROGRESS_UPDATE_INTERVAL=1000
SCAN_CLEANUP_AFTER_DAYS=30

# UI Configuration
DEFAULT_THEME=system
THEME_PERSISTENCE=true
DARK_MODE_ENABLED=true
NAVBAR_BRAND_LOGO=/images/logo.png

# Performance
SCAN_CHUNK_SIZE=100
PROGRESS_BAR_ANIMATION_SPEED=300
```

### **Config File Updates**

No changes to existing config files are required, but you may want to publish and customize:

```bash
# Publish scanning configuration (optional)
php artisan vendor:publish --tag=klioso-scanning

# Clear config cache after changes
php artisan config:clear
php artisan config:cache
```

---

## 🧪 **Testing Your Migration**

### **Automated Tests**
```bash
# Run full test suite
php artisan test

# Run specific feature tests
php artisan test --filter=ScheduledScanTest
php artisan test --filter=ProgressTrackingTest

# Test dark mode components
npm run test:components
```

### **Manual Testing Checklist**

#### **Core Functionality**
- [ ] User login/logout works
- [ ] Dashboard loads correctly
- [ ] Navigation dropdowns are properly aligned
- [ ] Dark mode toggle functions
- [ ] Scheduled scans can be created
- [ ] Progress tracking displays correctly

#### **New Features**
- [ ] Stuck scan detection works
- [ ] Progress reset functionality
- [ ] Real-time progress updates
- [ ] Dark mode across all components
- [ ] Mobile responsive navigation

#### **API Testing**
```bash
# Test progress endpoint
curl -X GET "http://your-domain.com/api/scheduled-scans/1/progress" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN"

# Test reset endpoint
curl -X PATCH "http://your-domain.com/api/scheduled-scans/1/reset-progress" \
     -H "Accept: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 **Common Migration Issues**

### **1. Database Migration Failures**
```bash
# Issue: Foreign key constraint errors
# Solution: Check for orphaned records
SELECT * FROM scan_histories WHERE scheduled_scan_id NOT IN (SELECT id FROM scheduled_scans);

# Clean up orphaned records
DELETE FROM scan_histories WHERE scheduled_scan_id NOT IN (SELECT id FROM scheduled_scans);

# Retry migration
php artisan migrate
```

### **2. Asset Compilation Issues**
```bash
# Issue: Dark mode styles not loading
# Solution: Clear and rebuild assets
rm -rf node_modules package-lock.json
npm install
npm run build

# Clear Laravel caches
php artisan optimize:clear
```

### **3. Component Prop Errors**
```jsx
// Issue: Progress bar component errors
// Solution: Update component usage

// OLD
<ProgressBar progress={value} />

// NEW
<ScanProgressBar 
    progress={value} 
    isRunning={false} 
    timeElapsed={0}
    estimatedTotal={0}
    currentStage="Complete"
/>
```

### **4. Permission Issues**
```bash
# Fix storage permissions
sudo chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# Fix SELinux issues (if applicable)
setsebool -P httpd_can_network_connect 1
setsebool -P httpd_unified 1
```

---

## 📊 **Performance Considerations**

### **Database Performance**
```sql
-- Add recommended indexes
CREATE INDEX idx_scheduled_scans_status_created ON scheduled_scans(status, created_at);
CREATE INDEX idx_scan_histories_trigger_date ON scan_histories(scan_trigger, created_at);

-- Optimize tables after migration
OPTIMIZE TABLE scheduled_scans;
OPTIMIZE TABLE scan_histories;
```

### **Asset Optimization**
```bash
# Production asset build
npm run build

# Verify asset sizes
ls -la public/build/assets/

# Enable gzip compression in web server
# Add to .htaccess (Apache) or nginx.conf (Nginx)
```

### **Caching Strategy**
```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Consider Redis for session/cache storage
```

---

## 🔄 **Rollback Plan**

If you need to rollback the migration:

### **1. Database Rollback**
```bash
# Rollback recent migrations (be very careful)
php artisan migrate:rollback --step=5

# Or restore from backup
mysql -u username -p database_name < backup_20250731_100000.sql
```

### **2. Application Rollback**
```bash
# Checkout previous version
git checkout v0.9.20

# Restore dependencies
composer install
npm install
npm run build

# Clear caches
php artisan optimize:clear
```

### **3. Verification**
```bash
# Verify rollback success
php artisan --version
php artisan migrate:status
curl -I http://your-domain.com
```

---

## 📞 **Migration Support**

If you encounter issues during migration:

1. **Check Logs**: `storage/logs/laravel.log`
2. **Database Logs**: MySQL/PostgreSQL error logs
3. **Web Server Logs**: Apache/Nginx error logs
4. **GitHub Issues**: [Report migration issues](https://github.com/nathanmaster/Klioso/issues)
5. **Community Support**: [GitHub Discussions](https://github.com/nathanmaster/Klioso/discussions)

---

**Migration Complete!** 🎉

Your Klioso installation is now upgraded to v0.9.46 with all 26 enhancements, enhanced scanning capabilities, comprehensive dark mode support, and improved navigation.
