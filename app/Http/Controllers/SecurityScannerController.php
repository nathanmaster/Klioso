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
        // Get all websites for scanning with proper relationships
        $websites = Website::with(['client:id,name'])
            ->select('id', 'name', 'domain_name', 'url', 'client_id', 'platform', 'status', 'last_scan')
            ->orderBy('domain_name')
            ->get()
            ->map(function ($website) {
                // Create a proper display name with fallbacks
                $displayName = $website->name && $website->name !== 'name' 
                    ? $website->name 
                    : ($website->domain_name 
                        ? (str_starts_with($website->domain_name, 'http') 
                            ? parse_url($website->domain_name, PHP_URL_HOST) ?? $website->domain_name
                            : $website->domain_name)
                        : ($website->url 
                            ? (str_starts_with($website->url, 'http') 
                                ? parse_url($website->url, PHP_URL_HOST) ?? $website->url
                                : $website->url)
                            : 'Website #' . $website->id));
                
                // Create display label with client info
                $displayLabel = $displayName;
                if ($website->client) {
                    $displayLabel .= " ({$website->client->name})";
                }
                
                return [
                    'id' => $website->id,
                    'name' => $website->name,
                    'domain_name' => $website->domain_name,
                    'url' => $website->url,
                    'display_name' => $displayName,
                    'display_label' => $displayLabel,
                    'platform' => $website->platform,
                    'status' => $website->status,
                    'last_scan' => $website->last_scan ? $website->last_scan->format('Y-m-d H:i:s') : null,
                    'client' => $website->client ? [
                        'id' => $website->client->id,
                        'name' => $website->client->name,
                    ] : null,
                ];
            });

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
            Log::info('Starting security scan', [
                'website_id' => $website->id,
                'website_url' => $website->url,
                'wpscan_api_configured' => !empty(config('services.wpscan.api_key'))
            ]);
            
            // Perform comprehensive WordPress security scan
            $scanResults = $this->scanService->scanWebsite($website->url, 'all');
            
            Log::info('Scan completed, processing results', [
                'website_id' => $website->id,
                'scan_keys' => array_keys($scanResults),
                'vulnerabilities_count' => isset($scanResults['vulnerabilities']) ? count($scanResults['vulnerabilities']) : 0,
                'plugins_count' => isset($scanResults['plugins']) ? count($scanResults['plugins']) : 0,
                'themes_count' => isset($scanResults['themes']) ? count($scanResults['themes']) : 0
            ]);
            
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
                    $scanResults = $this->scanService->scanWebsite($website->url, 'all');
                    
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
        
        try {
            Log::info('Processing security results', [
                'website_id' => $website->id,
                'website_name' => $website->name
            ]);

            // Generate unique scan ID for this scan session
            $scanId = 'scan_' . time() . '_' . $website->id;

            // 1. Create audit entries from all vulnerabilities
            if (isset($scanResults['vulnerabilities'])) {
                foreach ($scanResults['vulnerabilities'] as $vuln) {
                    $audit = SecurityAudit::createFromVulnerability($website->id, $vuln, $scanId);
                    $vulnerabilities[] = $this->formatAuditForResponse($audit);
                }
            }

            // 2. Process WordPress core vulnerabilities (legacy format support)
            if (isset($scanResults['wordpress']['vulnerabilities'])) {
                foreach ($scanResults['wordpress']['vulnerabilities'] as $vuln) {
                    $audit = SecurityAudit::createFromVulnerability($website->id, array_merge($vuln, [
                        'type' => 'wordpress_core'
                    ]), $scanId);
                    $vulnerabilities[] = $this->formatAuditForResponse($audit);
                }
            }

            // 3. Process plugin vulnerabilities (legacy format support)
            if (isset($scanResults['plugins'])) {
                foreach ($scanResults['plugins'] as $pluginSlug => $pluginData) {
                    if (isset($pluginData['vulnerabilities'])) {
                        foreach ($pluginData['vulnerabilities'] as $vuln) {
                            $audit = SecurityAudit::createFromVulnerability($website->id, array_merge($vuln, [
                                'type' => 'plugin',
                                'plugin_slug' => $pluginSlug
                            ]), $scanId);
                            $vulnerabilities[] = $this->formatAuditForResponse($audit);
                        }
                    }
                }
            }

            // 4. Check for common security issues
            $commonIssues = $this->checkCommonSecurityIssues($website, $scanResults);
            foreach ($commonIssues as $issue) {
                $audit = SecurityAudit::createFromVulnerability($website->id, $issue, $scanId);
                $vulnerabilities[] = $this->formatAuditForResponse($audit);
            }

            // 5. Calculate health score using the new health scoring system
            $healthData = $this->scanService->calculateHealthScore($scanResults);
            
            Log::info('Health score calculated', [
                'website_id' => $website->id,
                'health_score' => $healthData['overall_score'],
                'grade' => $healthData['grade']
            ]);

            // 6. Store comprehensive scan history with health data
            $scanHistory = ScanHistory::create([
                'website_id' => $website->id,
                'scan_data' => array_merge($scanResults, [
                    'health_data' => $healthData,
                    'scan_metadata' => [
                        'scan_id' => $scanId,
                        'scan_timestamp' => now()->toISOString(),
                        'scan_duration' => $scanResults['scan_duration'] ?? null,
                        'total_vulnerabilities' => count($vulnerabilities),
                        'wpscan_enabled' => !empty(config('services.wpscan.api_key')),
                        'scan_scope' => $scanResults['scan_scope'] ?? 'security'
                    ]
                ]),
                'scan_type' => 'security',
                'status' => 'completed',
            ]);

            // 7. Update website health score and security info
            $website->update([
                'last_scan' => now(),
                'health_score' => $healthData['overall_score'],
                'security_grade' => $healthData['grade'],
                'risk_level' => $healthData['risk_level']
            ]);

            // 8. Store health score impact in audit metadata
            foreach ($vulnerabilities as $index => $vuln) {
                if (isset($vuln['audit_id'])) {
                    $audit = SecurityAudit::find($vuln['audit_id']);
                    if ($audit) {
                        $metadata = $audit->metadata ?? [];
                        $metadata['health_impact'] = $this->calculateHealthImpact($audit, $healthData);
                        $metadata['scan_session'] = $scanId;
                        $audit->update(['metadata' => $metadata]);
                    }
                }
            }

            Log::info('Security scan processing completed', [
                'website_id' => $website->id,
                'vulnerabilities_count' => count($vulnerabilities),
                'health_score' => $healthData['overall_score'],
                'scan_id' => $scanId
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to process security results', [
                'website_id' => $website->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }

        return $vulnerabilities;
    }

    /**
     * Format audit for response
     */
    private function formatAuditForResponse($audit)
    {
        return [
            'audit_id' => $audit->id,
            'id' => $audit->id,
            'title' => $audit->title,
            'description' => $audit->description,
            'severity' => $audit->severity,
            'recommendation' => $audit->recommendation,
            'type' => ucwords(str_replace('_', ' ', $audit->audit_type)),
            'risk_score' => $audit->risk_score,
            'source' => $audit->source,
            'cve_id' => $audit->cve_id,
            'detected_at' => $audit->detected_at,
            'status' => $audit->status
        ];
    }

    /**
     * Calculate health impact of a specific vulnerability
     */
    private function calculateHealthImpact($audit, $healthData)
    {
        $impact = 'low';
        
        // Determine impact based on severity and component affected
        if ($audit->severity === 'critical') {
            $impact = 'critical';
        } elseif ($audit->severity === 'high') {
            $impact = 'high';
        } elseif ($audit->severity === 'medium') {
            $impact = 'medium';
        }

        // Additional factors
        $factors = [];
        if ($audit->audit_type === 'wordpress_core') {
            $factors[] = 'core_system';
        }
        if ($audit->exploitable) {
            $factors[] = 'exploitable';
        }
        if ($audit->risk_score > 70) {
            $factors[] = 'high_risk_score';
        }

        return [
            'impact_level' => $impact,
            'contributing_factors' => $factors,
            'health_deduction' => $this->calculateHealthDeduction($audit),
            'component_affected' => $this->getComponentFromAuditType($audit->audit_type)
        ];
    }

    /**
     * Calculate health score deduction for an audit
     */
    private function calculateHealthDeduction($audit)
    {
        $deduction = match($audit->severity) {
            'critical' => 25,
            'high' => 15,
            'medium' => 8,
            'low' => 3,
            default => 5
        };

        // Increase deduction for exploitable vulnerabilities
        if ($audit->exploitable) {
            $deduction *= 1.5;
        }

        return round($deduction, 1);
    }

    /**
     * Get component name from audit type
     */
    private function getComponentFromAuditType($auditType)
    {
        return match($auditType) {
            'wordpress_core' => 'core',
            'plugin_vulnerability', 'plugin' => 'plugins',
            'theme_vulnerability', 'theme' => 'themes',
            'config_backup_exposed', 'debug_enabled', 'directory_listing' => 'configuration',
            default => 'security'
        };
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