# Klioso v0.9.20 - Enhanced Scheduled Scanning & Navigation Improvements

**Release Date:** July 31, 2025  
**Version:** 0.9.20  
**Type:** Minor Feature Release  
**Priority:** Major - Enhanced scheduled scanning with real-time progress & navbar improvements

## 🚀 **What's New in This Release**

This minor release introduces significant enhancements to scheduled scanning with real-time progress tracking, comprehensive navigation improvements, and extensive dark mode refinements across all components.

## ✨ **Major Features**

### 📊 **Enhanced Scheduled Scanning System**

#### **Real-time Progress Tracking**
- **Progress Bar Integration**: Reusable `ScanProgressBar` component with WP scanner-style animations
- **Live Status Updates**: Real-time progress percentages and stage descriptions during scan execution
- **Queue Management**: Visual indicators for queued, running, and stuck scan detection
- **Time Estimation**: Accurate duration tracking and remaining time calculations

#### **Advanced Scan Management**
- **Stuck Scan Detection**: Automatic detection of scans running longer than 30 minutes
- **Progress Reset Functionality**: Manual reset for stuck scans with confirmation dialogs
- **Enhanced Status Display**: Color-coded status badges with animation for running scans
- **Schedule Auto-naming**: Intelligent default names when no name is provided

#### **Database Schema Enhancements**
- **Scan Status Tracking**: New `status`, `started_at`, `current_stage`, `progress_percent` fields
- **Scan History Relationships**: Foreign key relationships between scheduled scans and scan histories
- **Execution Metadata**: `scan_trigger`, `scan_started_at`, `scan_completed_at` fields for detailed tracking

### 🎨 **Navigation & UI Improvements**

#### **Redesigned WordPress Scanner Navigation**
- **Dropdown Menu Structure**: Consolidated WP Scanner menu with organized submenu items
- **Proper Alignment**: Fixed navbar dropdown positioning and alignment issues
- **Consistent Styling**: Matching active/inactive states with other navigation items
- **Mobile Responsive**: Enhanced mobile navigation with organized scanner sections

#### **Comprehensive Dark Mode Enhancements**
- **Component Coverage**: All form controls, modals, and progress bars now support dark mode
- **Button Variants**: Complete dark mode styling for primary, outline, and ghost button variants
- **Modal Improvements**: ScheduleModal, WebsitePlugins, and ScanDetailsModal with dark backgrounds
- **Accessibility**: WCAG AA compliant contrast ratios for all dark mode components

### 🔧 **Technical Improvements**

#### **Backend Infrastructure**
- **New Database Migrations**: 
  - `2025_07_31_142920_add_status_to_scheduled_scans_table.php`
  - `2025_07_31_180000_add_scheduled_scan_relationship_to_scan_histories.php`
- **Enhanced Controllers**: New `resetProgress()` method in ScheduledScanController
- **Bulk Operations**: Extended bulk operations for all resource types (clients, hosting providers, plugins, templates)
- **Route Optimization**: New routes for progress reset and enhanced bulk operations

#### **Frontend Architecture**
- **Component Reusability**: `ScanProgressBar` component with configurable sizes and display options
- **Modal System**: `ScanDetailsModal` with comprehensive scan information display
- **State Management**: Enhanced React hooks for progress tracking and scan monitoring
- **Performance**: Optimized component rendering and reduced unnecessary re-renders

#### **Data Structure Improvements**
- **Scan Results Integration**: Proper handling of scan_results and scan_summary fields
- **Display Attributes**: Consistent use of `domain_name` instead of mixed `name`/`url` fields
- **Error Handling**: Enhanced error states and recovery mechanisms
- **Loading States**: Professional loading indicators during all operations

## 🛠 **Bug Fixes**

### **Navigation Issues**
- ✅ **Fixed Scanner Dropdown**: Resolved positioning issues causing dropdown to appear at page top
- ✅ **Proper Alignment**: Scanner dropdown now aligns correctly with other navbar items
- ✅ **Active States**: Consistent styling for active scanner menu items

### **Scheduled Scanning**
- ✅ **Progress Tracking**: Fixed progress bars not updating during scan execution
- ✅ **Status Display**: Resolved issues with scan status not reflecting current state
- ✅ **Queue Management**: Fixed stuck scans not being properly detected or reset

