<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\HostingProviderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebsiteController;
use App\Http\Controllers\WebsiteGroupController;
use App\Http\Controllers\ScheduledScanController;
use App\Http\Controllers\PluginController;
use App\Http\Controllers\TemplateController;
use App\Http\Controllers\WordPressScanController;
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
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

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
});

require __DIR__.'/auth.php';
