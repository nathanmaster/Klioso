import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';

export default function Show({ plugin, websites }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Plugin Details</h1>}>
            <div className="max-w-4xl mx-auto space-y-6 mt-8">
                {/* Header with navigation */}
                <div className="flex justify-between items-center">
                    <BackButton fallbackRoute="/plugins" />
                    <div className="flex gap-2">
                        <Button as={Link} href={`/plugins/${plugin.id}/edit`}>Edit Plugin</Button>
                        <DeleteButton 
                            resource={plugin}
                            resourceName="plugin"
                            deleteRoute={`/plugins/${plugin.id}`}
                        />
                    </div>
                </div>

                {/* Plugin Details Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Plugin Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{plugin.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Type</label>
                            <span className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                plugin.is_paid ? 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200' : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            }`}>
                                {plugin.is_paid ? 'Paid' : 'Free'}
                            </span>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Install Source</label>
                            <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{plugin.install_source || '-'}</p>
                        </div>
                        {plugin.is_paid && plugin.purchase_url && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Purchase URL</label>
                                <p className="mt-1 text-sm">
                                    <a href={plugin.purchase_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                                        {plugin.purchase_url}
                                    </a>
                                </p>
                            </div>
                        )}
                        {plugin.description && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{plugin.description}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Websites Using This Plugin */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Websites Using This Plugin ({websites.length})</h3>
                    {websites.length > 0 ? (
                        <div className="space-y-3">
                            {websites.map(website => (
                                <div key={website.id} className="border dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-700">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h4 className="font-medium">
                                                <Link href={`/websites/${website.id}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                                                    {website.domain_name}
                                                </Link>
                                            </h4>
                                            <div className="flex gap-4 mt-2 text-sm text-gray-900 dark:text-gray-100">
                                                <span>
                                                    <strong>Version:</strong> {website.pivot.version || 'Not specified'}
                                                </span>
                                                <span className={`px-2 py-1 rounded text-xs ${
                                                    website.pivot.is_active 
                                                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                                                        : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                                }`}>
                                                    {website.pivot.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <Button as={Link} href={`/websites/${website.id}`} size="sm" variant="outline">
                                                View Website
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                            <p>This plugin is not currently used by any websites.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
