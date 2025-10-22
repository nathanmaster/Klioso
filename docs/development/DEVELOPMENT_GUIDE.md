# Development Guide

This guide covers development workflows, coding standards, and contribution guidelines for Klioso.

## 🚀 Getting Started for Developers

### Development Environment Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/nathanmaster/Klioso.git
   cd Klioso
   ```

2. **Install Dependencies**
   ```bash
   composer install
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database Setup**
   ```bash
   php artisan migrate:fresh --seed
   ```

5. **Start Development Servers**
   ```bash
   # Terminal 1: Laravel development server
   php artisan serve
   
   # Terminal 2: Frontend build with hot reload
   npm run dev
   ```

### Development Workflow

#### Branch Strategy
- `main` - Production ready code
- `develop` - Integration branch for features
- `feature/feature-name` - Individual features
- `hotfix/issue-description` - Critical fixes

#### Creating a New Feature
```bash
# Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/new-scanner-algorithm

# Make changes and commit
git add .
git commit -m "feat: implement new scanner algorithm"

# Push and create PR
git push origin feature/new-scanner-algorithm
```

## 🏗️ Architecture Overview

### Backend Structure

```
app/
├── Console/Commands/        # Artisan commands
├── Http/
│   ├── Controllers/
│   │   └── Management/     # Main business logic controllers
│   ├── Middleware/         # Custom middleware
│   └── Requests/          # Form request validation
├── Jobs/                  # Queue jobs
├── Mail/                  # Email templates
├── Models/               # Eloquent models
├── Providers/            # Service providers
└── Services/             # Business logic services
    └── WordPressScanService.php  # Core scanning logic
```

### Frontend Structure

```
resources/js/
├── Components/           # Reusable React components
│   ├── UniversalPageLayout.jsx  # Main layout component
│   └── Forms/           # Form components
├── Layouts/             # Page layouts
├── Pages/              # Inertia.js page components
│   ├── Dashboard.jsx
│   ├── Clients/
│   ├── Websites/
│   ├── Groups/
│   └── HostingProviders/
├── Utils/              # Helper functions
└── app.jsx            # Main React application
```

### Key Components

#### UniversalPageLayout
Standardized layout component used across all major views:

```jsx
<UniversalPageLayout
    title="Page Title"
    data={items}
    columns={tableColumns}
    actions={actionButtons}
    statisticsCards={cards}
    // ... other props
/>
```

#### WordPressScanService
Core scanning functionality:

```php
class WordPressScanService
{
    public function scanWebsite($url, $scanType = 'all')
    public function detectPlugins($url)
    public function checkVulnerabilities($plugins)
    public function scanBulkWebsites($websites)
}
```

## 🎨 Coding Standards

### PHP Standards (Laravel)

#### Controller Guidelines
```php
class WebsiteController extends Controller
{
    public function index(Request $request)
    {
        // Always validate input
        $request->validate([
            'search' => 'nullable|string|max:255',
            'per_page' => 'nullable|integer|min:1|max:100'
        ]);

        // Use Eloquent relationships
        $websites = Website::with(['client', 'hostingProvider'])
            ->when($request->search, function ($query, $search) {
                return $query->where('name', 'like', "%{$search}%");
            })
            ->paginate($request->per_page ?? 15);

        return Inertia::render('Websites/Index', [
            'websites' => $websites,
            'filters' => $request->only(['search'])
        ]);
    }
}
```

#### Model Guidelines
```php
class Website extends Model
{
    protected $fillable = [
        'name', 'url', 'client_id', 'status'
    ];

    protected $casts = [
        'last_scan' => 'datetime',
        'is_active' => 'boolean'
    ];

    // Always define relationships
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    // Use scopes for common queries
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
```

### JavaScript/React Standards

#### Component Structure
```jsx
import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';

export default function ComponentName({ auth, data, filters = {} }) {
    // State declarations first
    const [loading, setLoading] = useState(false);
    
    // Event handlers
    const handleAction = (item) => {
        // Handle action logic
    };
    
    // Configuration objects
    const tableColumns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (item) => (
                <span className="font-medium">{item.name}</span>
            )
        }
    ];
    
    return (
        <>
            <Head title="Page Title" />
            <UniversalPageLayout
                // Props here
            />
        </>
    );
}
```

