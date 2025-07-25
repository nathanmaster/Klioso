<?php

namespace App\Http\Controllers;

use App\Models\Plugin;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PluginController extends Controller
{
    public function index(Request $request)
    {
        $query = Plugin::query();
        
        // Search functionality
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }
        
        // Sorting functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        // Validate sort parameters
        $allowedSortFields = ['name', 'description', 'is_paid', 'purchase_url', 'install_source'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'name';
        }
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'asc';
        }
        
        $query->orderBy($sortBy, $sortDirection);
        
        // Pagination
        $plugins = $query->paginate($request->get('per_page', 15))
            ->withQueryString();
        
        return Inertia::render('Plugins/Index', [
            'plugins' => $plugins->items(),
            'pagination' => [
                'current_page' => $plugins->currentPage(),
                'last_page' => $plugins->lastPage(),
                'per_page' => $plugins->perPage(),
                'total' => $plugins->total(),
                'from' => $plugins->firstItem(),
                'to' => $plugins->lastItem(),
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
        return Inertia::render('Plugins/Create', [
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        Plugin::create($request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'is_paid' => 'boolean',
            'purchase_url' => 'nullable|string',
            'install_source' => 'required|string',
        ]));
        return redirect()->route('plugins.index');
    }

    public function show(Plugin $plugin)
    {
        return Inertia::render('Plugins/Show', [
            'plugin' => [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'description' => $plugin->description,
                'is_paid' => $plugin->is_paid,
                'purchase_url' => $plugin->purchase_url,
                'install_source' => $plugin->install_source,
            ],
            'websites' => $plugin->websites()->withPivot('version', 'is_active')->get()->map(function ($website) {
                return [
                    'id' => $website->id,
                    'domain_name' => $website->domain_name,
                    'pivot' => [
                        'version' => $website->pivot->version,
                        'is_active' => $website->pivot->is_active,
                    ],
                ];
            }),
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(Plugin $plugin)
    {
        return Inertia::render('Plugins/Edit', [
            'plugin' => [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'description' => $plugin->description,
                'is_paid' => $plugin->is_paid,
                'purchase_url' => $plugin->purchase_url,
                'install_source' => $plugin->install_source,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function update(Request $request, Plugin $plugin)
    {
        $plugin->update($request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'is_paid' => 'boolean',
            'purchase_url' => 'nullable|string',
            'install_source' => 'required|string',
        ]));
        return redirect()->route('plugins.index');
    }

    public function destroy(Plugin $plugin)
    {
        $plugin->delete();
        return redirect()->route('plugins.index');
    }
}