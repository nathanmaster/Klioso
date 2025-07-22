import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';
import WebsitePlugins from '@/Components/WebsitePlugins';

export default function Show({ website, allPlugins = [] }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Website Details</h1>}>
            <div className="max-w-4xl mx-auto space-y-6 mt-8">
                {/* Header with navigation */}
                <div className="flex justify-between items-center">
                    <BackButton fallbackRoute="/websites" />
                    <div className="flex gap-2">
                        <Button as={Link} href={`/websites/${website.id}/edit`}>Edit Website</Button>
                        <DeleteButton 
                            resource={website}
                            resourceName="website"
                            deleteRoute={`/websites/${website.id}`}
                        />
                    </div>
                </div>

                {/* Website Details Card */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4">Website Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Domain Name</label>
                            <p className="mt-1 text-sm text-gray-900">{website.domain_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Platform</label>
                            <p className="mt-1 text-sm text-gray-900">{website.platform || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">DNS Provider</label>
                            <p className="mt-1 text-sm text-gray-900">{website.dns_provider || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                website.status === 'active' ? 'bg-green-100 text-green-800' :
                                website.status === 'inactive' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {website.status || 'Unknown'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Client</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {website.client ? (
                                    <Link href={`/clients/${website.client.id}`} className="text-blue-600 hover:underline">
                                        {website.client.name}
                                    </Link>
                                ) : '-'}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Hosting Provider</label>
                            <p className="mt-1 text-sm text-gray-900">
                                {website.hostingProvider ? (
                                    <Link href={`/hosting-providers/${website.hostingProvider.id}`} className="text-blue-600 hover:underline">
                                        {website.hostingProvider.name}
                                    </Link>
                                ) : '-'}
                            </p>
                        </div>
                        {website.notes && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Notes</label>
                                <p className="mt-1 text-sm text-gray-900">{website.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Website Plugins Management */}
                <div className="bg-white rounded-lg shadow p-6">
                    <WebsitePlugins 
                        website={website}
                        allPlugins={allPlugins}
                        websitePlugins={website.plugins || []}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}