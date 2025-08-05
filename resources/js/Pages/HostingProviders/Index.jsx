import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BulkActionsModal from '@/Components/BulkActionsModal';
import Pagination from '@/Components/Pagination';
import { 
    PlusIcon, 
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    Squares2X2Icon,
    QueueListIcon,
    ServerIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, hostingProviders, pagination, sortBy, sortDirection, filters }) {
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const currentView = urlParams.get('view') || 'table';
    
    const [selectedProviders, setSelectedProviders] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [viewMode, setViewMode] = useState(currentView);

    // Update view mode when URL changes
    useEffect(() => {
        const newView = urlParams.get('view') || 'table';
        setViewMode(newView);
    }, [url]);

    // Update URL when view mode changes
    const handleViewModeChange = (newViewMode) => {
        const params = new URLSearchParams(window.location.search);
        params.set('view', newViewMode);
        
        // Remove page parameter when changing view to start from page 1
        params.delete('page');
        
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const handleSelectProvider = (providerId) => {
        setSelectedProviders(prev => 
            prev.includes(providerId.toString()) 
                ? prev.filter(id => id !== providerId.toString())
                : [...prev, providerId.toString()]
        );
    };

    const handleSelectAll = () => {
        if (selectedProviders.length === hostingProviders.length) {
            setSelectedProviders([]);
        } else {
            setSelectedProviders(hostingProviders.map(p => p.id.toString()));
        }
    };

    const clearSelection = () => {
        setSelectedProviders([]);
    };

    const handleDelete = (provider) => {
        if (confirm(`Are you sure you want to delete "${provider.name}"?`)) {
            router.delete(route('hosting-providers.destroy', provider.id));
        }
    };

    const getServices = (provider) => {
        const services = [];
        if (provider.provides_hosting) services.push('Web Hosting');
        if (provider.provides_dns) services.push('DNS Management');
        if (provider.provides_email) services.push('Email Services');
        if (provider.provides_domain_registration) services.push('Domain Registration');
        return services;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Hosting Providers
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedProviders.length > 0 && (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedProviders.length} selected
                                </span>
                                <button
                                    onClick={() => setShowBulkModal(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                                >
                                    <CheckIcon className="h-4 w-4" />
                                    Bulk Actions
                                </button>
                                <button
                                    onClick={clearSelection}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </>
                        )}
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                            <button
                                onClick={() => handleViewModeChange('table')}
                                className={`p-2 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <QueueListIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => handleViewModeChange('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <Squares2X2Icon className="h-4 w-4" />
                            </button>
                        </div>
                        <Link
                            href={route('hosting-providers.create')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Provider
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Hosting Providers" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {viewMode === 'table' ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedProviders.length === hostingProviders.length && hostingProviders.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Provider
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Services
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {hostingProviders.map((provider) => (
                                            <tr key={provider.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedProviders.includes(provider.id.toString())}
                                                        onChange={() => handleSelectProvider(provider.id)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {provider.name}
                                                        </div>
                                                        {provider.website && (
                                                            <a 
                                                                href={provider.website} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                            >
                                                                <GlobeAltIcon className="h-3 w-3" />
                                                                Visit Website
                                                            </a>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-wrap gap-1">
                                                        {getServices(provider).map((service, index) => (
                                                            <span 
                                                                key={index}
                                                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                                            >
                                                                {service}
                                                            </span>
                                                        ))}
                                                        {getServices(provider).length === 0 && (
                                                            <span className="text-sm text-gray-500 dark:text-gray-400">No services specified</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={provider.description}>
                                                        {provider.description ? (provider.description.length > 60 ? `${provider.description.substring(0, 60)}...` : provider.description) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={provider.contact_info}>
                                                        {provider.contact_info ? (provider.contact_info.length > 40 ? `${provider.contact_info.substring(0, 40)}...` : provider.contact_info) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('hosting-providers.show', provider.id)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('hosting-providers.edit', provider.id)}
                                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(provider)}
                                                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {hostingProviders.map((provider) => (
                                <div key={provider.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedProviders.includes(provider.id.toString())}
                                                onChange={() => handleSelectProvider(provider.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                            />
                                            <div className="flex gap-1">
                                                <Link
                                                    href={route('hosting-providers.show', provider.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('hosting-providers.edit', provider.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(provider)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                                                <ServerIcon className="h-5 w-5 text-indigo-500" />
                                                {provider.name}
                                            </h3>
                                            {provider.website && (
                                                <a 
                                                    href={provider.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    <GlobeAltIcon className="h-3 w-3" />
                                                    Visit Website
                                                </a>
                                            )}
                                        </div>
                                        <div className="space-y-3">
                                            {provider.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{provider.description}</p>
                                            )}
                                            <div>
                                                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Services:</span>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {getServices(provider).map((service, index) => (
                                                        <span 
                                                            key={index}
                                                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200"
                                                        >
                                                            {service}
                                                        </span>
                                                    ))}
                                                    {getServices(provider).length === 0 && (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">None specified</span>
                                                    )}
                                                </div>
                                            </div>
                                            {provider.contact_info && (
                                                <div className="text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Contact:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{provider.contact_info}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.last_page > 1 && (
                        <div className="mt-6">
                            <Pagination 
                                {...pagination} 
                                queryParams={{
                                    view: viewMode,
                                    ...Object.fromEntries(urlParams.entries())
                                }}
                            />
                        </div>
                    )}

                    {showBulkModal && (
                        <BulkActionsModal
                            isOpen={showBulkModal}
                            onClose={() => setShowBulkModal(false)}
                            selectedItems={selectedProviders}
                            items={hostingProviders}
                            onClearSelection={clearSelection}
                            resourceType="hosting-providers"
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
