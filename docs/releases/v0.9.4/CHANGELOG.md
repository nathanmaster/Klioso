# Klioso v0.9.4 - Critical Bug Fixes & Stability Improvements

Release Date: July 30, 2025  
Version: v0.9.4  
Type: Bug Fix Release  
Priority: **Critical** - Addresses database schema issues and core functionality

## 🎯 Overview

Klioso v0.9.4 is a critical bug fix release that addresses multiple database schema inconsistencies, scanning functionality issues, and improves overall system stability. This release follows the established v0.9.0.beta.1 methodology with comprehensive testing and systematic issue resolution.

## 🐛 **Critical Bug Fixes**

### 📊 **Database Schema Issues**

- **Fixed clients table**: Added missing `company` and `address` columns preventing client creation
- **Fixed scheduled_scans table**: Added all required columns (`name`, `scan_type`, `target`, etc.) for scheduled scan functionality
- **Fixed scan_histories table**: Renamed from `scan_history` to `scan_histories` to match model expectations
- **Fixed website_plugin table**: Added missing `last_updated` column causing SQL errors in plugin relationships
- **Schema Validation**: All database operations now properly validate against updated schema

### 🔍 **WordPress Scanner Fixes**
- **Added missing method**: Implemented `scanWordPressSite()` method in `WordPressScanService` for bulk operations
- **Fixed bulk scanning**: Corrected parameter passing from URL strings to Website objects
- **Improved scan history**: Updated data structure to match `scan_histories` table schema
- **Enhanced error handling**: Added comprehensive try-catch blocks and logging

### 🌐 **Website Display Issues**
- **Fixed dropdown displays**: Websites now show proper names instead of "()" in selection dropdowns
- **Added display accessors**: Implemented `display_name` and `display_label` attributes in Website model
- **Improved bulk actions**: Website names and details now display correctly in bulk operation interfaces
- **Enhanced data mapping**: Added missing display fields to controller responses

### ⚡ **Scheduled Scan Functionality**
- **Fixed POST errors**: Resolved SQLSTATE errors when creating scheduled scans
- **Updated model attributes**: Aligned ScheduledScan model with database schema
- **Improved validation**: Added proper field validation for scan creation
- **Enhanced configuration**: Scan configuration now properly stores and retrieves JSON data

## 🛠 **Technical Improvements**

### **Backend Enhancements**
- **Database Migrations**: Three new migrations to fix schema inconsistencies
  - `fix_clients_table_add_missing_columns.php`
  - `fix_scheduled_scans_table_add_missing_columns.php`
  - `fix_scan_history_table_rename_to_scan_histories.php`
- **Model Updates**: Updated fillable arrays and casts to match database structure
- **Service Layer**: Enhanced WordPressScanService with proper method signatures
- **Error Logging**: Improved error tracking and debugging capabilities

### **Development Environment**
- **Mailpit Integration**: Added Mailpit configuration for local email testing
- **Enhanced .env.example**: Added Mailpit settings and development configurations
- **Mail Configuration**: Added dedicated mailpit mailer for development builds

### **Data Integrity**
- **Scan History**: Proper data structure alignment between controllers and models
- **Website Relations**: Fixed relationship loading and display in all contexts
- **Bulk Operations**: Corrected data flow for multi-website operations

## 🔧 **Migration Guide**

### **For Existing Installations**
```bash
# Run the new migrations
php artisan migrate

# Clear any cached configurations
php artisan config:clear
php artisan cache:clear

# Restart queue workers if using background processing
php artisan queue:restart
```

### **For Development Environments**
```bash
# Optional: Set up Mailpit for email testing
# Update .env with Mailpit settings:
# MAIL_MAILER=mailpit
# MAILPIT_HOST=127.0.0.1
# MAILPIT_PORT=1025
# MAILPIT_WEB_PORT=8025
```

## ⚠️ **Breaking Changes**
- **Database Schema**: New required columns in `clients` and `scheduled_scans` tables
- **Scan History**: Table renamed from `scan_history` to `scan_histories`
- **Model Changes**: Updated ScheduledScan model attributes to match schema

## 🧪 **Testing & Validation**
- **Database Tests**: All migrations tested against SQLite and MySQL
- **Functionality Tests**: Bulk scanning, scheduled scans, and client creation verified
- **UI Testing**: Website display and selection functionality validated
- **Error Handling**: Exception scenarios tested and logged appropriately

## 📋 **Verification Checklist**
- ✅ Client creation with company and address fields
- ✅ Scheduled scan creation without SQL errors
- ✅ Scan history viewing without table errors
- ✅ Website names displayed in bulk actions
- ✅ Bulk scanning functionality working
- ✅ Website selection dropdowns showing proper names
- ✅ Mailpit integration for development testing

---

**Klioso v0.9.4** - Stability and reliability improvements for production use! 🔧✨

*This critical release resolves all known database schema issues and core functionality problems reported in v0.9.3.*
