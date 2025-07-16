<?php

use App\Http\Controllers\ClientController;
use App\Http\Controllers\HostingProviderController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WebsiteController;
use App\Http\Controllers\PluginController;
use App\Http\Controllers\TemplateController;
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

    // Add explicit index routes for Inertia pages
    Route::get('/clients', function () {
        return Inertia::render('Clients');
    })->name('clients.index');

    Route::get('/plugins', function () {
        return Inertia::render('Plugins');
    })->name('plugins.index');

    Route::get('/hosting-providers', function () {
        return Inertia::render('HostingProviders');
    })->name('hosting-providers.index');

    Route::get('/websites', function () {
        return Inertia::render('Websites');
    })->name('websites.index');

    Route::get('/templates', function () {
        return Inertia::render('Templates');
    })->name('templates.index');

    Route::resource('clients', ClientController::class);
    Route::resource('hosting-providers', HostingProviderController::class);
    Route::resource('websites', WebsiteController::class);
    Route::resource('plugins', PluginController::class);
    Route::resource('templates', TemplateController::class);
});

require __DIR__.'/auth.php';
