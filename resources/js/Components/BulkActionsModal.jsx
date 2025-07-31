import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    CheckIcon, 
    XMarkIcon,
    PlayIcon,
    PencilIcon,
    UserGroupIcon,
    ClockIcon,
    ArrowPathIcon,
    TrashIcon,
    TagIcon
} from '@heroicons/react/24/outline';

export default function BulkActionsModal({ 
    isOpen, 
    onClose, 
    selectedWebsites = [], 
    websites = [], 
    selectedItems = [], 
    items = [], 
    groups = [], 
    onClearSelection,
    resourceType = 'websites' // 'websites', 'clients', 'hosting-providers', 'plugins', 'templates'
}) {
    const [activeTab, setActiveTab] = useState(getDefaultTab(resourceType));
    const [loading, setLoading] = useState(false);
    const [bulkAction, setBulkAction] = useState({
        type: '',
        data: {}
    });

    // Get current items array based on resource type
    const currentItems = resourceType === 'websites' ? selectedWebsites || [] : selectedItems || [];
    const allItems = resourceType === 'websites' ? websites || [] : items || [];

    function getDefaultTab(type) {
        switch (type) {
            case 'websites':
                return 'scan';
            case 'clients':
                return 'status';
            case 'hosting-providers':
                return 'status';
            case 'plugins':
                return 'delete';
            case 'templates':
                return 'delete';
            default:
                return 'delete';
        }
    }

    function getAvailableTabs(type) {
        switch (type) {
            case 'websites':
                return [
                    { id: 'scan', label: 'Scan', icon: ArrowPathIcon },
                    { id: 'group', label: 'Groups', icon: UserGroupIcon },
                    { id: 'status', label: 'Status', icon: PencilIcon },
                    { id: 'schedule', label: 'Schedule', icon: ClockIcon }
                ];
            case 'clients':
                return [
                    { id: 'status', label: 'Status', icon: PencilIcon },
                    { id: 'delete', label: 'Delete', icon: TrashIcon }
                ];
            case 'hosting-providers':
                return [
                    { id: 'status', label: 'Status', icon: PencilIcon },
                    { id: 'delete', label: 'Delete', icon: TrashIcon }
                ];
            case 'plugins':
                return [
                    { id: 'type', label: 'Type', icon: TagIcon },
                    { id: 'delete', label: 'Delete', icon: TrashIcon }
                ];
            case 'templates':
                return [
                    { id: 'category', label: 'Category', icon: TagIcon },
                    { id: 'delete', label: 'Delete', icon: TrashIcon }
                ];
            default:
                return [
                    { id: 'delete', label: 'Delete', icon: TrashIcon }
                ];
        }
    }

    function getResourceLabel(type) {
        switch (type) {
            case 'websites':
                return 'Website';
            case 'clients':
                return 'Client';
            case 'hosting-providers':
                return 'Hosting Provider';
            case 'plugins':
                return 'Plugin';
            case 'templates':
                return 'Template';
            default:
                return 'Item';
        }
    }

    const handleBulkScan = () => {
        if (resourceType !== 'websites') return;
        
        setLoading(true);
        const websiteIds = currentItems.map(id => parseInt(id));
        
        router.post(route('scanner.bulk-scan'), {
            website_ids: websiteIds,
            scan_config: {
                check_plugins: true,
                check_themes: true,
                check_vulnerabilities: true,
                check_updates: true,
            }
        }, {
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleBulkGroupAssign = (groupId) => {
        if (resourceType !== 'websites') return;
        
        setLoading(true);
        const websiteIds = currentItems.map(id => parseInt(id));
        
        router.post(route('websites.bulk-assign-group'), {
            website_ids: websiteIds,
            group_id: groupId
        }, {
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleBulkStatusChange = (status) => {
        setLoading(true);
        const itemIds = currentItems.map(id => parseInt(id));
        
        const routes = {
            'websites': 'websites.bulk-status-update',
            'clients': 'clients.bulk-status-update',
            'hosting-providers': 'hosting-providers.bulk-status-update'
        };

        const routeName = routes[resourceType];
        if (!routeName) return;

        const payload = resourceType === 'websites' 
            ? { website_ids: itemIds, status: status }
            : { ids: itemIds, status: status };
        
        router.post(route(routeName), payload, {
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleBulkSchedule = (scheduleData) => {
        if (resourceType !== 'websites') return;
        
        setLoading(true);
        const websiteIds = currentItems.map(id => parseInt(id));
        
        console.log('handleBulkSchedule Debug:', {
            currentItems,
            websiteIds,
            scheduleData,
            routeName: 'scheduled-scans.bulk-create'
        });
        
        router.post(route('scheduled-scans.bulk-create'), {
            website_ids: websiteIds,
            ...scheduleData
        }, {
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleBulkDelete = () => {
        if (!confirm(`Are you sure you want to delete ${currentItems.length} ${getResourceLabel(resourceType).toLowerCase()}${currentItems.length !== 1 ? 's' : ''}?`)) {
            return;
        }

        setLoading(true);
        const itemIds = currentItems.map(id => parseInt(id));
        
        const routes = {
            'clients': 'clients.bulk-delete',
            'hosting-providers': 'hosting-providers.bulk-delete',
            'plugins': 'plugins.bulk-delete',
            'templates': 'templates.bulk-delete'
        };

        const routeName = routes[resourceType];
        if (!routeName) return;

        router.delete(route(routeName), {
            data: { ids: itemIds },
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleBulkTypeChange = (type) => {
        if (resourceType !== 'plugins') return;
        
        setLoading(true);
        const itemIds = currentItems.map(id => parseInt(id));

        router.post(route('plugins.bulk-type-update'), {
            ids: itemIds,
            type: type
        }, {
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    const handleBulkCategoryChange = (category) => {
        if (resourceType !== 'templates') return;
        
        setLoading(true);
        const itemIds = currentItems.map(id => parseInt(id));

        router.post(route('templates.bulk-category-update'), {
            ids: itemIds,
            category: category
        }, {
            onSuccess: () => {
                onClose();
                onClearSelection();
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            }
        });
    };

    if (!isOpen) return null;

    // Debug logging
    console.log('BulkActionsModal Debug:', {
        resourceType,
        currentItems,
        allItems: resourceType === 'websites' ? websites : items,
        selectedWebsites,
        selectedItems
    });

    const selectedItemDetails = resourceType === 'websites' 
        ? (websites || []).filter(w => currentItems.includes(w.id.toString()))
        : (allItems || []).filter(item => currentItems.includes(item.id.toString()));

    console.log('selectedItemDetails:', selectedItemDetails);

    const tabs = getAvailableTabs(resourceType);
    const resourceLabel = getResourceLabel(resourceType);

    return (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border border-gray-300 dark:border-gray-600 w-full max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        Bulk Actions for {currentItems.length} {resourceLabel}{currentItems.length !== 1 ? 's' : ''}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Selected Items Preview */}
                <div className="mb-6 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected {resourceLabel}s:</h4>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {selectedItemDetails.map((item) => (
                            <span key={item.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {item.name || item.title || item.url || item.domain_name || `${resourceLabel} ${item.id}`}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-600 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                    {/* Scan Tab - Only for websites */}
                    {activeTab === 'scan' && resourceType === 'websites' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Bulk Scan Options</h4>
                            <div className="space-y-4">
                                <div className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700">
                                    <h5 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Full WordPress Scan</h5>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                                        Perform a comprehensive scan including plugins, themes, vulnerabilities, and updates.
                                    </p>
                                    <button
                                        onClick={handleBulkScan}
                                        disabled={loading}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <ArrowPathIcon className="h-4 w-4" />
                                        )}
                                        {loading ? 'Scanning...' : `Scan ${currentItems.length} Website${currentItems.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Group Tab - Only for websites */}
                    {activeTab === 'group' && resourceType === 'websites' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Assign to Group</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => handleBulkGroupAssign(null)}
                                    className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-3 bg-white dark:bg-gray-700"
                                >
                                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                                        <XMarkIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100">Remove from Groups</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">Unassign from any groups</p>
                                    </div>
                                </div>
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        onClick={() => handleBulkGroupAssign(group.id)}
                                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-3 bg-white dark:bg-gray-700"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                                            style={{ backgroundColor: group.color }}
                                        >
                                            {group.icon === 'globe' ? '🌍' : '📁'}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900 dark:text-gray-100">{group.name}</h5>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{group.websites_count} websites</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Status Tab */}
                    {activeTab === 'status' && ['websites', 'clients', 'hosting-providers'].includes(resourceType) && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Update Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['active', 'inactive', 'maintenance'].map((status) => (
                                    <div
                                        key={status}
                                        onClick={() => handleBulkStatusChange(status)}
                                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-center bg-white dark:bg-gray-700"
                                    >
                                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                                            status === 'active' ? 'bg-green-100 dark:bg-green-900' :
                                            status === 'inactive' ? 'bg-red-100 dark:bg-red-900' : 'bg-yellow-100 dark:bg-yellow-900'
                                        }`}>
                                            <div className={`w-6 h-6 rounded-full ${
                                                status === 'active' ? 'bg-green-500' :
                                                status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}></div>
                                        </div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{status}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            {status === 'active' && 'Mark as operational'}
                                            {status === 'inactive' && 'Mark as offline'}
                                            {status === 'maintenance' && 'Mark as under maintenance'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Delete Tab */}
                    {activeTab === 'delete' && ['clients', 'hosting-providers', 'plugins', 'templates'].includes(resourceType) && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Delete {resourceLabel}s</h4>
                            <div className="p-4 border border-red-300 dark:border-red-600 rounded-lg bg-red-50 dark:bg-red-900/20">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                                        <TrashIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-red-900 dark:text-red-100">Permanent Deletion</h5>
                                        <p className="text-sm text-red-700 dark:text-red-300">
                                            This action cannot be undone. This will permanently delete {currentItems.length} {resourceLabel.toLowerCase()}{currentItems.length !== 1 ? 's' : ''}.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleBulkDelete}
                                    disabled={loading}
                                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md disabled:opacity-50 flex items-center gap-2"
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    ) : (
                                        <TrashIcon className="h-4 w-4" />
                                    )}
                                    {loading ? 'Deleting...' : `Delete ${currentItems.length} ${resourceLabel}${currentItems.length !== 1 ? 's' : ''}`}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Type Tab - Only for plugins */}
                    {activeTab === 'type' && resourceType === 'plugins' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Update Plugin Type</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['security', 'performance', 'functionality', 'design', 'other'].map((type) => (
                                    <div
                                        key={type}
                                        onClick={() => handleBulkTypeChange(type)}
                                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-center bg-white dark:bg-gray-700"
                                    >
                                        <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-2">
                                            <TagIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{type}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Set type to {type}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Tab - Only for templates */}
                    {activeTab === 'category' && resourceType === 'templates' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Update Template Category</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['business', 'blog', 'portfolio', 'ecommerce', 'landing', 'other'].map((category) => (
                                    <div
                                        key={category}
                                        onClick={() => handleBulkCategoryChange(category)}
                                        className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 text-center bg-white dark:bg-gray-700"
                                    >
                                        <div className="w-12 h-12 mx-auto rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mb-2">
                                            <TagIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <h5 className="font-medium text-gray-900 dark:text-gray-100 capitalize">{category}</h5>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Set category to {category}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Schedule Tab - Only for websites */}
                    {activeTab === 'schedule' && resourceType === 'websites' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Create Scheduled Scans</h4>
                            <BulkScheduleForm
                                selectedWebsites={currentItems}
                                onSubmit={handleBulkSchedule}
                                loading={loading}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500"
                        disabled={loading}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

// Separate component for bulk schedule creation
function BulkScheduleForm({ selectedWebsites, onSubmit, loading }) {
    const [scheduleData, setScheduleData] = useState({
        name_template: 'Weekly Scan - {website}',
        frequency: 'weekly',
        scheduled_time: '02:00',
        scan_config: {
            check_plugins: true,
            check_themes: true,
            check_vulnerabilities: true,
            check_updates: true,
        },
        is_active: true
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(scheduleData);
    };

    // Get the count for display purposes
    const websiteCount = selectedWebsites ? selectedWebsites.length : 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Schedule Name Template
                    </label>
                    <input
                        type="text"
                        value={scheduleData.name_template}
                        onChange={(e) => setScheduleData({...scheduleData, name_template: e.target.value})}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                        placeholder="{website} will be replaced with website name"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Use {'{website}'} as placeholder for website name</p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Frequency</label>
                    <select
                        value={scheduleData.frequency}
                        onChange={(e) => setScheduleData({...scheduleData, frequency: e.target.value})}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time</label>
                    <input
                        type="time"
                        value={scheduleData.scheduled_time}
                        onChange={(e) => setScheduleData({...scheduleData, scheduled_time: e.target.value})}
                        className="w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:ring-1"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Scan Options</label>
                <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-md border border-gray-200 dark:border-gray-600">
                    {[
                        { key: 'check_plugins', label: 'Check Plugins' },
                        { key: 'check_themes', label: 'Check Themes' },
                        { key: 'check_vulnerabilities', label: 'Check Vulnerabilities' },
                        { key: 'check_updates', label: 'Check for Updates' }
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={scheduleData.scan_config[key]}
                                onChange={(e) => setScheduleData({
                                    ...scheduleData,
                                    scan_config: {
                                        ...scheduleData.scan_config,
                                        [key]: e.target.checked
                                    }
                                })}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-500 bg-white dark:bg-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            />
                            <span className="ml-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                    <ClockIcon className="h-4 w-4" />
                )}
                Create {websiteCount} Scheduled Scan{websiteCount !== 1 ? 's' : ''}
            </button>
        </form>
        </div>
    );
}
