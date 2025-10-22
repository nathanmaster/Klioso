<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\SecurityAudit;
use App\Models\ScanHistory;
use App\Services\WordPressScanService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class SecurityScannerController extends Controller
{
    protected WordPressScanService $scanService;

    public function __construct(WordPressScanService $scanService)
    {
        $this->scanService = $scanService;
    }

    /**
     * Display the security scanner dashboard
     */
    public function index(Request $request)
    {
        // Get all websites for scanning
        $websites = Website::select('id', 'name', 'url')
            ->orderBy('name')
            ->get();

        // Calculate security overview
        $securityOverview = $this->calculateSecurityOverview();

        // Get recent security audits
        $securityAudits = SecurityAudit::with('website:id,name,url')
            ->latest('detected_at')
            ->limit(20)
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'title' => $audit->title,
                    'description' => $audit->description,
                    'severity' => $audit->severity,
                    'status' => $audit->status,
                    'detected_at' => $audit->detected_at,
                    'resolved_at' => $audit->resolved_at,
                    'website' => $audit->website,
                ];
            });

        // Get recent vulnerabilities
        $recentVulnerabilities = SecurityAudit::where('status', 'open')
            ->where('severity', 'critical')
            ->with('website:id,name,url')
            ->latest('detected_at')
            ->limit(10)
            ->get();

        return Inertia::render('SecurityScanner', [
            'websites' => $websites,
            'securityOverview' => $securityOverview,
            'securityAudits' => $securityAudits,
            'recentVulnerabilities' => $recentVulnerabilities,
        ]);
    }

    /**
     * Perform security scan on a website
     */
    public function scanWebsite(Request $request, Website $website)
    {
        try {
            // Perform comprehensive WordPress security scan
            $scanResults = $this->scanService->scanWebsite($website->url, 'security');
            
            // Store scan history
            $scanHistory = ScanHistory::create([
                'website_id' => $website->id,
                'scan_data' => $scanResults,
                'scan_type' => 'security',
                'status' => 'completed',
            ]);

            // Process and store security issues
            $vulnerabilities = $this->processSecurityResults($website, $scanResults);

            return response()->json([
                'success' => true,
                'data' => [
                    'scan_id' => $scanHistory->id,
                    'website' => $website->name,
                    'vulnerabilities' => $vulnerabilities,
                    'scan_date' => $scanHistory->created_at,
                ],
                'message' => 'Security scan completed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error("Security scan failed for website {$website->id}: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Security scan failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Perform bulk security scan
     */
    public function bulkScan(Request $request)
    {
        try {
            $websites = Website::all();
            $results = [];
            $totalVulnerabilities = 0;

            foreach ($websites as $website) {
                try {
                    $scanResults = $this->scanService->scanWebsite($website->url, 'security');
                    
                    // Store scan history
                    $scanHistory = ScanHistory::create([
                        'website_id' => $website->id,
                        'scan_data' => $scanResults,
                        'scan_type' => 'security',
                        'status' => 'completed',
                    ]);

                    // Process vulnerabilities
                    $vulnerabilities = $this->processSecurityResults($website, $scanResults);
                    $totalVulnerabilities += count($vulnerabilities);

                    $results[] = [
                        'website' => $website->name,
                        'url' => $website->url,
                        'vulnerabilities_count' => count($vulnerabilities),
                        'status' => 'completed'
                    ];

                } catch (\Exception $e) {
                    Log::error("Bulk security scan failed for website {$website->id}: " . $e->getMessage());
                    
                    $results[] = [
                        'website' => $website->name,
                        'url' => $website->url,
                        'status' => 'failed',
                        'error' => $e->getMessage()
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'total_websites' => count($websites),
                    'total_vulnerabilities' => $totalVulnerabilities,
                    'results' => $results,
                ],
                'message' => 'Bulk security scan completed'
            ]);

        } catch (\Exception $e) {
            Log::error("Bulk security scan failed: " . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Bulk security scan failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Calculate security overview statistics
     */
    private function calculateSecurityOverview(): array
    {
        $totalWebsites = Website::count();
        $criticalIssues = SecurityAudit::where('severity', 'critical')
            ->where('status', 'open')
            ->count();
        
        // Calculate average security score from latest analytics
        $averageScore = \DB::table('website_analytics')
            ->whereNotNull('security_score')
            ->avg('security_score') ?: 0;

        // Get last scan date
        $lastScan = ScanHistory::where('scan_type', 'security')
            ->latest('created_at')
            ->first();

        return [
            'total_websites' => $totalWebsites,
            'critical_issues' => $criticalIssues,
            'average_score' => round($averageScore),
            'last_scan' => $lastScan ? $lastScan->created_at->diffForHumans() : null,
        ];
    }

    /**
     * Process security scan results and create security audits
     */
    private function processSecurityResults(Website $website, array $scanResults): array
    {
        $vulnerabilities = [];

        // Extract WordPress version vulnerability
        if (isset($scanResults['wordpress']['version']) && isset($scanResults['wordpress']['vulnerabilities'])) {
            foreach ($scanResults['wordpress']['vulnerabilities'] as $vuln) {
                $audit = SecurityAudit::updateOrCreate([
                    'website_id' => $website->id,
                    'audit_type' => 'wordpress_core',
                    'affected_file' => 'wp-includes/version.php',
                ], [
                    'severity' => $this->mapSeverity($vuln['severity'] ?? 'medium'),
                    'title' => $vuln['title'] ?? 'WordPress Core Vulnerability',
                    'description' => $vuln['description'] ?? 'Outdated WordPress version detected',
                    'recommendation' => $vuln['recommendation'] ?? 'Update WordPress to the latest version',
                    'detected_at' => now(),
                    'status' => 'open',
                    'risk_score' => $vuln['risk_score'] ?? 5,
                ]);

                $vulnerabilities[] = [
                    'id' => $audit->id,
                    'title' => $audit->title,
                    'description' => $audit->description,
                    'severity' => $audit->severity,
                    'recommendation' => $audit->recommendation,
                    'type' => 'WordPress Core'
                ];
            }
        }

        // Extract plugin vulnerabilities
        if (isset($scanResults['plugins'])) {
            foreach ($scanResults['plugins'] as $pluginSlug => $pluginData) {
                if (isset($pluginData['vulnerabilities'])) {
                    foreach ($pluginData['vulnerabilities'] as $vuln) {
                        $audit = SecurityAudit::updateOrCreate([
                            'website_id' => $website->id,
                            'audit_type' => 'plugin_vulnerability',
                            'affected_file' => "wp-content/plugins/{$pluginSlug}",
                        ], [
                            'severity' => $this->mapSeverity($vuln['severity'] ?? 'medium'),
                            'title' => $vuln['title'] ?? "Plugin Vulnerability: {$pluginData['name']}",
                            'description' => $vuln['description'] ?? "Vulnerability in plugin {$pluginData['name']}",
                            'recommendation' => $vuln['recommendation'] ?? "Update {$pluginData['name']} plugin to latest version",
                            'detected_at' => now(),
                            'status' => 'open',
                            'risk_score' => $vuln['risk_score'] ?? 5,
                        ]);

                        $vulnerabilities[] = [
                            'id' => $audit->id,
                            'title' => $audit->title,
                            'description' => $audit->description,
                            'severity' => $audit->severity,
                            'recommendation' => $audit->recommendation,
                            'type' => 'Plugin'
                        ];
                    }
                }
            }
        }

        // Check for common security issues
        $commonIssues = $this->checkCommonSecurityIssues($website, $scanResults);
        foreach ($commonIssues as $issue) {
            $audit = SecurityAudit::updateOrCreate([
                'website_id' => $website->id,
                'audit_type' => $issue['type'],
                'title' => $issue['title'],
            ], [
                'severity' => $issue['severity'],
                'description' => $issue['description'],
                'recommendation' => $issue['recommendation'],
                'detected_at' => now(),
                'status' => 'open',
                'risk_score' => $issue['risk_score'],
            ]);

            $vulnerabilities[] = [
                'id' => $audit->id,
                'title' => $audit->title,
                'description' => $audit->description,
                'severity' => $audit->severity,
                'recommendation' => $audit->recommendation,
                'type' => 'Security Configuration'
            ];
        }

        return $vulnerabilities;
    }

    /**
     * Check for common WordPress security issues
     */
    private function checkCommonSecurityIssues(Website $website, array $scanResults): array
    {
        $issues = [];

        // Check if admin user exists
        if (isset($scanResults['users']) && in_array('admin', $scanResults['users'])) {
            $issues[] = [
                'type' => 'weak_username',
                'title' => 'Default Admin Username',
                'description' => 'Website uses the default "admin" username which is a security risk',
                'recommendation' => 'Change the admin username to something unique and non-obvious',
                'severity' => 'medium',
                'risk_score' => 6,
            ];
        }

        // Check for directory listing
        if (isset($scanResults['security']['directory_listing']) && $scanResults['security']['directory_listing']) {
            $issues[] = [
                'type' => 'directory_listing',
                'title' => 'Directory Listing Enabled',
                'description' => 'Directory listing is enabled, potentially exposing sensitive files',
                'recommendation' => 'Disable directory listing in web server configuration',
                'severity' => 'low',
                'risk_score' => 3,
            ];
        }

        // Check for debug mode
        if (isset($scanResults['wordpress']['debug']) && $scanResults['wordpress']['debug']) {
            $issues[] = [
                'type' => 'debug_mode',
                'title' => 'Debug Mode Enabled',
                'description' => 'WordPress debug mode is enabled in production',
                'recommendation' => 'Disable debug mode in wp-config.php',
                'severity' => 'medium',
                'risk_score' => 4,
            ];
        }

        return $issues;
    }

    /**
     * Map severity levels
     */
    private function mapSeverity(string $severity): string
    {
        $severity = strtolower($severity);
        
        if (in_array($severity, ['critical', 'high', 'medium', 'low'])) {
            return $severity;
        }
        
        // Map common alternatives
        $mapping = [
            'urgent' => 'critical',
            'important' => 'high',
            'moderate' => 'medium',
            'minor' => 'low',
            'info' => 'low',
        ];
        
        return $mapping[$severity] ?? 'medium';
    }
}