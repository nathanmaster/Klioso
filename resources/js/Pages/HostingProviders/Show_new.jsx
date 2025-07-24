import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';

export default function Show({ hostingProvider }) {
    const services = [];
    if (hostingProvider.provides_hosting) services.push('Web Hosting');
    if (hostingProvider.provides_dns) services.push('DNS Management');
    if (hostingProvider.provides_email) services.push('Email Services');
    if (hostingProvider.provides_domain_registration) services.push('Domain Registration');

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Provider Details</h1>}>
            <div className="max-w-4xl mx-auto py-8">
                <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                    <div className="flex justify-between items-center mb-4">
                        <BackButton fallbackRoute="/hosting-providers" />
                        <div className="flex gap-2">
                            <Button as={Link} href={`/hosting-providers/${hostingProvider.id}/edit`} size="sm">Edit</Button>
                            <DeleteButton
                                resource={hostingProvider}
                                resourceName="provider"
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
                    <div className="mb-4">
                        <strong>Services:</strong>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {services.length > 0 ? (
                                services.map((service, index) => (
                                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                        {service}
                                    </span>
                                ))
                            ) : (
                                <span className="text-gray-500">None specified</span>
                            )}
                        </div>
                    </div>
                    <div className="mb-2"><strong>Notes:</strong> {hostingProvider.notes || '-'}</div>
                    <div className="mb-2"><strong>Created:</strong> {new Date(hostingProvider.created_at).toLocaleDateString()}</div>
                    {hostingProvider.updated_at && hostingProvider.updated_at !== hostingProvider.created_at && (
                        <div className="mb-2"><strong>Updated:</strong> {new Date(hostingProvider.updated_at).toLocaleDateString()}</div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
