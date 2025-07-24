<?php

namespace App\Http\Controllers;

use App\Models\HostingProvider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HostingProviderController extends Controller
{
    public function index(Request $request)
    {
        $query = HostingProvider::query();
        
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
        $hostingProviders = $query->paginate($request->get('per_page', 15))
            ->withQueryString();
        
        $providerData = $hostingProviders->getCollection()->map(function ($provider) {
            return [
                'id' => $provider->id,
                'name' => $provider->name,
                'description' => $provider->description,
                'website' => $provider->website,
                'contact_info' => $provider->contact_info,
                'notes' => $provider->notes,
                'login_url' => $provider->login_url,
                'provides_hosting' => $provider->provides_hosting,
                'provides_dns' => $provider->provides_dns,
                'provides_email' => $provider->provides_email,
                'provides_domain_registration' => $provider->provides_domain_registration,
                'services' => $provider->services_string,
            ];
        });
        
        return Inertia::render('HostingProviders/Index', [
            'hostingProviders' => $providerData,
            'pagination' => [
                'current_page' => $hostingProviders->currentPage(),
                'last_page' => $hostingProviders->lastPage(),
                'per_page' => $hostingProviders->perPage(),
                'total' => $hostingProviders->total(),
                'from' => $hostingProviders->firstItem(),
                'to' => $hostingProviders->lastItem(),
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
        return Inertia::render('HostingProviders/Create', [
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'contact_info' => 'nullable|string',
            'notes' => 'nullable|string',
            'login_url' => 'nullable|url|max:255',
            'provides_hosting' => 'boolean',
            'provides_dns' => 'boolean',
            'provides_email' => 'boolean',
            'provides_domain_registration' => 'boolean',
        ]);
        HostingProvider::create($data);
        return redirect()->route('hosting-providers.index');
    }

    public function show(HostingProvider $hostingProvider)
    {
        return Inertia::render('HostingProviders/Show', [
            'hostingProvider' => [
                'id' => $hostingProvider->id,
                'name' => $hostingProvider->name,
                'description' => $hostingProvider->description,
                'website' => $hostingProvider->website,
                'contact_info' => $hostingProvider->contact_info,
                'notes' => $hostingProvider->notes,
                'login_url' => $hostingProvider->login_url,
                'provides_hosting' => $hostingProvider->provides_hosting,
                'provides_dns' => $hostingProvider->provides_dns,
                'provides_email' => $hostingProvider->provides_email,
                'provides_domain_registration' => $hostingProvider->provides_domain_registration,
                'services' => $hostingProvider->services,
                'created_at' => $hostingProvider->created_at,
                'updated_at' => $hostingProvider->updated_at,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(HostingProvider $hostingProvider)
    {
        return Inertia::render('HostingProviders/Edit', [
            'hostingProvider' => [
                'id' => $hostingProvider->id,
                'name' => $hostingProvider->name,
                'description' => $hostingProvider->description,
                'website' => $hostingProvider->website,
                'contact_info' => $hostingProvider->contact_info,
                'notes' => $hostingProvider->notes,
                'login_url' => $hostingProvider->login_url,
                'provides_hosting' => $hostingProvider->provides_hosting,
                'provides_dns' => $hostingProvider->provides_dns,
                'provides_email' => $hostingProvider->provides_email,
                'provides_domain_registration' => $hostingProvider->provides_domain_registration,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function update(Request $request, HostingProvider $hostingProvider)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'website' => 'nullable|url|max:255',
            'contact_info' => 'nullable|string',
            'notes' => 'nullable|string',
            'login_url' => 'nullable|url|max:255',
            'provides_hosting' => 'boolean',
            'provides_dns' => 'boolean',
            'provides_email' => 'boolean',
            'provides_domain_registration' => 'boolean',
        ]);
        $hostingProvider->update($data);
        return redirect()->route('hosting-providers.index');
    }

    public function destroy(HostingProvider $hostingProvider)
    {
        $hostingProvider->delete();
        return redirect()->route('hosting-providers.index');
    }
}
