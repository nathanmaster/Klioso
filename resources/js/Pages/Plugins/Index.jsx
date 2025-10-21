import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { 
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    PuzzlePieceIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    CalendarDaysIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, plugins, pagination, sortBy = 'name', sortDirection = 'asc', filters = {} }) {
    // Table column configuration
    const tableColumns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (plugin) => (
                <div className="flex items-center gap-2">
                    <PuzzlePieceIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {plugin.name}
                    </span>
                </div>
            )
        },
        {
            key: 'version',
            label: 'Version',
            sortable: true,
            render: (plugin) => (
                <div className="text-sm text-gray-900 dark:text-gray-100">
                    {plugin.version ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-mono rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            v{plugin.version}
                        </span>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">-</span>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            sortable: false,
            render: (plugin) => (
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    plugin.is_active 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                    {plugin.is_active ? (
                        <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Active
                        </>
                    ) : (
                        <>
                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                            Inactive
                        </>
                    )}
                </span>
            )
        },
        {
            key: 'description',
            label: 'Description',
            sortable: false,
            render: (plugin) => (
                <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs">
                    {plugin.description ? (
                        <span title={plugin.description}>
                            {plugin.description.length > 60 ? `${plugin.description.substring(0, 60)}...` : plugin.description}
                        </span>
                    ) : (
                        <span className="text-gray-500 dark:text-gray-400">No description</span>
                    )}
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (plugin) => (
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CalendarDaysIcon className="h-3 w-3" />
                    {new Date(plugin.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (plugin) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={route('plugins.show', plugin.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                        title="View Plugin"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    {plugin.url && (
                        <a
                            href={plugin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1"
                            title="Open Plugin URL"
                        >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>
                    )}
                    <Link
                        href={route('plugins.edit', plugin.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 p-1"
                        title="Edit Plugin"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(plugin)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                        title="Delete Plugin"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    // Grid card renderer
    const renderGridCard = (plugin) => (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <PuzzlePieceIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{plugin.name}</h3>
                    {plugin.version && (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-mono rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                            v{plugin.version}
                        </span>
                    )}
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                    plugin.is_active 
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                    {plugin.is_active ? (
                        <>
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Active
                        </>
                    ) : (
                        <>
                            <ExclamationCircleIcon className="h-3 w-3 mr-1" />
                            Inactive
                        </>
                    )}
                </span>
            </div>
            
            {plugin.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {plugin.description.length > 120 ? `${plugin.description.substring(0, 120)}...` : plugin.description}
                </p>
            )}
            
            <div className="space-y-2">
                {plugin.author && (
                    <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Author:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{plugin.author}</span>
                    </div>
                )}
                {plugin.url && (
                    <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">URL:</span>
                        <a 
                            href={plugin.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {plugin.url.replace(/^https?:\/\//, '')}
                        </a>
                    </div>
                )}
                {plugin.category && (
                    <div className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Category:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">{plugin.category}</span>
                    </div>
                )}
            </div>
            
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <CalendarDaysIcon className="h-3 w-3" />
                    Created {new Date(plugin.created_at).toLocaleDateString()}
                </span>
                <div className="flex gap-1">
                    <Link
                        href={route('plugins.show', plugin.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View Plugin"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    {plugin.url && (
                        <a
                            href={plugin.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-green-600 dark:hover:text-green-400"
                            title="Open Plugin URL"
                        >
                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        </a>
                    )}
                    <Link
                        href={route('plugins.edit', plugin.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit Plugin"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(plugin)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Plugin"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    // Statistics cards configuration
    const statisticsCards = [
        {
            label: 'Total Plugins',
            value: pagination?.total || plugins.length,
            icon: PuzzlePieceIcon,
            color: 'text-blue-500'
        },
        {
            label: 'Active Plugins',
            value: plugins.filter(plugin => plugin.is_active).length,
            icon: CheckCircleIcon,
            color: 'text-green-500'
        },
        {
            label: 'With URLs',
            value: plugins.filter(plugin => plugin.url).length,
            icon: ArrowTopRightOnSquareIcon,
            color: 'text-purple-500'
        }
    ];

    // Filter options configuration
    const filterOptions = [
        {
            key: 'status',
            label: 'Status',
            type: 'select',
            options: [
                { value: 'all', label: 'All Plugins' },
                { value: 'active', label: 'Active Only' },
                { value: 'inactive', label: 'Inactive Only' }
            ]
        },
        {
            key: 'category',
            label: 'Category',
            type: 'select',
            options: [
                { value: 'all', label: 'All Categories' },
                ...Array.from(new Set(plugins.map(p => p.category).filter(Boolean)))
                    .map(category => ({ value: category, label: category }))
            ]
        },
        {
            key: 'has_url',
            label: 'Has URL',
            type: 'select',
            options: [
                { value: 'all', label: 'All Plugins' },
                { value: 'yes', label: 'With URL' },
                { value: 'no', label: 'Without URL' }
            ]
        }
    ];

    // Bulk actions configuration
    const bulkActions = [
        {
            label: 'Delete Selected',
            action: 'delete',
            icon: TrashIcon,
            confirmMessage: 'Are you sure you want to delete the selected plugins?',
            variant: 'danger'
        }
    ];

    // Event handlers
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

    const handleSort = (column, direction) => {
        const params = new URLSearchParams(window.location.search);
        params.set('sort_by', column);
        params.set('sort_direction', direction);
        params.delete('page'); // Reset pagination
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleFilter = (filteredData, currentFilters) => {
        // Client-side filtering for demonstration
        let filtered = [...plugins];
        
        if (currentFilters.status === 'active') {
            filtered = filtered.filter(plugin => plugin.is_active);
        } else if (currentFilters.status === 'inactive') {
            filtered = filtered.filter(plugin => !plugin.is_active);
        }
        
        if (currentFilters.category && currentFilters.category !== 'all') {
            filtered = filtered.filter(plugin => plugin.category === currentFilters.category);
        }
        
        if (currentFilters.has_url === 'yes') {
            filtered = filtered.filter(plugin => plugin.url);
        } else if (currentFilters.has_url === 'no') {
            filtered = filtered.filter(plugin => !plugin.url);
        }
        
        return filtered;
    };

    const handleBulkAction = (action, selectedIds) => {
        if (action === 'delete') {
            if (confirm('Are you sure you want to delete the selected plugins?')) {
                router.delete(route('plugins.bulk-delete'), {
                    data: { ids: selectedIds }
                });
            }
        }
    };

    const handleDelete = (plugin) => {
        if (confirm(`Are you sure you want to delete "${plugin.name}"?`)) {
            router.delete(route('plugins.destroy', plugin.id));
        }
    };

    return (
        <>
            <Head title="Plugins" />
            
            <UniversalPageLayout
                title="Plugins"
                items={plugins}
                tableColumns={tableColumns}
                renderGridCard={renderGridCard}
                statisticsCards={statisticsCards}
                filterOptions={filterOptions}
                bulkActions={bulkActions}
                onSearch={handleSearch}
                onSort={handleSort}
                onFilter={handleFilter}
                onBulkAction={handleBulkAction}
                pagination={pagination}
                currentSort={{ column: sortBy, direction: sortDirection }}
                currentFilters={filters}
                createButton={{
                    label: 'Add Plugin',
                    href: route('plugins.create'),
                    icon: PlusIcon
                }}
                searchPlaceholder="Search plugins..."
                emptyStateMessage="No plugins found"
                emptyStateDescription="Get started by adding your first plugin"
                auth={auth}
            />
        </>
    );
}
