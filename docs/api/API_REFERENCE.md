# Klioso API Documentation

This document provides comprehensive API reference for Klioso's REST endpoints and integration capabilities.

## 🔗 Base Information

- **Base URL**: `{APP_URL}/api` (e.g., `http://localhost:8000/api`)
- **Authentication**: Laravel Sanctum Token-based
- **Content Type**: `application/json`
- **Rate Limiting**: 60 requests per minute per user

## 🔐 Authentication

### Getting API Token

```bash
# Login to get token
POST /api/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "password"
}

# Response
{
    "token": "1|abcdef123456...",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "user@example.com"
    }
}
```

### Using API Token

Include the token in the Authorization header:

```bash
curl -H "Authorization: Bearer 1|abcdef123456..." \
     -H "Accept: application/json" \
     https://your-domain.com/api/websites
```

## 📊 Core Endpoints

### Websites

#### List Websites
```http
GET /api/websites
```

**Query Parameters:**
- `search` - Search term for website names/domains
- `client_id` - Filter by client ID
- `status` - Filter by status (active, inactive, maintenance)
- `per_page` - Results per page (default: 15, max: 100)
- `page` - Page number

**Response:**
```json
{
    "data": [
        {
            "id": 1,
            "name": "Example Website",
            "url": "https://example.com",
            "domain_name": "example.com",
            "platform": "wordpress",
            "status": "active",
            "wordpress_version": "6.4.2",
            "last_scan": "2024-01-15T10:30:00Z",
            "client": {
                "id": 1,
                "name": "Example Client"
            }
        }
    ],
    "links": {...},
    "meta": {...}
}
```

#### Get Website Details
```http
GET /api/websites/{id}
```

#### Create Website
```http
POST /api/websites
Content-Type: application/json

{
    "name": "New Website",
    "url": "https://newsite.com",
    "client_id": 1,
    "platform": "wordpress",
    "status": "active"
}
```

#### Update Website
```http
PUT /api/websites/{id}
Content-Type: application/json

{
    "name": "Updated Website Name",
    "status": "maintenance"
}
```

#### Delete Website
```http
DELETE /api/websites/{id}
```

### Clients

#### List Clients
```http
GET /api/clients
```

**Query Parameters:**
- `search` - Search term for client names
- `per_page` - Results per page

#### Client CRUD Operations
Similar patterns to websites for GET, POST, PUT, DELETE operations.

### WordPress Scanner

#### Scan Website by URL
```http
POST /api/scanner/scan-url
Content-Type: application/json

{
    "url": "https://example.com",
    "scan_type": "full",
    "include_plugins": true,
    "include_themes": true,
    "check_vulnerabilities": true
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "url": "https://example.com",
        "wordpress_detected": true,
        "wp_version": "6.4.2",
        "theme": {
            "name": "Astra",
            "version": "4.6.0",
            "is_child": false
        },
        "plugins": [
            {
                "name": "Contact Form 7",
                "slug": "contact-form-7",
                "version": "5.8.4",
                "is_active": true,
                "vulnerabilities": []
            }
        ],
        "vulnerabilities": {
            "core": [],
            "plugins": [],
            "themes": []
        },
        "scan_metadata": {
            "scan_time": "2024-01-15T10:30:00Z",
            "duration": 12.5,
            "requests_made": 25
        }
    }
}
```

#### Scan Database Website
```http
POST /api/scanner/scan-website/{website_id}
```

#### Bulk Scan Websites
```http
POST /api/scanner/bulk-scan
Content-Type: application/json

{
    "website_ids": [1, 2, 3],
    "scan_type": "security_only"
}
```

### Scan History

#### Get Scan History
```http
GET /api/scan-history
```

**Query Parameters:**
- `website_id` - Filter by website
- `scan_type` - Filter by scan type
- `from_date` - Date range start (Y-m-d format)
- `to_date` - Date range end

#### Get Specific Scan Results
```http
GET /api/scan-history/{scan_id}
```

### Groups

#### List Website Groups
```http
GET /api/groups
```

#### Manage Group Websites
```http
POST /api/groups/{group_id}/websites
Content-Type: application/json

{
    "website_ids": [1, 2, 3]
}
```

```http
DELETE /api/groups/{group_id}/websites
Content-Type: application/json

{
    "website_ids": [2]
}
```

### Hosting Providers

#### List Hosting Providers
```http
GET /api/hosting-providers
```

#### Get Provider Statistics
```http
GET /api/hosting-providers/statistics
```

**Response:**
```json
{
    "total_providers": 15,
    "hosting_providers": 8,
    "dns_providers": 5,
    "email_providers": 3,
    "domain_providers": 4,
    "providers_with_websites": 12
}
```

## 🔍 Advanced Scanner API

### WPScan Integration

The scanner integrates with WPScan API for vulnerability detection. Ensure `WPSCAN_API_TOKEN` is configured.

