# WordPress Management System

[![Laravel](https://img.shields.io/badge/Laravel-v12.x-red.svg)](https://laravel.com)
[![PHP](https://img.shields.io/badge/PHP-8.2+-blue.svg)](https://php.net)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-v2.0-purple.svg)](https://inertiajs.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3.x-blue.svg)](https://tailwindcss.com)

> A comprehensive Laravel-based management system for WordPress websites, clients, hosting providers, and plugin tracking with advanced WordPress scanning capabilities.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Key Components](#key-components)
- [WordPress Scanner](#wordpress-scanner)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Known Issues](#known-issues)
- [Future Implementations](#future-implementations)
- [Contributing](#contributing)
- [License](#license)

## 🎯 About

This WordPress Management System is a comprehensive internal tool designed for agencies, developers, and WordPress professionals who manage multiple websites and clients. The system provides a centralized platform to track clients, hosting providers, websites, plugins, and perform automated WordPress scans for security and maintenance purposes.

### Core Philosophy

The primary goal is to create a **single source of truth** for all client, website, and operational data. This system serves as an internal administrative tool that emphasizes:

- **Security**: Secure authentication and data protection
- **Clarity**: Clean, intuitive interface with comprehensive data visualization
- **Extensibility**: Modular architecture for easy feature expansion
- **Efficiency**: Automated scanning and data synchronization

## ✨ Features

### 🏢 Client Management
- Complete client information tracking (contact details, company info, addresses)
- Client-website relationship management
- Notes and communication history

### 🌐 Website Management
- Domain tracking and status monitoring
- Platform identification (WordPress, custom, etc.)
- DNS provider information
- Hosting provider relationships
- Plugin installation tracking with version control

### 🔌 Plugin Management
- Comprehensive plugin database with version tracking
- Paid vs free plugin classification
- Installation source tracking (WordPress Repository, GitHub, custom)
- Plugin-website relationship management

### 🏗️ Hosting Provider Management
- Complete hosting provider information
- Contact details and login URLs
- Service tracking and notes

### 📄 Template Management
- Website template tracking and categorization
- Template-website relationships

### 🔍 WordPress Scanner ⭐
**Advanced WordPress website scanning capabilities:**

- **URL-based scanning**: Scan any WordPress website by URL
- **Database website scanning**: Scan websites already in your database
- **Plugin detection**: Identify installed plugins with version information
- **Theme detection**: Discover active and inactive themes
- **WordPress version detection**: Identify WordPress core version
- **Security vulnerability scanning**: Check for known security issues
- **Automated plugin database integration**: Automatically match discovered plugins with your database
- **Real-time results**: Live scanning with progress indicators

## 🛠️ Technology Stack

### Backend
- **Laravel 12+**: Modern PHP framework with robust features
- **PHP 8.2+**: Latest PHP with performance improvements
- **MySQL 8+**: Reliable database with JSON support
- **Laravel Sanctum**: API authentication
- **Eloquent ORM**: Database relationships and migrations

### Frontend
- **Inertia.js v2.0**: Modern SPA experience without API complexity
- **React 18**: Component-based UI with hooks
- **Tailwind CSS v3**: Utility-first CSS framework
- **Headless UI**: Accessible component library
- **Vite**: Fast build tool and development server

### Development Tools
- **Laravel Breeze**: Authentication scaffolding
- **Pest**: Modern PHP testing framework
- **Laravel Pint**: Code formatting
- **Ziggy**: Laravel route handling in JavaScript

## 🚀 Quick Start

### Prerequisites
- PHP 8.2 or higher
- Composer
- Node.js 18+ and npm
- MySQL 8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nathanmaster/laravel12.git
   cd laravel12
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Configure database**
   ```bash
   # Edit .env file with your database credentials
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=laravel12
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   ```

6. **Run migrations**
   ```bash
   php artisan migrate
   ```

7. **Seed the database (optional)**
   ```bash
   php artisan db:seed
   ```

8. **Build assets**
   ```bash
   npm run build
   # Or for development
   npm run dev
   ```

9. **Start the development server**
   ```bash
   php artisan serve
   ```

10. **Access the application**
    - Open your browser to `http://localhost:8000`
    - Register a new account or login

## 📁 Project Structure

```
laravel12/
├── app/
│   ├── Http/Controllers/           # API and web controllers
│   │   ├── ClientController.php
│   │   ├── WebsiteController.php
│   │   ├── PluginController.php
│   │   ├── WordPressScanController.php
│   │   └── ...
│   ├── Models/                     # Eloquent models
│   │   ├── Client.php
│   │   ├── Website.php
│   │   ├── Plugin.php
│   │   ├── WebsiteScan.php
│   │   └── ...
│   └── Services/                   # Business logic services
│       └── WordPressScanService.php
├── database/
│   ├── migrations/                 # Database migrations
│   └── seeders/                    # Database seeders
├── resources/
│   ├── js/
│   │   ├── Components/             # Reusable React components
│   │   ├── Layouts/                # Page layouts
│   │   └── Pages/                  # Inertia.js pages
│   │       ├── Clients/
│   │       ├── Websites/
│   │       ├── Plugins/
│   │       └── Scanner/
│   └── views/                      # Blade templates
├── routes/
│   ├── web.php                     # Web routes
│   └── api.php                     # API routes
└── storage/
    └── logs/                       # Application logs
```

## 🔧 Key Components

### Models & Relationships

```php
// Client Model
class Client extends Model {
    // Has many websites
    public function websites() {
        return $this->hasMany(Website::class);
    }
}

// Website Model  
class Website extends Model {
    // Belongs to client and hosting provider
    public function client() {
        return $this->belongsTo(Client::class);
    }
    
    // Many-to-many with plugins
    public function plugins() {
        return $this->belongsToMany(Plugin::class, 'website_plugin')
            ->withPivot('version', 'is_active')
            ->withTimestamps();
    }
}

// Plugin Model
class Plugin extends Model {
    // Many-to-many with websites
    public function websites() {
        return $this->belongsToMany(Website::class, 'website_plugin');
    }
}
```

### WordPress Scanner Service

The `WordPressScanService` is the core component for WordPress website analysis:

```php
class WordPressScanService {
    // Main scanning method
    public function scanWebsite($url, $scanType = 'plugins');
    
    // Detection methods
    protected function detectWordPress($url);
    protected function scanPlugins($url);
    protected function scanThemes($url);
    protected function getWordPressVersion($url);
}
```

### React Components

Key frontend components built with React and Tailwind CSS:

- **TableLayout**: Reusable data table with search, filtering, and pagination
- **Form Components**: Consistent form inputs with validation
- **Scanner Interface**: Real-time WordPress scanning with progress indicators
- **DeleteButton**: Confirmable delete actions with user feedback

## 🔍 WordPress Scanner

### Features
- **Multi-method detection**: HTML parsing, README.txt analysis, common plugin path checking
- **Real-time scanning**: Live progress updates and results
- **Database integration**: Automatic plugin matching and synchronization
- **Comprehensive results**: Plugins, themes, WordPress version, and security insights

### Scanning Methods

1. **WordPress Detection**
   - Common WordPress indicators in HTML
   - wp-admin accessibility check
   - wp-json API endpoint detection

2. **Plugin Detection**
   - HTML source parsing for `/wp-content/plugins/` references
   - README.txt file analysis for version and description
   - Common plugin path testing

3. **Theme Detection**
   - HTML source scanning for `/wp-content/themes/` references
   - Active theme identification

### Usage Examples

```javascript
// Scan a custom URL
const response = await fetch('/scan', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
        url: 'https://example.com',
        scan_type: 'plugins'
    })
});

// Scan a database website
const response = await fetch(`/websites/${websiteId}/scan`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken,
    },
    body: JSON.stringify({
        scan_type: 'all',
        auto_sync: true
    })
});
```

## 🗄️ Database Schema

### Core Tables

- **clients**: Client information and contact details
- **hosting_providers**: Hosting company information
- **websites**: Website details and relationships
- **plugins**: Plugin information and metadata
- **templates**: Website template information
- **website_plugin**: Many-to-many relationship (websites ↔ plugins)
- **website_scans**: WordPress scan results and history

### Key Relationships

```sql
-- Website belongs to client and hosting provider
websites.client_id → clients.id
websites.hosting_provider_id → hosting_providers.id

-- Many-to-many: websites and plugins
website_plugin.website_id → websites.id
website_plugin.plugin_id → plugins.id

-- Scan results linked to scanned URLs
website_scans.url (indexed for quick lookups)
```

## 📚 API Documentation

### REST Endpoints

```
GET    /clients                    # List all clients
POST   /clients                    # Create new client
GET    /clients/{id}               # Show client details
PUT    /clients/{id}               # Update client
DELETE /clients/{id}               # Delete client

GET    /websites                   # List all websites
POST   /websites                   # Create new website
GET    /websites/{id}              # Show website details
PUT    /websites/{id}              # Update website
DELETE /websites/{id}              # Delete website

GET    /plugins                    # List all plugins
POST   /plugins                    # Create new plugin
GET    /plugins/{id}               # Show plugin details
PUT    /plugins/{id}               # Update plugin
DELETE /plugins/{id}               # Delete plugin

# Website-Plugin relationships
POST   /websites/{id}/plugins      # Attach plugin to website
PUT    /websites/{id}/plugins/{plugin} # Update plugin on website
DELETE /websites/{id}/plugins/{plugin} # Remove plugin from website

# WordPress Scanner
GET    /scanner                    # Scanner interface
POST   /scan                       # Scan custom URL
POST   /websites/{id}/scan         # Scan database website
POST   /scanner/add-plugin         # Add discovered plugin to database
```

### Response Format

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
    "scan_type": "plugins",
    "scanned_at": "2025-01-23T10:30:00Z"
  }
}
```

## ⚠️ Known Issues

### Current Limitations

1. **WordPress Scanner**
   - Limited to publicly accessible information only
   - Cannot detect heavily obfuscated or custom plugin structures
   - Rate limiting may affect large-scale scanning operations
   - Some WordPress sites with security plugins may block scanning attempts

2. **Database Performance**
   - Large datasets (1000+ websites) may experience slower query performance
   - Search functionality could benefit from full-text indexing
   - Bulk operations on website-plugin relationships need optimization

3. **UI/UX**
   - Mobile responsiveness needs improvement on complex data tables
   - Real-time updates require manual page refresh in some scenarios
   - Limited keyboard navigation support

4. **Security**
   - CORS configuration requires manual setup for different environments
   - File upload functionality not yet implemented for client documents
   - API rate limiting not implemented

### Browser Compatibility

- **Fully Supported**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Partial Support**: Internet Explorer 11 (limited functionality)

## 🚀 Future Implementations

### Planned Features

#### Phase 1: Enhanced WordPress Integration
- [ ] **WPScan API Integration**: Connect with WPScan vulnerability database
- [ ] **WordPress CLI Integration**: Direct WordPress management via WP-CLI
- [ ] **Automated Updates**: Schedule and manage WordPress core and plugin updates
- [ ] **Backup Integration**: Connect with backup services (UpdraftPlus, BackupBuddy)

#### Phase 2: Advanced Analytics
- [ ] **Performance Monitoring**: Website speed and uptime tracking
- [ ] **Security Scanning**: Automated malware and vulnerability detection
- [ ] **SEO Analysis**: Basic SEO health checks and recommendations
- [ ] **Analytics Dashboard**: Visual reports and trends

#### Phase 3: Client Portal
- [ ] **Client Access**: Dedicated client login with limited website access
- [ ] **Maintenance Reports**: Automated client reporting
- [ ] **Ticket System**: Support request management
- [ ] **Billing Integration**: Connect with invoicing systems

#### Phase 4: Advanced Features
- [ ] **Multi-tenancy**: Support for multiple agencies/organizations
- [ ] **API Webhooks**: Real-time notifications and integrations
- [ ] **Mobile App**: React Native mobile application
- [ ] **Bulk Operations**: Mass website management tools

### Technical Improvements

#### Performance Optimizations
- [ ] **Database Indexing**: Optimize query performance for large datasets
- [ ] **Caching Strategy**: Implement Redis for frequently accessed data
- [ ] **Queue System**: Background processing for long-running tasks
- [ ] **CDN Integration**: Asset optimization and delivery

#### Developer Experience
- [ ] **API Documentation**: OpenAPI/Swagger documentation
- [ ] **Testing Suite**: Comprehensive unit and feature tests
- [ ] **Docker Support**: Containerized development environment
- [ ] **CI/CD Pipeline**: Automated testing and deployment

#### Security Enhancements
- [ ] **Two-Factor Authentication**: Enhanced security for admin accounts
- [ ] **Role-Based Permissions**: Granular access control
- [ ] **Audit Logging**: Track all system changes and access
- [ ] **Rate Limiting**: API request throttling

## 🧪 Development & Testing

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test suite
php artisan test --testsuite=Feature

# Run with coverage
php artisan test --coverage

# Frontend tests
npm run test
```

### Code Quality

```bash
# Format code
./vendor/bin/pint

# Static analysis
./vendor/bin/phpstan analyse

# Frontend linting
npm run lint
```

### Development Commands

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Clear caches
php artisan config:clear
php artisan cache:clear
php artisan view:clear

# Generate IDE helpers
php artisan ide-helper:generate
php artisan ide-helper:models
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Follow coding standards**: Use Laravel Pint for PHP, ESLint for JavaScript
4. **Write tests**: Include unit and feature tests for new functionality
5. **Update documentation**: Keep README and inline docs current
6. **Submit a pull request**: Describe your changes and their benefits

### Contribution Areas

- **WordPress Scanner Improvements**: New detection methods, vulnerability databases
- **UI/UX Enhancements**: Better responsive design, accessibility improvements
- **Performance Optimizations**: Database queries, caching strategies
- **Security Features**: Enhanced authentication, permission systems
- **Documentation**: Code examples, tutorials, API documentation

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🙏 Acknowledgments

- **Laravel Community**: For the excellent framework and ecosystem
- **Inertia.js Team**: For bridging the gap between backend and frontend
- **Tailwind CSS**: For the utility-first CSS framework
- **React Team**: For the powerful UI library
- **WordPress Community**: For the inspiration and platform insights

## 📞 Support

For support, questions, or feature requests:

- **Issues**: [GitHub Issues](https://github.com/nathanmaster/laravel12/issues)
- **Discussions**: [GitHub Discussions](https://github.com/nathanmaster/laravel12/discussions)
- **Documentation**: Check the `/docs` folder and inline code comments

---

**Built with ❤️ using Laravel, React, and modern web technologies.**
