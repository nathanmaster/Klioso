# WordPress Scanner Documentation

## Overview

The WordPress Scanner is a comprehensive tool for scanning WordPress websites to detect:
- **Plugins** installed on the website
- **Themes** installed on the website  
- **WordPress version**
- **Security vulnerabilities** (when available)

## Features

### 1. URL Scanning
- Enter any WordPress website URL to scan
- Supports both HTTP and HTTPS URLs
- Detects plugins through various methods:
  - HTML parsing for wp-content/plugins/ references
  - README.txt file analysis
  - Header detection

### 2. Website Database Scanning
- Scan websites already stored in your database
- Auto-sync discovered plugins to website records
- Track plugin versions and status

### 3. Plugin Database Integration
- Automatically matches discovered plugins with your plugin database
- Add new plugins to database directly from scan results
- Track paid vs free plugins

## How to Use

### Scanning a Custom URL

1. Navigate to **Scanner** in the main navigation
2. Select the **"Scan URL"** tab
3. Enter the WordPress website URL (e.g., `https://example.com`)
4. Choose scan type:
   - **Plugins Only**: Detect installed plugins
   - **Themes Only**: Detect installed themes
   - **Vulnerabilities Only**: Check for security issues
   - **All (Comprehensive)**: Scan everything
5. Click **"Start Scan"**

### Scanning Existing Websites

1. Navigate to **Scanner** in the main navigation
2. Select the **"Scan Website"** tab
3. Choose a website from your database
4. Choose scan type and options
5. Enable **"Auto-sync"** to automatically add discovered plugins to the website
6. Click **"Start Scan"**

## Technical Implementation

### Backend Components

- **WordPressScanController**: Handles scan requests and results
- **WordPressScanService**: Core scanning logic
- **WebsiteScan Model**: Database model for storing scan results

### Scanning Methods

1. **WordPress Detection**:
   - Checks for common WordPress indicators in HTML
   - Tests wp-admin login page accessibility
   - Looks for wp-json API endpoints

2. **Plugin Detection**:
   - Parses HTML for `/wp-content/plugins/` references
   - Attempts to read plugin README.txt files
   - Extracts plugin names, versions, and descriptions

3. **Theme Detection**:
   - Scans for `/wp-content/themes/` references
   - Identifies active and inactive themes

4. **Version Detection**:
   - Looks for WordPress generator meta tags
   - Checks various WordPress version indicators

### Database Schema

The `website_scans` table stores:
- `url`: Scanned website URL
- `status`: Scan status (pending, completed, failed)
- `plugins`: JSON array of discovered plugins
- `themes`: JSON array of discovered themes
- `wordpress_version`: Detected WordPress version
- `raw_output`: Raw scan output for debugging
- `error_message`: Error details if scan fails
- `scanned_at`: Timestamp of scan completion

## API Endpoints

- `GET /scanner` - Scanner interface
- `POST /scan` - Scan custom URL
- `POST /websites/{website}/scan` - Scan database website
- `POST /scanner/add-plugin` - Add discovered plugin to database

## Example Usage

### Scanning WordPress.org
```
URL: https://wordpress.org
Scan Type: All (Comprehensive)
```

This will detect:
- WordPress version
- Any publicly visible plugins
- Theme information
- Potential security indicators

### Results Format

```json
{
  "success": true,
  "data": {
    "url": "https://example.com",
    "wordpress_detected": true,
    "wp_version": "6.4.2",
    "plugins": [
      {
        "name": "Contact Form 7",
        "slug": "contact-form-7",
        "version": "5.8.4",
        "status": "active",
        "in_database": true,
        "is_paid": false
      }
    ],
    "themes": [
      {
        "name": "twentytwentythree",
        "slug": "twentytwentythree",
        "status": "active"
      }
    ]
  }
}
```

## Security Notes

- Scanning is performed using HTTP requests only
- No credentials or authentication is attempted
- Only publicly accessible information is gathered
- Respects robots.txt and reasonable rate limits
- Uses proper User-Agent headers

## Troubleshooting

### Common Issues

1. **"WordPress not detected"**
   - Website may not be WordPress
   - WordPress may be heavily customized
   - Site may be behind authentication

2. **"Scan failed" errors**
   - Website may be down or slow
   - Firewall blocking requests
   - Rate limiting in effect

3. **No plugins found**
   - Plugins may be heavily obfuscated
   - Site may use custom plugin structure
   - Only active, publicly visible plugins are detected

### Performance Tips

- Use "Plugins Only" scan for faster results
- Avoid scanning the same site repeatedly
- Large sites may take longer to scan

## Development

To extend the scanner:

1. Modify `WordPressScanService` for new detection methods
2. Update the React component for UI changes
3. Add new scan types in the controller
4. Extend the database schema as needed

## Support

For issues or feature requests, check the application logs and ensure:
- Laravel server is running
- Database is accessible
- Internet connectivity is available
- Target websites are accessible
