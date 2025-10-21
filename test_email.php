<?php

require_once __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

try {
    // Test email configuration
    echo "Testing email configuration...\n";
    echo "Default mailer: " . $app->make('config')->get('mail.default') . "\n";
    echo "SMTP Host: " . $app->make('config')->get('mail.mailers.smtp.host') . "\n";
    echo "SMTP Port: " . $app->make('config')->get('mail.mailers.smtp.port') . "\n";
    
    // Try to send a simple email
    $mailer = $app->make('mailer');
    $mailer->raw('This is a test email', function ($message) {
        $message->to('test@example.com')
                ->subject('Test Email from Laravel 12');
    });
    
    echo "Email sent successfully!\n";
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    
    // Get more detailed error information
    if (method_exists($e, 'getPrevious') && $e->getPrevious()) {
        echo "Previous error: " . $e->getPrevious()->getMessage() . "\n";
    }
}
