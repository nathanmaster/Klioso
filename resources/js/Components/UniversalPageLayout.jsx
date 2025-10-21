import React, { useState, useEffect } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ResponsiveTable from '@/Components/ResponsiveTable';
import { Logger, safeGet, ErrorBoundary } from '@/Utils/errorHandler.jsx';
import toast from 'react-hot-toast';
import { 
    MagnifyingGlassIcon, 
    Squares2X2Icon,
    ListBulletIcon,
    PlusIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

/**
 * Universal Page Layout Component
 * Provides consistent functionality across all index pages including:
 * - View toggles (grid/table)
 * - Search functionality
 * - Filtering
 * - Bulk selection and actions
 * - Statistics cards
 * - Sorting
 */
export default function UniversalPageLayout({
    // Page configuration
    title,
    auth,
    data = [],
    createRoute,
    createButtonText = 'Create',
    searchPlaceholder = 'Search...',
    
    // Data and pagination
    pagination = null,
    sortBy = null,
    sortDirection = 'asc',
    filters = {},
    
    // View configuration
    defaultView = 'table', // 'grid' | 'table'
    allowViewToggle = true,
    allowBulkActions = true,
    allowSearch = true,
    
    // Grid view configuration
    gridColumns = 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    renderGridCard,
    
    // Table view configuration
    tableColumns = [],
    
    // Filtering configuration
    filterOptions = [],
    customFilters = null,
    
    // Statistics configuration
    statisticsCards = [],
    
    // Bulk actions configuration
    bulkActions = [
        {
            label: 'Delete',
            action: 'delete',
            variant: 'danger',
            icon: TrashIcon
        }
    ],
    
    // Event handlers
    onSort,
    onBulkAction,
    onCreateClick,
    onSearch,
    onFilter,
    
    // Additional content
    children
}) {
    // Prop validation and error handling - log only once
    useEffect(() => {
        Logger.info('UniversalPageLayout mounted', {
            title,
            hasAuth: !!auth,
            hasUser: !!safeGet(auth, 'user'),
            dataLength: Array.isArray(data) ? data.length : 'not-array'
        });

        // Validate required props
        if (!auth) {
            Logger.error('UniversalPageLayout: auth prop is missing', { title });
        }

        if (!safeGet(auth, 'user')) {
            Logger.error('UniversalPageLayout: auth.user is missing', { title });
        }
    }, []); // Empty dependency array - only run once on mount

    const { url } = usePage();
    
    // State management
    const [viewMode, setViewMode] = useState(() => {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        return urlParams.get('view') || defaultView;
    });
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [selectedItems, setSelectedItems] = useState([]);
    const [currentFilters, setCurrentFilters] = useState(() => filters || {});
    const [filteredData, setFilteredData] = useState(data);

    // Update view mode when URL changes
    useEffect(() => {
        const urlParams = new URLSearchParams(url.split('?')[1] || '');
        const newView = urlParams.get('view') || defaultView;
        setViewMode(newView);
    }, [url, defaultView]);

    // Filter data based on search and filters
    useEffect(() => {
        let filtered = data;

        // Apply search filter
        if (searchTerm && allowSearch) {
            filtered = filtered.filter(item => {
                const searchFields = ['name', 'domain_name', 'description', 'title'];
                return searchFields.some(field => 
                    item[field]?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        }

        // Apply custom filters
        if (onFilter) {
            filtered = onFilter(filtered, currentFilters);
        } else {
            // Apply default filtering logic
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value && value !== 'all') {
                    filtered = filtered.filter(item => {
                        if (key === 'status') {
                            return value === 'active' ? item.is_active : !item.is_active;
                        }
                        return item[key] === value;
                    });
                }
            });
        }

        setFilteredData(filtered);
    }, [data, searchTerm, currentFilters, allowSearch]); // Removed onFilter from dependencies

    // View mode handlers
    const handleViewModeChange = (newViewMode) => {
        const params = new URLSearchParams(window.location.search);
        params.set('view', newViewMode);
        
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    // Selection handlers
    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => 
            prev.includes(itemId.toString()) 
                ? prev.filter(id => id !== itemId.toString())
                : [...prev, itemId.toString()]
        );
    };

    const handleSelectAll = () => {
        if (selectedItems.length === filteredData.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(filteredData.map(item => item.id.toString()));
        }
    };

    const clearSelection = () => {
        setSelectedItems([]);
    };

    // Search handler
    const handleSearch = (value) => {
        setSearchTerm(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    // Filter handler
    const handleFilterChange = (key, value) => {
        const newFilters = { ...currentFilters, [key]: value };
        setCurrentFilters(newFilters);
    };

    // Sort handler
    const handleSort = (column) => {
        if (onSort) {
            onSort(column);
        } else {
            // Default sorting logic
            const params = new URLSearchParams(window.location.search);
            let newDirection = 'asc';
            if (sortBy === column && sortDirection === 'asc') {
                newDirection = 'desc';
            }
            params.set('sort_by', column);
            params.set('sort_direction', newDirection);
            
            router.visit(`${window.location.pathname}?${params.toString()}`, {
                preserveState: true,
                preserveScroll: true
            });
        }
    };

    // Bulk action handler
    const handleBulkAction = (action) => {
        if (onBulkAction) {
            onBulkAction(action, selectedItems);
        } else {
            // Default bulk action logic
            if (action === 'delete') {
                if (confirm(`Are you sure you want to delete ${selectedItems.length} item(s)?`)) {
                    // Generic bulk delete implementation
                    toast.error('Bulk delete functionality must be implemented by the parent component.', {
                        duration: 4000,
                    });
                    console.warn('UniversalPageLayout: Bulk delete action received but no onBulkAction handler provided');
                }
            }
        }
    };

    return (
        <ErrorBoundary componentName="UniversalPageLayout">
            <AuthenticatedLayout
                user={safeGet(auth, 'user', null, 'UniversalPageLayout auth.user access')}
                header={
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
                        <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                            {title}
                        </h2>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                        {/* Search */}
                        {allowSearch && (
                            <div className="relative w-full sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                />
                            </div>
                        )}

                        {/* Custom Filters */}
                        {customFilters || (filterOptions.length > 0 && (
                            <div className="flex space-x-2">
                                {filterOptions.map((filter) => (
                                    <select
                                        key={filter.key}
                                        value={currentFilters[filter.key] || 'all'}
                                        onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                                        className="block px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        {filter.options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ))}
                            </div>
                        ))}

                        {/* View Toggle */}
                        {allowViewToggle && (
                            <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                <button
                                    onClick={() => handleViewModeChange('grid')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                    title="Grid view"
                                >
                                    <Squares2X2Icon className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => handleViewModeChange('table')}
                                    className={`p-2 rounded-md transition-colors ${
                                        viewMode === 'table'
                                            ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                    }`}
                                    title="Table view"
                                >
                                    <ListBulletIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}

                        {/* Create Button */}
                        {createRoute && (
                            <button
                                onClick={onCreateClick || (() => router.visit(createRoute))}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition ease-in-out duration-150"
                            >
                                <PlusIcon className="h-4 w-4 mr-1" />
                                {createButtonText}
                            </button>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={title} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Bulk Actions Bar */}
                    {allowBulkActions && selectedItems.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                        {selectedItems.length} item(s) selected
                                    </span>
                                    <button
                                        onClick={clearSelection}
                                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                                    >
                                        Clear selection
                                    </button>
                                </div>
                                <div className="flex items-center space-x-2">
                                    {bulkActions.map((action) => (
                                        <button
                                            key={action.action}
                                            onClick={() => handleBulkAction(action.action)}
                                            className={`inline-flex items-center px-3 py-1.5 text-sm rounded-md transition-colors ${
                                                action.variant === 'danger'
                                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}
                                        >
                                            {action.icon && <action.icon className="h-4 w-4 mr-1" />}
                                            {action.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    {statisticsCards.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            {statisticsCards.map((card, index) => (
                                <div key={index} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <card.icon className={`h-8 w-8 ${card.color}`} />
                                            </div>
                                            <div className="ml-5 w-0 flex-1">
                                                <dl>
                                                    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                                                        {card.label}
                                                    </dt>
                                                    <dd className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                                        {card.value}
                                                    </dd>
                                                </dl>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Custom Content */}
                    {children}

                    {/* Main Content Display */}
                    {viewMode === 'grid' ? (
                        // Grid View
                        <div className={`grid ${gridColumns} gap-6`}>
                            {filteredData.map((item) => 
                                renderGridCard ? renderGridCard(item, {
                                    selected: selectedItems.includes(item.id.toString()),
                                    onSelect: allowBulkActions ? () => handleSelectItem(item.id) : undefined
                                }) : (
                                    <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                                        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                            {item.name || item.title || item.domain_name}
                                        </div>
                                        {item.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                )
                            )}
                        </div>
                    ) : (
                        // Table View
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <ResponsiveTable
                                columns={[
                                    ...(allowBulkActions ? [{
                                        key: 'select',
                                        label: (
                                            <div className="flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded touch-manipulation"
                                                    aria-label="Select all items"
                                                />
                                            </div>
                                        ),
                                        render: (item) => (
                                            <div className="flex items-center justify-center py-2">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(item.id.toString())}
                                                    onChange={() => handleSelectItem(item.id)}
                                                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded touch-manipulation"
                                                    aria-label={`Select ${item.name || item.title || item.domain_name || 'item'}`}
                                                />
                                            </div>
                                        ),
                                        sortable: false,
                                        className: "w-12 text-center"
                                    }] : []),
                                    ...tableColumns
                                ]}
                                data={filteredData}
                                sortBy={sortBy}
                                sortDirection={sortDirection}
                                onSort={handleSort}
                            />
                        </div>
                    )}

                    {/* Empty State */}
                    {filteredData.length === 0 && (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4">
                                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-6m-4 0h-6m-2-6V9a2 2 0 012-2h12a2 2 0 012 2v2" />
                                    </svg>
                                </div>
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {searchTerm || Object.values(currentFilters).some(v => v && v !== 'all') 
                                        ? `No results found`
                                        : `No ${title.toLowerCase()} found`
                                    }
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    {searchTerm || Object.values(currentFilters).some(v => v && v !== 'all') 
                                        ? 'Try adjusting your search or filter criteria.'
                                        : `Get started by creating your first ${title.toLowerCase().slice(0, -1)}.`
                                    }
                                </p>
                                {!searchTerm && !Object.values(currentFilters).some(v => v && v !== 'all') && createRoute && (
                                    <div className="mt-6">
                                        <button
                                            onClick={onCreateClick || (() => router.visit(createRoute))}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600"
                                        >
                                            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                            {createButtonText}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && filteredData.length > 0 && (
                        <div className="mt-6">
                            {/* Pagination component would go here */}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
        </ErrorBoundary>
    );
}
