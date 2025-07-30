import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';
import WebsitePlugins from '@/Components/WebsitePlugins';

export default function Show({ website, allPlugins = [] }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Website Details</h1>}>
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
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Website Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Domain Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{website.domain_name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Platform</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{website.platform || '-'}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                website.status === 'active' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                                website.status === 'inactive' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                            }`}>
                                {website.status || 'Unknown'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {website.client ? (
                                    <Link href={`/clients/${website.client.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {website.client.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400 italic">No client assigned</span>
                                )}
                            </p>
                        </div>
                        {website.notes && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{website.notes}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Service Providers Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Service Providers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="inline-flex items-center">
                                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                                    Hosting Provider
                                </span>
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {website.hostingProvider ? (
                                    <Link href={`/hosting-providers/${website.hostingProvider.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {website.hostingProvider.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400 italic">Not assigned</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="inline-flex items-center">
                                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                                    DNS Provider
                                </span>
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {website.dnsProvider ? (
                                    <Link href={`/hosting-providers/${website.dnsProvider.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {website.dnsProvider.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400 italic">Not assigned</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="inline-flex items-center">
                                    <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                                    Email Provider
                                </span>
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {website.emailProvider ? (
                                    <Link href={`/hosting-providers/${website.emailProvider.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {website.emailProvider.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400 italic">Not assigned</span>
                                )}
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span className="inline-flex items-center">
                                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                                    Domain Registrar
                                </span>
                            </label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                                {website.domainRegistrar ? (
                                    <Link href={`/hosting-providers/${website.domainRegistrar.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {website.domainRegistrar.name}
                                    </Link>
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400 italic">Not assigned</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Website Plugins Management */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
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