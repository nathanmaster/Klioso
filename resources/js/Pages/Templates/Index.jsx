import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
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
    DocumentTextIcon,
    ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, templates, pagination, sortBy, sortDirection, filters }) {
    const [selectedTemplates, setSelectedTemplates] = useState([]);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'

    const handleSelectTemplate = (templateId) => {
        setSelectedTemplates(prev => 
            prev.includes(templateId.toString()) 
                ? prev.filter(id => id !== templateId.toString())
                : [...prev, templateId.toString()]
        );
    };

    const handleSelectAll = () => {
        if (selectedTemplates.length === templates.length) {
            setSelectedTemplates([]);
        } else {
            setSelectedTemplates(templates.map(t => t.id.toString()));
        }
    };

    const clearSelection = () => {
        setSelectedTemplates([]);
    };

    const handleDelete = (template) => {
        if (confirm(`Are you sure you want to delete "${template.name}"?`)) {
            router.delete(route('templates.destroy', template.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Templates
                    </h2>
                    <div className="flex items-center gap-3">
                        {selectedTemplates.length > 0 && (
                            <>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedTemplates.length} selected
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
                            href={route('templates.create')}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Template
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="Templates" />

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
                                                    checked={selectedTemplates.length === templates.length && templates.length > 0}
                                                    onChange={handleSelectAll}
                                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                />
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Template
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Description
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Source URL
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
                                        {templates.map((template) => (
                                            <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTemplates.includes(template.id.toString())}
                                                        onChange={() => handleSelectTemplate(template.id)}
                                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                                            <DocumentTextIcon className="h-4 w-4 text-indigo-500" />
                                                            {template.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={template.description}>
                                                        {template.description || '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {template.source_url ? (
                                                        <a 
                                                            href={template.source_url} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer" 
                                                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                        >
                                                            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                                            View Source
                                                        </a>
                                                    ) : (
                                                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate" title={template.notes}>
                                                        {template.notes ? (template.notes.length > 50 ? `${template.notes.substring(0, 50)}...` : template.notes) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right text-sm font-medium">
                                                    <div className="flex justify-end gap-2">
                                                        <Link
                                                            href={route('templates.show', template.id)}
                                                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        <Link
                                                            href={route('templates.edit', template.id)}
                                                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                                        >
                                                            <PencilIcon className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(template)}
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
                            {templates.map((template) => (
                                <div key={template.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedTemplates.includes(template.id.toString())}
                                                onChange={() => handleSelectTemplate(template.id)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded"
                                            />
                                            <div className="flex gap-1">
                                                <Link
                                                    href={route('templates.show', template.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <Link
                                                    href={route('templates.edit', template.id)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(template)}
                                                    className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1 flex items-center gap-2">
                                                <DocumentTextIcon className="h-5 w-5 text-indigo-500" />
                                                {template.name}
                                            </h3>
                                        </div>
                                        <div className="space-y-3">
                                            {template.description && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{template.description}</p>
                                            )}
                                            {template.source_url && (
                                                <a 
                                                    href={template.source_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer" 
                                                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                                                    View Source
                                                </a>
                                            )}
                                            {template.notes && (
                                                <div className="text-sm">
                                                    <span className="text-gray-500 dark:text-gray-400">Notes:</span>
                                                    <span className="ml-2 text-gray-900 dark:text-gray-100">{template.notes.length > 100 ? `${template.notes.substring(0, 100)}...` : template.notes}</span>
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
                            <Pagination {...pagination} />
                        </div>
                    )}

                    {showBulkModal && (
                        <BulkActionsModal
                            isOpen={showBulkModal}
                            onClose={() => setShowBulkModal(false)}
                            selectedItems={selectedTemplates}
                            items={templates}
                            onClearSelection={clearSelection}
                            resourceType="templates"
                        />
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
