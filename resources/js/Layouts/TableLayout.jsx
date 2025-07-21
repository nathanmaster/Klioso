import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import Table from '@/Components/Table';
import Button from '@/Components/Button';

export default function TableLayout({ 
    title, 
    data, 
    columns, 
    createRoute,
    createButtonText = 'Add New',
    searchPlaceholder = 'Search...',
    emptyStateMessage = 'No records found.',
    filters,
    searchRoute,
    children 
}) {
    const [search, setSearch] = useState(filters?.search || '');

    function handleSearch(e) {
        e.preventDefault();
        if (searchRoute) {
            router.get(searchRoute, { search });
        }
    }

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">{title}</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    {createRoute && (
                        <Button as={Link} href={createRoute} size="sm" className="mt-4">+ {createButtonText}</Button>
                    )}
                </nav>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-lg shadow">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-800">All {title}</h2>
                            {createRoute && (
                                <Button as={Link} href={createRoute}>+ {createButtonText}</Button>
                            )}
                        </div>

                        {/* Search Form */}
                        {searchRoute && (
                            <form onSubmit={handleSearch} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                />
                                <Button type="submit" variant="outline">Search</Button>
                                {search && (
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => {
                                            setSearch('');
                                            router.get(searchRoute);
                                        }}
                                    >
                                        Clear
                                    </Button>
                                )}
                            </form>
                        )}

                        {/* Custom header content */}
                        {children}
                    </div>

                    <div className="p-6">
                        {data && data.length > 0 ? (
                            <Table columns={columns} data={data} />
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">
                                    {search ? `No ${title.toLowerCase()} found matching your search.` : emptyStateMessage}
                                </p>
                                {createRoute && (
                                    <Button as={Link} href={createRoute}>Create your first {title.toLowerCase().slice(0, -1)}</Button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
