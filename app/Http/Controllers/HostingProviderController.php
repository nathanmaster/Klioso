<?php

namespace App\Http\Controllers;

use App\Models\HostingProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HostingProviderController extends Controller
{
    public function index()
    {
        $providers = HostingProvider::all()->map(function ($provider) {
            return [
                'id' => $provider->id,
                'name' => $provider->name,
                'login_url' => $provider->login_url,
            ];
        });
        return Inertia::render('HostingProviders/Index', [
            'providers' => $providers,
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function create()
    {
        return Inertia::render('HostingProviders/Create', [
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'login_url' => 'nullable|string',
        ]);
        HostingProvider::create($data);
        return redirect()->route('hosting-providers.index');
    }

    public function show(HostingProvider $hostingProvider)
    {
        return Inertia::render('HostingProviders/Show', [
            'hostingProvider' => [
                'id' => $hostingProvider->id,
                'name' => $hostingProvider->name,
                'login_url' => $hostingProvider->login_url,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(HostingProvider $hostingProvider)
    {
        return Inertia::render('HostingProviders/Edit', [
            'hostingProvider' => [
                'id' => $hostingProvider->id,
                'name' => $hostingProvider->name,
                'login_url' => $hostingProvider->login_url,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function update(Request $request, HostingProvider $hostingProvider)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'login_url' => 'nullable|string',
        ]);
        $hostingProvider->update($data);
        return redirect()->route('hosting-providers.index');
    }

    public function destroy(HostingProvider $hostingProvider)
    {
        $hostingProvider->delete();
        return redirect()->route('hosting-providers.index');
    }
}
