import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';

export default function Show({ hostingProvider }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Hosting Provider Details</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href={`/hosting-providers/${hostingProvider.id}/edit`} size="sm" className="mt-4">Edit Provider</Button>
                </nav>
                
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <BackButton fallbackRoute="/hosting-providers" />
                            <div className="flex gap-2">
                                <Button as={Link} href={`/hosting-providers/${hostingProvider.id}/edit`} size="sm">Edit</Button>
                                <DeleteButton
                                    resource={hostingProvider}
                                    resourceName="hosting provider"
                                    deleteRoute={`/hosting-providers/${hostingProvider.id}`}
                                    onSuccess={() => window.location.href = '/hosting-providers'}
                                />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">{hostingProvider.name}</h2>
                        <div className="mb-2"><strong>Description:</strong> {hostingProvider.description || '-'}</div>
                        <div className="mb-2">
                            <strong>Website:</strong> 
                            {hostingProvider.website ? (
                                <a href={hostingProvider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    {hostingProvider.website}
                                </a>
                            ) : '-'}
                        </div>
                        <div className="mb-2"><strong>Contact Info:</strong> {hostingProvider.contact_info || '-'}</div>
                        <div className="mb-2"><strong>Notes:</strong> {hostingProvider.notes || '-'}</div>
                        <div className="mb-2"><strong>Created:</strong> {new Date(hostingProvider.created_at).toLocaleDateString()}</div>
                        {hostingProvider.updated_at && hostingProvider.updated_at !== hostingProvider.created_at && (
                            <div className="mb-2"><strong>Updated:</strong> {new Date(hostingProvider.updated_at).toLocaleDateString()}</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
