<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\WebsiteAnalytics;
use App\Models\SecurityAudit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AnalyticsController extends Controller
{
    /**
     * Display the analytics dashboard
     */
    public function dashboard(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Get overview statistics
        $stats = $this->getOverviewStats($dateRange);
        
        // Get recent analytics data
        $recentAnalytics = WebsiteAnalytics::with('website')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->latest()
            ->limit(50)
            ->get();
        
        // Get security alerts
        $securityAlerts = SecurityAudit::with('website')
            ->where('status', 'open')
            ->where('severity', 'high')
            ->orWhere('severity', 'critical')
            ->orderBy('detected_at', 'desc')
            ->limit(10)
            ->get();
        
        // Get performance trends
        $performanceTrends = $this->getPerformanceTrends($dateRange);
        
        // Get health distribution
        $healthDistribution = $this->getHealthDistribution();
        
        return Inertia::render('Analytics/Dashboard', [
            'stats' => $stats,
            'recentAnalytics' => $recentAnalytics,
            'securityAlerts' => $securityAlerts,
            'performanceTrends' => $performanceTrends,
            'healthDistribution' => $healthDistribution,
            'dateRange' => $dateRange,
        ]);
    }

    /**
     * Show detailed analytics for a specific website
     */
    public function website(Website $website, Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Get latest analytics
        $latestAnalytics = WebsiteAnalytics::where('website_id', $website->id)
            ->latest()
            ->first();
        
        // Get historical data
        $historicalData = WebsiteAnalytics::where('website_id', $website->id)
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->orderBy('scanned_at')
            ->get();
        
        // Get security audits
        $securityAudits = SecurityAudit::where('website_id', $website->id)
            ->orderBy('detected_at', 'desc')
            ->get();
        
        // Calculate trends
        $trends = $this->calculateWebsiteTrends($website->id, $dateRange);
        
        return Inertia::render('Analytics/Website', [
            'website' => $website->load(['client', 'group']),
            'latestAnalytics' => $latestAnalytics,
            'historicalData' => $historicalData,
            'securityAudits' => $securityAudits,
            'trends' => $trends,
            'dateRange' => $dateRange,
        ]);
    }

    /**
     * Get security overview
     */
    public function security(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Get security statistics
        $securityStats = $this->getSecurityStats($dateRange);
        
        // Get recent security audits
        $recentAudits = SecurityAudit::with('website')
            ->whereBetween('detected_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('detected_at', 'desc')
            ->paginate(25);
        
        // Get vulnerability distribution
        $vulnerabilityDistribution = SecurityAudit::selectRaw('audit_type, severity, count(*) as count')
            ->whereBetween('detected_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('audit_type', 'severity')
            ->get();
        
        // Get websites with critical issues
        $criticalWebsites = Website::whereHas('securityAudits', function($query) {
            $query->where('status', 'open')
                  ->where('severity', 'critical');
        })->with(['securityAudits' => function($query) {
            $query->where('status', 'open')
                  ->where('severity', 'critical');
        }])->get();
        
        return Inertia::render('Analytics/Security', [
            'securityStats' => $securityStats,
            'recentAudits' => $recentAudits,
            'vulnerabilityDistribution' => $vulnerabilityDistribution,
            'criticalWebsites' => $criticalWebsites,
            'dateRange' => $dateRange,
        ]);
    }

    /**
     * Get performance overview
     */
    public function performance(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Get performance statistics
        $performanceStats = $this->getPerformanceStats($dateRange);
        
        // Get slowest websites
        $slowestWebsites = WebsiteAnalytics::with('website')
            ->whereNotNull('load_time')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->orderBy('load_time', 'desc')
            ->limit(10)
            ->get();
        
        // Get uptime statistics
        $uptimeStats = WebsiteAnalytics::selectRaw('
                website_id,
                AVG(uptime_percentage) as avg_uptime,
                MIN(uptime_percentage) as min_uptime,
                MAX(uptime_percentage) as max_uptime
            ')
            ->with('website')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->groupBy('website_id')
            ->orderBy('avg_uptime', 'asc')
            ->limit(10)
            ->get();
        
        return Inertia::render('Analytics/Performance', [
            'performanceStats' => $performanceStats,
            'slowestWebsites' => $slowestWebsites,
            'uptimeStats' => $uptimeStats,
            'dateRange' => $dateRange,
        ]);
    }

    /**
     * Generate and export analytics report
     */
    public function exportReport(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        $format = $request->get('format', 'pdf');
        
        // Generate comprehensive report data
        $reportData = [
            'overview' => $this->getOverviewStats($dateRange),
            'security' => $this->getSecurityStats($dateRange),
            'performance' => $this->getPerformanceStats($dateRange),
            'websites' => Website::with(['latestAnalytics', 'securityAudits'])->get(),
            'dateRange' => $dateRange,
            'generatedAt' => now(),
        ];
        
        // Return download response based on format
        if ($format === 'json') {
            return response()->json($reportData);
        }
        
        // For PDF/Excel generation, you would use libraries like DomPDF or PhpSpreadsheet
        return response()->json(['message' => 'Report generated successfully', 'data' => $reportData]);
    }

    /**
     * Get date range from request
     */
    private function getDateRange(Request $request)
    {
        $period = $request->get('period', '7d');
        
        $ranges = [
            '24h' => [Carbon::now()->subDay(), Carbon::now()],
            '7d' => [Carbon::now()->subWeek(), Carbon::now()],
            '30d' => [Carbon::now()->subMonth(), Carbon::now()],
            '90d' => [Carbon::now()->subMonths(3), Carbon::now()],
        ];
        
        [$start, $end] = $ranges[$period] ?? $ranges['7d'];
        
        return [
            'start' => $start,
            'end' => $end,
            'period' => $period,
        ];
    }

    /**
     * Get overview statistics
     */
    private function getOverviewStats($dateRange)
    {
        $totalWebsites = Website::count();
        $scannedWebsites = WebsiteAnalytics::distinct('website_id')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->count();
        
        $avgHealthScore = WebsiteAnalytics::dateRange($dateRange['start'], $dateRange['end'])
            ->avg('health_score');
        
        $criticalIssues = SecurityAudit::where('status', 'open')
            ->where('severity', 'critical')
            ->count();
        
        $websitesOnline = WebsiteAnalytics::where('is_online', true)
            ->distinct('website_id')
            ->count();
        
        return [
            'totalWebsites' => $totalWebsites,
            'scannedWebsites' => $scannedWebsites,
            'avgHealthScore' => round($avgHealthScore, 1),
            'criticalIssues' => $criticalIssues,
            'websitesOnline' => $websitesOnline,
            'uptimePercentage' => $totalWebsites > 0 ? round(($websitesOnline / $totalWebsites) * 100, 1) : 0,
        ];
    }

    /**
     * Get security statistics
     */
    private function getSecurityStats($dateRange)
    {
        return [
            'totalIssues' => SecurityAudit::whereBetween('detected_at', [$dateRange['start'], $dateRange['end']])->count(),
            'criticalIssues' => SecurityAudit::where('severity', 'critical')->whereBetween('detected_at', [$dateRange['start'], $dateRange['end']])->count(),
            'resolvedIssues' => SecurityAudit::whereIn('status', ['fixed', 'false_positive'])->whereBetween('detected_at', [$dateRange['start'], $dateRange['end']])->count(),
            'avgSecurityScore' => round(WebsiteAnalytics::dateRange($dateRange['start'], $dateRange['end'])->avg('security_score'), 1),
        ];
    }

    /**
     * Get performance statistics
     */
    private function getPerformanceStats($dateRange)
    {
        return [
            'avgLoadTime' => round(WebsiteAnalytics::dateRange($dateRange['start'], $dateRange['end'])->avg('load_time'), 3),
            'avgUptime' => round(WebsiteAnalytics::dateRange($dateRange['start'], $dateRange['end'])->avg('uptime_percentage'), 2),
            'fastestSite' => WebsiteAnalytics::with('website')->whereNotNull('load_time')->dateRange($dateRange['start'], $dateRange['end'])->orderBy('load_time')->first(),
            'slowestSite' => WebsiteAnalytics::with('website')->whereNotNull('load_time')->dateRange($dateRange['start'], $dateRange['end'])->orderBy('load_time', 'desc')->first(),
        ];
    }

    /**
     * Get performance trends
     */
    private function getPerformanceTrends($dateRange)
    {
        return WebsiteAnalytics::selectRaw('
                DATE(scanned_at) as date,
                AVG(load_time) as avg_load_time,
                AVG(uptime_percentage) as avg_uptime,
                AVG(health_score) as avg_health_score
            ')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->groupBy('date')
            ->orderBy('date')
            ->get();
    }

    /**
     * Get health distribution
     */
    private function getHealthDistribution()
    {
        return WebsiteAnalytics::selectRaw('
                CASE 
                    WHEN health_score >= 90 THEN "excellent"
                    WHEN health_score >= 75 THEN "good"
                    WHEN health_score >= 50 THEN "fair"
                    ELSE "poor"
                END as health_status,
                COUNT(*) as count
            ')
            ->whereNotNull('health_score')
            ->groupBy('health_status')
            ->get();
    }

    /**
     * Calculate website trends
     */
    private function calculateWebsiteTrends($websiteId, $dateRange)
    {
        $current = WebsiteAnalytics::where('website_id', $websiteId)
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->latest()
            ->first();
        
        $previous = WebsiteAnalytics::where('website_id', $websiteId)
            ->where('scanned_at', '<', $dateRange['start'])
            ->latest()
            ->first();
        
        if (!$current || !$previous) {
            return null;
        }
        
        return [
            'healthScore' => $this->calculateTrend($previous->health_score, $current->health_score),
            'securityScore' => $this->calculateTrend($previous->security_score, $current->security_score),
            'loadTime' => $this->calculateTrend($previous->load_time, $current->load_time, true), // inverse for load time
            'uptime' => $this->calculateTrend($previous->uptime_percentage, $current->uptime_percentage),
        ];
    }

    /**
     * Calculate trend direction and percentage
     */
    private function calculateTrend($previous, $current, $inverse = false)
    {
        if (!$previous || !$current) {
            return ['direction' => 'neutral', 'percentage' => 0];
        }
        
        $change = (($current - $previous) / $previous) * 100;
        
        if ($inverse) {
            $change = -$change; // Invert for metrics where lower is better
        }
        
        return [
            'direction' => $change > 5 ? 'up' : ($change < -5 ? 'down' : 'neutral'),
            'percentage' => round(abs($change), 1),
        ];
    }
}
