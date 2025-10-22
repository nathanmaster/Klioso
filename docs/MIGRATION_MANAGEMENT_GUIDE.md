# Klioso Migration Management Guide

## Overview

Klioso uses an **optimized migration strategy** to handle the challenge of managing 35+ migration files. This system provides two installation paths:

1. **Fresh Installation Schema** - Single comprehensive migration for new installations
2. **Incremental Migrations** - Individual migration files for existing installations

## Migration Strategy

### Problem Solved
- **Before**: New installations required running 35+ individual migration files
- **After**: New installations use a single optimized schema migration
- **Benefit**: Faster setup, cleaner migration history, easier maintenance

### Two-Path Approach

#### Path 1: Fresh Installation (Recommended for New Installs)
```bash
php artisan klioso:install --fresh
```
- Uses `9999_12_31_000000_fresh_installation_schema.php`
- Creates complete database schema in a single migration
- Marks historical migrations as "already run"
- **Ideal for**: New installations, development environments, clean deployments

#### Path 2: Incremental Migration (For Existing Installations)
```bash
php artisan klioso:install
```
- Uses all individual migration files
- Preserves existing data and schema evolution
- Applies only pending migrations
- **Ideal for**: Production updates, existing installations, data preservation

## Installation Commands

### Automatic Detection
```bash
php artisan klioso:install
```
- Automatically detects if it's a fresh or existing installation
- Recommends the appropriate migration path
- Prompts for confirmation before proceeding

### Force Fresh Installation
```bash
php artisan klioso:install --fresh --force
```
- Forces fresh installation schema usage
- Bypasses confirmation prompts
- **Warning**: Only use on empty databases

### Manual Migration (Traditional Laravel)
```bash
php artisan migrate
```
- Runs all pending migrations incrementally
- Skips the fresh installation schema automatically
- Standard Laravel migration behavior

## Migration File Organization

### Fresh Installation Schema
**File**: `database/migrations/9999_12_31_000000_fresh_installation_schema.php`

**Contains**:
- Complete current database schema
- All tables with their final structure
- Comprehensive indexes for performance
- Automatic detection of fresh vs. existing installations

**Tables Created**:
- Core Laravel tables (users, cache, jobs)
- Klioso core tables (clients, websites, hosting_providers)
- Feature tables (plugins, templates, articles)
- Monitoring tables (scans, analytics, security_audits)
- Advanced tables (notifications, dashboard_panels)

### Historical Migrations (Preserved)
**Purpose**: Maintain complete schema evolution history
**Location**: `database/migrations/` (all dated files)
**Status**: Used for existing installations and historical reference

### Key Features of Fresh Schema

#### 1. **Complete Table Definitions**
```php
// Example: Enhanced websites table with all features
Schema::create('websites', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    // ... standard fields ...
    
    // Health scoring fields (from latest migrations)
    $table->decimal('health_score', 5, 2)->nullable();
    $table->string('security_grade', 1)->nullable();
    $table->string('risk_level', 20)->nullable();
    // ... other enhanced fields ...
});
```

#### 2. **WPScan Integration Fields**
```php
// SecurityAudits table with full WPScan integration
$table->string('cve_id')->nullable();
$table->string('wpvulndb_id')->nullable();
$table->string('source', 50)->default('automated');
$table->json('references')->nullable();
// ... complete vulnerability tracking ...
```

#### 3. **Performance Optimizations**
```php
// Comprehensive indexing strategy
$table->index(['health_score'], 'websites_health_score_index');
$table->index(['security_grade'], 'websites_security_grade_index');
$table->index(['scan_id'], 'security_audits_scan_id_index');
// ... all performance indexes ...
```

## Usage Scenarios

### New Development Environment
```bash
# Clone repository
git clone https://github.com/nathanmaster/Klioso.git
cd Klioso

# Install dependencies
composer install
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Fast installation with optimized schema
php artisan klioso:install --fresh

# Start development
php artisan serve
```

### Production Deployment (New)
```bash
# Production deployment
php artisan klioso:install --fresh --force

# Optimize for production
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Existing Installation Update
```bash
# Update existing installation
git pull origin main
composer install --no-dev
npm run build

