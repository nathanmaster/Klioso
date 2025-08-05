import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowLeftIcon, UserGroupIcon } from '@heroicons/react/24/outline';

export default function Edit({ auth, group, availableColors, availableIcons }) {
    const [formData, setFormData] = useState({
        name: group.name,
        description: group.description || '',
        color: group.color,
        icon: group.icon,
        is_active: group.is_active,
    });

    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        
        router.put(route('groups.update', group.id), formData, {
            onError: (errors) => setErrors(errors),
            onSuccess: () => {
                router.visit(route('groups.show', group.id));
            },
        });
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
                <div className="flex items-center gap-4">
                    <Link
                        href={route('groups.show', group.id)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeftIcon className="h-5 w-5" />
                    </Link>
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Edit Group: {group.name}
                    </h2>
                </div>
            }
        >
            <Head title={`Edit Group: ${group.name}`} />

            <div className="py-12">
                <div className="max-w-2xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.name ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        required
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.description ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        rows="3"
                                        placeholder="Optional description for this group"
                                    />
                                    {errors.description && (
                                        <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Color *
                                        </label>
                                        <div className="space-y-2">
                                            <select
                                                value={formData.color}
                                                onChange={(e) => setFormData({...formData, color: e.target.value})}
                                                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.color ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            >
                                                {Object.entries(availableColors).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Preview:</span>
                                                <div
                                                    className="w-6 h-6 rounded border"
                                                    style={{ backgroundColor: formData.color }}
                                                />
                                            </div>
                                        </div>
                                        {errors.color && (
                                            <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Icon *
                                        </label>
                                        <div className="space-y-2">
                                            <select
                                                value={formData.icon}
                                                onChange={(e) => setFormData({...formData, icon: e.target.value})}
                                                className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                                                    errors.icon ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                            >
                                                {Object.entries(availableIcons).map(([value, label]) => (
                                                    <option key={value} value={value}>{label}</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm text-gray-600">Preview:</span>
                                                <div className="w-6 h-6 flex items-center justify-center">
                                                    {getIconComponent(formData.icon)}
                                                </div>
                                            </div>
                                        </div>
                                        {errors.icon && (
                                            <p className="mt-1 text-sm text-red-600">{errors.icon}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-900">Active</span>
                                    </label>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Inactive groups are hidden from most views but websites remain accessible.
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Link
                                        href={route('groups.show', group.id)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Update Group
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