### **Dark Mode Compatibility**
- ✅ **Form Controls**: All input fields, selects, and checkboxes now properly support dark mode
- ✅ **Modal Backgrounds**: Fixed modal backgrounds and text contrast in dark mode
- ✅ **Progress Indicators**: Enhanced visibility of progress bars and animations in dark mode

### **Data Display**
- ✅ **Website Names**: Consistent use of `domain_name` across all components
- ✅ **Bulk Actions**: Fixed bulk action modal props and resource type handling
- ✅ **Scan History**: Proper display of scan trigger types and execution metadata

## 📊 **Database Schema Updates**

### **Scheduled Scans Enhancements**
```sql
-- New status tracking fields
ALTER TABLE scheduled_scans ADD COLUMN status ENUM('idle', 'queued', 'running', 'completed', 'failed') DEFAULT 'idle';
ALTER TABLE scheduled_scans ADD COLUMN started_at TIMESTAMP NULL;
ALTER TABLE scheduled_scans ADD COLUMN current_stage TEXT NULL;
ALTER TABLE scheduled_scans ADD COLUMN progress_percent INT DEFAULT 0;
ALTER TABLE scheduled_scans ADD COLUMN last_error TEXT NULL;
```

### **Scan History Relationships**
```sql
-- Enhanced scan tracking
ALTER TABLE scan_histories ADD COLUMN scheduled_scan_id BIGINT UNSIGNED NULL;
ALTER TABLE scan_histories ADD COLUMN scan_trigger VARCHAR(255) DEFAULT 'manual';
ALTER TABLE scan_histories ADD COLUMN scan_started_at TIMESTAMP NULL;
ALTER TABLE scan_histories ADD COLUMN scan_completed_at TIMESTAMP NULL;
```

## 🎯 **Performance Improvements**

### **Frontend Optimizations**
- **Component Memoization**: Reduced re-renders in progress tracking components
- **Efficient Polling**: Smart polling intervals for scan status updates
- **Memory Management**: Proper cleanup of progress timers and intervals

### **Backend Efficiency**
- **Database Indexing**: New indexes for improved scan history queries
- **Query Optimization**: Enhanced bulk operation performance
- **Resource Management**: Better handling of long-running scan processes

## 📦 **Installation & Upgrade**

### **From Previous Versions**
```bash
# Run database migrations
php artisan migrate

# Clear compiled files
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Rebuild assets
npm run build

# Restart queue workers (if using)
php artisan queue:restart
```

### **New Installation**
```bash
# Clone repository
git clone https://github.com/nathanmaster/Klioso.git
cd Klioso

# Install dependencies
composer install
npm install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run migrations and build
php artisan migrate
npm run build

# Start development server
php artisan serve
```

## ⚠️ **Breaking Changes**

### **Navigation Structure**
- **Scanner Menu**: WordPress Scanner is now organized under a dropdown menu instead of separate top-level items
- **Route Changes**: Some scanner-related routes may have updated structure

### **Component Props**
- **BulkActionsModal**: Now requires `isOpen`, `items`, and `resourceType` props in addition to existing props
- **Modal Structure**: Some modal components have updated prop structures for dark mode support

## 📋 **Migration Notes**

### **For Existing Installations**
1. The navigation structure has changed - WordPress Scanner is now under a dropdown
2. New database fields added for enhanced scan tracking
3. Dark mode improvements may affect custom styling
4. Progress tracking requires updated frontend components

### **For Developers**
1. Use `ScanProgressBar` component for consistent progress displays
2. Follow new modal prop structure for dark mode compatibility
3. Use `domain_name` field consistently for website display
4. Implement proper error handling for scan operations

## 🔮 **What's Next in v0.9.21**

- **Advanced Analytics**: Enhanced performance metrics and reporting
- **API Improvements**: RESTful API enhancements for external integrations
- **Security Features**: Advanced vulnerability scanning and notifications
- **Mobile Experience**: Enhanced mobile interface and touch interactions

---

**Contributors:** Klioso Development Team  
**Download:** [Release Binaries](https://github.com/nathanmaster/Klioso/releases/tag/v0.9.20)  
**Documentation:** [Updated Documentation](https://github.com/nathanmaster/Klioso/blob/main/README.md)  
**Support:** [Issues & Support](https://github.com/nathanmaster/Klioso/issues)

---

*This release represents continued commitment to providing a professional, accessible, and feature-rich WordPress management platform with enhanced scanning capabilities and improved user experience.*
