# Changelog

All notable changes to Klioso (formerly WordPress Management System) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2025-07-24

### 🎉 Major Features Added
- **Multi-Service Provider System**: Complete restructuring of hosting providers to support multiple service types
  - Providers can now offer hosting, DNS, email, and domain registration services independently
  - Websites can use different providers for different services (e.g., GoDaddy for hosting, Cloudflare for DNS)
  - Service type badges and filtering in UI
  
- **Responsive Table Layout System**: Modern, mobile-first interface design
  - Removed sidebar navigation in favor of clean header-based navigation
  - Mobile-responsive card layouts for small screens
  - Desktop table views with proper pagination and sorting
  - Click-to-sort functionality on table headers
  
- **WordPress Scanner Enhancement**: Advanced scanning capabilities
  - URL-based scanning for any WordPress site
  - Database website scanning with auto-sync
  - Plugin detection with version information
  - Theme detection and analysis
  - Security vulnerability scanning
  - Real-time scan progress indicators
  
- **Flexible Website Management**: Optional relationships for real-world use cases
  - Client assignment now optional (supports internal/dev sites)
  - Provider assignments optional (supports TBD/planning phase sites)
  - Clear UI indicators for missing relationships

### 🏗️ Technical Improvements
- **Database Schema Updates**:
  - Added service type boolean columns to hosting_providers table
  - Added separate provider relationship columns to websites table
  - Made client_id and hosting_provider_id nullable for flexibility
  
- **Model Enhancements**:
  - HostingProvider model with service type casts and helper methods
  - Website model with separate provider relationships
  - Enhanced validation and fillable arrays
  
- **UI/UX Overhaul**:
  - ARIA-compliant form components with proper accessibility attributes
  - Consistent spacing and responsive design throughout
  - Service type checkboxes with clear labeling
  - Provider dropdowns filtered by service capabilities
  
- **Controller Logic Updates**:
  - Enhanced validation for multi-service providers
  - Improved data loading with service type information
  - Better error handling and user feedback

### 🎨 User Interface Changes
- **Provider Management**:
  - Service type checkboxes in create/edit forms
  - Service badges display in show/index pages
  - Clear "Optional" labeling for non-required fields
  
- **Website Management**:
  - Separate dropdowns for each provider type
  - Filtered provider lists based on service capabilities
  - Graceful handling of missing provider relationships
  
- **Table Layouts**:
  - Responsive card views for mobile devices
  - Improved pagination with page size options
  - Sortable columns with visual indicators
  - Better search functionality

### 🔧 Development Experience
- **Code Quality**:
  - Enhanced accessibility with proper ARIA attributes
  - Improved component reusability
  - Better separation of concerns
  - Comprehensive error handling
  
- **Database Management**:
  - Smart migration handling for existing installations
  - Column existence checks to prevent conflicts
  - Proper rollback strategies

### 🐛 Bug Fixes
- Fixed duplicate column errors in migrations
- Resolved accessibility issues in form components
- Improved mobile responsiveness across all pages
- Fixed provider relationship validation issues

### ⚠️ Breaking Changes
- **Database Schema**: Existing installations must run new migrations
- **Provider Relationships**: Websites now support separate providers for different services
- **UI Layout**: Sidebar navigation removed, header-based navigation implemented
- **Form Structure**: Provider selection split into service-specific dropdowns

### 🚀 Performance Improvements
- Optimized database queries with proper eager loading
- Reduced bundle size with component optimization
- Improved page load times with better caching strategies
- Enhanced mobile performance with responsive images

## [0.7.0] - Previous Version
### Added
- WordPress Scanner functionality
- Plugin management system
- Client-website relationships
- Basic hosting provider management

## [0.6.0] - Previous Version
### Added
- Initial Laravel 12 setup
- Basic CRUD operations
- Authentication system
- Database migrations

---

## Migration Guide: 0.7.x → 0.8.0

### Database Changes Required
```bash
# Run these commands after updating code
php artisan migrate
```

### Configuration Updates
- Review `.env` file for any new configuration options
- Update web server configuration if needed
- Clear application caches: `php artisan config:clear`

### UI Changes
- Sidebar navigation has been removed
- Provider selection is now service-specific
- Mobile layout significantly improved

### API Changes
- Provider creation now includes service type fields
- Website creation supports separate provider relationships
- Enhanced validation rules for optional fields

For detailed upgrade instructions, see [UPGRADE.md](UPGRADE.md).
