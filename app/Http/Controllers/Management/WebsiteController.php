<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;

use App\Models\Website;
use App\Models\Client;
use App\Models\HostingProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WebsiteController extends Controller
{
    public function index(Request $request)
    {
        $query = Website::with(['client', 'hostingProvider', 'dnsProvider', 'emailProvider', 'domainRegistrar', 'group']);
        
        // Search functionality
        $search = $request->get('search');
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('domain_name', 'like', "%{$search}%")
                  ->orWhere('display_name', 'like', "%{$search}%")
                  ->orWhere('platform', 'like', "%{$search}%")
                  ->orWhere('notes', 'like', "%{$search}%")
                  ->orWhereHas('client', function($clientQuery) use ($search) {
                      $clientQuery->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        $statusFilter = $request->get('status');
        if ($statusFilter && $statusFilter !== 'all') {
            $query->where('status', $statusFilter);
        }

        // Platform filter
        $platformFilter = $request->get('platform');
        if ($platformFilter && $platformFilter !== 'all') {
            $query->where('platform', $platformFilter);
        }

        // Group filter
        $groupFilter = $request->get('group_id');
        if ($groupFilter && $groupFilter !== 'all') {
            if ($groupFilter === 'ungrouped') {
                $query->whereNull('group_id');
            } else {
                $query->where('group_id', $groupFilter);
            }
        }

        // Client filter
        $clientFilter = $request->get('client_id');
        if ($clientFilter && $clientFilter !== 'all') {
            $query->where('client_id', $clientFilter);
        }
        
        // Sorting functionality
        $sortBy = $request->get('sort_by', 'domain_name');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        // Validate sort parameters
        $allowedSortFields = ['domain_name', 'display_name', 'platform', 'status', 'created_at', 'updated_at'];
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

        // Get groups for filter dropdown
        $groups = \App\Models\WebsiteGroup::select('id', 'name')->get();

        $websiteData = $websites->getCollection()->map(function ($website) {
            return [
                'id' => $website->id,
                'name' => $website->name,
                'url' => $website->url,
                'domain_name' => $website->domain_name,
                'display_name' => $website->display_name,
                'display_label' => $website->display_label,
                'platform' => $website->platform,
                'status' => $website->status,
                'notes' => $website->notes,
                'wordpress_version' => $website->wordpress_version,
                'last_scan' => $website->last_scan,
                'created_at' => $website->created_at,
                'updated_at' => $website->updated_at,
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
                'group' => $website->group ? [
                    'id' => $website->group->id,
                    'name' => $website->group->name,
                    'color' => $website->group->color,
                    'icon' => $website->group->icon,
                ] : null,
            ];
        });

        // Get website groups for bulk operations
        $groups = \App\Models\WebsiteGroup::active()->ordered()->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'color' => $group->color,
                'icon' => $group->icon,
                'websites_count' => $group->websites_count,
            ];
        });
        
        return Inertia::render('Websites/IndexNew', [
            'websites' => $websiteData,
            'groups' => $groups,
            'pagination' => [
                'current_page' => $websites->currentPage(),
                'last_page' => $websites->lastPage(),
                'per_page' => $websites->perPage(),
                'total' => $websites->total(),
                'from' => $websites->firstItem(),
                'to' => $websites->lastItem(),
            ],
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
                'platform' => $platformFilter,
                'group_id' => $groupFilter,
                'client_id' => $clientFilter,
            ],
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
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
                        'last_updated' => $plugin->pivot->last_updated,
                        'created_at' => $plugin->pivot->created_at,
                        'updated_at' => $plugin->pivot->updated_at,
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
                        'last_updated' => $plugin->pivot->last_updated,
                        'created_at' => $plugin->pivot->created_at,
                        'updated_at' => $plugin->pivot->updated_at,
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
            'last_updated' => now(),
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
            'last_updated' => now(),
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

    /**
     * Bulk assign websites to a group
     */
    public function bulkAssignGroup(Request $request)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
            'group_id' => 'nullable|exists:website_groups,id',
        ]);

        $websiteIds = $validated['website_ids'];
        $groupId = $validated['group_id'];

        Website::whereIn('id', $websiteIds)
            ->update(['group_id' => $groupId]);

        $count = count($websiteIds);
        $groupName = $groupId ? \App\Models\WebsiteGroup::find($groupId)->name : 'no group';
        
        return back()->with('success', "{$count} website(s) assigned to {$groupName} successfully.");
    }

    /**
     * Bulk update website status
     */
    public function bulkStatusUpdate(Request $request)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
            'status' => 'required|in:active,inactive,maintenance',
        ]);

        $websiteIds = $validated['website_ids'];
        $status = $validated['status'];

        Website::whereIn('id', $websiteIds)
            ->update(['status' => $status]);

        $count = count($websiteIds);
        
        return back()->with('success', "{$count} website(s) status updated to {$status} successfully.");
    }

    /**
     * Collect analytics for a single website
     */
    public function collectAnalytics(Website $website)
    {
        \App\Jobs\CollectWebsiteAnalytics::dispatch($website, 'full');
        
        return back()->with('success', 'Analytics collection started for ' . $website->domain_name);
    }

    /**
     * Bulk collect analytics for multiple websites
     */
    public function bulkCollectAnalytics(Request $request)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
            'scan_type' => 'nullable|in:quick,full,security',
        ]);

        $websiteIds = $validated['website_ids'];
        $scanType = $validated['scan_type'] ?? 'full';

        $websites = Website::whereIn('id', $websiteIds)->get();
        
        foreach ($websites as $website) {
            \App\Jobs\CollectWebsiteAnalytics::dispatch($website, $scanType);
        }

        $count = count($websiteIds);
        
        return back()->with('success', "Analytics collection started for {$count} website(s).");
    }
}
