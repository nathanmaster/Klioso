<?php

namespace App\Http\Controllers;

use App\Models\DashboardPanel;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Display the customizable dashboard
     */
    public function index(Request $request)
    {
        $layout = $request->get('layout', 'main');
        
        // Get user's dashboard panels
        $panels = DashboardPanel::where('user_id', auth()->id())
            ->forLayout($layout)
            ->visible()
            ->orderBy('order')
            ->get();

        // If no panels exist, create default panels
        if ($panels->isEmpty()) {
            DashboardPanel::createDefaultPanels(auth()->id(), $layout);
            $panels = DashboardPanel::where('user_id', auth()->id())
                ->forLayout($layout)
                ->visible()
                ->orderBy('order')
                ->get();
        }

        // Get panel data for each panel
        $panelData = [];
        foreach ($panels as $panel) {
            $panelData[$panel->id] = $this->getPanelData($panel);
        }

        return Inertia::render('Dashboard/Customizable', [
            'panels' => $panels,
            'panelData' => $panelData,
            'availableTypes' => DashboardPanel::getAvailableTypes(),
            'layout' => $layout,
        ]);
    }

    /**
     * Store a new dashboard panel
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'required|string',
            'position' => 'required|array',
            'size' => 'required|array',
            'config' => 'nullable|array',
            'dashboard_layout' => 'string',
        ]);

        $availableTypes = DashboardPanel::getAvailableTypes();
        if (!isset($availableTypes[$validated['type']])) {
            return response()->json(['error' => 'Invalid panel type'], 400);
        }

        $panel = DashboardPanel::create([
            'user_id' => auth()->id(),
            'component' => $availableTypes[$validated['type']]['component'],
            ...$validated
        ]);

        return response()->json([
            'panel' => $panel,
            'data' => $this->getPanelData($panel)
        ]);
    }

    /**
     * Update a dashboard panel
     */
    public function update(Request $request, DashboardPanel $panel)
    {
        // Ensure user owns the panel
        if ($panel->user_id !== auth()->id()) {
            abort(403);
        }

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'position' => 'sometimes|array',
            'size' => 'sometimes|array',
            'config' => 'sometimes|array',
            'is_visible' => 'sometimes|boolean',
        ]);

        $panel->update($validated);

        return response()->json([
            'panel' => $panel->fresh(),
            'data' => $this->getPanelData($panel)
        ]);
    }

    /**
     * Remove a dashboard panel
     */
    public function destroy(DashboardPanel $panel)
    {
        // Ensure user owns the panel
        if ($panel->user_id !== auth()->id()) {
            abort(403);
        }

        $panel->delete();

        return response()->json(['message' => 'Panel deleted successfully']);
    }

    /**
     * Update panel layout (positions and sizes)
     */
    public function updateLayout(Request $request)
    {
        $validated = $request->validate([
            'panels' => 'required|array',
            'panels.*.id' => 'required|exists:dashboard_panels,id',
            'panels.*.position' => 'required|array',
            'panels.*.size' => 'required|array',
        ]);

        foreach ($validated['panels'] as $panelUpdate) {
            $panel = DashboardPanel::where('id', $panelUpdate['id'])
                ->where('user_id', auth()->id())
                ->first();

            if ($panel) {
                $panel->update([
                    'position' => $panelUpdate['position'],
                    'size' => $panelUpdate['size'],
                ]);
            }
        }

        return response()->json(['message' => 'Layout updated successfully']);
    }

    /**
     * Reset dashboard to default layout
     */
    public function resetToDefault(Request $request)
    {
        $layout = $request->get('layout', 'main');

        // Delete existing panels for this layout
        DashboardPanel::where('user_id', auth()->id())
            ->where('dashboard_layout', $layout)
            ->delete();

        // Create default panels
        DashboardPanel::createDefaultPanels(auth()->id(), $layout);

        return response()->json(['message' => 'Dashboard reset to default']);
    }

    /**
     * Get data for a specific panel
     */
    private function getPanelData(DashboardPanel $panel)
    {
        switch ($panel->type) {
            case 'analytics_overview':
                return $this->getAnalyticsOverviewData($panel);
            case 'security_alerts':
                return $this->getSecurityAlertsData($panel);
            case 'performance_metrics':
                return $this->getPerformanceMetricsData($panel);
            case 'recent_scans':
                return $this->getRecentScansData($panel);
            case 'website_status':
                return $this->getWebsiteStatusData($panel);
            case 'system_health':
                return $this->getSystemHealthData($panel);
            default:
                return [];
        }
    }

    /**
     * Get analytics overview data
     */
    private function getAnalyticsOverviewData(DashboardPanel $panel)
    {
        $dateRange = [
            'start' => now()->subDays(30),
            'end' => now()
        ];

        // Get basic stats
        $stats = [
            'total_websites' => \App\Models\Website::count(),
            'healthy_websites' => \App\Models\Website::whereHas('analytics', function($query) {
                $query->where('health_score', '>=', 80);
            })->count(),
            'critical_issues' => \App\Models\SecurityAudit::where('severity', 'critical')
                ->where('status', 'open')->count(),
            'total_scans' => \App\Models\WebsiteScan::whereBetween('created_at', [
                $dateRange['start'], $dateRange['end']
            ])->count(),
        ];

        // Get chart data for the last 7 days
        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $scanCount = \App\Models\WebsiteScan::whereDate('created_at', $date)->count();
            $chartData[] = [
                'name' => $date->format('M j'),
                'value' => $scanCount,
                'date' => $date->format('Y-m-d')
            ];
        }

        // Get security overview
        $securityOverview = [
            'overall_score' => round(\App\Models\WebsiteAnalytics::avg('security_score') ?? 0),
            'critical_issues' => $stats['critical_issues'],
            'total_audits' => \App\Models\SecurityAudit::whereBetween('detected_at', [
                $dateRange['start'], $dateRange['end']
            ])->count(),
        ];

        // Get performance metrics
        $performanceMetrics = [
            'avg_load_time' => round(\App\Models\WebsiteAnalytics::avg('page_load_time') ?? 0, 2) . 's',
            'uptime_percentage' => round(\App\Models\WebsiteAnalytics::avg('uptime_percentage') ?? 0, 1),
            'last_scan' => \App\Models\WebsiteScan::latest()->first()?->created_at,
        ];

        // Get recent activity
        $recentActivity = collect();
        
        // Recent scans
        $recentScans = \App\Models\WebsiteScan::with('website')
            ->latest()
            ->limit(3)
            ->get()
            ->map(function($scan) {
                return [
                    'type' => 'scan',
                    'description' => "Scanned {$scan->website->name}",
                    'timestamp' => $scan->created_at,
                    'website_id' => $scan->website_id,
                ];
            });

        // Recent security audits
        $recentAudits = \App\Models\SecurityAudit::with('website')
            ->latest('detected_at')
            ->limit(2)
            ->get()
            ->map(function($audit) {
                return [
                    'type' => 'security',
                    'description' => "Security issue found on {$audit->website->name}",
                    'timestamp' => $audit->detected_at,
                    'website_id' => $audit->website_id,
                ];
            });

        $recentActivity = $recentScans->concat($recentAudits)
            ->sortByDesc('timestamp')
            ->take(5)
            ->values();

        return [
            'stats' => $stats,
            'chartData' => $chartData,
            'securityOverview' => $securityOverview,
            'performanceMetrics' => $performanceMetrics,
            'recentActivity' => $recentActivity,
        ];
    }

    /**
     * Get security alerts data
     */
    private function getSecurityAlertsData(DashboardPanel $panel)
    {
        $alerts = \App\Models\SecurityAudit::with('website')
            ->where('status', 'open')
            ->orderBy('detected_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($alert) {
                return [
                    'id' => $alert->id,
                    'title' => $alert->vulnerability_type ?? $alert->title,
                    'severity' => $alert->severity,
                    'website' => $alert->website->name ?? $alert->website->domain_name,
                    'detected_at' => $alert->detected_at->diffForHumans(),
                ];
            });

        return [
            'alerts' => $alerts,
            'totalCritical' => \App\Models\SecurityAudit::where('severity', 'critical')->where('status', 'open')->count(),
            'totalHigh' => \App\Models\SecurityAudit::where('severity', 'high')->where('status', 'open')->count(),
        ];
    }

    /**
     * Get performance metrics data
     */
    private function getPerformanceMetricsData(DashboardPanel $panel)
    {
        $analytics = \App\Models\WebsiteAnalytics::whereBetween('created_at', [
            now()->subDays(7), now()
        ]);

        return [
            'avgResponseTime' => round($analytics->avg('load_time') ?? 0, 2),
            'avgUptime' => round($analytics->avg('uptime_percentage') ?? 0, 2),
            'avgHealthScore' => round($analytics->avg('health_score') ?? 0, 1),
            'trends' => $this->getPerformanceTrends(),
        ];
    }

    /**
     * Get recent scans data
     */
    private function getRecentScansData(DashboardPanel $panel)
    {
        $recentScans = \App\Models\WebsiteScan::with('website')
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'website_id' => $scan->website_id,
                    'website' => $scan->website ? [
                        'id' => $scan->website->id,
                        'name' => $scan->website->name,
                        'domain_name' => $scan->website->domain_name,
                    ] : null,
                    'domain_name' => $scan->website->domain_name ?? $scan->domain_name,
                    'status' => $scan->status ?? 'completed',
                    'created_at' => $scan->created_at,
                    'duration_seconds' => $scan->duration_seconds,
                    'issues_found' => $scan->issues_found ?? 0,
                    'error_message' => $scan->error_message,
                ];
            });

        // Get scan statistics
        $scanStats = [
            'completed_today' => \App\Models\WebsiteScan::whereDate('created_at', today())
                ->where('status', 'completed')
                ->count(),
            'failed_today' => \App\Models\WebsiteScan::whereDate('created_at', today())
                ->where('status', 'failed')
                ->count(),
            'running' => \App\Models\WebsiteScan::where('status', 'running')->count(),
            'total_today' => \App\Models\WebsiteScan::whereDate('created_at', today())->count(),
        ];

        return [
            'recentScans' => $recentScans,
            'scanStats' => $scanStats,
        ];
    }

    /**
     * Get website status data
     */
    private function getWebsiteStatusData(DashboardPanel $panel)
    {
        $websites = \App\Models\Website::with(['latestAnalytics', 'securityAudits'])
            ->limit(10)
            ->get()
            ->map(function ($website) {
                $latestAnalytics = $website->latestAnalytics;
                $criticalIssues = $website->securityAudits->where('severity', 'critical')->where('status', 'open')->count();
                
                return [
                    'id' => $website->id,
                    'name' => $website->name ?? $website->domain_name,
                    'health_score' => $latestAnalytics->health_score ?? 0,
                    'uptime' => $latestAnalytics->uptime_percentage ?? 0,
                    'critical_issues' => $criticalIssues,
                    'status' => $this->getWebsiteStatus($latestAnalytics, $criticalIssues),
                ];
            });

        return [
            'websites' => $websites,
            'totalOnline' => $websites->where('status', 'online')->count(),
            'totalOffline' => $websites->where('status', 'offline')->count(),
        ];
    }

    /**
     * Get system health data
     */
    private function getSystemHealthData(DashboardPanel $panel)
    {
        return [
            'cpu_usage' => rand(10, 50), // Mock data - replace with actual system metrics
            'memory_usage' => rand(30, 70),
            'disk_usage' => rand(20, 60),
            'active_jobs' => \App\Models\ScheduledScan::where('status', 'running')->count(),
            'queue_size' => rand(0, 10),
        ];
    }

    /**
     * Get performance trends for charts
     */
    private function getPerformanceTrends()
    {
        $trends = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = now()->subDays($i);
            $dayAnalytics = \App\Models\WebsiteAnalytics::whereDate('created_at', $date);
            
            $trends[] = [
                'date' => $date->format('M j'),
                'responseTime' => round($dayAnalytics->avg('load_time') ?? 0, 2),
                'uptime' => round($dayAnalytics->avg('uptime_percentage') ?? 0, 2),
                'healthScore' => round($dayAnalytics->avg('health_score') ?? 0, 1),
            ];
        }
        return $trends;
    }

    /**
     * Determine website status based on analytics and security
     */
    private function getWebsiteStatus($analytics, $criticalIssues)
    {
        if (!$analytics) return 'unknown';
        if ($criticalIssues > 0) return 'critical';
        if ($analytics->uptime_percentage < 95) return 'offline';
        if ($analytics->health_score > 80) return 'online';
        return 'warning';
    }
}
