<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DashboardPanel extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'type',
        'component',
        'position',
        'size',
        'config',
        'is_visible',
        'is_default',
        'dashboard_layout',
    ];

    protected $casts = [
        'config' => 'array',
        'is_visible' => 'boolean',
        'is_default' => 'boolean',
        'position' => 'array',
        'size' => 'array',
    ];

    /**
     * Get the user that owns this dashboard panel
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for getting panels for a specific dashboard layout
     */
    public function scopeForLayout($query, $layout = 'main')
    {
        return $query->where('dashboard_layout', $layout);
    }

    /**
     * Scope for getting visible panels
     */
    public function scopeVisible($query)
    {
        return $query->where('is_visible', true);
    }

    /**
     * Scope for getting default panels
     */
    public function scopeDefault($query)
    {
        return $query->where('is_default', true);
    }

    /**
     * Get available panel types
     */
    public static function getAvailableTypes()
    {
        return [
            'analytics_overview' => [
                'name' => 'Analytics Overview',
                'description' => 'General analytics metrics and KPIs',
                'component' => 'AnalyticsOverviewPanel',
                'icon' => 'ChartBarIcon',
                'size' => ['w' => 4, 'h' => 2],
            ],
            'security_alerts' => [
                'name' => 'Security Alerts',
                'description' => 'Latest security issues and vulnerabilities',
                'component' => 'SecurityAlertsPanel',
                'icon' => 'ShieldExclamationIcon',
                'size' => ['w' => 4, 'h' => 3],
            ],
            'performance_metrics' => [
                'name' => 'Performance Metrics',
                'description' => 'Website performance and uptime statistics',
                'component' => 'PerformanceMetricsPanel',
                'icon' => 'ChartLineIcon',
                'size' => ['w' => 6, 'h' => 3],
            ],
            'recent_scans' => [
                'name' => 'Recent Scans',
                'description' => 'Latest scan results and activity',
                'component' => 'RecentScansPanel',
                'icon' => 'MagnifyingGlassIcon',
                'size' => ['w' => 4, 'h' => 3],
            ],
            'website_status' => [
                'name' => 'Website Status',
                'description' => 'Current status of monitored websites',
                'component' => 'WebsiteStatusPanel',
                'icon' => 'GlobeAltIcon',
                'size' => ['w' => 3, 'h' => 2],
            ],
            'system_health' => [
                'name' => 'System Health',
                'description' => 'Overall system health and resource usage',
                'component' => 'SystemHealthPanel',
                'icon' => 'CpuChipIcon',
                'size' => ['w' => 3, 'h' => 2],
            ],
            'custom_chart' => [
                'name' => 'Custom Chart',
                'description' => 'Configurable chart with custom data source',
                'component' => 'CustomChartPanel',
                'icon' => 'PresentationChartLineIcon',
                'size' => ['w' => 6, 'h' => 4],
            ],
            'quick_actions' => [
                'name' => 'Quick Actions',
                'description' => 'Frequently used actions and shortcuts',
                'component' => 'QuickActionsPanel',
                'icon' => 'BoltIcon',
                'size' => ['w' => 2, 'h' => 3],
            ],
        ];
    }

    /**
     * Create default panels for a user
     */
    public static function createDefaultPanels($userId, $layout = 'main')
    {
        $defaultPanels = [
            [
                'title' => 'Analytics Overview',
                'type' => 'analytics_overview',
                'component' => 'AnalyticsOverviewPanel',
                'position' => ['x' => 0, 'y' => 0],
                'size' => ['w' => 4, 'h' => 2],
                'is_default' => true,
                'is_visible' => true,
            ],
            [
                'title' => 'Security Alerts',
                'type' => 'security_alerts',
                'component' => 'SecurityAlertsPanel',
                'position' => ['x' => 4, 'y' => 0],
                'size' => ['w' => 4, 'h' => 2],
                'is_default' => true,
                'is_visible' => true,
            ],
            [
                'title' => 'Performance Trends',
                'type' => 'performance_metrics',
                'component' => 'PerformanceMetricsPanel',
                'position' => ['x' => 8, 'y' => 0],
                'size' => ['w' => 4, 'h' => 2],
                'is_default' => true,
                'is_visible' => true,
            ],
            [
                'title' => 'Recent Scans',
                'type' => 'recent_scans',
                'component' => 'RecentScansPanel',
                'position' => ['x' => 0, 'y' => 2],
                'size' => ['w' => 6, 'h' => 3],
                'is_default' => true,
                'is_visible' => true,
            ],
            [
                'title' => 'Website Status',
                'type' => 'website_status',
                'component' => 'WebsiteStatusPanel',
                'position' => ['x' => 6, 'y' => 2],
                'size' => ['w' => 6, 'h' => 3],
                'is_default' => true,
                'is_visible' => true,
            ],
        ];

        foreach ($defaultPanels as $panelData) {
            self::create([
                'user_id' => $userId,
                'dashboard_layout' => $layout,
                ...$panelData
            ]);
        }
    }
}
