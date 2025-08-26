<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;

use App\Models\WebsiteGroup;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class WebsiteGroupController extends Controller
{
    /**
     * Display a listing of website groups.
     */
    public function index(Request $request)
    {
        // Get query parameters
        $search = $request->get('search');
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        $statusFilter = $request->get('status', 'all');
        
        // Build query
        $query = WebsiteGroup::with('websites')->withCount('websites');
        
        // Apply search filter
        if ($search) {
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        
        // Apply status filter
        if ($statusFilter !== 'all') {
            $query->where('is_active', $statusFilter === 'active');
        }
        
        // Validate sort parameters
        $allowedSortFields = ['name', 'created_at', 'websites_count', 'sort_order'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'name';
        }
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'asc';
        }
        
        // Apply sorting
        if ($sortBy === 'websites_count') {
            $query->orderBy('websites_count', $sortDirection);
        } else {
            $query->orderBy($sortBy, $sortDirection);
        }
        
        // If no custom sorting, apply default ordering
        if ($sortBy !== 'sort_order') {
            $query->orderBy('sort_order', 'asc');
        }
        
        $groups = $query->get()->map(function ($group) {
            return [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'color' => $group->color,
                'icon' => $group->icon,
                'sort_order' => $group->sort_order,
                'is_active' => $group->is_active,
                'websites_count' => $group->websites_count,
                'created_at' => $group->created_at,
                'updated_at' => $group->updated_at,
            ];
        });

        return Inertia::render('Groups/Index', [
            'groups' => $groups,
            'availableColors' => WebsiteGroup::getAvailableColors(),
            'availableIcons' => WebsiteGroup::getAvailableIcons(),
            'filters' => [
                'search' => $search,
                'status' => $statusFilter,
            ],
            'sortBy' => $sortBy,
            'sortDirection' => $sortDirection,
        ]);
    }

    /**
     * Show the form for creating a new website group.
     */
    public function create()
    {
        return Inertia::render('Groups/Create', [
            'availableColors' => WebsiteGroup::getAvailableColors(),
            'availableIcons' => WebsiteGroup::getAvailableIcons(),
        ]);
    }

    /**
     * Store a newly created website group in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:website_groups',
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|max:7',
            'icon' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Set sort order to be last
        $maxSortOrder = WebsiteGroup::max('sort_order') ?? 0;
        $validated['sort_order'] = $maxSortOrder + 1;
        $validated['is_active'] = $validated['is_active'] ?? true;

        $group = WebsiteGroup::create($validated);

        return redirect()->route('groups.index')
            ->with('success', 'Website group created successfully.');
    }

    /**
     * Display the specified website group.
     */
    public function show(WebsiteGroup $group)
    {
        $group->load(['websites' => function ($query) {
            $query->with(['client', 'hostingProvider', 'scanHistory' => function ($query) {
                $query->latest()->limit(1);
            }]);
        }]);

        return Inertia::render('Groups/Show', [
            'group' => [
                'id' => $group->id,
                'name' => $group->name,
                'description' => $group->description,
                'color' => $group->color,
                'icon' => $group->icon,
                'sort_order' => $group->sort_order,
                'is_active' => $group->is_active,
                'websites_count' => $group->websites->count(),
                'created_at' => $group->created_at,
                'updated_at' => $group->updated_at,
                'websites' => $group->websites->map(function ($website) {
                    return [
                        'id' => $website->id,
                        'name' => $website->name,
                        'url' => $website->url,
                        'status' => $website->status,
                        'status_color' => $website->status_color,
                        'wordpress_version' => $website->wordpress_version,
                        'last_scan' => $website->last_scan,
                        'client' => $website->client,
                        'hosting_provider' => $website->hostingProvider,
                        'latest_scan' => $website->scanHistory->first(),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Show the form for editing the specified website group.
     */
    public function edit(WebsiteGroup $group)
    {
        return Inertia::render('Groups/Edit', [
            'group' => $group,
            'availableColors' => WebsiteGroup::getAvailableColors(),
            'availableIcons' => WebsiteGroup::getAvailableIcons(),
        ]);
    }

    /**
     * Update the specified website group in storage.
     */
    public function update(Request $request, WebsiteGroup $group)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('website_groups')->ignore($group->id)],
            'description' => 'nullable|string|max:1000',
            'color' => 'required|string|max:7',
            'icon' => 'required|string|max:255',
            'is_active' => 'boolean',
        ]);

        $group->update($validated);

        return redirect()->route('groups.index')
            ->with('success', 'Website group updated successfully.');
    }

    /**
     * Remove the specified website group from storage.
     */
    public function destroy(WebsiteGroup $group)
    {
        // Check if group has websites
        if ($group->websites()->count() > 0) {
            return back()->with('error', 'Cannot delete group that contains websites. Please move websites to another group first.');
        }

        $group->delete();

        return redirect()->route('groups.index')
            ->with('success', 'Website group deleted successfully.');
    }

    /**
     * Update the sort order of website groups.
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'groups' => 'required|array',
            'groups.*.id' => 'required|exists:website_groups,id',
            'groups.*.sort_order' => 'required|integer|min:1',
        ]);

        foreach ($validated['groups'] as $groupData) {
            WebsiteGroup::where('id', $groupData['id'])
                ->update(['sort_order' => $groupData['sort_order']]);
        }

        return back()->with('success', 'Group order updated successfully.');
    }

    /**
     * Add websites to a group.
     */
    public function addWebsites(Request $request, WebsiteGroup $group)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
        ]);

        Website::whereIn('id', $validated['website_ids'])
            ->update(['group_id' => $group->id]);

        $count = count($validated['website_ids']);
        
        return back()->with('success', "{$count} website(s) added to group successfully.");
    }

    /**
     * Remove websites from a group.
     */
    public function removeWebsites(Request $request, WebsiteGroup $group)
    {
        $validated = $request->validate([
            'website_ids' => 'required|array',
            'website_ids.*' => 'exists:websites,id',
        ]);

        Website::whereIn('id', $validated['website_ids'])
            ->where('group_id', $group->id)
            ->update(['group_id' => null]);

        $count = count($validated['website_ids']);
        
        return back()->with('success', "{$count} website(s) removed from group successfully.");
    }

    /**
     * Get ungrouped websites for assignment.
     */
    public function ungroupedWebsites()
    {
        $websites = Website::whereNull('group_id')
            ->with(['client', 'hostingProvider'])
            ->get()
            ->map(function ($website) {
                return [
                    'id' => $website->id,
                    'name' => $website->name,
                    'url' => $website->url,
                    'status' => $website->status,
                    'client' => $website->client?->name,
                    'hosting_provider' => $website->hostingProvider?->name,
                ];
            });

        return response()->json($websites);
    }
}
