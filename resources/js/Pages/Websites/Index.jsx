import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BulkActionsModal from '@/Components/BulkActionsModal';
import Pagination from '@/Components/Pagination';
import { safeRoute } from '@/Utils/safeRoute';
import { 
    PlusIcon, 
    CheckIcon,
    XMarkIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    Squares2X2Icon,
    QueueListIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, websites, groups, pagination, filters, sortBy, sortDirection }) {
    const { url } = usePage();
    const urlParams = new URLSearchParams(url.split('?')[1] || '');
    const currentView = urlParams.get('view') || 'table';
    
    const [selectedWebsites, setSelectedWebsites] = useState([]);
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

    const handleSelectWebsite = (websiteId) => {
        setSelectedWebsites(prev => 
            prev.includes(websiteId.toString()) 
                ? prev.filter(id => id !== websiteId.toString())
                : [...prev, websiteId.toString()]
        );
    };

    const handleSelectAll = () => {
        if (selectedWebsites.length === websites.length) {
            setSelectedWebsites([]);
        } else {
            setSelectedWebsites(websites.map(w => w.id.toString()));
        }
    };

    const clearSelection = () => {
        setSelectedWebsites([]);
    };

    const handleDelete = (website) => {
        if (confirm(`Are you sure you want to delete "${website.domain_name}"?`)) {
            router.delete(safeRoute('websites.destroy', website.id));
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
            case 'inactive': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
            case 'maintenance': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Websites
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedWebsites.length > 0 && (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedWebsites.length} selected
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
                            href={route('websites.create')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Website
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Websites" />

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
                                                    checked={selectedWebsites.length === websites.length && websites.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Website
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Group
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Client
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Last Scan
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {websites.map((website) => (
                                            <tr key={website.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedWebsites.includes(website.id.toString())}
                                                        onChange={() => handleSelectWebsite(website.id)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                            {website.domain_name}
                                                        </div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{website.domain_name}</div>
                                                        {website.wordpress_version && (
                                                            <div className="text-xs text-blue-600 dark:text-blue-400">WordPress {website.wordpress_version}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(website.status)}`}>
                                                        {website.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {website.group ? (
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-4 h-4 rounded flex items-center justify-center text-xs"
                                                                style={{ backgroundColor: website.group.color }}
                                                            >
                                                                {website.group.icon === 'globe' ? '🌍' : '📁'}
                                                            </div>
                                                            <span className="text-sm text-gray-900 dark:text-gray-100">{website.group.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">No group</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {website.client ? (
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{website.client.name}</span>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">No client</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                    {website.last_scan ? new Date(website.last_scan).toLocaleDateString() : 'Never'}
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={safeRoute('websites.show', website.id)}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={safeRoute('websites.edit', website.id)}
                                                            className="text-gray-600 hover:text-gray-900"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(website)}
                                                            className="text-red-600 hover:text-red-900"
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
                            {websites.map((website) => (
                                <div key={website.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedWebsites.includes(website.id.toString())}
                                                onChange={() => handleSelectWebsite(website.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                            />
                                            <div className="flex gap-1">
                                                <Link
                                                    href={safeRoute('websites.show', website.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={safeRoute('websites.edit', website.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(website)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                {website.domain_name}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{website.domain_name}</p>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(website.status)}`}>
                                                    {website.status}
                                                </span>
                                            </div>
                                            
                                            {website.group && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Group</span>
                                                    <div className="flex items-center gap-1">
                                                        <div
                                                            className="w-3 h-3 rounded"
                                                            style={{ backgroundColor: website.group.color }}
                                                        />
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{website.group.name}</span>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {website.client && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Client</span>
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">{website.client.name}</span>
                                                </div>
                                            )}
                                            
                                            {website.wordpress_version && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">WordPress</span>
                                                    <span className="text-sm text-gray-900 dark:text-gray-100">{website.wordpress_version}</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Last Scan</span>
                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                    {website.last_scan ? new Date(website.last_scan).toLocaleDateString() : 'Never'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {websites.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500">🌐</div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No websites</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Get started by adding your first website.
                                </p>
                                <div className="mt-6">
                                    <Link
                                        href={route('websites.create')}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Add Website
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

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

            <BulkActionsModal
                isOpen={showBulkModal}
                onClose={() => setShowBulkModal(false)}
                selectedWebsites={selectedWebsites}
                websites={websites}
                groups={groups}
                onClearSelection={clearSelection}
                resourceType="websites"
            />
        </AuthenticatedLayout>
    );
}
