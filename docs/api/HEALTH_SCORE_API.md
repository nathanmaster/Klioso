# Health Score API Documentation

## Overview
The Health Score API provides comprehensive website health monitoring and scoring functionality for the Klioso WordPress management system. It calculates dynamic health scores based on multiple factors including availability, performance, security, maintenance, and SEO.

## Base URL
```
/api/health-score
```

## Authentication
All Health Score API endpoints require authentication. Include your session token or use authenticated requests.

## Endpoints

### 1. Dashboard Summary
Get overall health score summary for dashboard display.

```http
GET /api/health-score/dashboard
```

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_websites": 25,
      "average_health_score": 82,
      "healthy_websites": 18,
      "critical_websites": 2,
      "critical_issues_count": 5
    },
    "distribution": {
      "excellent": 8,
      "good": 10,
      "fair": 5,
      "poor": 2
    },
    "top_recommendations": [
      "Review and patch security vulnerabilities immediately",
      "Schedule WordPress and plugin updates",
      "Optimize images, enable caching, or upgrade hosting"
    ],
    "calculated_at": "2025-10-22T15:30:00.000Z"
  }
}
```

### 2. All Websites Health Scores
Get health scores for all websites with summary statistics.

```http
GET /api/health-score/all
```

**Response:**
```json
{
  "success": true,
  "data": {
    "health_scores": [
      {
        "website_id": 1,
        "website_name": "Example.com",
        "website_url": "https://example.com",
        "overall_score": 85,
        "grade": "B",
        "status": "Good",
        "critical_issues": []
      }
    ],
    "summary": {
      "total_websites": 25,
      "average_score": 82,
      "distribution": {
        "excellent": 8,
        "good": 10,
        "fair": 5,
        "poor": 2
      },
      "healthy_websites": 18,
      "critical_websites": 2
    },
    "calculated_at": "2025-10-22T15:30:00.000Z"
  }
}
```

### 3. Individual Website Health Score
Get detailed health score for a specific website.

```http
GET /api/health-score/website/{website_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "website_id": 1,
    "website_name": "Example.com",
    "website_url": "https://example.com",
    "health_data": {
      "overall_score": 85,
      "grade": "B",
      "status": "Good",
      "components": {
        "availability": {
          "score": 95,
          "issues": []
        },
        "performance": {
          "score": 78,
          "issues": ["Moderate load time: 2.3s"]
        },
        "security": {
          "score": 90,
          "issues": []
        },
        "maintenance": {
          "score": 80,
          "issues": ["2 plugins need updates"]
        },
        "seo": {
          "score": 85,
          "issues": []
        }
      },
      "issues": [
        {
          "component": "performance",
          "issue": "Moderate load time: 2.3s",
          "severity": "medium"
        },
        {
          "component": "maintenance",
          "issue": "2 plugins need updates",
          "severity": "low"
        }
      ],
      "recommendations": [
        "Optimize images, enable caching, or upgrade hosting",
        "Schedule WordPress and plugin updates"
      ]
    },
    "calculated_at": "2025-10-22T15:30:00.000Z"
  }
}
```

### 4. Health Score Trends
Get historical health score trends for a specific website.

```http
GET /api/health-score/trends/{website_id}?days=30
```

**Parameters:**
- `days` (optional): Number of days for historical data (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "website_id": 1,
    "website_name": "Example.com",
    "period_days": 30,
    "trends": [
      {
        "date": "2025-10-22",
        "overall_score": 85,
        "availability": 95,
        "performance": 78,
        "security": 90,
        "maintenance": 80,
        "seo": 85
      },
      {
        "date": "2025-10-21",
        "overall_score": 83,
        "availability": 95,
        "performance": 75,
        "security": 90,
        "maintenance": 75,
        "seo": 85
      }
    ],
    "calculated_at": "2025-10-22T15:30:00.000Z"
  }
}
```

## Health Score Components

### 1. Availability (Weight: 30%)
- **Website Online Status**: 50 points deducted if offline
- **Uptime Percentage**: Deductions based on 30-day uptime
  - < 95%: -30 points
  - < 99%: -15 points
- **SSL Certificate**: 20 points deducted for invalid/expired SSL

### 2. Performance (Weight: 25%)
- **Load Time Scoring**:
  - > 5 seconds: -40 points
  - > 3 seconds: -25 points
  - > 2 seconds: -10 points
- **Page Size**: 15 points deducted for pages > 3MB

### 3. Security (Weight: 25%)
- **Security Vulnerabilities**:
  - Critical issues: -30 points each
  - High issues: -15 points each
  - Medium issues: -5 points each
- **Security Scan Recency**: 10 points deducted if no scan in 30 days

### 4. Maintenance (Weight: 15%)
- **WordPress Updates**: 20 points deducted if updates available
- **Plugin Updates**: Up to 30 points deducted (5 points per outdated plugin)
- **Backup Status**: 15 points deducted if no backup in 7 days

### 5. SEO (Weight: 5%)
- **SEO Score**: Direct mapping from SEO analysis
- **Optimization Issues**: Deductions for poor SEO scores

## Health Score Grading

| Score Range | Grade | Status    | Description |
|------------|-------|-----------|-------------|
| 90-100     | A     | Excellent | Outstanding website health |
| 80-89      | B     | Good      | Good health with minor issues |
| 70-79      | C     | Fair      | Moderate issues need attention |
| 60-69      | D     | Poor      | Significant problems |
| 0-59       | F     | Critical  | Immediate action required |

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `401`: Unauthorized
- `404`: Website not found
- `500`: Server error

## Usage Examples

### JavaScript Fetch API
```javascript
// Get dashboard summary
const response = await fetch('/api/health-score/dashboard');
const data = await response.json();

// Get specific website health score
const websiteResponse = await fetch('/api/health-score/website/1');
const websiteData = await websiteResponse.json();

// Get trends with custom period
const trendsResponse = await fetch('/api/health-score/trends/1?days=60');
const trendsData = await trendsResponse.json();
```

### React Component Integration
```jsx
import HealthScoreWidget from '@/Components/Dashboard/HealthScoreWidget';

// Dashboard overview
<HealthScoreWidget />

// Specific website
<HealthScoreWidget websiteId={1} showTrends={true} />
```

## Rate Limiting
- Dashboard endpoint: 60 requests per minute
- Individual website endpoints: 100 requests per minute
- Trends endpoint: 30 requests per minute

## Caching
Health scores are calculated in real-time but component scores are cached for:
- Availability: 5 minutes
- Performance: 15 minutes  
- Security: 1 hour
- Maintenance: 30 minutes
- SEO: 4 hours

## Integration Notes

1. **Real-time Updates**: Health scores reflect current website status
2. **Historical Data**: Trends require analytics data collection
3. **Customization**: Scoring weights can be adjusted per business needs
4. **Performance**: Use dashboard endpoint for overview, individual endpoints for details
5. **Error Handling**: Always check `success` field in response

## Support
For API support or questions, refer to the main Klioso documentation or contact the development team.