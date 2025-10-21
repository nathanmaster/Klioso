<?php

namespace App\Console\Commands;

use App\Services\WPScanService;
use App\Models\Website;
use App\Services\WordPressScanner;
use Illuminate\Console\Command;

class WPScanSecurityCheck extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'wpscan:security-check 
                            {website? : The website ID to scan}
                            {--all : Scan all websites}
                            {--status : Check WPScan API status}';

    /**
     * The console command description.
     */
    protected $description = 'Perform security vulnerability checks using WPScan API';

    /**
     * Execute the console command.
     */
    public function handle(WPScanService $wpScanService, WordPressScanner $scanner)
    {
        if ($this->option('status')) {
            return $this->showApiStatus($wpScanService);
        }

        if ($this->option('all')) {
            return $this->scanAllWebsites($wpScanService, $scanner);
        }

        $websiteId = $this->argument('website');
        if (!$websiteId) {
            $this->error('Please provide a website ID or use --all flag');
            return Command::FAILURE;
        }

        return $this->scanSingleWebsite($websiteId, $wpScanService, $scanner);
    }

    /**
     * Show WPScan API status
     */
    private function showApiStatus(WPScanService $wpScanService)
    {
        $this->info('Checking WPScan API status...');
        
        $status = $wpScanService->getApiStatus();
        
        if (isset($status['error'])) {
            $this->error('API Status Error: ' . $status['error']);
            return Command::FAILURE;
        }

        $this->info('WPScan API Status:');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Requests Remaining', $status['requests_remaining'] ?? 'Unknown'],
                ['Plan', $status['plan'] ?? 'Unknown'],
                ['Start Date', $status['start_date'] ?? 'Unknown'],
                ['End Date', $status['end_date'] ?? 'Unknown'],
            ]
        );

        return Command::SUCCESS;
    }

    /**
     * Scan all websites
     */
    private function scanAllWebsites(WPScanService $wpScanService, WordPressScanner $scanner)
    {
        $websites = Website::where('status', 'active')->get();
        
        if ($websites->isEmpty()) {
            $this->warn('No active websites found to scan.');
            return Command::SUCCESS;
        }

        $this->info("Found {$websites->count()} active websites to scan.");
        
        $progressBar = $this->output->createProgressBar($websites->count());
        $progressBar->start();

        $results = [];
        
        foreach ($websites as $website) {
            $result = $this->performSecurityScan($website, $wpScanService, $scanner);
            $results[] = $result;
            $progressBar->advance();
        }

        $progressBar->finish();
        $this->newLine(2);

        $this->displayScanResults($results);
        return Command::SUCCESS;
    }

    /**
     * Scan a single website
     */
    private function scanSingleWebsite($websiteId, WPScanService $wpScanService, WordPressScanner $scanner)
    {
        $website = Website::find($websiteId);
        
        if (!$website) {
            $this->error("Website with ID {$websiteId} not found.");
            return Command::FAILURE;
        }

        $this->info("Scanning website: {$website->url}");
        
        $result = $this->performSecurityScan($website, $wpScanService, $scanner);
        $this->displayScanResults([$result]);

        return Command::SUCCESS;
    }

    /**
     * Perform security scan on a website
     */
    private function performSecurityScan($website, WPScanService $wpScanService, WordPressScanner $scanner)
    {
        try {
            // First, perform standard WordPress scan
            $this->line("Scanning {$website->url}...");
            $scanResults = $scanner->scanWebsite($website->url);
            
            // Then, enhance with WPScan security data
            $securityReport = $wpScanService->performSecurityScan($scanResults);
            
            return [
                'website' => $website,
                'scan_successful' => true,
                'scan_results' => $scanResults,
                'security_report' => $securityReport,
                'error' => null,
            ];
        } catch (\Exception $e) {
            return [
                'website' => $website,
                'scan_successful' => false,
                'scan_results' => null,
                'security_report' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Display scan results in a formatted table
     */
    private function displayScanResults($results)
    {
        $tableData = [];
        
        foreach ($results as $result) {
            $website = $result['website'];
            
            if (!$result['scan_successful']) {
                $tableData[] = [
                    $website->url,
                    'FAILED',
                    $result['error'],
                    '-',
                    '-',
                    '-',
                ];
                continue;
            }

            $securityReport = $result['security_report'];
            $totalVulns = $securityReport['total_vulnerabilities'];
            $critical = $securityReport['severity_breakdown']['critical'];
            $high = $securityReport['severity_breakdown']['high'];
            
            $status = $totalVulns > 0 ? 'VULNERABILITIES FOUND' : 'SECURE';
            $riskLevel = $this->calculateRiskLevel($securityReport['severity_breakdown']);
            
            $tableData[] = [
                $website->url,
                $status,
                $totalVulns,
                $critical,
                $high,
                $riskLevel,
            ];
        }

        $this->table(
            ['Website', 'Status', 'Total Vulns', 'Critical', 'High', 'Risk Level'],
            $tableData
        );

        // Show detailed vulnerabilities for critical/high severity
        foreach ($results as $result) {
            if ($result['scan_successful'] && $result['security_report']['total_vulnerabilities'] > 0) {
                $this->showDetailedVulnerabilities($result);
            }
        }
    }

    /**
     * Show detailed vulnerability information
     */
    private function showDetailedVulnerabilities($result)
    {
        $website = $result['website'];
        $securityReport = $result['security_report'];
        
        $this->newLine();
        $this->info("Detailed Vulnerabilities for: {$website->url}");
        $this->line(str_repeat('=', 50));

        // WordPress Core Vulnerabilities
        if (!empty($securityReport['wordpress_vulnerabilities']['vulnerabilities'])) {
            $this->warn('WordPress Core Vulnerabilities:');
            foreach ($securityReport['wordpress_vulnerabilities']['vulnerabilities'] as $vuln) {
                $this->line("  • {$vuln['title']} ({$vuln['severity'] ?? 'Unknown'})");
            }
            $this->newLine();
        }

        // Plugin Vulnerabilities
        foreach ($securityReport['plugin_vulnerabilities'] as $pluginVulns) {
            if (!empty($pluginVulns['vulnerabilities'])) {
                $this->warn("Plugin Vulnerabilities ({$pluginVulns['plugin']}):");
                foreach ($pluginVulns['vulnerabilities'] as $vuln) {
                    $this->line("  • {$vuln['title']} ({$vuln['severity'] ?? 'Unknown'})");
                }
                $this->newLine();
            }
        }

        // Theme Vulnerabilities
        foreach ($securityReport['theme_vulnerabilities'] as $themeVulns) {
            if (!empty($themeVulns['vulnerabilities'])) {
                $this->warn("Theme Vulnerabilities ({$themeVulns['theme']}):");
                foreach ($themeVulns['vulnerabilities'] as $vuln) {
                    $this->line("  • {$vuln['title']} ({$vuln['severity'] ?? 'Unknown'})");
                }
                $this->newLine();
            }
        }
    }

    /**
     * Calculate overall risk level
     */
    private function calculateRiskLevel($severityBreakdown)
    {
        if ($severityBreakdown['critical'] > 0) {
            return 'CRITICAL';
        } elseif ($severityBreakdown['high'] > 2) {
            return 'HIGH';
        } elseif ($severityBreakdown['high'] > 0 || $severityBreakdown['medium'] > 5) {
            return 'MEDIUM';
        } elseif ($severityBreakdown['medium'] > 0 || $severityBreakdown['low'] > 0) {
            return 'LOW';
        } else {
            return 'MINIMAL';
        }
    }
}
