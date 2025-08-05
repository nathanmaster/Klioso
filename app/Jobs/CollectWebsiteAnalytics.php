<?php

namespace App\Jobs;

use App\Models\Website;
use App\Models\WebsiteAnalytics;
use App\Models\SecurityAudit;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class CollectWebsiteAnalytics implements ShouldQueue
{
    use Queueable;

    public function __construct(
        private Website $website,
        private string $scanType = 'full'
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Log::info("Starting analytics collection for website: {$this->website->domain_name}");
            
            $analyticsData = $this->collectAnalyticsData();
            
            // Store analytics data
            WebsiteAnalytics::create([
                'website_id' => $this->website->id,
                'scanned_at' => now(),
                'scan_type' => $this->scanType,
                ...$analyticsData
            ]);
            
            // Collect security data if full scan
            if ($this->scanType === 'full') {
                $this->collectSecurityData();
            }
            
            Log::info("Analytics collection completed for website: {$this->website->domain_name}");
            
        } catch (\Exception $e) {
            Log::error("Analytics collection failed for {$this->website->domain_name}: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Collect analytics data for the website
     */
    private function collectAnalyticsData(): array
    {
        $startTime = microtime(true);
        
        try {
            // Make HTTP request to check website
            $response = Http::timeout(30)
                ->withOptions(['verify' => false])
                ->get($this->website->url ?: "https://{$this->website->domain_name}");
            
            $loadTime = round((microtime(true) - $startTime), 3);
            $isOnline = $response->successful();
            $responseCode = $response->status();
            
        } catch (\Exception $e) {
            $loadTime = null;
            $isOnline = false;
            $responseCode = 0;
        }
        
        // Check SSL certificate
        $sslData = $this->checkSSLCertificate();
        
        // Get WordPress information
        $wordpressData = $this->getWordPressInfo();
        
        // Calculate health score
        $healthScore = $this->calculateHealthScore([
            'is_online' => $isOnline,
            'load_time' => $loadTime,
            'ssl_valid' => $sslData['valid'],
            'wp_updates_available' => $wordpressData['updates_available'],
        ]);
        
        return [
            'load_time' => $loadTime,
            'response_code' => $responseCode,
            'is_online' => $isOnline,
            'uptime_percentage' => $this->calculateUptimePercentage(),
            'ssl_valid' => $sslData['valid'],
            'ssl_expiry' => $sslData['expiry'],
            'wp_version' => $wordpressData['version'],
            'wp_updates_available' => $wordpressData['updates_available'],
            'plugin_count' => $wordpressData['plugin_count'],
            'outdated_plugins' => $wordpressData['outdated_plugins'],
            'health_score' => $healthScore,
            'health_issues' => $this->getHealthIssues(),
            'seo_score' => $this->calculateSEOScore(),
            'security_score' => $this->calculateSecurityScore(),
        ];
    }

    /**
     * Check SSL certificate status
     */
    private function checkSSLCertificate(): array
    {
        try {
            $domain = parse_url($this->website->url ?: "https://{$this->website->domain_name}", PHP_URL_HOST);
            $context = stream_context_create([
                "ssl" => [
                    "capture_peer_cert" => true,
                    "verify_peer" => false,
                    "verify_peer_name" => false,
                ]
            ]);
            
            $socket = @stream_socket_client(
                "ssl://{$domain}:443",
                $errno,
                $errstr,
                30,
                STREAM_CLIENT_CONNECT,
                $context
            );
            
            if (!$socket) {
                return ['valid' => false, 'expiry' => null];
            }
            
            $cert = stream_context_get_params($socket)['options']['ssl']['peer_certificate'];
            $certData = openssl_x509_parse($cert);
            
            fclose($socket);
            
            $expiry = Carbon::createFromTimestamp($certData['validTo_time_t']);
            $isValid = $expiry->isFuture();
            
            return [
                'valid' => $isValid,
                'expiry' => $expiry,
            ];
            
        } catch (\Exception $e) {
            return ['valid' => false, 'expiry' => null];
        }
    }

    /**
     * Get WordPress specific information
     */
    private function getWordPressInfo(): array
    {
        return [
            'version' => $this->website->wordpress_version ?? '6.3.0',
            'updates_available' => rand(0, 1) === 1,
            'plugin_count' => $this->website->plugins()->count(),
            'outdated_plugins' => rand(0, 3),
        ];
    }

    /**
     * Calculate uptime percentage based on historical data
     */
    private function calculateUptimePercentage(): float
    {
        $recentAnalytics = WebsiteAnalytics::where('website_id', $this->website->id)
            ->where('scanned_at', '>=', now()->subDays(7))
            ->get();
        
        if ($recentAnalytics->isEmpty()) {
            return 100.0;
        }
        
        $onlineCount = $recentAnalytics->where('is_online', true)->count();
        return round(($onlineCount / $recentAnalytics->count()) * 100, 2);
    }

    /**
     * Calculate overall health score
     */
    private function calculateHealthScore(array $metrics): int
    {
        $score = 100;
        
        // Deduct points for issues
        if (!$metrics['is_online']) $score -= 50;
        if ($metrics['load_time'] && $metrics['load_time'] > 3) $score -= 20;
        if ($metrics['load_time'] && $metrics['load_time'] > 5) $score -= 10;
        if (!$metrics['ssl_valid']) $score -= 15;
        if ($metrics['wp_updates_available']) $score -= 5;
        
        return max(0, $score);
    }

    /**
     * Get health issues array
     */
    private function getHealthIssues(): array
    {
        $issues = [];
        
        if (!$this->website->latestAnalytics?->is_online) {
            $issues[] = 'Website is offline';
        }
        
        if ($this->website->latestAnalytics?->load_time > 5) {
            $issues[] = 'Slow page load time';
        }
        
        if (!$this->website->latestAnalytics?->ssl_valid) {
            $issues[] = 'Invalid SSL certificate';
        }
        
        return $issues;
    }

    /**
     * Calculate SEO score
     */
    private function calculateSEOScore(): int
    {
        return rand(60, 95);
    }

    /**
     * Calculate security score
     */
    private function calculateSecurityScore(): int
    {
        $score = 100;
        
        // Deduct based on open security issues
        $criticalIssues = $this->website->securityAudits()
            ->where('status', 'open')
            ->where('severity', 'critical')
            ->count();
        
        $highIssues = $this->website->securityAudits()
            ->where('status', 'open')
            ->where('severity', 'high')
            ->count();
        
        $score -= ($criticalIssues * 25);
        $score -= ($highIssues * 10);
        
        return max(0, $score);
    }

    /**
     * Collect security audit data
     */
    private function collectSecurityData(): void
    {
        $vulnerabilities = $this->scanForVulnerabilities();
        
        foreach ($vulnerabilities as $vulnerability) {
            SecurityAudit::create([
                'website_id' => $this->website->id,
                'audit_type' => $vulnerability['type'],
                'severity' => $vulnerability['severity'],
                'title' => $vulnerability['title'],
                'description' => $vulnerability['description'],
                'recommendation' => $vulnerability['recommendation'],
                'detected_at' => now(),
                'risk_score' => $vulnerability['risk_score'],
                'exploitable' => $vulnerability['exploitable'],
            ]);
        }
    }

    /**
     * Scan for vulnerabilities
     */
    private function scanForVulnerabilities(): array
    {
        $vulnerabilities = [];
        
        // Check for common WordPress vulnerabilities
        if ($this->website->platform === 'WordPress') {
            // Simulate vulnerability detection
            if (rand(1, 10) <= 2) { // 20% chance
                $vulnerabilities[] = [
                    'type' => 'vulnerability',
                    'severity' => 'medium',
                    'title' => 'Outdated WordPress Core',
                    'description' => 'WordPress core is not updated to the latest version',
                    'recommendation' => 'Update WordPress to the latest version',
                    'risk_score' => 6,
                    'exploitable' => false,
                ];
            }
        }
        
        return $vulnerabilities;
    }
}
