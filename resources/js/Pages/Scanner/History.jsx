import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import ScanDetailsModal from '@/Components/ScanDetailsModal';

export default function ScanHistory({ scanHistory, filters }) {
    const [localFilters, setLocalFilters] = useState(filters);
    const [selectedScan, setSelectedScan] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleViewDetails = (scan) => {
        setSelectedScan(scan);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedScan(null);
    };

    const handleRescan = (scan) => {
        if (confirm(`Re-scan ${scan.target}?`)) {
            // Determine the appropriate route based on scan type
            if (scan.scan_type === 'website' && scan.website) {
                // For website scans, use the website scan route
                router.post(route('scanner.website', scan.website.id), {}, {
                    onSuccess: () => {
                        router.visit(route('scanner.index'), {
                            onSuccess: () => {
                                // Optional: show success message
                            }
                        });
                    },
                    onError: (errors) => {
                        alert('Failed to start re-scan: ' + Object.values(errors)[0]);
                    }
                });
            } else {
                // For URL scans, use the general scan route
                router.post(route('scanner.scan'), {
                    url: scan.target,
                    check_plugins: true,
                    check_themes: true,
                    check_vulnerabilities: true
                }, {
                    onSuccess: () => {
                        router.visit(route('scanner.index'), {
                            onSuccess: () => {
                                // Optional: show success message
                            }
                        });
                    },
                    onError: (errors) => {
                        alert('Failed to start re-scan: ' + Object.values(errors)[0]);
                    }
                });
            }
        }
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...localFilters, [key]: value };
        setLocalFilters(newFilters);
        
        // Update URL with filters
        router.get(route('scanner.history'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const formatDuration = (durationMs) => {
        if (!durationMs) return 'Unknown';
        
        const seconds = durationMs / 1000;
        if (seconds < 1) {
            return durationMs + 'ms';
        } else if (seconds < 60) {
            return Math.round(seconds * 10) / 10 + 's';
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.round((seconds % 60) * 10) / 10;
            return `${minutes}m ${remainingSeconds}s`;
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
            failed: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
            partial: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTriggerBadge = (trigger) => {
        const badges = {
            manual: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
            scheduled: 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200',
            api: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[trigger] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {trigger === 'manual' ? 'Manual' : trigger === 'scheduled' ? 'Scheduled' : trigger === 'api' ? 'API' : trigger}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const badges = {
            url: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
            website: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
            bulk_scan: 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
                {type === 'bulk_scan' ? 'BULK' : type.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Scan History
                    </h2>
                    <Link
                        href={route('scanner.index')}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        New Scan
                    </Link>
                </div>
            }
        >
            <Head title="Scan History" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filters */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Search Target
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search URLs or websites..."
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Scan Type
                                    </label>
                                    <select
                                        value={localFilters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="url">URL Scans</option>
                                        <option value="website">Website Scans</option>
                                        <option value="bulk_scan">Bulk Scans</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Trigger
                                    </label>
                                    <select
                                        value={localFilters.trigger || 'all'}
                                        onChange={(e) => handleFilterChange('trigger', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Triggers</option>
                                        <option value="manual">Manual</option>
                                        <option value="scheduled">Scheduled</option>
                                        <option value="api">API</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={localFilters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="completed">Completed</option>
                                        <option value="failed">Failed</option>
                                        <option value="partial">Partial</option>
                                    </select>
                                </div>
                                
                                <div className="flex items-end">
                                    <Button
                                        onClick={() => {
                                            setLocalFilters({ type: 'all', status: 'all', trigger: 'all', search: '' });
                                            router.get(route('scanner.history'));
                                        }}
                                        variant="outline"
                                        size="sm"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                                Showing {scanHistory.data.length} of {scanHistory.total} scans
                            </div>

                            {/* Scan History Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                    <thead className="bg-gray-50 dark:bg-gray-700">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Target
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Trigger
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Results
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                        {scanHistory.data.map((scan) => (
                                            <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                        {scan.target}
                                                    </div>
                                                    {scan.website && (
                                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                                            Website: {scan.website.domain_name}
                                                        </div>
                                                    )}
                                                    {scan.scheduled_scan && (
                                                        <div className="text-xs text-indigo-600 dark:text-indigo-400">
                                                            From: {scan.scheduled_scan.name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getTypeBadge(scan.scan_type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getTriggerBadge(scan.scan_trigger)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="flex flex-col space-y-1">
                                                        {scan.plugins_found > 0 && (
                                                            <span className="text-blue-600 dark:text-blue-400">
                                                                {scan.plugins_found} plugins
                                                            </span>
                                                        )}
                                                        {scan.themes_found > 0 && (
                                                            <span className="text-purple-600 dark:text-purple-400">
                                                                {scan.themes_found} themes
                                                            </span>
                                                        )}
                                                        {scan.vulnerabilities_found > 0 && (
                                                            <span className="text-red-600 dark:text-red-400">
                                                                {scan.vulnerabilities_found} vulnerabilities
                                                            </span>
                                                        )}
                                                        {scan.plugins_found === 0 && scan.themes_found === 0 && scan.vulnerabilities_found === 0 && (
                                                            <span className="text-gray-400 dark:text-gray-500">No items found</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {scan.duration || formatDuration(scan.scan_duration_ms)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(scan.status)}
                                                    {scan.error_message && (
                                                        <div className="text-xs text-red-600 dark:text-red-400 mt-1" title={scan.error_message}>
                                                            {scan.error_message.length > 50 
                                                                ? scan.error_message.substring(0, 50) + '...'
                                                                : scan.error_message
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    <div className="text-sm text-gray-900 dark:text-gray-100">
                                                        {scan.formatted_date || new Date(scan.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        {scan.relative_time || new Date(scan.created_at).toLocaleTimeString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button 
                                                        onClick={() => handleViewDetails(scan)}
                                                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 mr-3 transition-colors"
                                                    >
                                                        View Details
                                                    </button>
                                                    {scan.status === 'completed' && (
                                                        <button 
                                                            onClick={() => handleRescan(scan)}
                                                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 transition-colors"
                                                        >
                                                            Re-scan
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Empty State */}
                            {scanHistory.data.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="text-gray-400 dark:text-gray-500 text-lg mb-4">
                                        No scan history found
                                    </div>
                                    <Link
                                        href={route('scanner.index')}
                                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                    >
                                        Start Your First Scan
                                    </Link>
                                </div>
                            )}

                            {/* Pagination */}
                            {scanHistory.data.length > 0 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Showing {scanHistory.from} to {scanHistory.to} of {scanHistory.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {scanHistory.prev_page_url && (
                                            <Link
                                                href={scanHistory.prev_page_url}
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {scanHistory.next_page_url && (
                                            <Link
                                                href={scanHistory.next_page_url}
                                                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                            >
                                                Next
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Scan Details Modal */}
            <ScanDetailsModal 
                scan={selectedScan}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </AuthenticatedLayout>
    );
}
