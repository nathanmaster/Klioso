<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $query = Client::query();
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('contact_email', 'like', '%' . $request->search . '%');
        }
        $clients = $query->get();
        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only('search'),
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function create()
    {
        return Inertia::render('Clients/Create', [
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            // ...add other columns as needed...
        ]);
        Client::create($validated);
        return redirect()->route('clients.index');
    }

    public function show(Client $client)
    {
        return Inertia::render('Clients/Show', [
            'client' => $client,
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function edit(Client $client)
    {
        return Inertia::render('Clients/Edit', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'contact_email' => $client->contact_email,
                'contact_phone' => $client->contact_phone,
                'notes' => $client->notes,
            ],
            'layout' => 'AuthenticatedLayout',
        ]);
    }

    public function update(Request $request, Client $client)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'contact_email' => 'nullable|email|max:255',
            'contact_phone' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
            'company' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            // ...add other columns as needed...
        ]);
        $client->update($validated);
        return redirect()->route('clients.index');
    }

    public function destroy(Client $client)
    {
        $client->delete();
        return redirect()->route('clients.index');
    }
}
