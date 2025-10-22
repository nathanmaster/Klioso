<?php

namespace App\Services;

use App\Models\Website;
use App\Models\SecurityAudit;
use App\Models\ScanHistory;

class HealthScoreService
{
    /**
     * Calculate comprehensive health score for a website
     */
    public function calculateHealthScore(Website $website): array
    {
        $components = [
            'availability' => $this->calculateAvailabilityScore($website),
            'performance' => $this->calculatePerformanceScore($website),
            'security' => $this->calculateSecurityScore($website),
            'maintenance' => $this->calculateMaintenanceScore($website),
            'seo' => $this->calculateSEOScore($website),
        ];

        $overallScore = $this->calculateOverallScore($components);
        $issues = $this->identifyHealthIssues($website, $components);
        $recommendations = $this->generateRecommendations($issues);

        return [
            'overall_score' => $overallScore,
            'components' => $components,
            'issues' => $issues,
            'recommendations' => $recommendations,
            'grade' => $this->getHealthGrade($overallScore),
            'status' => $this->getHealthStatus($overallScore),
        ];
    }

    /**
     * Calculate availability score (30% weight)
     */
    private function calculateAvailabilityScore(Website $website): array
    {
        $analytics = $website->latestAnalytics;
        $score = 100;
        $issues = [];

        if (!$analytics) {
            return ['score' => 50, 'issues' => ['No analytics data available - website not yet scanned']];
        }

        // Check if site is online
        if (!$analytics->is_online) {
            $score = 0;
            $issues[] = 'Website is offline';
        } else {
            // Check uptime percentage (last 30 days)
            $uptimePercentage = $this->calculateUptimePercentage($website);
            
            if ($uptimePercentage < 95) {
                $score -= 30;
                $issues[] = "Low uptime: {$uptimePercentage}%";
            } elseif ($uptimePercentage < 99) {
                $score -= 15;
                $issues[] = "Moderate uptime issues: {$uptimePercentage}%";
            }

            // Check SSL status
            if (isset($analytics->ssl_valid) && !$analytics->ssl_valid) {
                $score -= 20;
                $issues[] = 'Invalid or expired SSL certificate';
            }
        }

        return ['score' => max(0, $score), 'issues' => $issues];
    }

    /**
     * Calculate performance score (25% weight)
     */
    private function calculatePerformanceScore(Website $website): array
    {
        $analytics = $website->latestAnalytics;
        $score = 100;
        $issues = [];

        if (!$analytics || !$analytics->load_time) {
            return ['score' => 50, 'issues' => ['No performance data available - website not yet scanned']];
        }

        $loadTime = $analytics->load_time;

        // Load time scoring
        if ($loadTime > 5) {
            $score -= 40;
            $issues[] = "Very slow load time: {$loadTime}s";
        } elseif ($loadTime > 3) {
            $score -= 25;
            $issues[] = "Slow load time: {$loadTime}s";
        } elseif ($loadTime > 2) {
            $score -= 10;
            $issues[] = "Moderate load time: {$loadTime}s";
        }

        // Check for performance optimizations
        if (isset($analytics->page_size) && $analytics->page_size && $analytics->page_size > 3000) { // 3MB
            $score -= 15;
            $issues[] = 'Large page size affecting performance';
        }

        return ['score' => max(0, $score), 'issues' => $issues];
    }

    /**
     * Calculate security score (25% weight)
     */
    private function calculateSecurityScore(Website $website): array
    {
        $score = 100;
        $issues = [];

        // Check open security audits
        $criticalIssues = SecurityAudit::where('website_id', $website->id)
            ->where('status', 'open')
            ->where('severity', 'critical')
            ->count();

        $highIssues = SecurityAudit::where('website_id', $website->id)
            ->where('status', 'open')
            ->where('severity', 'high')
            ->count();

        $mediumIssues = SecurityAudit::where('website_id', $website->id)
            ->where('status', 'open')
            ->where('severity', 'medium')
            ->count();

        // Deduct points for security issues
        $score -= ($criticalIssues * 30);
        $score -= ($highIssues * 15);
        $score -= ($mediumIssues * 5);

        if ($criticalIssues > 0) {
            $issues[] = "{$criticalIssues} critical security vulnerabilities";
        }
        if ($highIssues > 0) {
            $issues[] = "{$highIssues} high-priority security issues";
        }
        if ($mediumIssues > 0) {
            $issues[] = "{$mediumIssues} medium-priority security issues";
        }

        // Check for recent security scans
        $lastSecurityScan = ScanHistory::where('website_id', $website->id)
            ->where('scan_type', 'security')
            ->latest('created_at')
            ->first();

        if (!$lastSecurityScan || $lastSecurityScan->created_at->diffInDays() > 30) {
            $score -= 10;
            $issues[] = 'No recent security scan performed';
        }

        return ['score' => max(0, $score), 'issues' => $issues];
    }

