import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { safeRoute } from '@/Utils/safeRoute';
import { 
    PlusIcon,
    EyeIcon,
    PencilIcon,
    TrashIcon,
    UserIcon,
    BuildingOfficeIcon,
    EnvelopeIcon,
    PhoneIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, clients, pagination, sortBy, sortDirection, filters }) {
    // Table column configuration
    const tableColumns = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            render: (client) => (
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {client.name}
                </div>
            )
        },
        {
            key: 'contact_email',
            label: 'Contact',
            sortable: true,
            render: (client) => (
                <div>
                    <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                        <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                        {client.contact_email || '-'}
                    </div>
                    {client.contact_phone && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3 text-gray-400" />
                            {client.contact_phone}
                        </div>
                    )}
                </div>
            )
        },
        {
            key: 'company',
            label: 'Company',
            sortable: false,
            render: (client) => (
                <div className="text-sm text-gray-900 dark:text-gray-100 flex items-center gap-1">
                    <BuildingOfficeIcon className="h-3 w-3 text-gray-400" />
                    {client.company || '-'}
                </div>
            )
        },
        {
            key: 'notes',
            label: 'Notes',
            sortable: false,
            render: (client) => (
                <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={client.notes}>
                    {client.notes ? (client.notes.length > 50 ? `${client.notes.substring(0, 50)}...` : client.notes) : '-'}
                </div>
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            render: (client) => (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(client.created_at).toLocaleDateString()}
                </div>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (client) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={safeRoute('clients.show', client.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                        title="View Client"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={safeRoute('clients.edit', client.id)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 p-1"
                        title="Edit Client"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(client)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                        title="Delete Client"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    // Grid card renderer
    const renderGridCard = (client) => (
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{client.name}</h3>
                </div>
                <div className="flex gap-1">
                    <Link
                        href={safeRoute('clients.show', client.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        title="View Client"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <Link
                        href={safeRoute('clients.edit', client.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        title="Edit Client"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleDelete(client)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        title="Delete Client"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>
            
            {client.company && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-1">
                    <BuildingOfficeIcon className="h-3 w-3" />
                    {client.company}
                </p>
            )}
            
            <div className="space-y-2">
                {client.contact_email && (
                    <div className="text-sm flex items-center gap-2">
                        <EnvelopeIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900 dark:text-gray-100">{client.contact_email}</span>
                    </div>
                )}
                {client.contact_phone && (
                    <div className="text-sm flex items-center gap-2">
                        <PhoneIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-gray-900 dark:text-gray-100">{client.contact_phone}</span>
                    </div>
                )}
                {client.notes && (
                    <div className="text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                        <span className="ml-2 text-gray-900 dark:text-gray-100">
                            {client.notes.length > 100 ? `${client.notes.substring(0, 100)}...` : client.notes}
                        </span>
                    </div>
                )}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                    Created {new Date(client.created_at).toLocaleDateString()}
                </span>
            </div>
        </div>
    );

    // Statistics cards configuration
    const statisticsCards = [
        {
            label: 'Total Clients',
            value: pagination?.total || clients.length,
            icon: UserIcon,
            color: 'text-blue-500'
        },
        {
            label: 'With Email',
            value: clients.filter(client => client.contact_email).length,
            icon: EnvelopeIcon,
            color: 'text-green-500'
        },
        {
            label: 'With Company',
            value: clients.filter(client => client.company).length,
            icon: BuildingOfficeIcon,
            color: 'text-purple-500'
        }
    ];

    // Filter options configuration
    const filterOptions = [
        {
            key: 'has_email',
            label: 'Has Email',
            type: 'select',
            options: [
                { value: 'all', label: 'All Clients' },
                { value: 'yes', label: 'With Email' },
                { value: 'no', label: 'Without Email' }
            ]
        },
        {
            key: 'has_company',
            label: 'Has Company',
            type: 'select',
            options: [
                { value: 'all', label: 'All Clients' },
                { value: 'yes', label: 'With Company' },
                { value: 'no', label: 'Without Company' }
            ]
        }
    ];

    // Bulk actions configuration
    const bulkActions = [
        {
            label: 'Delete Selected',
            action: 'delete',
            icon: TrashIcon,
            confirmMessage: 'Are you sure you want to delete the selected clients?',
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
        // This example uses client-side filtering, but you could implement server-side filtering
        // by sending the filter parameters to the backend like we do with search and sort
        let filtered = [...clients];
        
        if (currentFilters.has_email === 'yes') {
            filtered = filtered.filter(client => client.contact_email);
        } else if (currentFilters.has_email === 'no') {
            filtered = filtered.filter(client => !client.contact_email);
        }
        
        if (currentFilters.has_company === 'yes') {
            filtered = filtered.filter(client => client.company);
        } else if (currentFilters.has_company === 'no') {
            filtered = filtered.filter(client => !client.company);
        }
        
        return filtered;
    };

    const handleBulkAction = (action, selectedIds) => {
        if (action === 'delete') {
            if (confirm('Are you sure you want to delete the selected clients?')) {
                router.post(route('clients.bulk-delete'), {
                    ids: selectedIds
                });
            }
        }
    };

    const handleDelete = (client) => {
        if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
            router.delete(safeRoute('clients.destroy', client.id));
        }
    };

    return (
        <>
            <Head title="Clients" />
            
            <UniversalPageLayout
                title="Clients"
                auth={auth}
                data={clients}
                tableColumns={tableColumns}
                renderGridCard={renderGridCard}
                statisticsCards={statisticsCards}
                bulkActions={bulkActions}
                onSearch={handleSearch}
                onSort={handleSort}
                onFilter={handleFilter}
                onBulkAction={handleBulkAction}
                pagination={pagination}
                sortBy={sortBy}
                sortDirection={sortDirection}
                filters={filters}
                createRoute={route('clients.create')}
                createButtonText="Add Client"
                searchPlaceholder="Search clients..."
                defaultView="table"
                allowViewToggle={true}
                allowBulkActions={true}
                allowSearch={true}
                gridColumns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            />
        </>
    );
}
