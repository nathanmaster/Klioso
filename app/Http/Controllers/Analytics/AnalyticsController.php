<?php

namespace App\Http\Controllers\Analytics;

use App\Http\Controllers\Controller;

use App\Models\Website;
use App\Models\WebsiteAnalytics;
use App\Models\WebsiteScan;
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
        
        // Get analytics data with proper structure for frontend
        $analytics = $this->getAnalyticsData($dateRange);
        
        // Get security overview with proper structure
        $securityOverview = $this->getSecurityOverview($dateRange);
        
        // Get performance data with proper structure
        $performanceData = $this->getPerformanceData($dateRange);
        
        // Get recent alerts
        $recentAlerts = $this->getRecentAlerts();
        
        return Inertia::render('Analytics/Dashboard', [
            'analytics' => $analytics,
            'securityOverview' => $securityOverview,
            'performanceData' => $performanceData,
            'recentAlerts' => $recentAlerts,
            'stats' => $stats,
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
        
        // Get security overview
        $securityOverview = $this->getSecurityOverview($dateRange);
        
        // Get recent security audits with proper relationships
        $recentAudits = SecurityAudit::with(['website'])
            ->whereBetween('detected_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('detected_at', 'desc')
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'website_id' => $audit->website_id,
                    'website' => $audit->website ? [
                        'id' => $audit->website->id,
                        'name' => $audit->website->name,
                        'url' => $audit->website->url,
                    ] : null,
                    'issue_type' => $audit->audit_type,
                    'risk_level' => $audit->severity,
                    'status' => $audit->status,
                    'details' => $audit->details ?? $audit->recommendations,
                    'created_at' => $audit->detected_at,
                ];
            });
        
        // Get critical alerts (critical severity, open status)
        $criticalAlerts = SecurityAudit::with(['website'])
            ->where('severity', 'critical')
            ->where('status', 'open')
            ->orderBy('detected_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'website_id' => $audit->website_id,
                    'website' => $audit->website ? [
                        'id' => $audit->website->id,
                        'name' => $audit->website->name,
                        'url' => $audit->website->url,
                    ] : null,
                    'issue_type' => $audit->audit_type,
                    'details' => $audit->details ?? $audit->recommendations,
                    'created_at' => $audit->detected_at,
                ];
            });
        
        // Get all websites for context
        $websites = Website::select('id', 'name', 'url')->get();
        
        return Inertia::render('Analytics/Security', [
            'securityOverview' => $securityOverview,
            'recentAudits' => $recentAudits,
            'criticalAlerts' => $criticalAlerts,
            'websites' => $websites,
            'filters' => $request->only(['search', 'severity', 'status']),
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
    
    /**
     * Get analytics data with proper structure for frontend
     */
    private function getAnalyticsData($dateRange)
    {
        $totalWebsites = Website::count();
        
        // Get website growth (compared to previous period)
        $previousPeriodStart = Carbon::parse($dateRange['start'])->subDays(
            Carbon::parse($dateRange['start'])->diffInDays($dateRange['end'])
        );
        $previousWebsiteCount = Website::where('created_at', '<', $dateRange['start'])->count();
        $websitesGrowth = $totalWebsites > 0 && $previousWebsiteCount > 0 
            ? (($totalWebsites - $previousWebsiteCount) / $previousWebsiteCount) * 100 
            : 0;
        
        // Total scans in current period
        $totalScans = WebsiteScan::dateRange($dateRange['start'], $dateRange['end'])->count();
        
        // Get scan growth
        $previousScans = WebsiteScan::where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $dateRange['start'])
            ->count();
        $scansGrowth = $previousScans > 0 
            ? (($totalScans - $previousScans) / $previousScans) * 100 
            : 0;
        
        // Active monitoring (websites with recent analytics)
        $activeMonitoring = WebsiteAnalytics::distinct('website_id')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->count();
        
        // Get monitoring growth
        $previousMonitoring = WebsiteAnalytics::distinct('website_id')
            ->where('created_at', '>=', $previousPeriodStart)
            ->where('created_at', '<', $dateRange['start'])
            ->count();
        $monitoringGrowth = $previousMonitoring > 0 
            ? (($activeMonitoring - $previousMonitoring) / $previousMonitoring) * 100 
            : 0;
        
        // Alerts this period
        $totalAlerts = SecurityAudit::dateRange($dateRange['start'], $dateRange['end'])->count();
        
        // Get alerts growth
        $previousAlerts = SecurityAudit::where('detected_at', '>=', $previousPeriodStart)
            ->where('detected_at', '<', $dateRange['start'])
            ->count();
        $alertsGrowth = $previousAlerts > 0 
            ? (($totalAlerts - $previousAlerts) / $previousAlerts) * 100 
            : 0;
        
        return [
            'totalWebsites' => $totalWebsites,
            'websitesGrowth' => round($websitesGrowth, 1),
            'totalScans' => $totalScans,
            'scansGrowth' => round($scansGrowth, 1),
            'activeMonitoring' => $activeMonitoring,
            'monitoringGrowth' => round($monitoringGrowth, 1),
            'totalAlerts' => $totalAlerts,
            'alertsGrowth' => round($alertsGrowth, 1),
        ];
    }
    
    /**
     * Get security overview with proper structure for frontend
     */
    private function getSecurityOverview($dateRange)
    {
        $totalVulnerabilities = SecurityAudit::dateRange($dateRange['start'], $dateRange['end'])->count();
        
        $activeAlerts = SecurityAudit::where('status', 'open')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->count();
        
        $resolvedIssues = SecurityAudit::where('status', 'resolved')
            ->dateRange($dateRange['start'], $dateRange['end'])
            ->count();
        
        $riskScore = $this->calculateRiskScore();
        
        // Security trend data for chart (last 30 days)
        $securityTrends = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dailyAlerts = SecurityAudit::whereDate('detected_at', $date)->count();
            $securityTrends[] = [
                'date' => $date->format('M j'),
                'alerts' => $dailyAlerts,
                'resolved' => SecurityAudit::whereDate('resolved_at', $date)->count(),
            ];
        }
        
        return [
            'totalVulnerabilities' => $totalVulnerabilities,
            'activeAlerts' => $activeAlerts,
            'resolvedIssues' => $resolvedIssues,
            'riskScore' => $riskScore,
            'trends' => $securityTrends,
        ];
    }
    
    /**
     * Get performance data with proper structure for frontend
     */
    private function getPerformanceData($dateRange)
    {
        $analytics = WebsiteAnalytics::dateRange($dateRange['start'], $dateRange['end']);
        
        $avgResponseTime = round($analytics->avg('load_time') ?? 0, 2);
        $uptimePercentage = round($analytics->avg('uptime_percentage') ?? 0, 2);
        $avgHealthScore = round($analytics->avg('health_score') ?? 0, 1);
        $totalRequests = $analytics->sum('page_views') ?? 0;
        
        // Performance trends for chart (last 30 days)
        $performanceTrends = [];
        for ($i = 29; $i >= 0; $i--) {
            $date = Carbon::now()->subDays($i);
            $dayAnalytics = WebsiteAnalytics::whereDate('created_at', $date);
            
            $performanceTrends[] = [
                'date' => $date->format('M j'),
                'responseTime' => round($dayAnalytics->avg('load_time') ?? 0, 2),
                'uptime' => round($dayAnalytics->avg('uptime_percentage') ?? 0, 2),
                'healthScore' => round($dayAnalytics->avg('health_score') ?? 0, 1),
            ];
        }
        
        return [
            'avgResponseTime' => $avgResponseTime,
            'uptimePercentage' => $uptimePercentage,
            'avgHealthScore' => $avgHealthScore,
            'totalRequests' => $totalRequests,
            'trends' => $performanceTrends,
        ];
    }
    
    /**
     * Get recent alerts for the dashboard
     */
    private function getRecentAlerts()
    {
        return SecurityAudit::with('website')
            ->where('status', 'open')
            ->orderBy('detected_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'title' => $alert->vulnerability_type,
                    'description' => $alert->description,
                    'severity' => $alert->severity,
                    'website' => $alert->website->name,
                    'time' => $alert->detected_at->diffForHumans(),
                    'status' => $alert->status,
                ];
            });
    }
    
    /**
     * Calculate overall risk score
     */
    private function calculateRiskScore()
    {
        $criticalIssues = SecurityAudit::where('severity', 'critical')
            ->where('status', 'open')
            ->count();
        
        $highIssues = SecurityAudit::where('severity', 'high')
            ->where('status', 'open')
            ->count();
        
        $mediumIssues = SecurityAudit::where('severity', 'medium')
            ->where('status', 'open')
            ->count();
        
        // Calculate weighted risk score (0-100)
        $riskScore = ($criticalIssues * 10) + ($highIssues * 5) + ($mediumIssues * 2);
        
        // Cap at 100
        return min($riskScore, 100);
    }

    /**
     * Get real-time analytics data for polling
     */
    public function realtime(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        return response()->json([
            'analytics' => $this->getAnalyticsData($dateRange),
            'securityOverview' => $this->getSecurityOverview($dateRange),
            'performanceData' => $this->getPerformanceData($dateRange),
            'recentAlerts' => $this->getRecentAlerts(),
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Refresh analytics data (trigger collection)
     */
    public function refresh(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        
        // Trigger background job to collect fresh analytics
        // This would typically dispatch a job to collect analytics
        // For now, just return the current data
        
        return response()->json([
            'success' => true,
            'message' => 'Analytics refresh initiated',
            'data' => [
                'analytics' => $this->getAnalyticsData($dateRange),
                'securityOverview' => $this->getSecurityOverview($dateRange),
                'performanceData' => $this->getPerformanceData($dateRange),
                'recentAlerts' => $this->getRecentAlerts(),
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }

    /**
     * Get analytics summary for quick overview
     */
    public function summary(Request $request)
    {
        $dateRange = $this->getDateRange($request);
        $analytics = $this->getAnalyticsData($dateRange);
        $security = $this->getSecurityOverview($dateRange);
        $performance = $this->getPerformanceData($dateRange);
        
        return response()->json([
            'summary' => [
                'websites' => $analytics['totalWebsites'],
                'scans' => $analytics['totalScans'],
                'alerts' => $security['activeAlerts'],
                'avgHealth' => $performance['avgHealthScore'],
                'avgResponseTime' => $performance['avgResponseTime'],
                'uptime' => $performance['uptimePercentage'],
                'riskScore' => $security['riskScore'],
            ],
            'trends' => [
                'websites' => $analytics['websitesGrowth'],
                'scans' => $analytics['scansGrowth'],
                'monitoring' => $analytics['monitoringGrowth'],
                'alerts' => $analytics['alertsGrowth'],
            ],
            'timestamp' => now()->toISOString(),
        ]);
    }
}
