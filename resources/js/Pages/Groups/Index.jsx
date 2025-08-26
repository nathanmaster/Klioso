import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { 
    PlusIcon, 
    PencilIcon, 
    TrashIcon, 
    EyeIcon, 
    FolderIcon,
    CheckCircleIcon,
    GlobeAltIcon
} from '@heroicons/react/24/outline';
import { Link } from '@inertiajs/react';
import { getIconComponent } from '@/Utils/iconMapping';

export default function Index({ auth, groups, availableColors, availableIcons, filters = {}, sortBy, sortDirection }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'globe',
        is_active: true,
    });

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingGroup) {
            router.put(route('groups.update', editingGroup.id), formData, {
                onSuccess: () => {
                    setIsCreating(false);
                    setEditingGroup(null);
                    setFormData({
                        name: '',
                        description: '',
                        color: '#3B82F6',
                        icon: 'globe',
                        is_active: true,
                    });
                },
            });
        } else {
            router.post(route('groups.store'), formData, {
                onSuccess: () => {
                    setIsCreating(false);
                    setFormData({
                        name: '',
                        description: '',
                        color: '#3B82F6',
                        icon: 'globe',
                        is_active: true,
                    });
                },
            });
        }
    };

    const handleEdit = (group) => {
        setEditingGroup(group);
        setFormData({
            name: group.name,
            description: group.description || '',
            color: group.color,
            icon: group.icon,
            is_active: group.is_active,
        });
        setIsCreating(true);
    };

    const handleDelete = (group) => {
        if (confirm(`Are you sure you want to delete the group "${group.name}"?`)) {
            router.delete(route('groups.destroy', group.id));
        }
    };

    // Configure table columns
    const tableColumns = [
        {
            key: 'name',
            label: 'Group',
            render: (group) => (
                <div className="flex items-center">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: group.color }}
                    >
                        {React.createElement(getIconComponent(group.icon), { className: "h-4 w-4 text-white" })}
                    </div>
                    <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {group.name}
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'description',
            label: 'Description',
            render: (group) => (
                <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                    {group.description || '-'}
                </div>
            )
        },
        {
            key: 'websites_count',
            label: 'Websites',
            render: (group) => (
                <div className="text-sm text-gray-900 dark:text-gray-100">
                    {group.websites_count}
                </div>
            )
        },
        {
            key: 'is_active',
            label: 'Status',
            render: (group) => (
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    group.is_active
                        ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}>
                    {group.is_active ? 'Active' : 'Inactive'}
                </span>
            )
        },
        {
            key: 'created_at',
            label: 'Created',
            render: (group) => (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(group.created_at).toLocaleDateString()}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (group) => (
                <div className="flex items-center justify-end space-x-2">
                    <Link
                        href={route('groups.show', group.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                        <EyeIcon className="h-4 w-4" />
                    </Link>
                    <button
                        onClick={() => handleEdit(group)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                        <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => handleDelete(group)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        disabled={group.websites_count > 0}
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            )
        }
    ];

    // Configure grid card renderer
    const renderGridCard = (group, { selected, onSelect }) => (
        <div key={group.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg relative">
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
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: group.color }}
                        >
                            {React.createElement(getIconComponent(group.icon), { className: "h-5 w-5 text-white" })}
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{group.name}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {group.websites_count} website{group.websites_count !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <Link
                            href={route('groups.show', group.id)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                            onClick={() => handleEdit(group)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => handleDelete(group)}
                            className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                            disabled={group.websites_count > 0}
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {group.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{group.description}</p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className={`px-2 py-1 rounded-full ${group.is_active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                        {group.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );

    // Configure statistics cards
    const statisticsCards = [
        {
            label: 'Total Groups',
            value: groups.length,
            icon: FolderIcon,
            color: 'text-blue-500'
        },
        {
            label: 'Active Groups',
            value: groups.filter(g => g.is_active).length,
            icon: CheckCircleIcon,
            color: 'text-green-500'
        },
        {
            label: 'Total Websites',
            value: groups.reduce((total, group) => total + (group.websites_count || 0), 0),
            icon: GlobeAltIcon,
            color: 'text-purple-500'
        }
    ];

    // Configure filter options
    const filterOptions = [
        {
            key: 'status',
            options: [
                { value: 'all', label: 'All Groups' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
            ]
        }
    ];

    // Handle bulk actions
    const handleBulkAction = (action, selectedIds) => {
        if (action === 'delete') {
            if (confirm(`Are you sure you want to delete ${selectedIds.length} group(s)?`)) {
                // Implementation for bulk delete
                selectedIds.forEach(id => {
                    const group = groups.find(g => g.id.toString() === id);
                    if (group && group.websites_count === 0) {
                        router.delete(route('groups.destroy', id));
                    }
                });
            }
        }
    };

    // Handle search with routing
    const handleSearch = (searchTerm) => {
        const params = new URLSearchParams(window.location.search);
        if (searchTerm) {
            params.set('search', searchTerm);
        } else {
            params.delete('search');
        }
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
        router.visit(`${window.location.pathname}?${params.toString()}`, {
            preserveState: true,
            preserveScroll: true
        });
        // Return the original data since filtering is handled server-side
        return filteredData;
    };

    return (
        <>
            <UniversalPageLayout
                title="Website Groups"
                auth={auth}
                data={groups}
                createRoute={null} // We handle create with modal
                createButtonText="Create Group"
                searchPlaceholder="Search groups..."
                defaultView="grid"
                allowViewToggle={true}
                allowBulkActions={true}
                allowSearch={true}
                gridColumns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                renderGridCard={renderGridCard}
                tableColumns={tableColumns}
                filterOptions={filterOptions}
                statisticsCards={statisticsCards}
                filters={filters}
                sortBy={sortBy}
                sortDirection={sortDirection}
                onCreateClick={() => setIsCreating(true)}
                onBulkAction={handleBulkAction}
                onSearch={handleSearch}
                onFilter={handleFilter}
            />

            {/* Create/Edit Modal */}
            {isCreating && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                                {editingGroup ? 'Edit Group' : 'Create New Group'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Color</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {availableColors.map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, color })}
                                                className={`w-8 h-8 rounded-full border-2 ${
                                                    formData.color === color
                                                        ? 'border-gray-900 dark:border-gray-100'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Icon</label>
                                    <div className="mt-2 grid grid-cols-6 gap-2">
                                        {availableIcons.map((icon) => (
                                            <button
                                                key={icon}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, icon })}
                                                className={`p-2 rounded-md border ${
                                                    formData.icon === icon
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                                        : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                                }`}
                                            >
                                                {React.createElement(getIconComponent(icon), { className: "h-5 w-5 text-gray-700 dark:text-gray-300" })}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                                        Active
                                    </label>
                                </div>

                                <div className="flex justify-end gap-2 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingGroup(null);
                                            setFormData({
                                                name: '',
                                                description: '',
                                                color: '#3B82F6',
                                                icon: 'globe',
                                                is_active: true,
                                            });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 dark:bg-blue-700 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                                    >
                                        {editingGroup ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
