<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Feature Flags
    |--------------------------------------------------------------------------
    |
    | This file contains feature flags that can be toggled on/off for
    | different environments. Set to false to disable features in production.
    | 
    | In development (local/dev), all features are enabled by default.
    | In production, only stable features are enabled by default.
    |
    */

    // Development environment check
    'is_dev' => in_array(env('APP_ENV'), ['local', 'development', 'dev']),

    // Core Features (should always be enabled)
    'core' => [
        'client_management' => env('FEATURE_CLIENT_MANAGEMENT', true),
        'website_management' => env('FEATURE_WEBSITE_MANAGEMENT', true),
        'plugin_management' => env('FEATURE_PLUGIN_MANAGEMENT', true),
        'hosting_providers' => env('FEATURE_HOSTING_PROVIDERS', true),
    ],

    // Scanner Features (can be disabled in production if unstable)
    'scanner' => [
        'wordpress_scanner' => env('FEATURE_WORDPRESS_SCANNER', true),
        'bulk_scanning' => env('FEATURE_BULK_SCANNING', true),
        'vulnerability_scanning' => env('FEATURE_VULNERABILITY_SCANNING', true),
        'automated_scanning' => env('FEATURE_AUTOMATED_SCANNING', in_array(env('APP_ENV'), ['local', 'development', 'dev'])), // Enabled in dev
        'security_dashboard' => env('FEATURE_SECURITY_DASHBOARD', true),
    ],

    // Advanced Features (experimental/beta - enabled in development)
    'advanced' => [
        'template_management' => env('FEATURE_TEMPLATE_MANAGEMENT', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
        'advanced_analytics' => env('FEATURE_ADVANCED_ANALYTICS', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
        'api_access' => env('FEATURE_API_ACCESS', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
        'multi_tenant' => env('FEATURE_MULTI_TENANT', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
        'custom_reports' => env('FEATURE_CUSTOM_REPORTS', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
    ],

    // UI Features
    'ui' => [
        'dark_mode' => env('FEATURE_DARK_MODE', true),
        'advanced_search' => env('FEATURE_ADVANCED_SEARCH', true),
        'bulk_actions' => env('FEATURE_BULK_ACTIONS', true),
        'export_data' => env('FEATURE_EXPORT_DATA', true),
    ],

    // Development/Debug Features (enabled only in development)
    'debug' => [
        'debug_toolbar' => env('FEATURE_DEBUG_TOOLBAR', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
        'query_logging' => env('FEATURE_QUERY_LOGGING', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
        'test_endpoints' => env('FEATURE_TEST_ENDPOINTS', in_array(env('APP_ENV'), ['local', 'development', 'dev'])),
    ],
];