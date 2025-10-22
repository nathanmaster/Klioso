<?php

use App\Http\Controllers\Management\ClientController;
use App\Http\Controllers\Management\HostingProviderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Management\WebsiteController;
use App\Http\Controllers\Management\WebsiteGroupController;
use App\Http\Controllers\Scanner\ScheduledScanController;
use App\Http\Controllers\Management\PluginController;
use App\Http\Controllers\Management\TemplateController;
use App\Http\Controllers\Scanner\WordPressScanController;
use App\Http\Controllers\SecurityScanController;
use App\Http\Controllers\Analytics\AnalyticsController;
use App\Http\Controllers\Analytics\DashboardController;
use App\Http\Controllers\Admin\EmailTestController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    // Get comprehensive dashboard data using new services
    $healthScoreService = app(\App\Services\HealthScoreService::class);
    
    $totalWebsites = \App\Models\Website::count();
    $totalClients = \App\Models\Client::count();
    $totalScans = \App\Models\ScanHistory::count();
    $recentScans = \App\Models\ScanHistory::with('website')->latest()->limit(5)->get();
    
    // Calculate overall health metrics
    $websites = \App\Models\Website::with('latestAnalytics')->get();
    $healthScores = [];
    $totalHealthScore = 0;
    $healthyWebsites = 0;
    $criticalWebsites = 0;
    
    foreach ($websites as $website) {
        try {
            $healthData = $healthScoreService->calculateHealthScore($website);
            $healthScores[] = $healthData;
            $totalHealthScore += $healthData['overall_score'];
            
            if ($healthData['overall_score'] >= 80) {
                $healthyWebsites++;
            } elseif ($healthData['overall_score'] < 50) {
                $criticalWebsites++;
            }
        } catch (\Exception $e) {
            // Log error but continue with other websites
            \Log::warning("Failed to calculate health score for website {$website->id}: " . $e->getMessage());
            $healthScores[] = ['overall_score' => 0];
        }
    }
    
    $averageHealthScore = $websites->count() > 0 ? round($totalHealthScore / $websites->count()) : 0;
    
    // Security metrics
    $criticalSecurityIssues = \App\Models\SecurityAudit::where('severity', 'critical')
        ->where('status', 'open')->count();
    $totalSecurityIssues = \App\Models\SecurityAudit::where('status', 'open')->count();
    
    // Performance metrics (with fallback for null values)
    $avgLoadTime = \App\Models\WebsiteAnalytics::whereNotNull('load_time')
        ->avg('load_time') ?: 0;
    
    // Maintenance alerts (with fallback for null tables)
    $outdatedWebsites = \App\Models\WebsiteAnalytics::where('wp_updates_available', true)
        ->distinct('website_id')->count();
    $pluginUpdatesNeeded = \App\Models\WebsiteAnalytics::whereNotNull('outdated_plugins')
        ->where('outdated_plugins', '>', 0)->sum('outdated_plugins') ?: 0;
    
    // Calculate health distribution safely
    $distribution = ['excellent' => 0, 'good' => 0, 'fair' => 0, 'poor' => 0];
    foreach ($healthScores as $healthData) {
        $score = $healthData['overall_score'] ?? 0;
        if ($score >= 90) {
            $distribution['excellent']++;
        } elseif ($score >= 80) {
            $distribution['good']++;
        } elseif ($score >= 60) {
            $distribution['fair']++;
        } else {
            $distribution['poor']++;
        }
    }
    
    return Inertia::render('Dashboard', [
        'stats' => [
            'totalWebsites' => $totalWebsites,
            'totalClients' => $totalClients,
            'totalScans' => $totalScans,
            'healthyWebsites' => $healthyWebsites,
            'criticalWebsites' => $criticalWebsites,
            'averageHealthScore' => $averageHealthScore,
            'criticalSecurityIssues' => $criticalSecurityIssues,
            'totalSecurityIssues' => $totalSecurityIssues,
            'avgLoadTime' => round($avgLoadTime, 2),
            'outdatedWebsites' => $outdatedWebsites,
            'pluginUpdatesNeeded' => $pluginUpdatesNeeded,
        ],
        'recentScans' => $recentScans,
        'healthOverview' => [
            'averageScore' => $averageHealthScore,
            'distribution' => $distribution,
        ],
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');

// Test route
Route::get('/test', function () {
    return Inertia::render('Test');
})->name('test');

// Customizable Dashboard Routes
Route::get('/dashboard/customizable', [DashboardController::class, 'index'])->name('dashboard.customizable');
Route::post('/dashboard/panels', [DashboardController::class, 'storePanel'])->name('dashboard.panels.store');
Route::patch('/dashboard/panels/{panel}', [DashboardController::class, 'updatePanel'])->name('dashboard.panels.update');
Route::delete('/dashboard/panels/{panel}', [DashboardController::class, 'destroyPanel'])->name('dashboard.panels.destroy');
Route::post('/dashboard/layout', [DashboardController::class, 'updateLayout'])->name('dashboard.layout.update');
Route::post('/dashboard/reset', [DashboardController::class, 'resetLayout'])->name('dashboard.reset');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Resource routes
    Route::resource('clients', ClientController::class);
    Route::resource('hosting-providers', HostingProviderController::class);
    Route::resource('websites', WebsiteController::class);
    Route::resource('plugins', PluginController::class);
    Route::resource('templates', TemplateController::class);
    Route::resource('groups', WebsiteGroupController::class);
    Route::resource('scheduled-scans', ScheduledScanController::class);

    // Website Group management routes
    Route::put('/groups/{group}/order', [WebsiteGroupController::class, 'updateOrder'])->name('groups.update-order');
    Route::post('/groups/{group}/websites', [WebsiteGroupController::class, 'addWebsites'])->name('groups.add-websites');
    Route::delete('/groups/{group}/websites', [WebsiteGroupController::class, 'removeWebsites'])->name('groups.remove-websites');
    Route::get('/ungrouped-websites', [WebsiteGroupController::class, 'ungroupedWebsites'])->name('groups.ungrouped-websites');

    // Scheduled Scan management routes
    Route::post('/scheduled-scans/{scheduledScan}/toggle', [ScheduledScanController::class, 'toggleActive'])->name('scheduled-scans.toggle');
    Route::post('/scheduled-scans/{scheduledScan}/run', [ScheduledScanController::class, 'runNow'])->name('scheduled-scans.run');
    Route::post('/scheduled-scans/{scheduledScan}/reset-progress', [ScheduledScanController::class, 'resetProgress'])->name('scheduled-scans.reset-progress');
    Route::get('/scheduled-scans-due', [ScheduledScanController::class, 'due'])->name('scheduled-scans.due');

    // Website-Plugin relationship routes
    Route::post('/websites/{website}/plugins', [WebsiteController::class, 'attachPlugin'])->name('websites.plugins.attach');
    Route::put('/websites/{website}/plugins/{plugin}', [WebsiteController::class, 'updatePlugin'])->name('websites.plugins.update');
    Route::delete('/websites/{website}/plugins/{plugin}', [WebsiteController::class, 'detachPlugin'])->name('websites.plugins.detach');

    // WordPress Scanner routes
    Route::get('/scanner', [WordPressScanController::class, 'index'])->name('scanner.index');
    Route::get('/scanner/history', [WordPressScanController::class, 'history'])->name('scanner.history');
    Route::post('/scanner/export', [WordPressScanController::class, 'export'])->name('scanner.export');
    Route::post('/scan', [WordPressScanController::class, 'scan'])->name('scanner.scan');
    Route::post('/websites/{website}/scan', [WordPressScanController::class, 'scanWebsite'])->name('scanner.website');
    Route::post('/scanner/add-plugin', [WordPressScanController::class, 'addPlugin'])->name('scanner.add-plugin');
    Route::post('/scanner/bulk-add-plugins', [WordPressScanController::class, 'bulkAddPlugins'])->name('scanner.bulk-add-plugins');
    Route::post('/scanner/bulk-scan', [WordPressScanController::class, 'bulkScan'])->name('scanner.bulk-scan');

    // Security Scanner routes
    Route::get('/security', [SecurityScanController::class, 'index'])->name('security.index');
    Route::post('/security/scan/{website}', [SecurityScanController::class, 'scanWebsite'])->name('security.scan-website');
    Route::post('/security/bulk-scan', [SecurityScanController::class, 'bulkScan'])->name('security.bulk-scan');
    Route::get('/security/report/{website}', [SecurityScanController::class, 'getVulnerabilityReport'])->name('security.report');
    Route::get('/security/api-status', [SecurityScanController::class, 'getApiStatus'])->name('security.api-status');

    // Bulk Website Operations
    Route::post('/websites/bulk-assign-group', [WebsiteController::class, 'bulkAssignGroup'])->name('websites.bulk-assign-group');
    Route::post('/websites/bulk-status-update', [WebsiteController::class, 'bulkStatusUpdate'])->name('websites.bulk-status-update');
    Route::post('/scheduled-scans/bulk-create', [ScheduledScanController::class, 'bulkCreate'])->name('scheduled-scans.bulk-create');

    // Bulk Client Operations
    Route::post('/clients/bulk-status-update', [ClientController::class, 'bulkStatusUpdate'])->name('clients.bulk-status-update');
    Route::delete('/clients/bulk-delete', [ClientController::class, 'bulkDelete'])->name('clients.bulk-delete');

    // Bulk Hosting Provider Operations
    Route::post('/hosting-providers/bulk-status-update', [HostingProviderController::class, 'bulkStatusUpdate'])->name('hosting-providers.bulk-status-update');
    Route::delete('/hosting-providers/bulk-delete', [HostingProviderController::class, 'bulkDelete'])->name('hosting-providers.bulk-delete');

    // Bulk Plugin Operations
    Route::post('/plugins/bulk-type-update', [PluginController::class, 'bulkTypeUpdate'])->name('plugins.bulk-type-update');
    Route::delete('/plugins/bulk-delete', [PluginController::class, 'bulkDelete'])->name('plugins.bulk-delete');

    // Bulk Template Operations
    Route::post('/templates/bulk-category-update', [TemplateController::class, 'bulkCategoryUpdate'])->name('templates.bulk-category-update');
    Route::delete('/templates/bulk-delete', [TemplateController::class, 'bulkDelete'])->name('templates.bulk-delete');

    // Analytics Dashboard Routes
    Route::get('/analytics', [AnalyticsController::class, 'dashboard'])->name('analytics.dashboard');
    Route::get('/analytics/website/{website}', [AnalyticsController::class, 'website'])->name('analytics.website');
    Route::get('/analytics/security', [AnalyticsController::class, 'security'])->name('analytics.security');
    Route::get('/analytics/performance', [AnalyticsController::class, 'performance'])->name('analytics.performance');
    Route::post('/analytics/export', [AnalyticsController::class, 'exportReport'])->name('analytics.export');
    Route::get('/analytics/realtime', [AnalyticsController::class, 'realtime'])->name('analytics.realtime');
    Route::post('/analytics/refresh', [AnalyticsController::class, 'refresh'])->name('analytics.refresh');
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary'])->name('analytics.summary');
    
    // Analytics Collection Routes
    Route::post('/websites/{website}/collect-analytics', [WebsiteController::class, 'collectAnalytics'])->name('websites.collect-analytics');
    Route::post('/websites/bulk-collect-analytics', [WebsiteController::class, 'bulkCollectAnalytics'])->name('websites.bulk-collect-analytics');

    // Email Testing Routes (Development)
    Route::get('/email-test', [EmailTestController::class, 'index'])->name('email-test.index');
    Route::post('/email-test/send', [EmailTestController::class, 'send'])->name('email-test.send');
    Route::post('/email-test/bulk', [EmailTestController::class, 'sendBulkTest'])->name('email-test.bulk');
    Route::get('/email-test/config', [EmailTestController::class, 'testConfig'])->name('email-test.config');
});

// API Routes for Error Logging and Analytics (no CSRF required)
Route::prefix('api')->middleware(['web'])->group(function () {
    Route::post('/analytics/error', [App\Http\Controllers\Api\AnalyticsController::class, 'logError']);
    Route::post('/analytics/page-view', [App\Http\Controllers\Api\AnalyticsController::class, 'logPageView']);
    Route::get('/analytics/errors', [App\Http\Controllers\Api\AnalyticsController::class, 'getErrorAnalytics'])->middleware('auth');
    
    // Health Score API routes
    Route::middleware('auth')->group(function () {
        Route::get('/health-score/dashboard', [App\Http\Controllers\Api\HealthScoreController::class, 'dashboard'])->name('api.health-score.dashboard');
        Route::get('/health-score/all', [App\Http\Controllers\Api\HealthScoreController::class, 'all'])->name('api.health-score.all');
        Route::get('/health-score/website/{website}', [App\Http\Controllers\Api\HealthScoreController::class, 'website'])->name('api.health-score.website');
        Route::get('/health-score/trends/{website}', [App\Http\Controllers\Api\HealthScoreController::class, 'trends'])->name('api.health-score.trends');
    });
});

require __DIR__.'/auth.php';