#### State Management Patterns
```jsx
// Use local state for component-specific data
const [isLoading, setIsLoading] = useState(false);

// Use Inertia router for navigation
const handleEdit = (item) => {
    router.visit(route('items.edit', item.id));
};

// Use forms for data submission
const handleSubmit = (data) => {
    router.post(route('items.store'), data, {
        onSuccess: () => setIsCreating(false),
        onError: (errors) => console.error(errors)
    });
};
```

### CSS/Styling Standards

#### Tailwind CSS Usage
```jsx
// Use consistent spacing
className="p-6 mb-4 space-y-4"

// Use semantic color classes
className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"

// Use responsive design
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"

// Use consistent button styles
className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
```

## 🧪 Testing Guidelines

### Running Tests

```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/WebsiteTest.php

# Run with coverage
php artisan test --coverage

# Frontend tests
npm run test
```

### Writing Tests

#### Feature Tests
```php
class WebsiteTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_view_websites()
    {
        $user = User::factory()->create();
        $websites = Website::factory(3)->create();

        $response = $this->actingAs($user)
            ->get('/websites');

        $response->assertStatus(200)
            ->assertInertia(fn (Assert $page) => 
                $page->component('Websites/Index')
                    ->has('websites.data', 3)
            );
    }

    public function test_user_can_create_website()
    {
        $user = User::factory()->create();
        $client = Client::factory()->create();

        $websiteData = [
            'name' => 'Test Website',
            'url' => 'https://test.com',
            'client_id' => $client->id,
            'platform' => 'wordpress'
        ];

        $response = $this->actingAs($user)
            ->post('/websites', $websiteData);

        $response->assertRedirect('/websites');
        $this->assertDatabaseHas('websites', $websiteData);
    }
}
```

#### Unit Tests
```php
class WordPressScanServiceTest extends TestCase
{
    public function test_can_detect_wordpress_installation()
    {
        $service = new WordPressScanService();
        
        // Mock HTTP responses
        Http::fake([
            'example.com/wp-admin' => Http::response('', 200),
            'example.com/wp-includes/js/jquery/jquery.js' => Http::response('', 200)
        ]);

        $result = $service->detectWordPress('https://example.com');

        $this->assertTrue($result);
    }
}
```

### React Component Testing

```javascript
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import WebsiteCard from '../Components/WebsiteCard';

test('renders website card with correct information', () => {
    const website = {
        id: 1,
        name: 'Test Website',
        url: 'https://test.com',
        status: 'active'
    };

    render(<WebsiteCard website={website} />);

    expect(screen.getByText('Test Website')).toBeInTheDocument();
    expect(screen.getByText('https://test.com')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
});
```

## 🔧 Code Quality Tools

### PHP Code Quality

```bash
# Format code with Laravel Pint
./vendor/bin/pint

# Static analysis with PHPStan
./vendor/bin/phpstan analyse

# Run Larastan (Laravel-specific PHPStan rules)
php artisan code:analyse
```

### JavaScript Code Quality

```bash
# ESLint for code linting
npm run lint

# Fix linting issues
npm run lint:fix

# Prettier for code formatting
npm run format
```

### Pre-commit Hooks

Set up pre-commit hooks to ensure code quality:

```bash
# Install pre-commit hooks
composer require --dev brianium/paratest
npm install --save-dev husky lint-staged

# Configure in package.json
{
    "husky": {
        "hooks": {
            "pre-commit": "lint-staged"
        }
    },
    "lint-staged": {
        "*.php": ["./vendor/bin/pint", "php artisan test"],
        "*.{js,jsx}": ["npm run lint:fix", "npm run test:ci"]
    }
}
```

## 📊 Performance Guidelines

### Database Optimization

#### Use Proper Indexing
```php
// In migrations
Schema::table('websites', function (Blueprint $table) {
    $table->index(['client_id', 'status']);
    $table->index(['domain_name']);
    $table->fullText(['name', 'description']);
});
```

