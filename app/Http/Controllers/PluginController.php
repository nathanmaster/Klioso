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
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }
        $plugins = $query->get()->map(function ($plugin) {
            return [
                'id' => $plugin->id,
                'name' => $plugin->name,
                'description' => $plugin->description,
                'is_paid' => $plugin->is_paid,
                'purchase_url' => $plugin->purchase_url,
                'install_source' => $plugin->install_source,
            ];
        });
        return Inertia::render('Plugins/Index', [
            'plugins' => $plugins,
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