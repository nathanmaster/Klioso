import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Show({ plugin, websites }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Plugin Details</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href={`/plugins/${plugin.id}/edit`} size="sm" className="mt-4">Edit Plugin</Button>
                </nav>
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4">{plugin.name}</h2>
                        <div className="mb-2"><strong>Description:</strong> {plugin.description}</div>
                        <div className="mb-2"><strong>Paid:</strong> {plugin.is_paid ? 'Yes' : 'No'}</div>
                        <div className="mb-2"><strong>Purchase URL:</strong> {plugin.purchase_url}</div>
                        <div className="mb-2"><strong>Install Source:</strong> {plugin.install_source}</div>
                        <div className="mt-6">
                            <h3 className="font-semibold mb-2">Websites Using This Plugin</h3>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th>Domain</th>
                                        <th>Version</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 items-center text-center">
                                    {websites.map(site => (
                                        <tr key={site.id}>
                                            <td className="text-center">
                                                <Link href={`/websites/${site.id}`}>{site.domain_name}</Link>
                                            </td>
                                            <td className="text-center">{site.pivot.version || '-'}</td>
                                            <td className="text-center">{site.pivot.is_active ? 'Active' : 'Inactive'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