# Apply new migrations only
php artisan klioso:install
# or
php artisan migrate
```

### Development to Production Migration
```bash
# Export data from development
php artisan db:dump --database=development

# Fresh production setup
php artisan klioso:install --fresh --force

# Import essential data
php artisan db:import --file=development_data.sql --tables=clients,websites
```

## Benefits of This Approach

### For New Installations
- ✅ **Faster Setup**: Single migration vs. 35+ individual migrations
- ✅ **Cleaner History**: No lengthy migration history to process
- ✅ **Optimized Schema**: Includes all performance indexes from day one
- ✅ **Current Features**: Immediate access to all latest features (WPScan, health scoring)

### For Existing Installations
- ✅ **Data Preservation**: No data loss during updates
- ✅ **Incremental Updates**: Only new features are migrated
- ✅ **Historical Tracking**: Complete audit trail of schema changes
- ✅ **Safe Updates**: Rollback capability with individual migrations

### For Development Teams
- ✅ **Faster Onboarding**: New developers get up and running quickly
- ✅ **Consistent Environment**: All developers start with identical schema
- ✅ **Testing Efficiency**: Fresh test databases create faster
- ✅ **CI/CD Optimization**: Faster automated testing and deployment

## Advanced Usage

### Custom Installation Scripts
```bash
# Create custom installation script
cat > install-klioso.sh << 'EOF'
#!/bin/bash
echo "🚀 Setting up Klioso Development Environment"

# Install dependencies
composer install
npm install

# Setup environment
cp .env.example .env
php artisan key:generate

# Fast database setup
php artisan klioso:install --fresh --force

# Seed test data (if available)
php artisan db:seed

echo "✅ Klioso ready at http://localhost:8000"
php artisan serve
EOF

chmod +x install-klioso.sh
./install-klioso.sh
```

### Docker Integration
```dockerfile
# In your Dockerfile
RUN php artisan klioso:install --fresh --force
```

### CI/CD Pipeline Integration
```yaml
# GitHub Actions example
- name: Setup Database
  run: |
    php artisan klioso:install --fresh --force
    php artisan db:seed --class=TestSeeder
```

## Migration Management Best Practices

### 1. **Version Control Strategy**
- Keep all migration files in version control
- Tag releases that introduce breaking changes
- Document migration dependencies

### 2. **Environment-Specific Approaches**
- **Development**: Always use fresh installation
- **Staging**: Mirror production migration strategy
- **Production**: Use incremental migrations for safety

### 3. **Data Safety**
- Always backup before major migrations
- Test migration rollbacks in staging
- Use database transactions where possible

### 4. **Performance Considerations**
- Fresh installations include all performance indexes
- Incremental migrations may need index optimization
- Monitor query performance after migrations

## Troubleshooting

### Fresh Installation Issues
```bash
# If fresh installation fails
php artisan migrate:reset
php artisan klioso:install --fresh --force

# Check database connection
php artisan tinker
>>> DB::connection()->getPdo()
```

### Incremental Migration Issues
```bash
# Check migration status
php artisan migrate:status

# Run specific migration
php artisan migrate --path=database/migrations/specific_migration.php

# Rollback if needed
php artisan migrate:rollback --step=1
```

### Mixed State Recovery
```bash
# If migrations are in mixed state
php artisan migrate:reset
php artisan klioso:install --fresh --force

# For production, use more careful approach
php artisan migrate:status
php artisan migrate --pretend  # Check what will run
php artisan migrate
```

## Future Maintenance

### Adding New Migrations
1. Create new migration file as normal: `php artisan make:migration feature_name`
2. Update fresh installation schema to include new feature
3. Test both paths: fresh installation and incremental migration
4. Update this documentation

### Schema Synchronization
- Periodically verify fresh schema matches incremental result
- Use automated tests to ensure schema consistency
- Update fresh schema when major structural changes occur

### Performance Monitoring
- Monitor migration execution times
- Optimize fresh schema for common query patterns
- Review and update indexes based on usage patterns

This migration management system ensures Klioso can scale efficiently while maintaining data integrity and providing fast setup for new installations.