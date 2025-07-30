import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import ResponsiveTable from '@/Components/ResponsiveTable';
import Button from '@/Components/Button';
import Pagination from '@/Components/Pagination';

export default function ResponsiveTableLayout({ 
    title, 
    data = [], 
    columns = [], 
    createRoute,
    createButtonText = 'Add New',
    searchPlaceholder = 'Search...',
    emptyStateMessage = 'No records found.',
    filters = {},
    searchRoute,
    sortBy = null,
    sortDirection = 'asc',
    pagination = null,
    children 
}) {
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        if (searchRoute) {
            router.get(searchRoute, { search, sort_by: sortBy, sort_direction: sortDirection });
        }
    }

    function handleSort(column) {
        if (!searchRoute) return;
        
        let newDirection = 'asc';
        if (sortBy === column && sortDirection === 'asc') {
            newDirection = 'desc';
        }
        
        router.get(searchRoute, { 
            search, 
            sort_by: column, 
            sort_direction: newDirection,
            page: 1 // Reset to first page when sorting
        });
    }

    function handleClearSearch() {
        setSearch('');
        router.get(searchRoute, { sort_by: sortBy, sort_direction: sortDirection });
    }

    return (
        <AuthenticatedLayout>
            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">{title}</h1>
                                {createRoute && (
                                    <Button as={Link} href={createRoute} className="w-full sm:w-auto">
                                        + {createButtonText}
                                    </Button>
                                )}
                            </div>

                            {/* Search Form */}
                            {searchRoute && (
                                <div className="mt-4">
                                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            placeholder={searchPlaceholder}
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="flex-1 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        />
                                        <div className="flex gap-2">
                                            <Button type="submit" variant="outline" className="flex-1 sm:flex-none">
                                                Search
                                            </Button>
                                            {search && (
                                                <Button 
                                                    type="button" 
                                                    variant="ghost" 
                                                    onClick={handleClearSearch}
                                                    className="flex-1 sm:flex-none"
                                                >
                                                    Clear
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </div>
                            )}

                            {/* Custom header content */}
                            {children}
                        </div>

                        {/* Table Content */}
                        <div className="overflow-hidden">
                            {data && data.length > 0 ? (
                                <>
                                    <ResponsiveTable 
                                        columns={columns} 
                                        data={data} 
                                        sortBy={sortBy}
                                        sortDirection={sortDirection}
                                        onSort={handleSort}
                                    />
                                    {pagination && (
                                        <div className="px-6 py-4 border-t border-gray-200">
                                            <Pagination {...pagination} />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-12">
                                    <div className="max-w-md mx-auto">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            {search ? `No ${title.toLowerCase()} found` : `No ${title.toLowerCase()}`}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {search ? `No ${title.toLowerCase()} match your search criteria.` : emptyStateMessage}
                                        </p>
                                        {createRoute && (
                                            <div className="mt-6">
                                                <Button as={Link} href={createRoute}>
                                                    + Create your first {title.toLowerCase().slice(0, -1)}
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
