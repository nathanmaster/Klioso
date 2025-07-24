<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\HostingProviderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebsiteController;
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

    // Website-Plugin relationship routes
    Route::post('/websites/{website}/plugins', [WebsiteController::class, 'attachPlugin'])->name('websites.plugins.attach');
    Route::put('/websites/{website}/plugins/{plugin}', [WebsiteController::class, 'updatePlugin'])->name('websites.plugins.update');
    Route::delete('/websites/{website}/plugins/{plugin}', [WebsiteController::class, 'detachPlugin'])->name('websites.plugins.detach');

    // WordPress Scanner routes
    Route::get('/scanner', [WordPressScanController::class, 'index'])->name('scanner.index');
    Route::post('/scan', [WordPressScanController::class, 'scan'])->name('scanner.scan');
    Route::post('/websites/{website}/scan', [WordPressScanController::class, 'scanWebsite'])->name('scanner.website');
    Route::post('/scanner/add-plugin', [WordPressScanController::class, 'addPlugin'])->name('scanner.add-plugin');
});

require __DIR__.'/auth.php';
