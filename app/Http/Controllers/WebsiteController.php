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
        $query = Website::with(['client', 'hostingProvider', 'dnsProvider', 'emailProvider', 'domainRegistrar']);
        
        // Search functionality
        if ($request->search) {
            $query->where('domain_name', 'like', '%' . $request->search . '%')
                  ->orWhere('platform', 'like', '%' . $request->search . '%')
                  ->orWhereHas('client', function($q) use ($request) {
                      $q->where('name', 'like', '%' . $request->search . '%');
                  });
        }
        
        // Sorting functionality
        $sortBy = $request->get('sort_by', 'domain_name');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        // Validate sort parameters
        $allowedSortFields = ['domain_name', 'platform', 'status', 'created_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'domain_name';
        }
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'asc';
        }
        
        $query->orderBy($sortBy, $sortDirection);
        
        // Pagination
        $websites = $query->paginate($request->get('per_page', 15))
            ->withQueryString();
        
        $websiteData = $websites->getCollection()->map(function ($website) {
            return [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
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
                'dnsProvider' => $website->dnsProvider ? [
                    'id' => $website->dnsProvider->id,
                    'name' => $website->dnsProvider->name,
                ] : null,
                'emailProvider' => $website->emailProvider ? [
                    'id' => $website->emailProvider->id,
                    'name' => $website->emailProvider->name,
                ] : null,
                'domainRegistrar' => $website->domainRegistrar ? [
                    'id' => $website->domainRegistrar->id,
                    'name' => $website->domainRegistrar->name,
                ] : null,
            ];
        });
        
        return Inertia::render('Websites/Index', [
            'websites' => $websiteData,
            'pagination' => [
                'current_page' => $websites->currentPage(),
                'last_page' => $websites->lastPage(),
                'per_page' => $websites->perPage(),
                'total' => $websites->total(),
                'from' => $websites->firstItem(),
                'to' => $websites->lastItem(),
                'path' => $request->url(),
            ],
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
            'filters' => $request->only('search'),
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function create()
    {
        $clients = Client::all()->map(fn($c) => ['id' => $c->id, 'name' => $c->name]);
        $hostingProviders = HostingProvider::all()->map(fn($p) => [
            'id' => $p->id, 
            'name' => $p->name,
            'provides_hosting' => $p->provides_hosting,
            'provides_dns' => $p->provides_dns,
            'provides_email' => $p->provides_email,
            'provides_domain_registration' => $p->provides_domain_registration,
        ]);
        return Inertia::render('Websites/Create', [
            'clients' => $clients,
            'hostingProviders' => $hostingProviders,
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => 'nullable|exists:clients,id',
            'hosting_provider_id' => 'nullable|exists:hosting_providers,id',
            'dns_provider_id' => 'nullable|exists:hosting_providers,id',
            'email_provider_id' => 'nullable|exists:hosting_providers,id',
            'domain_registrar_id' => 'nullable|exists:hosting_providers,id',
            'domain_name' => 'required|string|unique:websites,domain_name',
            'platform' => 'required|string',
            'status' => 'required|string',
            'notes' => 'nullable|string',
        ]);
        Website::create($data);
        return redirect()->route('websites.index');
    }

    public function show(Website $website)
    {
        $website->load([
            'client', 
            'hostingProvider', 
            'dnsProvider', 
            'emailProvider', 
            'domainRegistrar', 
            'plugins'
        ]);
        $allPlugins = \App\Models\Plugin::all();
        
        return Inertia::render('Websites/Show', [
            'website' => [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
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
                'dnsProvider' => $website->dnsProvider ? [
                    'id' => $website->dnsProvider->id,
                    'name' => $website->dnsProvider->name,
                ] : null,
                'emailProvider' => $website->emailProvider ? [
                    'id' => $website->emailProvider->id,
                    'name' => $website->emailProvider->name,
                ] : null,
                'domainRegistrar' => $website->domainRegistrar ? [
                    'id' => $website->domainRegistrar->id,
                    'name' => $website->domainRegistrar->name,
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
        $hostingProviders = HostingProvider::all()->map(fn($p) => [
            'id' => $p->id, 
            'name' => $p->name,
            'provides_hosting' => $p->provides_hosting,
            'provides_dns' => $p->provides_dns,
            'provides_email' => $p->provides_email,
            'provides_domain_registration' => $p->provides_domain_registration,
        ]);
        $allPlugins = \App\Models\Plugin::all();
        $website->load(['plugins']);
        
        return Inertia::render('Websites/Edit', [
            'website' => [
                'id' => $website->id,
                'domain_name' => $website->domain_name,
                'platform' => $website->platform,
                'status' => $website->status,
                'notes' => $website->notes,
                'client_id' => $website->client_id,
                'hosting_provider_id' => $website->hosting_provider_id,
                'dns_provider_id' => $website->dns_provider_id,
                'email_provider_id' => $website->email_provider_id,
                'domain_registrar_id' => $website->domain_registrar_id,
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
            'client_id' => 'nullable|exists:clients,id',
            'hosting_provider_id' => 'nullable|exists:hosting_providers,id',
            'dns_provider_id' => 'nullable|exists:hosting_providers,id',
            'email_provider_id' => 'nullable|exists:hosting_providers,id',
            'domain_registrar_id' => 'nullable|exists:hosting_providers,id',
            'domain_name' => 'required|string|unique:websites,domain_name,' . $website->id,
            'platform' => 'required|string',
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
