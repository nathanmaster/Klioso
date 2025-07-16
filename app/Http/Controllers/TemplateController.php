<?php

namespace App\Http\Controllers;

use App\Models\Template;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TemplateController extends Controller
{
    public function index()
    {
        $templates = Template::all()->map(function ($template) {
            return [
                'id' => $template->id,
                'name' => $template->name,
                'description' => $template->description,
                'source_url' => $template->source_url,
                'notes' => $template->notes,
            ];
        });
        return Inertia::render('Templates/Index', [
            'templates' => $templates,
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
