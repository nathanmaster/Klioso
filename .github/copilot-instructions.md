# Klioso - WordPress Management System AI Instructions

## Project Overview
Klioso is a Laravel 12 + React (Inertia.js) WordPress management system for agencies tracking clients, websites, hosting providers, and plugins. The core value is **centralized WordPress ecosystem management** with automated scanning capabilities.

## Architecture & Key Components

### Core Domain Models
- **Website**: Central entity linking to clients, hosting providers, plugins via many-to-many relationships
- **Client**: Business entities owning websites 
- **Plugin**: WordPress plugins with version tracking via `website_plugin` pivot table
- **HostingProvider**: Handles hosting, DNS, email, and domain registration services
- **ScanHistory**: WordPress scan results with plugin/theme detection and vulnerability data
- **ScheduledScan**: Automated scanning jobs with configurable frequency and scope

### Critical Service: WordPressScanService
Located in `app/Services/WordPressScanService.php` - this is the heart of the application:
- **URL-based scanning**: Detects WordPress, plugins, themes, versions from any public URL
- **Database website scanning**: Scans sites already registered in the system
- **Plugin detection**: Uses HTTP requests to wp-content paths to identify installed plugins
- **Vulnerability scanning**: Checks for known security issues
- **Concurrent scanning**: Supports bulk operations with configurable timeouts

### Frontend Architecture (React + Inertia.js)
- **Pages structure**: `resources/js/Pages/` organized by domain (Clients, Websites, Plugins, Scanner)
- **Shared components**: `resources/js/Components/` for reusable UI elements
- **Inertia.js patterns**: Server-side rendering with React SPA experience, no separate API layer
- **Current file context**: Working in `resources/js/Pages/Plugins/Show.jsx` for plugin detail views

## Development Workflows

### Build & Development
```bash
# Frontend development with hot reload
npm run dev

# Production build
npm run build

# Backend development
php artisan serve
```

### Database Management
- **Migrations**: Extensive migration history showing evolution from basic CRUD to complex scanning system
- **Key relationships**: Use Eloquent relationships extensively, especially many-to-many with pivot data
- **Performance**: Recent indexes added in `2025_08_27_161117_add_performance_indexes_to_tables.php`

### Testing
- **Pest PHP**: Uses Pest testing framework (not PHPUnit)
- **Test structure**: `tests/Feature/` and `tests/Unit/` directories

## Project-Specific Patterns

### Scanner Integration Patterns
When working with scan functionality:
```php
// Always use the WordPressScanService for external scanning
$scanService = app(WordPressScanService::class);
$results = $scanService->scanWebsite($url, 'all');

// Store results in ScanHistory with proper relationships
$scanHistory = ScanHistory::create([
    'website_id' => $website->id,
    'scan_data' => $results,
    'scan_type' => 'automated'
]);
```

### Inertia.js Data Patterns
- **Page props**: Always include related models when needed: `return Inertia::render('Page', ['model' => $model->load('relationships')])`
- **Form handling**: Use Inertia forms with proper validation feedback
- **Shared data**: Global data via `HandleInertiaRequests` middleware

### Plugin-Website Relationship Pattern
```php
// Attach plugin with version metadata
$website->plugins()->attach($pluginId, [
    'version' => $detectedVersion,
    'is_active' => true,
    'last_updated' => now()
]);

// Update existing plugin relationship
$website->plugins()->updateExistingPivot($pluginId, [
    'version' => $newVersion,
    'last_updated' => now()
]);
```

### Component Naming Conventions
- **React components**: PascalCase, co-located in domain folders
- **Shared components**: Generic names in `Components/` (Button, DeleteButton, BackButton)
- **Layout components**: In `Layouts/` directory (AuthenticatedLayout)

## Release Management
- **Automated tooling**: Use `tools/release/quick-release.sh` for version bumps
- **Version tracking**: `version.json` and `package.json` must stay synchronized
- **Documentation**: Release notes auto-generated in `docs/releases/`

## Critical Integration Points

### Scanner API Routes
- `POST /scan`: URL-based scanning
- `POST /websites/{website}/scan`: Database website scanning  
- `POST /scanner/bulk-scan`: Multiple website scanning
- `GET /scanner/history`: Scan result history

### Database Performance Notes
- **Heavy queries**: Plugin relationships on websites can be expensive, use eager loading
- **Indexing**: Recent performance indexes on `website_plugin` table for version lookups
- **Scanning load**: Scanner operations are I/O intensive, consider queuing for large batches

### Security Considerations
- **External requests**: Scanner makes HTTP requests to external WordPress sites
- **Rate limiting**: Implement delays between scan requests to avoid being blocked
- **Vulnerability data**: Store and display security scan results responsibly

## Common Tasks

### Adding New Scan Types
1. Extend `WordPressScanService` with new detection method
2. Update `ScanHistory` model to store new data format
3. Create React components in `Pages/Scanner/` for results display
4. Add routes in `web.php` following existing scanner patterns

### Adding Website Relationships
1. Create migration with proper foreign keys
2. Add Eloquent relationship methods to `Website` model
3. Update website forms and display components
4. Consider impact on scanner data collection

When working on this codebase, prioritize understanding the WordPress scanning workflow and the complex relationships between websites, plugins, and scan results. The scanner service is the most critical component for understanding how external WordPress sites are analyzed and integrated into the management system.