<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index(Request $request)
    {
        $query = Template::query();
        
        // Search functionality
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('description', 'like', '%' . $request->search . '%');
        }
        
        // Sorting functionality
        $sortBy = $request->get('sort_by', 'name');
        $sortDirection = $request->get('sort_direction', 'asc');
        
        // Validate sort parameters
        $allowedSortFields = ['name', 'description', 'created_at'];
        if (!in_array($sortBy, $allowedSortFields)) {
            $sortBy = 'name';
        }
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'asc';
        }
        
        $query->orderBy($sortBy, $sortDirection);
        
        // Pagination
        $templates = $query->paginate($request->get('per_page', 15))
            ->withQueryString();
        
        $templateData = $templates->getCollection()->map(function ($template) {
            return [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'source_url' => $template->source_url,
                'notes' => $template->notes,
            ];
        });
        
        return Inertia::render('Templates/Index', [
            'templates' => $templateData,
            'pagination' => [
                'current_page' => $templates->currentPage(),
                'last_page' => $templates->lastPage(),
                'per_page' => $templates->perPage(),
                'total' => $templates->total(),
                'from' => $templates->firstItem(),
                'to' => $templates->lastItem(),
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
        return Inertia::render('Templates/Create', [
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        Template::create($request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'source_url' => 'nullable|string',
            'notes' => 'nullable|string',
        ]));
        return redirect()->route('templates.index');
    }

    public function show(Template $template)
    {
        return Inertia::render('Templates/Show', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'source_url' => $template->source_url,
                'notes' => $template->notes,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(Template $template)
    {
        return Inertia::render('Templates/Edit', [
            'template' => [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'source_url' => $template->source_url,
                'notes' => $template->notes,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function update(Request $request, Template $template)
    {
        $template->update($request->validate([
            'name' => 'required|string',
            'description' => 'nullable|string',
            'source_url' => 'nullable|string',
            'notes' => 'nullable|string',
        ]));
        return redirect()->route('templates.index');
    }

    public function destroy(Template $template)
    {
        $template->delete();
        return redirect()->route('templates.index');
    }
}
