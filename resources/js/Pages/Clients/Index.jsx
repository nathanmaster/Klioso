import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BulkActionsModal from '@/Components/BulkActionsModal';
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

// Clients Index Page
export default function Index({ auth, clients, pagination, sortBy, sortDirection, filters }) {
    const [selectedClients, setSelectedClients] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    const handleSelectClient = (clientId) => {
        setSelectedClients(prev => 
            prev.includes(clientId.toString()) 
                ? prev.filter(id => id !== clientId.toString())
                : [...prev, clientId.toString()]
        );
    };

    const handleSelectAll = () => {
        if (selectedClients.length === clients.length) {
            setSelectedClients([]);
        } else {
            setSelectedClients(clients.map(c => c.id.toString()));
        }
    };

    const clearSelection = () => {
        setSelectedClients([]);
    };

    const handleDelete = (client) => {
        if (confirm(`Are you sure you want to delete "${client.name}"?`)) {
            router.delete(route('clients.destroy', client.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Clients
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedClients.length > 0 && (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedClients.length} selected
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
                                onClick={() => setViewMode('table')}
                                className={`p-2 ${viewMode === 'table' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <QueueListIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}
                            >
                                <Squares2X2Icon className="h-4 w-4" />
                            </button>
                        </div>
                        <Link
                            href={route('clients.create')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Client
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Clients" />

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
                                                    checked={selectedClients.length === clients.length && clients.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Company
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Notes
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {clients.map((client) => (
                                            <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedClients.includes(client.id.toString())}
                                                        onChange={() => handleSelectClient(client.id)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {client.name}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm text-gray-900 dark:text-gray-100">{client.contact_email || '-'}</div>
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">{client.contact_phone || '-'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">{client.company || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={client.notes}>
                                                        {client.notes ? (client.notes.length > 50 ? `${client.notes.substring(0, 50)}...` : client.notes) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('clients.show', client.id)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('clients.edit', client.id)}
                                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(client)}
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
                            {clients.map((client) => (
                                <div key={client.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedClients.includes(client.id.toString())}
                                                onChange={() => handleSelectClient(client.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                            />
                                            <div className="flex gap-1">
                                                <Link
                                                    href={route('clients.show', client.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('clients.edit', client.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(client)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">{client.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{client.company || 'No company'}</p>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">{client.contact_email || '-'}</span>
                                            </div>
                                            <div className="text-sm">
                                                <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                                                <span className="ml-2 text-gray-900 dark:text-gray-100">{client.contact_phone || '-'}</span>
                                            </div>
                                            {client.notes && (
                                                <div className="text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{client.notes.length > 100 ? `${client.notes.substring(0, 100)}...` : client.notes}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {showBulkModal && (
                        <BulkActionsModal
                            selectedItems={selectedClients}
                            onClose={() => setShowBulkModal(false)}
                            onClearSelection={clearSelection}
                            resourceType="clients"
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
