import React from 'react';
import { router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { 
    EyeIcon, 
    PencilIcon, 
    TrashIcon,
    GlobeAltIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    ServerIcon
} from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';

export default function Index({ auth, websites, groups, pagination, filters = {}, sortBy, sortDirection }) {
    
    // Configure table columns
    const tableColumns = [
        {
            key: 'domain_name',
            label: 'Website',
            render: (website) => (
                <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8">
                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <GlobeAltIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {website.domain_name}
                        </div>
                        {website.display_name && website.display_name !== website.domain_name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {website.display_name}
                            </div>
                        )}
                    </div>
                </div>
            )
        },
        {
            key: 'platform',
            label: 'Platform',
            render: (website) => (
                <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                    {website.platform || 'Unknown'}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (website) => {
                const statusColors = {
                    active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
                    inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
                    maintenance: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200',
                    error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                };
                
                return (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        statusColors[website.status] || statusColors.inactive
                    }`}>
                        {website.status ? website.status.charAt(0).toUpperCase() + website.status.slice(1) : 'Unknown'}
                    </span>
                );
            }
        },
        {
            key: 'client',
            label: 'Client',
            render: (website) => (
                <div className="text-sm text-gray-900 dark:text-gray-100">
                    {website.client?.name || '-'}
                </div>
            )
        },
        {
            key: 'group',
            label: 'Group',
            render: (website) => (
                <div className="text-sm text-gray-900 dark:text-gray-100">
                    {website.group?.name || 'Ungrouped'}
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Added',
            render: (website) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(website.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (website) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={route('websites.show', website.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="View website"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={route('websites.edit', website.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                        title="Edit website"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(website)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        title="Delete website"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    // Configure grid card renderer
    const renderGridCard = (website, { selected, onSelect }) => (
        <div key={website.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg relative">
            {/* Checkbox for bulk selection */}
            {onSelect && (
                <div className="absolute top-3 left-3 z-10">
                    <input
                        type="checkbox"
                        checked={selected}
                        onChange={onSelect}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                    />
                </div>
            )}
            <div className="p-6 pt-12">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                            <GlobeAltIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {website.domain_name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {website.platform || 'Unknown Platform'}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Link
                            href={route('websites.show', website.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                        <Link
                            href={route('websites.edit', website.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
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
                
                {website.display_name && website.display_name !== website.domain_name && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {website.display_name}
                    </p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-full ${
                        website.status === 'active' 
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                            : website.status === 'maintenance'
                            ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                            : website.status === 'error'
                            ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                        {website.status ? website.status.charAt(0).toUpperCase() + website.status.slice(1) : 'Unknown'}
                    </span>
                    <span>Added {new Date(website.created_at).toLocaleDateString()}</span>
                </div>
                
                {website.client && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Client: {website.client.name}
                    </div>
                )}
            </div>
        </div>
    );

    // Configure statistics cards
    const statisticsCards = [
        {
            label: 'Total Websites',
            value: websites?.data?.length || websites?.length || 0,
            icon: GlobeAltIcon,
            color: 'text-blue-500',
            description: 'All websites in the system'
        },
        {
            label: 'Active Websites',
            value: (websites?.data || websites)?.filter(w => w.status === 'active').length || 0,
            icon: CheckCircleIcon,
            color: 'text-green-500',
            description: 'Currently active websites'
        },
        {
            label: 'Issues Detected',
            value: (websites?.data || websites)?.filter(w => w.status === 'error').length || 0,
            icon: ExclamationTriangleIcon,
            color: 'text-red-500',
            description: 'Websites with detected issues'
        }
    ];

    // Configure filter options
    const filterOptions = [
        {
            key: 'status',
            options: [
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'maintenance', label: 'Maintenance' },
                { value: 'error', label: 'Error' }
            ]
        },
        {
            key: 'platform',
            options: [
                { value: 'all', label: 'All Platforms' },
                { value: 'wordpress', label: 'WordPress' },
                { value: 'drupal', label: 'Drupal' },
                { value: 'custom', label: 'Custom' },
                { value: 'shopify', label: 'Shopify' }
            ]
        },
        {
            key: 'group_id',
            options: [
                { value: 'all', label: 'All Groups' },
                { value: 'ungrouped', label: 'Ungrouped' },
                ...(groups || []).map(group => ({
                    value: group.id.toString(),
                    label: group.name
                }))
            ]
        }
    ];

    // Handle delete
    const handleDelete = (website) => {
        if (confirm(`Are you sure you want to delete ${website.domain_name}?`)) {
            router.delete(route('websites.destroy', website.id));
        }
    };

    // Handle bulk actions
    const handleBulkAction = (action, selectedIds) => {
        if (action === 'delete') {
            if (confirm(`Are you sure you want to delete ${selectedIds.length} website(s)?`)) {
                // Implementation for bulk delete
                selectedIds.forEach(id => {
                    router.delete(route('websites.destroy', id));
                });
            }
        } else if (action === 'activate') {
            // Bulk activate websites
            router.post('/websites/bulk-update', {
                ids: selectedIds,
                status: 'active'
            });
        } else if (action === 'deactivate') {
            // Bulk deactivate websites
            router.post('/websites/bulk-update', {
                ids: selectedIds,
                status: 'inactive'
            });
        }
    };

    // Configure bulk actions
    const bulkActions = [
        {
            key: 'activate',
            label: 'Activate',
            variant: 'success',
            icon: CheckCircleIcon,
            onClick: (selectedIds) => handleBulkAction('activate', selectedIds)
        },
        {
            key: 'deactivate',
            label: 'Deactivate',
            variant: 'warning',
            icon: ExclamationTriangleIcon,
            onClick: (selectedIds) => handleBulkAction('deactivate', selectedIds)
        },
        {
            key: 'delete',
            label: 'Delete',
            variant: 'danger',
            icon: TrashIcon,
            onClick: (selectedIds) => handleBulkAction('delete', selectedIds)
        }
    ];

    // Handle search with routing
    const handleSearch = (searchTerm) => {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
        params.delete('page'); // Reset pagination
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true
        });
    };

    // Handle filtering with routing
    const handleFilter = (filteredData, currentFilters) => {
        const params = new URLSearchParams(window.location.search);
        Object.entries(currentFilters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });
        params.delete('page'); // Reset pagination
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true
        });
        
        // Return the original data since filtering is handled server-side
        return filteredData;
    };

    return (
        <UniversalPageLayout
            title="Websites"
            auth={auth}
            data={websites?.data || websites || []}
            createRoute={route('websites.create')}
            createButtonText="Add Website"
            searchPlaceholder="Search websites..."
            defaultView="table"
            allowViewToggle={true}
            allowBulkActions={true}
            allowSearch={true}
            gridColumns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            renderGridCard={renderGridCard}
            tableColumns={tableColumns}
            filterOptions={filterOptions}
            statisticsCards={statisticsCards}
            bulkActions={bulkActions}
            filters={filters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            pagination={pagination}
            onBulkAction={handleBulkAction}
            onSearch={handleSearch}
            onFilter={handleFilter}
        />
    );
}
