<?php

namespace App\Http\Controllers;

use App\Models\Website;
use App\Models\Client;
use App\Models\HostingProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebsiteController extends Controller
{
    public function index(Request $request)
    {
        $query = Website::with(['client', 'hostingProvider']);
        if ($request->search) {
            $query->where('domain_name', 'like', '%' . $request->search . '%')
                  ->orWhere('platform', 'like', '%' . $request->search . '%');
        }
        $websites = $query->get()->map(function ($website) {
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
            'filters' => $request->only('search'),
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function create()
    {
        $clients = Client::all()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);
        $hostingProviders = HostingProvider::all()->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);
        return Inertia::render('Websites/Create', [
            'clients' => $clients,
            'hostingProviders' => $hostingProviders,
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
        $allPlugins = \App\Models\Plugin::all();
        
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
                    'description' => $plugin->description,
                    'pivot' => [
                        'version' => $plugin->pivot->version,
                        'is_active' => $plugin->pivot->is_active,
                    ],
                ]),
            ],
            'allPlugins' => $allPlugins->map(fn($plugin) => [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'description' => $plugin->description,
            ]),
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(Website $website)
    {
        $clients = Client::all()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);
        $hostingProviders = HostingProvider::all()->map(fn($p) => ['id' => $p->id, 'name' => $p->name]);
        $allPlugins = \App\Models\Plugin::all();
        $website->load(['plugins']);
        
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
                'plugins' => $website->plugins->map(fn($plugin) => [
                    'id' => $plugin->id,
                    'name' => $plugin->name,
                    'description' => $plugin->description,
                    'pivot' => [
                        'version' => $plugin->pivot->version,
                        'is_active' => $plugin->pivot->is_active,
                    ],
                ]),
            ],
            'clients' => $clients,
            'hostingProviders' => $hostingProviders,
            'allPlugins' => $allPlugins->map(fn($plugin) => [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'description' => $plugin->description,
            ]),
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

    /**
     * Attach a plugin to a website
     */
    public function attachPlugin(Request $request, Website $website)
    {
        $data = $request->validate([
            'plugin_id' => 'required|exists:plugins,id',
            'version' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Check if plugin is already attached
        if ($website->plugins()->where('plugin_id', $data['plugin_id'])->exists()) {
            return response()->json(['message' => 'Plugin is already attached to this website.'], 422);
        }

        $website->plugins()->attach($data['plugin_id'], [
            'version' => $data['version'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Plugin attached successfully.');
    }

    /**
     * Update a plugin attached to a website
     */
    public function updatePlugin(Request $request, Website $website, $pluginId)
    {
        $data = $request->validate([
            'version' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Check if plugin is attached
        if (!$website->plugins()->where('plugin_id', $pluginId)->exists()) {
            return response()->json(['message' => 'Plugin is not attached to this website.'], 404);
        }

        $website->plugins()->updateExistingPivot($pluginId, [
            'version' => $data['version'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return redirect()->back()->with('success', 'Plugin updated successfully.');
    }

    /**
     * Detach a plugin from a website
     */
    public function detachPlugin(Website $website, $pluginId)
    {
        // Check if plugin is attached
        if (!$website->plugins()->where('plugin_id', $pluginId)->exists()) {
            return response()->json(['message' => 'Plugin is not attached to this website.'], 404);
        }

        $website->plugins()->detach($pluginId);

        return redirect()->back()->with('success', 'Plugin removed successfully.');
    }
}
