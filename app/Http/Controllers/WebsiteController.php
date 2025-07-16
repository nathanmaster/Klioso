<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Client;
use App\Models\HostingProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebsiteController extends Controller
{
    public function index()
    {
        $websites = Website::with(['client', 'hostingProvider'])->get()->map(function ($website) {
            return [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
                'dns_provider' => $website->dns_provider,
                'status' => $website->status,
                'notes' => $website->notes,
                'client' => $website->client ? [
                    'id' => $website->client->id,
                    'name' => $website->client->name,
                ] : null,
                'hostingProvider' => $website->hostingProvider ? [
                    'id' => $website->hostingProvider->id,
                    'name' => $website->hostingProvider->name,
                ] : null,
            ];
        });
        return Inertia::render('Websites/Index', [
            'websites' => $websites,
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function create()
    {
        $clients = Client::all()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);
        $providers = HostingProvider::all()->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);
        return Inertia::render('Websites/Create', [
            'clients' => $clients,
            'providers' => $providers,
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'hosting_provider_id' => 'required|exists:hosting_providers,id',
            'domain_name' => 'required|string|unique:websites,domain_name',
            'platform' => 'required|string',
            'dns_provider' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);
        Website::create($data);
        return redirect()->route('websites.index');
    }

    public function show(Website $website)
    {
        $website->load(['client', 'hostingProvider', 'plugins']);
        return Inertia::render('Websites/Show', [
            'website' => [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
                'dns_provider' => $website->dns_provider,
                'status' => $website->status,
                'notes' => $website->notes,
                'client' => $website->client ? [
                    'id' => $website->client->id,
                    'name' => $website->client->name,
                ] : null,
                'hostingProvider' => $website->hostingProvider ? [
                    'id' => $website->hostingProvider->id,
                    'name' => $website->hostingProvider->name,
                ] : null,
                'plugins' => $website->plugins->map(fn($plugin) => [
                    'id' => $plugin->id,
                    'name' => $plugin->name,
                    'pivot' => [
                        'version' => $plugin->pivot->version,
                        'is_active' => $plugin->pivot->is_active,
                    ],
                ]),
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(Website $website)
    {
        $clients = Client::all()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);
        $providers = HostingProvider::all()->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);
        return Inertia::render('Websites/Edit', [
            'website' => [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
                'dns_provider' => $website->dns_provider,
                'status' => $website->status,
                'notes' => $website->notes,
                'client_id' => $website->client_id,
                'hosting_provider_id' => $website->hosting_provider_id,
            ],
            'clients' => $clients,
            'providers' => $providers,
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function update(Request $request, Website $website)
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'hosting_provider_id' => 'required|exists:hosting_providers,id',
            'domain_name' => 'required|string|unique:websites,domain_name,' . $website->id,
            'platform' => 'required|string',
            'dns_provider' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);
        $website->update($data);
        return redirect()->route('websites.index');
    }

    public function destroy(Website $website)
    {
        $website->delete();
        return redirect()->route('websites.index');
    }
}
