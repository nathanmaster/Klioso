import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Index({ auth, groups, availableColors, availableIcons }) {
    const [isCreating, setIsCreating] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: 'globe',
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingGroup) {
            router.put(route('groups.update', editingGroup.id), formData, {
                onSuccess: () => {
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

    const getIconComponent = (iconName) => {
        const iconClass = "h-5 w-5";
        switch (iconName) {
            case 'globe': return <div className={iconClass}>🌍</div>;
            case 'server': return <div className={iconClass}>🖥️</div>;
            case 'briefcase': return <div className={iconClass}>💼</div>;
            case 'folder': return <div className={iconClass}>📁</div>;
            case 'star': return <div className={iconClass}>⭐</div>;
            case 'heart': return <div className={iconClass}>❤️</div>;
            case 'shield': return <div className={iconClass}>🛡️</div>;
            case 'lightning-bolt': return <div className={iconClass}>⚡</div>;
            case 'fire': return <div className={iconClass}>🔥</div>;
            case 'sparkles': return <div className={iconClass}>✨</div>;
            default: return <UserGroupIcon className={iconClass} />;
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Website Groups
                    </h2>
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Create Group
                    </button>
                </div>
            }
        >
            <Head title="Website Groups" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Create/Edit Form */}
                    {isCreating && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    {editingGroup ? 'Edit Group' : 'Create New Group'}
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            rows="3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Color</label>
                                            <select
                                                value={formData.color}
                                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                {Object.entries(availableColors).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Icon</label>
                                            <select
                                                value={formData.icon}
                                                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                            >
                                                {Object.entries(availableIcons).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 block text-sm text-gray-900">Active</label>
                                    </div>
                                    <div className="flex justify-end gap-2">
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
                                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                        >
                                            {editingGroup ? 'Update' : 'Create'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Groups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {groups.map((group) => (
                            <div key={group.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: group.color }}
                                            >
                                                {getIconComponent(group.icon)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">{group.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    {group.websites_count} website{group.websites_count !== 1 ? 's' : ''}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <Link
                                                href={route('groups.show', group.id)}
                                                className="p-1 text-gray-400 hover:text-gray-600"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleEdit(group)}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                            >
                                                <PencilIcon className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(group)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                                disabled={group.websites_count > 0}
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {group.description && (
                                        <p className="text-sm text-gray-600 mb-4">{group.description}</p>
                                    )}
                                    <div className="flex items-center justify-between text-xs text-gray-500">
                                        <span className={`px-2 py-1 rounded-full ${group.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {group.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                        <span>Created {new Date(group.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {groups.length === 0 && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No groups</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Get started by creating a new website group to organize your sites.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setIsCreating(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Create Group
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
