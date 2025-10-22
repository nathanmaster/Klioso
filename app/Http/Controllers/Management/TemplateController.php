<?php

namespace App\Http\Controllers\Management;

use App\Http\Controllers\Controller;

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
            'auth' => [
                'user' => auth()->user()
            ],
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
        ]);
    }

    public function create()
    {
        return Inertia::render('Templates/Create');
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
                'created_at' => $template->created_at,
                'updated_at' => $template->updated_at,
            ],
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

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:templates,id'
        ]);

        Template::whereIn('id', $request->ids)->delete();
        
        return redirect()->route('templates.index')
                        ->with('success', 'Selected templates have been deleted.');
    }
}
