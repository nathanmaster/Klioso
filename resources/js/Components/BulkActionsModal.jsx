import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { 
    CheckIcon, 
    XMarkIcon,
    PlayIcon,
    PencilIcon,
    UserGroupIcon,
    ClockIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function BulkActionsModal({ 
    isOpen, 
    onClose, 
    selectedWebsites, 
    websites, 
    groups, 
    onClearSelection 
}) {
    const [activeTab, setActiveTab] = useState('scan');
    const [loading, setLoading] = useState(false);
    const [bulkAction, setBulkAction] = useState({
        type: '',
        data: {}
    });

    const handleBulkScan = () => {
        setLoading(true);
        const websiteIds = selectedWebsites.map(id => parseInt(id));
        
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
        setLoading(true);
        const websiteIds = selectedWebsites.map(id => parseInt(id));
        
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
        const websiteIds = selectedWebsites.map(id => parseInt(id));
        
        router.post(route('websites.bulk-status-update'), {
            website_ids: websiteIds,
            status: status
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

    const handleBulkSchedule = (scheduleData) => {
        setLoading(true);
        const websiteIds = selectedWebsites.map(id => parseInt(id));
        
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

    if (!isOpen) return null;

    const selectedWebsiteDetails = websites.filter(w => selectedWebsites.includes(w.id.toString()));

    const tabs = [
        { id: 'scan', name: 'Scan', icon: ArrowPathIcon },
        { id: 'group', name: 'Groups', icon: UserGroupIcon },
        { id: 'status', name: 'Status', icon: PencilIcon },
        { id: 'schedule', name: 'Schedule', icon: ClockIcon },
    ];

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                        Bulk Actions for {selectedWebsites.length} Website{selectedWebsites.length !== 1 ? 's' : ''}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>

                {/* Selected Websites Preview */}
                <div className="mb-6 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Selected Websites:</h4>
                    <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                        {selectedWebsiteDetails.map((website) => (
                            <span key={website.id} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {website.name}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                        activeTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab Content */}
                <div className="space-y-4">
                    {activeTab === 'scan' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Bulk Scan Options</h4>
                            <div className="space-y-4">
                                <div className="p-4 border rounded-lg">
                                    <h5 className="font-medium text-gray-900 mb-2">Full WordPress Scan</h5>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Perform a comprehensive scan including plugins, themes, vulnerabilities, and updates.
                                    </p>
                                    <button
                                        onClick={handleBulkScan}
                                        disabled={loading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {loading ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        ) : (
                                            <ArrowPathIcon className="h-4 w-4" />
                                        )}
                                        {loading ? 'Scanning...' : `Scan ${selectedWebsites.length} Website${selectedWebsites.length !== 1 ? 's' : ''}`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'group' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Assign to Group</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() => handleBulkGroupAssign(null)}
                                    className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <XMarkIcon className="h-4 w-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <h5 className="font-medium text-gray-900">Remove from Groups</h5>
                                        <p className="text-sm text-gray-600">Unassign from any groups</p>
                                    </div>
                                </div>
                                {groups.map((group) => (
                                    <div
                                        key={group.id}
                                        onClick={() => handleBulkGroupAssign(group.id)}
                                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-3"
                                    >
                                        <div
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs"
                                            style={{ backgroundColor: group.color }}
                                        >
                                            {group.icon === 'globe' ? '🌍' : '📁'}
                                        </div>
                                        <div>
                                            <h5 className="font-medium text-gray-900">{group.name}</h5>
                                            <p className="text-sm text-gray-600">{group.websites_count} websites</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'status' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Update Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {['active', 'inactive', 'maintenance'].map((status) => (
                                    <div
                                        key={status}
                                        onClick={() => handleBulkStatusChange(status)}
                                        className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 text-center"
                                    >
                                        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                                            status === 'active' ? 'bg-green-100' :
                                            status === 'inactive' ? 'bg-red-100' : 'bg-yellow-100'
                                        }`}>
                                            <div className={`w-6 h-6 rounded-full ${
                                                status === 'active' ? 'bg-green-500' :
                                                status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                                            }`}></div>
                                        </div>
                                        <h5 className="font-medium text-gray-900 capitalize">{status}</h5>
                                        <p className="text-sm text-gray-600">
                                            {status === 'active' && 'Mark as operational'}
                                            {status === 'inactive' && 'Mark as offline'}
                                            {status === 'maintenance' && 'Mark as under maintenance'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'schedule' && (
                        <div>
                            <h4 className="text-lg font-medium text-gray-900 mb-4">Create Scheduled Scans</h4>
                            <BulkScheduleForm
                                selectedWebsites={selectedWebsites}
                                onSubmit={handleBulkSchedule}
                                loading={loading}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Schedule Name Template
                </label>
                <input
                    type="text"
                    value={scheduleData.name_template}
                    onChange={(e) => setScheduleData({...scheduleData, name_template: e.target.value})}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="{website} will be replaced with website name"
                />
                <p className="text-xs text-gray-500 mt-1">Use {'{website}'} as placeholder for website name</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                    <select
                        value={scheduleData.frequency}
                        onChange={(e) => setScheduleData({...scheduleData, frequency: e.target.value})}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <input
                        type="time"
                        value={scheduleData.scheduled_time}
                        onChange={(e) => setScheduleData({...scheduleData, scheduled_time: e.target.value})}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scan Options</label>
                <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                    {[
                        { key: 'check_plugins', label: 'Check Plugins' },
                        { key: 'check_themes', label: 'Check Themes' },
                        { key: 'check_vulnerabilities', label: 'Check Vulnerabilities' },
                        { key: 'check_updates', label: 'Check for Updates' }
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center">
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
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{label}</span>
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
                Create {selectedWebsites.length} Scheduled Scan{selectedWebsites.length !== 1 ? 's' : ''}
            </button>
        </form>
    );
}