#### Vulnerability Check
```http
POST /api/scanner/check-vulnerabilities
Content-Type: application/json

{
    "wordpress_version": "6.4.2",
    "plugins": [
        {"slug": "contact-form-7", "version": "5.8.4"},
        {"slug": "yoast-seo", "version": "21.8"}
    ],
    "themes": [
        {"slug": "astra", "version": "4.6.0"}
    ]
}
```

#### Plugin Database Sync
```http
POST /api/scanner/sync-plugins
```

Syncs discovered plugins with the internal plugin database.

### Scheduled Scans

#### Create Scheduled Scan
```http
POST /api/scheduled-scans
Content-Type: application/json

{
    "name": "Daily Security Scan",
    "website_ids": [1, 2, 3],
    "scan_type": "security",
    "frequency": "daily",
    "time": "02:00",
    "is_active": true
}
```

#### List Scheduled Scans
```http
GET /api/scheduled-scans
```

## 📈 Analytics & Reporting

### Dashboard Statistics
```http
GET /api/dashboard/stats
```

**Response:**
```json
{
    "total_websites": 45,
    "total_clients": 12,
    "healthy_websites": 42,
    "critical_issues": 3,
    "recent_scans": 18,
    "pending_updates": 7
}
```

### Security Overview
```http
GET /api/security/overview
```

### Performance Metrics
```http
GET /api/analytics/performance
```

**Query Parameters:**
- `website_id` - Specific website metrics
- `days` - Time period (default: 30)

## 🔧 System & Configuration

### Application Health Check
```http
GET /api/health
```

**Response:**
```json
{
    "status": "ok",
    "database": "connected",
    "wpscan_api": "configured",
    "queue": "running",
    "version": "1.10.023"
}
```

### Configuration
```http
GET /api/config
```

Returns non-sensitive configuration information.

## 📝 Webhooks & Events

### Webhook Configuration
```http
POST /api/webhooks
Content-Type: application/json

{
    "url": "https://your-app.com/webhook",
    "events": ["scan_completed", "vulnerability_found"],
    "secret": "webhook-secret-key"
}
```

### Available Events
- `scan_completed` - When a website scan finishes
- `vulnerability_found` - When new vulnerabilities are detected
- `website_updated` - When website information changes
- `client_created` - When a new client is added

### Webhook Payload Example
```json
{
    "event": "scan_completed",
    "timestamp": "2024-01-15T10:30:00Z",
    "data": {
        "website_id": 1,
        "scan_id": 123,
        "status": "completed",
        "vulnerabilities_found": 2
    },
    "signature": "sha256=..."
}
```

## 🔒 Security Considerations

### Rate Limiting
- **Global**: 1000 requests per hour per IP
- **Authenticated**: 60 requests per minute per user
- **Scanner**: 10 concurrent scans per user

### API Key Security
- Tokens expire after 30 days of inactivity
- Use HTTPS in production
- Rotate tokens regularly
- Store tokens securely (environment variables)

### CORS Configuration
Configure allowed origins in `config/cors.php`:

```php
'allowed_origins' => [
    'https://your-frontend.com',
    'https://admin-panel.com'
]
```

## 📊 Error Handling

### Standard Error Response
```json
{
    "success": false,
    "message": "Validation failed",
    "errors": {
        "url": ["The URL field is required."],
        "client_id": ["The client ID must be a valid integer."]
    },
    "code": 422
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 🧪 Testing the API

### Using cURL
```bash
# Get API token
TOKEN=$(curl -s -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

# Use token for requests
curl -H "Authorization: Bearer $TOKEN" \
     -H "Accept: application/json" \
     http://localhost:8000/api/websites
```

### Using JavaScript (Axios)
```javascript
const axios = require('axios');

// Login and get token
const response = await axios.post('http://localhost:8000/api/login', {
    email: 'admin@example.com',
    password: 'password'
});

const token = response.data.token;

// Configure axios defaults
axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
axios.defaults.headers.common['Accept'] = 'application/json';

// Make API calls
const websites = await axios.get('http://localhost:8000/api/websites');
```

### Postman Collection
Import the Postman collection from `/docs/api/Klioso_API.postman_collection.json` for easy API testing.

## 📚 SDK & Libraries

### PHP SDK (Coming Soon)
```php
use Klioso\SDK\KliosoClient;

$klioso = new KliosoClient([
    'base_url' => 'https://your-klioso-instance.com/api',
    'token' => 'your-api-token'
]);

$websites = $klioso->websites()->list();
$scanResult = $klioso->scanner()->scanUrl('https://example.com');
```

### JavaScript SDK (Coming Soon)
```javascript
import { KliosoClient } from '@klioso/sdk';

const klioso = new KliosoClient({
    baseUrl: 'https://your-klioso-instance.com/api',
    token: 'your-api-token'
});

const websites = await klioso.websites.list();
const scanResult = await klioso.scanner.scanUrl('https://example.com');
```

## 🆘 Support & Resources

- **API Issues**: [GitHub Issues](https://github.com/nathanmaster/Klioso/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/nathanmaster/Klioso/discussions)
- **API Updates**: Check the [Changelog](../../CHANGELOG.md)

---

**Last Updated**: v1.10.023 - October 22, 2025