    /**
     * Calculate maintenance score (15% weight)
     */
    private function calculateMaintenanceScore(Website $website): array
    {
        $analytics = $website->latestAnalytics;
        $score = 100;
        $issues = [];

        if (!$analytics) {
            return ['score' => 50, 'issues' => ['No maintenance data available - website not yet scanned']];
        }

        // Check for WordPress updates
        if (isset($analytics->wp_updates_available) && $analytics->wp_updates_available) {
            $score -= 20;
            $issues[] = 'WordPress core updates available';
        }

        // Check for outdated plugins
        if (isset($analytics->outdated_plugins) && $analytics->outdated_plugins && $analytics->outdated_plugins > 0) {
            $score -= min(30, $analytics->outdated_plugins * 5);
            $issues[] = "{$analytics->outdated_plugins} plugins need updates";
        }

        // Check backup status (assuming we have this data)
        $lastBackup = $this->getLastBackupDate($website);
        if (!$lastBackup || $lastBackup->diffInDays() > 7) {
            $score -= 15;
            $issues[] = 'No recent backup found';
        }

        return ['score' => max(0, $score), 'issues' => $issues];
    }

    /**
     * Calculate SEO score (5% weight)
     */
    private function calculateSEOScore(Website $website): array
    {
        $analytics = $website->latestAnalytics;
        $score = 100;
        $issues = [];

        if (!$analytics) {
            return ['score' => 50, 'issues' => ['No SEO data available - website not yet scanned']];
        }

        if (isset($analytics->seo_score) && $analytics->seo_score) {
            $score = $analytics->seo_score;
            if ($score < 70) {
                $issues[] = 'Poor SEO optimization';
            } elseif ($score < 85) {
                $issues[] = 'SEO improvements needed';
            }
        } else {
            $score = 75; // Default score when no SEO data available
            $issues[] = 'SEO analysis not yet performed';
        }

        return ['score' => $score, 'issues' => $issues];
    }

    /**
     * Calculate overall weighted score
     */
    private function calculateOverallScore(array $components): int
    {
        $weights = [
            'availability' => 0.30,
            'performance' => 0.25,
            'security' => 0.25,
            'maintenance' => 0.15,
            'seo' => 0.05,
        ];

        $weightedScore = 0;
        foreach ($components as $component => $data) {
            $weightedScore += $data['score'] * $weights[$component];
        }

        return round($weightedScore);
    }

    /**
     * Identify critical health issues
     */
    private function identifyHealthIssues(Website $website, array $components): array
    {
        $allIssues = [];
        foreach ($components as $component => $data) {
            foreach ($data['issues'] as $issue) {
                $allIssues[] = [
                    'component' => $component,
                    'issue' => $issue,
                    'severity' => $this->getIssueSeverity($component, $data['score']),
                ];
            }
        }

        return $allIssues;
    }

    /**
     * Generate actionable recommendations
     */
    private function generateRecommendations(array $issues): array
    {
        $recommendations = [];
        
        foreach ($issues as $issue) {
            switch ($issue['component']) {
                case 'availability':
                    if (str_contains($issue['issue'], 'offline')) {
                        $recommendations[] = 'Contact hosting provider to resolve website downtime';
                    } elseif (str_contains($issue['issue'], 'SSL')) {
                        $recommendations[] = 'Renew or fix SSL certificate configuration';
                    }
                    break;
                    
                case 'performance':
                    if (str_contains($issue['issue'], 'load time')) {
                        $recommendations[] = 'Optimize images, enable caching, or upgrade hosting';
                    }
                    break;
                    
                case 'security':
                    if (str_contains($issue['issue'], 'vulnerabilities')) {
                        $recommendations[] = 'Review and patch security vulnerabilities immediately';
                    }
                    break;
                    
                case 'maintenance':
                    if (str_contains($issue['issue'], 'updates')) {
                        $recommendations[] = 'Schedule WordPress and plugin updates';
                    } elseif (str_contains($issue['issue'], 'backup')) {
                        $recommendations[] = 'Set up automated backup schedule';
                    }
                    break;
            }
        }

        return array_unique($recommendations);
    }

    /**
     * Get health grade (A-F)
     */
    private function getHealthGrade(int $score): string
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }

    /**
     * Get health status
     */
    private function getHealthStatus(int $score): string
    {
        if ($score >= 90) return 'Excellent';
        if ($score >= 80) return 'Good';
        if ($score >= 70) return 'Fair';
        if ($score >= 60) return 'Poor';
        return 'Critical';
    }

    /**
     * Helper methods
     */
    private function calculateUptimePercentage(Website $website): float
    {
        // Calculate uptime from analytics data over last 30 days
        $analytics = $website->analytics()
            ->where('scanned_at', '>=', now()->subDays(30))
            ->get();

        if ($analytics->isEmpty()) {
            return 100; // Assume good if no data
        }

        $onlineCount = $analytics->where('is_online', true)->count();
        return round(($onlineCount / $analytics->count()) * 100, 1);
    }

    private function getLastBackupDate(Website $website)
    {
        // This would integrate with backup system when available
        return now()->subDays(rand(1, 14)); // Simulate for now
    }

    private function getIssueSeverity(string $component, int $score): string
    {
        if ($component === 'availability' && $score === 0) return 'critical';
        if ($component === 'security' && $score < 60) return 'critical';
        if ($score < 50) return 'high';
        if ($score < 70) return 'medium';
        return 'low';
    }
}