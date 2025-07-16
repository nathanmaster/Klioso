import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

// Reusable PageHeader component
function PageHeader({ title, children }) {
    return (
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold leading-tight text-gray-800">{title}</h2>
            {children}
        </div>
    );
}

// Reusable Table component
function DataTable({ columns, data }) {
    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map(col => (
                            <th key={col.key} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {col.label}
                            </th>
                        ))}
                        <th className="px-4 py-2"></th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length + 1} className="px-4 py-4 text-center text-gray-400">
                                No data found.
                            </td>
                        </tr>
                    ) : (
                        data.map(row => (
                            <tr key={row.id}>
                                {columns.map(col => (
                                    <td key={col.key} className="px-4 py-2 whitespace-nowrap">{row[col.key]}</td>
                                ))}
                                <td className="px-4 py-2 whitespace-nowrap text-right text-sm font-medium">
                                    {/* Example action buttons */}
                                    <button className="text-blue-600 hover:underline mr-2">Edit</button>
                                    <button className="text-red-600 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function Templates({ templates = [] }) {
    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { key: 'source_url', label: 'Source URL' },
        { key: 'notes', label: 'Notes' },
    ];

    return (
        <AuthenticatedLayout
            header={<PageHeader title="Templates">
                {/* Add button or actions can go here */}
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Template</button>
            </PageHeader>}
        >
            <Head title="Templates" />
            <div className="py-12">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <DataTable columns={columns} data={templates} />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