#### Eager Loading
```php
// Good: Load relationships upfront
$websites = Website::with(['client', 'hostingProvider', 'plugins'])
    ->get();

// Bad: N+1 query problem
$websites = Website::all();
foreach ($websites as $website) {
    echo $website->client->name; // Triggers query for each iteration
}
```

#### Query Optimization
```php
// Use specific selects when possible
$websites = Website::select(['id', 'name', 'url', 'client_id'])
    ->with(['client:id,name'])
    ->active()
    ->limit(10)
    ->get();
```

### Frontend Optimization

#### Component Optimization
```jsx
import { memo, useMemo } from 'react';

const WebsiteList = memo(({ websites, filters }) => {
    // Memoize expensive calculations
    const filteredWebsites = useMemo(() => {
        return websites.filter(website => 
            website.name.includes(filters.search)
        );
    }, [websites, filters.search]);

    return (
        <div>
            {filteredWebsites.map(website => (
                <WebsiteCard key={website.id} website={website} />
            ))}
        </div>
    );
});
```

#### Bundle Optimization
```javascript
// Use dynamic imports for code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Wrap in Suspense
<Suspense fallback={<LoadingSpinner />}>
    <LazyComponent />
</Suspense>
```

## 🔐 Security Best Practices

### Input Validation

```php
// Always validate input
public function store(Request $request)
{
    $validated = $request->validate([
        'url' => 'required|url|max:255',
        'name' => 'required|string|max:100',
        'client_id' => 'required|exists:clients,id'
    ]);

    // Use validated data only
    Website::create($validated);
}
```

### SQL Injection Prevention

```php
// Good: Use Eloquent or parameter binding
$websites = Website::where('client_id', $clientId)->get();

// Good: Parameter binding for raw queries
$websites = DB::select('SELECT * FROM websites WHERE client_id = ?', [$clientId]);

// Bad: String concatenation
$websites = DB::select("SELECT * FROM websites WHERE client_id = {$clientId}");
```

### XSS Prevention

```jsx
// React automatically escapes content
<div>{website.name}</div> // Safe

// Be careful with dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} />
```

### CSRF Protection

```jsx
// Inertia.js automatically handles CSRF tokens
router.post('/websites', data); // CSRF token included automatically
```

## 📝 Documentation Standards

### Code Documentation

```php
/**
 * Scan a WordPress website for plugins and vulnerabilities.
 *
 * @param  string  $url  The website URL to scan
 * @param  string  $scanType  Type of scan: 'plugins', 'security', 'full'
 * @return array  Scan results including plugins and vulnerabilities
 * 
 * @throws \Exception  When URL is invalid or unreachable
 */
public function scanWebsite(string $url, string $scanType = 'full'): array
{
    // Implementation
}
```

### README Updates

When adding new features, update relevant documentation:

1. **README.md** - High-level feature description
2. **API_REFERENCE.md** - API endpoints
3. **COMPLETE_INSTALLATION_GUIDE.md** - Setup requirements
4. **CHANGELOG.md** - Version changes

## 🚀 Deployment

### Environment Preparation

```bash
# Install production dependencies
composer install --optimize-autoloader --no-dev

# Build assets
npm run build

# Cache configuration
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### Database Migration

```bash
# Run migrations in production
php artisan migrate --force

# Rollback if needed
php artisan migrate:rollback --step=1
```

### Queue Workers

```bash
# Start queue workers
php artisan queue:work --daemon --sleep=3 --tries=3

# Monitor queue status
php artisan queue:monitor
```

## 🤝 Contributing

### Contribution Workflow

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Make changes** following coding standards
4. **Write tests** for new functionality
5. **Update documentation** as needed
6. **Submit pull request** with clear description

### Pull Request Guidelines

- **Clear title**: Describe what the PR does
- **Description**: Explain why the change is needed
- **Testing**: Include test results or testing instructions
- **Breaking changes**: Clearly document any breaking changes
- **Screenshots**: Include for UI changes

### Code Review Process

All contributions go through code review:

1. **Automated checks**: CI runs tests and linting
2. **Peer review**: Another developer reviews code
3. **Maintainer approval**: Project maintainer gives final approval
4. **Merge**: Changes are merged to main branch

---

**Happy coding!** 🚀