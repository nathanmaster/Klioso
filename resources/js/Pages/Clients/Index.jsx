import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Table from '@/Components/Table';
import Button from '@/Components/Button';

export default function Index({ clients, filters }) {
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        router.get('/clients', { search });
    }

    const columns = [
        { label: 'Name', key: 'name', render: client => <Link href={`/clients/${client.id}`}>{client.name}</Link> },
        { label: 'Contact Email', key: 'contact_email' },
        { label: 'Contact Phone', key: 'contact_phone' },
        { label: 'Address', key: 'address' },
        { label: 'Company', key: 'company' },
        { label: 'Notes', key: 'notes' },
        { label: 'Actions', key: 'actions', render: client => <Button as={Link} href={`/clients/${client.id}/edit`}>Edit</Button> }
    ];

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Clients</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href="/clients/create" size="sm" className="mt-4">+ New Client</Button>
                </nav>
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={handleSearch} className="flex items-center gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border rounded px-3 py-2 w-full max-w-xs"
                            />
                            <Button type="submit" size="sm">Search</Button>
                        </form>
                        <table className="min-w-full divide-y divide-gray-200 ">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Contact Email</th>
                                    <th>Contact Phone</th>
                                    <th>Address</th>
                                    <th>Company</th>
                                    <th>Notes</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 items-center text-center">
                                {clients.map(client => (
                                    <tr key={client.id}>
                                        <td className="text-center">{client.name}</td>
                                        <td className="text-center">{client.contact_email}</td>
                                        <td className="text-center">{client.contact_phone}</td>
                                        <td className="text-center">{client.address}</td>
                                        <td className="text-center">{client.company}</td>
                                        <td className="text-center">{client.notes}</td>
                                        <td className="text-center">
                                            <Button as={Link} href={`/clients/${client.id}/edit`}>Edit</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
