<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;

use App\Mail\TestEmail;
use App\Mail\SecurityAlertEmail;
use App\Models\Website;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class EmailTestController extends Controller
{
    /**
     * Show the email testing dashboard
     */
    public function index()
    {
        $mailConfig = [
            'mailer' => config('mail.default'),
            'host' => config('mail.mailers.smtp.host'),
            'port' => config('mail.mailers.smtp.port'),
            'from_address' => config('mail.from.address'),
            'from_name' => config('mail.from.name'),
            'environment' => app()->environment(),
            'mailpit_url' => app()->environment('local') ? 'http://localhost:8025' : null,
        ];

        return Inertia::render('EmailTest/Index', [
            'auth' => [
                'user' => auth()->user()
            ],
            'mailConfig' => $mailConfig,
            'websites' => Website::select('id', 'domain_name')->get(),
        ]);
    }

    /**
     * Send a test email
     */
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:basic,security',
            'website_id' => 'required_if:type,security|exists:websites,id'
        ]);

        try {
            $successMessage = 'Test email sent successfully!';
            
            if ($request->type === 'basic') {
                $testData = [
                    'title' => 'Klioso Email Test - Basic',
                    'message' => 'This is a basic test email to verify your email configuration.',
                    'timestamp' => now()->format('Y-m-d H:i:s'),
                    'recipient' => $request->email,
                    'environment' => app()->environment(),
                    'server_time' => now()->toDateTimeString(),
                ];

                Mail::to($request->email)->send(new TestEmail($testData));
                
                if (app()->environment('local')) {
                    $successMessage .= ' Check Mailpit at http://localhost:8025';
                } else {
                    $successMessage .= ' Email sent to: ' . $request->email;
                }
                
                return back()->with('success', $successMessage);
            } 
            
            if ($request->type === 'security') {
                $website = Website::findOrFail($request->website_id);
                
                $alertData = [
                    'severity' => 'high',
                    'description' => 'TEST ALERT: Suspicious file upload detected in wp-content/uploads/',
                    'affected_files' => ['test-malicious-script.php', 'test-backdoor.txt'],
                    'recommendation' => 'This is a test security alert. No action required.',
                    'website' => $website->domain_name,
                    'timestamp' => now()->toDateTimeString(),
                ];

                Mail::to($request->email)->send(new SecurityAlertEmail($website, 'TEST: Malicious File Upload Detected', $alertData));
                
                if (app()->environment('local')) {
                    $successMessage .= ' Check Mailpit at http://localhost:8025';
                } else {
                    $successMessage .= ' Security alert sent to: ' . $request->email;
                }
                
                return back()->with('success', $successMessage);
            }

        } catch (\Exception $e) {
            \Log::error('Email test failed', [
                'email' => $request->email,
                'type' => $request->type,
                'error' => $e->getMessage()
            ]);
            
            return back()->with('error', 'Failed to send email: ' . $e->getMessage());
        }
    }

    /**
     * Test email configuration
     */
    public function testConfig()
    {
        try {
            $config = [
                'mail_driver' => config('mail.default'),
                'smtp_host' => config('mail.mailers.smtp.host'),
                'smtp_port' => config('mail.mailers.smtp.port'),
                'from_address' => config('mail.from.address'),
                'from_name' => config('mail.from.name'),
                'encryption' => config('mail.mailers.smtp.encryption'),
            ];

            // Test email configuration by attempting to send a test email
            // This is more reliable than trying to create transports directly
            try {
                Mail::to('test@example.com')->send(new TestEmail([
                    'title' => 'Configuration Test',
                    'message' => 'This is a configuration test email.',
                    'timestamp' => now()->format('Y-m-d H:i:s')
                ]));
                
                $testResult = 'Email sending test passed';
            } catch (\Exception $mailError) {
                $testResult = 'Email sending test failed: ' . $mailError->getMessage();
            }
            
            return response()->json([
                'status' => 'success',
                'message' => 'Email configuration loaded successfully',
                'config' => $config,
                'test_result' => $testResult,
                'mailpit_url' => app()->environment('local') ? 'http://localhost:8025' : null,
                'environment' => app()->environment()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email configuration error: ' . $e->getMessage(),
                'suggestion' => app()->environment('local') ? 'Make sure Mailpit is running on port 1025' : 'Check your SMTP configuration',
                'error_details' => [
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                ]
            ], 500);
        }
    }

    /**
     * Send bulk test emails (for load testing)
     */
    public function sendBulkTest(Request $request)
    {
        $request->validate([
            'count' => 'required|integer|min:1|max:50',
            'email' => 'required|email'
        ]);

        try {
            $count = $request->count;
            $sent = 0;

            for ($i = 1; $i <= $count; $i++) {
                $testData = [
                    'title' => "Klioso Bulk Test Email #{$i}",
                    'message' => "This is bulk test email #{$i} of {$count} for load testing.",
                    'timestamp' => now()->format('Y-m-d H:i:s'),
                    'batch_info' => "Email {$i} of {$count}"
                ];

                Mail::to($request->email)->send(new TestEmail($testData));
                $sent++;
                
                // Small delay to prevent overwhelming
                usleep(100000); // 0.1 second
            }

            return back()->with('success', "Successfully sent {$sent} test emails! Check Mailpit for all emails.");

        } catch (\Exception $e) {
            return back()->with('error', 'Bulk email test failed: ' . $e->getMessage());
        }
    }
}
