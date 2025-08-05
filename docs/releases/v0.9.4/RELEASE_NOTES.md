# Klioso v0.9.4 - Critical Bug Fixes & Stability

**Release Date:** July 30, 2025  
**Version:** 0.9.4  
**Type:** Bug Fix Release  
**Priority:** Critical

## 🚨 Critical Fixes

### Database Schema Resolved
- **✅ Client Creation Fixed**: Added missing `company` and `address` columns to clients table
- **✅ Scheduled Scans Fixed**: Complete schema update with all required fields
- **✅ Scan History Fixed**: Renamed table to `scan_histories` to match model expectations

### Core Functionality Restored
- **✅ Bulk Scanning**: Fixed `scanWordPressSite()` method and parameter handling
- **✅ Website Display**: Proper names now show in dropdowns instead of "()"
- **✅ Scheduled Scans**: POST errors resolved, creation now works correctly

## 🛠️ Technical Improvements

### Enhanced Development Environment
- **📧 Mailpit Integration**: Local email testing configuration added
- **🔧 Error Handling**: Comprehensive logging and exception management
- **📊 Data Structure**: Aligned models with database schema

### System Stability
- **🔍 Scanner Service**: Added missing methods for bulk operations
- **📋 Model Updates**: Proper fillable arrays and relationship loading
- **⚡ Performance**: Optimized database queries and data mapping

## 📋 Quick Installation

```bash
# Run new migrations
php artisan migrate

# Clear cache
php artisan config:clear
php artisan cache:clear
```

## ⚠️ Important Notes

- **Database changes required** - Run migrations before use
- **Breaking changes** in scan history table structure
- **Development setup** includes Mailpit for email testing

---

*This release resolves all critical issues preventing normal operation of client management, scheduled scanning, and bulk operations.*
