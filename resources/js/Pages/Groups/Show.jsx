import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { 
    ArrowLeftIcon, 
    PencilIcon, 
    TrashIcon, 
    PlusIcon,
    EyeIcon,
    ComputerDesktopIcon,
    UserGroupIcon 
} from '@heroicons/react/24/outline';

export default function Show({ auth, group }) {
    const [isAddingWebsites, setIsAddingWebsites] = useState(false);
    const [ungroupedWebsites, setUngroupedWebsites] = useState([]);
    const [selectedWebsites, setSelectedWebsites] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const getStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'maintenance': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const fetchUngroupedWebsites = async () => {
        setLoading(true);
        try {
            const response = await fetch(route('groups.ungrouped-websites'));
            const data = await response.json();
            setUngroupedWebsites(data);
        } catch (error) {
            console.error('Error fetching ungrouped websites:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWebsites = () => {
        setIsAddingWebsites(true);
        fetchUngroupedWebsites();
    };

    const handleWebsiteSelection = (websiteId) => {
        setSelectedWebsites(prev => 
            prev.includes(websiteId) 
                ? prev.filter(id => id !== websiteId)
                : [...prev, websiteId]
        );
    };

    const handleAddSelectedWebsites = () => {
        if (selectedWebsites.length > 0) {
            router.post(route('groups.add-websites', group.id), {
                website_ids: selectedWebsites
            }, {
                onSuccess: () => {
                    setIsAddingWebsites(false);
                    setSelectedWebsites([]);
                    setUngroupedWebsites([]);
                }
            });
        }
    };

    const handleRemoveWebsite = (websiteId) => {
        if (confirm('Are you sure you want to remove this website from the group?')) {
            router.delete(route('groups.remove-websites', group.id), {
                data: { website_ids: [websiteId] }
            });
        }
    };

    const handleDeleteGroup = () => {
        if (confirm(`Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`)) {
            router.delete(route('groups.destroy', group.id), {
                onSuccess: () => {
                    router.visit(route('groups.index'));
                }
            });
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('groups.index')}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <ArrowLeftIcon className="h-5 w-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-lg flex items-center justify-center"
                                style={{ backgroundColor: group.color }}
                            >
                                {getIconComponent(group.icon)}
                            </div>
                            <div>
                                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                    {group.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {group.websites_count} website{group.websites_count !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAddWebsites}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Websites
                        </button>
                        <Link
                            href={route('groups.edit', group.id)}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                            <PencilIcon className="h-4 w-4" />
                            Edit
                        </Link>
                        <button
                            onClick={handleDeleteGroup}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                            disabled={group.websites_count > 0}
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Group: ${group.name}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Group Description */}
                    {group.description && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <p className="text-gray-600">{group.description}</p>
                            </div>
                        </div>
                    )}

                    {/* Add Websites Modal */}
                    {isAddingWebsites && (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg mb-6">
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-medium text-gray-900">Add Websites to Group</h3>
                                    <button
                                        onClick={() => {
                                            setIsAddingWebsites(false);
                                            setSelectedWebsites([]);
                                            setUngroupedWebsites([]);
                                        }}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                </div>
                                
                                {loading ? (
                                    <div className="text-center py-4">Loading ungrouped websites...</div>
                                ) : ungroupedWebsites.length === 0 ? (
                                    <div className="text-center py-4 text-gray-500">
                                        No ungrouped websites available.
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                                            {ungroupedWebsites.map((website) => (
                                                <label key={website.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedWebsites.includes(website.id)}
                                                        onChange={() => handleWebsiteSelection(website.id)}
                                                        className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="font-medium text-gray-900">{website.name}</div>
                                                        <div className="text-sm text-gray-500">{website.url}</div>
                                                        {website.client && (
                                                            <div className="text-xs text-gray-400">Client: {website.client}</div>
                                                        )}
                                                    </div>
                                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(website.status)}`}>
                                                        {website.status}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setIsAddingWebsites(false);
                                                    setSelectedWebsites([]);
                                                    setUngroupedWebsites([]);
                                                }}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddSelectedWebsites}
                                                disabled={selectedWebsites.length === 0}
                                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Add {selectedWebsites.length} Website{selectedWebsites.length !== 1 ? 's' : ''}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Websites Grid */}
                    {group.websites && group.websites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {group.websites.map((website) => (
                                <div key={website.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">{website.name}</h3>
                                                    <p className="text-sm text-gray-500">{website.url}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Link
                                                    href={route('websites.show', website.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleRemoveWebsite(website.id)}
                                                    className="p-1 text-gray-400 hover:text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-500">Status:</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(website.status)}`}>
                                                    {website.status}
                                                </span>
                                            </div>
                                            
                                            {website.wordpress_version && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">WordPress:</span>
                                                    <span className="text-sm text-gray-900">{website.wordpress_version}</span>
                                                </div>
                                            )}
                                            
                                            {website.client && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Client:</span>
                                                    <span className="text-sm text-gray-900">{website.client.name}</span>
                                                </div>
                                            )}
                                            
                                            {website.hosting_provider && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Hosting:</span>
                                                    <span className="text-sm text-gray-900">{website.hosting_provider.name}</span>
                                                </div>
                                            )}
                                            
                                            {website.last_scan && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-500">Last Scan:</span>
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(website.last_scan).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <ComputerDesktopIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No websites in this group</h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add websites to this group to organize and manage them together.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={handleAddWebsites}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Add Websites
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
