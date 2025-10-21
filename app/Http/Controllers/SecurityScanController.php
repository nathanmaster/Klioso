<?php

namespace App\Http\Controllers;

use App\Services\WPScanService;
use App\Services\WordPressScanner;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SecurityScanController extends Controller
{
    public function __construct(
        private WPScanService $wpScanService,
        private WordPressScanner $scanner
    ) {}

    /**
     * Display security scan dashboard
     */
    public function index()
    {
        $websites = Website::with(['lastScan'])
            ->where('status', 'active')
            ->get()
            ->map(function ($website) {
                $lastScan = $website->lastScan;
                return [
                    'id' => $website->id,
                    'url' => $website->url,
                    'name' => $website->name,
                    'last_scan' => $lastScan?->scan_completed_at ?? $lastScan?->created_at,
                    'scan_status' => $lastScan?->status ?? 'never_scanned',
                    'vulnerabilities_count' => $lastScan?->security_data['total_vulnerabilities'] ?? 0,
                ];
            });

        return Inertia::render('Security/SecurityDashboard', [
            'websites' => $websites,
            'apiStatus' => $this->wpScanService->getApiStatus(),
        ]);
    }

    /**
     * Perform security scan on a specific website
     */
    public function scanWebsite(Request $request, Website $website)
    {
        try {
            // Perform WordPress scan
            $scanResults = $this->scanner->scanWebsite($website->url);
            
            // Enhance with WPScan security data
            $securityReport = $this->wpScanService->performSecurityScan($scanResults);
            
            // Save scan results to database
            $website->scans()->create([
                'scan_type' => 'security_scan',
                'type' => 'security_scan',
                'status' => 'completed',
                'target' => $website->url,
                'scan_results' => $scanResults,
                'security_data' => $securityReport,
                'scan_started_at' => now(),
                'scan_completed_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Security scan completed successfully',
                'data' => [
                    'scan_results' => $scanResults,
                    'security_report' => $securityReport,
                ],
            ]);
        } catch (\Exception $e) {
            // Save failed scan
            $website->scans()->create([
                'scan_type' => 'security_scan',
                'type' => 'security_scan',
                'status' => 'failed',
                'target' => $website->url,
                'error_message' => $e->getMessage(),
                'scan_started_at' => now(),
                'scan_completed_at' => now(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Security scan failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Perform bulk security scan on multiple websites
     */
    public function bulkScan(Request $request)
    {
        $websiteIds = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
        ])['website_ids'];

        $websites = Website::whereIn('id', $websiteIds)->get();
        $results = [];

        foreach ($websites as $website) {
            try {
                $scanResults = $this->scanner->scanWebsite($website->url);
                $securityReport = $this->wpScanService->performSecurityScan($scanResults);
                
                $website->scans()->create([
                    'scan_type' => 'bulk_security_scan',
                    'type' => 'bulk_security_scan',
                    'status' => 'completed',
                    'target' => $website->url,
                    'scan_results' => $scanResults,
                    'security_data' => $securityReport,
                    'scan_started_at' => now(),
                    'scan_completed_at' => now(),
                ]);

                $results[] = [
                    'website_id' => $website->id,
                    'website_url' => $website->url,
                    'success' => true,
                    'vulnerabilities_found' => $securityReport['total_vulnerabilities'],
                    'critical_vulnerabilities' => $securityReport['severity_breakdown']['critical'],
                ];
            } catch (\Exception $e) {
                $website->scans()->create([
                    'scan_type' => 'bulk_security_scan',
                    'type' => 'bulk_security_scan',
                    'status' => 'failed',
                    'target' => $website->url,
                    'error_message' => $e->getMessage(),
                    'scan_started_at' => now(),
                    'scan_completed_at' => now(),
                ]);

                $results[] = [
                    'website_id' => $website->id,
                    'website_url' => $website->url,
                    'success' => false,
                    'error' => $e->getMessage(),
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Bulk security scan completed',
            'results' => $results,
            'summary' => [
                'total_scanned' => count($results),
                'successful_scans' => count(array_filter($results, fn($r) => $r['success'])),
                'failed_scans' => count(array_filter($results, fn($r) => !$r['success'])),
                'total_vulnerabilities' => array_sum(array_column(
                    array_filter($results, fn($r) => $r['success']), 
                    'vulnerabilities_found'
                )),
            ],
        ]);
    }

    /**
     * Get detailed vulnerability report for a website
     */
    public function getVulnerabilityReport(Website $website)
    {
        $latestScan = $website->scans()
            ->whereNotNull('security_data')
            ->latest()
            ->first();

        if (!$latestScan) {
            return response()->json([
                'success' => false,
                'message' => 'No security scan data found for this website',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'website' => [
                    'id' => $website->id,
                    'url' => $website->url,
                    'name' => $website->name,
                ],
                'scan_date' => $latestScan->scan_completed_at ?? $latestScan->created_at,
                'security_report' => $latestScan->security_data,
                'recommendations' => $this->generateSecurityRecommendations($latestScan->security_data),
            ],
        ]);
    }

    /**
     * Get WPScan API status
     */
    public function getApiStatus()
    {
        $status = $this->wpScanService->getApiStatus();
        
        return response()->json([
            'success' => !isset($status['error']),
            'data' => $status,
        ]);
    }

    /**
     * Generate security recommendations based on scan results
     */
    private function generateSecurityRecommendations($securityData)
    {
        $recommendations = [];

        // WordPress Core recommendations
        if (!empty($securityData['wordpress_vulnerabilities']['vulnerabilities'])) {
            $recommendations[] = [
                'type' => 'critical',
                'category' => 'WordPress Core',
                'title' => 'Update WordPress Core',
                'description' => 'WordPress core vulnerabilities detected. Update to the latest version immediately.',
                'action' => 'Update WordPress core to the latest stable version',
                'priority' => 'high',
            ];
        }

        // Plugin recommendations
        foreach ($securityData['plugin_vulnerabilities'] as $pluginVulns) {
            if (!empty($pluginVulns['vulnerabilities'])) {
                $recommendations[] = [
                    'type' => 'warning',
                    'category' => 'Plugin Security',
                    'title' => "Update {$pluginVulns['plugin']} Plugin",
                    'description' => "Security vulnerabilities found in {$pluginVulns['plugin']} plugin.",
                    'action' => "Update or remove the {$pluginVulns['plugin']} plugin",
                    'priority' => $this->calculatePriority($pluginVulns['vulnerabilities']),
                ];
            }
        }

        // Theme recommendations
        foreach ($securityData['theme_vulnerabilities'] as $themeVulns) {
            if (!empty($themeVulns['vulnerabilities'])) {
                $recommendations[] = [
                    'type' => 'warning',
                    'category' => 'Theme Security',
                    'title' => "Update {$themeVulns['theme']} Theme",
                    'description' => "Security vulnerabilities found in {$themeVulns['theme']} theme.",
                    'action' => "Update or change the {$themeVulns['theme']} theme",
                    'priority' => $this->calculatePriority($themeVulns['vulnerabilities']),
                ];
            }
        }

        // General security recommendations
        if ($securityData['total_vulnerabilities'] == 0) {
            $recommendations[] = [
                'type' => 'success',
                'category' => 'Security Status',
                'title' => 'No Known Vulnerabilities',
                'description' => 'No known vulnerabilities found. Continue regular security monitoring.',
                'action' => 'Schedule regular security scans',
                'priority' => 'low',
            ];
        }

        return $recommendations;
    }

    /**
     * Calculate recommendation priority based on vulnerabilities
     */
    private function calculatePriority($vulnerabilities)
    {
        $hasCritical = false;
        $hasHigh = false;

        foreach ($vulnerabilities as $vuln) {
            $severity = strtolower($vuln['severity'] ?? 'medium');
            if ($severity === 'critical') {
                $hascritical = true;
            } elseif ($severity === 'high') {
                $hasHigh = true;
            }
        }

        if ($hasCritical) {
            return 'critical';
        } elseif ($hasHigh) {
            return 'high';
        } else {
            return 'medium';
        }
    }
}
