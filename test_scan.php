<?php

require_once __DIR__ . '/vendor/autoload.php';

use App\Services\WordPressScanService;

// Create the service
$service = new WordPressScanService();

// Test with a simple WordPress site
echo "Testing WordPress scan with https://wordpress.org...\n";

try {
    $result = $service->scanWebsite('https://wordpress.org', 'plugins');
    
    echo "WordPress detected: " . ($result['wordpress_detected'] ? 'Yes' : 'No') . "\n";
    echo "WP Version: " . ($result['wp_version'] ?? 'Unknown') . "\n";
    echo "Plugins found: " . count($result['plugins']) . "\n";
    echo "Errors: " . count($result['errors']) . "\n";
    
    if (!empty($result['errors'])) {
        echo "Error details:\n";
        foreach ($result['errors'] as $error) {
            echo "  - $error\n";
        }
    }
    
} catch (Exception $e) {
    echo "Exception occurred: " . $e->getMessage() . "\n";
}

echo "Test completed.\n";
