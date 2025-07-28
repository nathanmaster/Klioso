import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';

export default function ScanHistory({ scanHistory, filters }) {
    const [localFilters, setLocalFilters] = useState(filters);

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
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800',
            partial: 'bg-yellow-100 text-yellow-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTypeBadge = (type) => {
        const badges = {
            url: 'bg-blue-100 text-blue-800',
            website: 'bg-purple-100 text-purple-800'
        };
        
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[type] || 'bg-gray-100 text-gray-800'}`}>
                {type.toUpperCase()}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
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
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6">
                            {/* Filters */}
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Search Target
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Search URLs or websites..."
                                        value={localFilters.search}
                                        onChange={(e) => handleFilterChange('search', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Scan Type
                                    </label>
                                    <select
                                        value={localFilters.type}
                                        onChange={(e) => handleFilterChange('type', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="url">URL Scans</option>
                                        <option value="website">Website Scans</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={localFilters.status}
                                        onChange={(e) => handleFilterChange('status', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
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
                                            setLocalFilters({ type: 'all', status: 'all', search: '' });
                                            router.get(route('scanner.history'));
                                        }}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        Clear Filters
                                    </Button>
                                </div>
                            </div>

                            {/* Results Count */}
                            <div className="mb-4 text-sm text-gray-600">
                                Showing {scanHistory.data.length} of {scanHistory.total} scans
                            </div>

                            {/* Scan History Table */}
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Target
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Type
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Results
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Duration
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {scanHistory.data.map((scan) => (
                                            <tr key={scan.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {scan.target}
                                                    </div>
                                                    {scan.website && (
                                                        <div className="text-sm text-gray-500">
                                                            Website: {scan.website.domain_name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getTypeBadge(scan.scan_type)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex flex-col space-y-1">
                                                        {scan.plugins_found > 0 && (
                                                            <span className="text-blue-600">
                                                                {scan.plugins_found} plugins
                                                            </span>
                                                        )}
                                                        {scan.themes_found > 0 && (
                                                            <span className="text-purple-600">
                                                                {scan.themes_found} themes
                                                            </span>
                                                        )}
                                                        {scan.vulnerabilities_found > 0 && (
                                                            <span className="text-red-600">
                                                                {scan.vulnerabilities_found} vulnerabilities
                                                            </span>
                                                        )}
                                                        {scan.plugins_found === 0 && scan.themes_found === 0 && scan.vulnerabilities_found === 0 && (
                                                            <span className="text-gray-400">No items found</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {formatDuration(scan.scan_duration_ms)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(scan.status)}
                                                    {scan.error_message && (
                                                        <div className="text-xs text-red-600 mt-1" title={scan.error_message}>
                                                            {scan.error_message.length > 50 
                                                                ? scan.error_message.substring(0, 50) + '...'
                                                                : scan.error_message
                                                            }
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(scan.created_at).toLocaleDateString()} <br />
                                                    <span className="text-gray-500">
                                                        {new Date(scan.created_at).toLocaleTimeString()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                                                        View Details
                                                    </button>
                                                    {scan.status === 'completed' && (
                                                        <button className="text-green-600 hover:text-green-900">
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
                                    <div className="text-gray-400 text-lg mb-4">
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
                                    <div className="text-sm text-gray-700">
                                        Showing {scanHistory.from} to {scanHistory.to} of {scanHistory.total} results
                                    </div>
                                    <div className="flex space-x-2">
                                        {scanHistory.prev_page_url && (
                                            <Link
                                                href={scanHistory.prev_page_url}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                                            >
                                                Previous
                                            </Link>
                                        )}
                                        {scanHistory.next_page_url && (
                                            <Link
                                                href={scanHistory.next_page_url}
                                                className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
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
        </AuthenticatedLayout>
    );
}
