import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import Table from '@/Components/Table';
import Button from '@/Components/Button';

export default function Index({ plugins }) {
    const [search, setSearch] = useState('');

    const columns = [
        { label: 'Name', key: 'name', render: plugin => <Link href={`/plugins/${plugin.id}`}>{plugin.name}</Link> },
        { label: 'Description', key: 'description' },
        { label: 'Paid', key: 'is_paid', render: plugin => plugin.is_paid ? 'Yes' : 'No' },
        { label: 'Purchase URL', key: 'purchase_url' },
        { label: 'Install Source', key: 'install_source' },
        { label: 'Actions', key: 'actions', render: plugin => <Button as={Link} href={`/plugins/${plugin.id}/edit`}>Edit</Button> }
    ];

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Plugins</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href="/plugins/create" size="sm" className="mt-4">+ Add Plugin</Button>
                </nav>
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6">
                        <form onSubmit={e => e.preventDefault()} className="flex items-center gap-2 mb-6">
                            <input
                                type="text"
                                placeholder="Search plugins..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="border rounded px-3 py-2 w-full max-w-xs"
                            />
                            <Button type="submit" size="sm">Search</Button>
                        </form>
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Paid</th>
                                    <th>Purchase URL</th>
                                    <th>Install Source</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 items-center text-center">
                                {plugins.map(plugin => (
                                    <tr key={plugin.id}>
                                        <td className="text-center">
                                            <Link href={`/plugins/${plugin.id}`}>{plugin.name}</Link>
                                        </td>
                                        <td className="text-center">{plugin.description}</td>
                                        <td className="text-center">{plugin.is_paid ? 'Yes' : 'No'}</td>
                                        <td className="text-center">{plugin.purchase_url}</td>
                                        <td className="text-center">{plugin.install_source}</td>
                                        <td className="text-center">
                                            <Button as={Link} href={`/plugins/${plugin.id}/edit`}>Edit</Button>
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