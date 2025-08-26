import React from 'react';
import { XMarkIcon, ClockIcon, CalendarIcon, GlobeAltIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const isDevelopment = () => {
    return import.meta.env.DEV || import.meta.env.MODE === 'development';
};

export default function ScanDetailsModal({ scan, isOpen, onClose }) {
    if (!isOpen || !scan) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const formatDuration = (durationMs) => {
        if (!durationMs) return 'N/A';
        const seconds = Math.round(durationMs / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600 bg-green-100';
            case 'failed': return 'text-red-600 bg-red-100';
            case 'partial': return 'text-yellow-600 bg-yellow-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getTriggerColor = (trigger) => {
        switch (trigger) {
            case 'manual': return 'text-blue-600 bg-blue-100';
            case 'scheduled': return 'text-purple-600 bg-purple-100';
            case 'api': return 'text-green-600 bg-green-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const scanResults = scan.scan_results || {};
    const scanSummary = scan.scan_summary || {};

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                Scan Details
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {scan.target}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                        {/* Scan Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Status</p>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(scan.status)}`}>
                                            {scan.status.charAt(0).toUpperCase() + scan.status.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Trigger</p>
                                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getTriggerColor(scan.scan_trigger)}`}>
                                            {scan.scan_trigger.charAt(0).toUpperCase() + scan.scan_trigger.slice(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Duration</p>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {formatDuration(scan.scan_duration_ms)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Date</p>
                                        <p className="text-sm text-gray-900">
                                            {formatDate(scan.created_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* WordPress Information */}
                        {scanResults.wordpress_detected && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <GlobeAltIcon className="h-5 w-5" />
                                    WordPress Information
                                </h3>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-green-800">WordPress Detected</p>
                                            <p className="text-sm text-green-700">✓ WordPress installation found</p>
                                        </div>
                                        {scanResults.wp_version && (
                                            <div>
                                                <p className="text-sm font-medium text-green-800">WordPress Version</p>
                                                <p className="text-sm text-green-700">{scanResults.wp_version}</p>
                                            </div>
                                        )}
                                        {scanResults.theme && (
                                            <div>
                                                <p className="text-sm font-medium text-green-800">Active Theme</p>
                                                <p className="text-sm text-green-700">{scanResults.theme.name || 'Unknown'}</p>
                                            </div>
                                        )}
                                        {scanSummary.final_url_used && scanSummary.final_url_used !== scan.target && (
                                            <div>
                                                <p className="text-sm font-medium text-green-800">Final URL Used</p>
                                                <p className="text-sm text-green-700">{scanSummary.final_url_used}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Scan Results Summary */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scan Results Summary</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {(() => {
                                                // Try different ways to get plugin count
                                                if (scanResults.plugins && Array.isArray(scanResults.plugins)) {
                                                    return scanResults.plugins.length;
                                                }
                                                if (scanSummary.total_plugins !== undefined) {
                                                    return scanSummary.total_plugins;
                                                }
                                                return scan.plugins_found || 0;
                                            })()}
                                        </p>
                                        <p className="text-sm font-medium text-blue-800">Plugins Found</p>
                                    </div>
                                </div>
                                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-purple-600">
                                            {(() => {
                                                // Try different ways to get theme count
                                                if (scanResults.themes && Array.isArray(scanResults.themes)) {
                                                    return scanResults.themes.length;
                                                }
                                                if (scanSummary.total_themes !== undefined) {
                                                    return scanSummary.total_themes;
                                                }
                                                return scan.themes_found || 0;
                                            })()}
                                        </p>
                                        <p className="text-sm font-medium text-purple-800">Themes Found</p>
                                    </div>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="text-center">
                                        <p className="text-2xl font-bold text-red-600">
                                            {(() => {
                                                // Try different ways to get vulnerability count
                                                if (scanResults.vulnerabilities && Array.isArray(scanResults.vulnerabilities)) {
                                                    return scanResults.vulnerabilities.length;
                                                }
                                                if (scanSummary.total_vulnerabilities !== undefined) {
                                                    return scanSummary.total_vulnerabilities;
                                                }
                                                return scan.vulnerabilities_found || 0;
                                            })()}
                                        </p>
                                        <p className="text-sm font-medium text-red-800">Vulnerabilities</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Plugins Found */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Plugins Found ({(() => {
                                    // Try different ways to get plugin count
                                    if (scanResults.plugins && Array.isArray(scanResults.plugins)) {
                                        return scanResults.plugins.length;
                                    }
                                    if (scanSummary.total_plugins !== undefined) {
                                        return scanSummary.total_plugins;
                                    }
                                    return scan.plugins_found || 0;
                                })()})
                            </h3>
                            {(() => {
                                // Try to get plugins from different sources
                                let plugins = null;
                                
                                if (scanResults.plugins && Array.isArray(scanResults.plugins)) {
                                    plugins = scanResults.plugins;
                                } else if (scanResults.plugins && typeof scanResults.plugins === 'object') {
                                    // Sometimes plugins might be stored as an object
                                    plugins = Object.values(scanResults.plugins);
                                }
                                
                                if (plugins && plugins.length > 0) {
                                    return (
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="max-h-64 overflow-y-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Name
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Version
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {plugins.map((plugin, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{plugin.name || plugin.slug}</p>
                                                                        {plugin.description && (
                                                                            <p className="text-gray-500 text-xs truncate max-w-xs" title={plugin.description}>
                                                                                {plugin.description.length > 80 
                                                                                    ? plugin.description.substring(0, 80) + '...' 
                                                                                    : plugin.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {plugin.version || 'Unknown'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        plugin.status === 'active' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {plugin.status || 'Unknown'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const pluginCount = scanSummary.total_plugins || scan.plugins_found || 0;
                                    return (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                            <p className="text-gray-500">
                                                {pluginCount > 0 
                                                    ? `${pluginCount} plugins were detected but detailed information is not available` 
                                                    : 'No plugins found during this scan'
                                                }
                                            </p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Themes Found */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                Themes Found ({(() => {
                                    // Try different ways to get theme count
                                    if (scanResults.themes && Array.isArray(scanResults.themes)) {
                                        return scanResults.themes.length;
                                    }
                                    if (scanSummary.total_themes !== undefined) {
                                        return scanSummary.total_themes;
                                    }
                                    return scan.themes_found || 0;
                                })()})
                            </h3>
                            {(() => {
                                // Try to get themes from different sources
                                let themes = null;
                                if (scanResults.themes && Array.isArray(scanResults.themes)) {
                                    themes = scanResults.themes;
                                } else if (scanResults.themes && typeof scanResults.themes === 'object') {
                                    // Sometimes themes might be stored as an object
                                    themes = Object.values(scanResults.themes);
                                }
                                
                                if (themes && themes.length > 0) {
                                    return (
                                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                            <div className="max-h-64 overflow-y-auto">
                                                <table className="min-w-full divide-y divide-gray-200">
                                                    <thead className="bg-gray-50">
                                                        <tr>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Name
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Version
                                                            </th>
                                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                                Status
                                                            </th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="bg-white divide-y divide-gray-200">
                                                        {themes.map((theme, index) => (
                                                            <tr key={index} className="hover:bg-gray-50">
                                                                <td className="px-4 py-3 text-sm">
                                                                    <div>
                                                                        <p className="font-medium text-gray-900">{theme.name || theme.slug}</p>
                                                                        {theme.description && (
                                                                            <p className="text-gray-500 text-xs truncate max-w-xs" title={theme.description}>
                                                                                {theme.description.length > 80 
                                                                                    ? theme.description.substring(0, 80) + '...' 
                                                                                    : theme.description
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {theme.version || 'Unknown'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm">
                                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                                                        theme.status === 'active' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {theme.status || 'Unknown'}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    );
                                } else {
                                    const themeCount = scanSummary.total_themes || scan.themes_found || 0;
                                    return (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                            <p className="text-gray-500">
                                                {themeCount > 0 
                                                    ? `${themeCount} themes were detected but detailed information is not available` 
                                                    : 'No themes found during this scan'
                                                }
                                            </p>
                                        </div>
                                    );
                                }
                            })()}
                        </div>

                        {/* Vulnerabilities */}
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                                Vulnerabilities Found ({(scanResults.vulnerabilities && Array.isArray(scanResults.vulnerabilities)) ? scanResults.vulnerabilities.length : (scan.vulnerabilities_found || 0)})
                            </h3>
                            {scanResults.vulnerabilities && scanResults.vulnerabilities.length > 0 ? (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="space-y-3">
                                        {scanResults.vulnerabilities.map((vuln, index) => (
                                            <div key={index} className="bg-white border border-red-200 rounded p-3">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-medium text-red-900">{vuln.title || vuln.name}</p>
                                                        {vuln.description && (
                                                            <p className="text-sm text-red-700 mt-1">{vuln.description}</p>
                                                        )}
                                                        {vuln.severity && (
                                                            <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                                                                vuln.severity === 'high' ? 'bg-red-100 text-red-800' :
                                                                vuln.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-blue-100 text-blue-800'
                                                            }`}>
                                                                {vuln.severity.toUpperCase()} SEVERITY
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <p className="text-green-700">No vulnerabilities found during this scan</p>
                                </div>
                            )}
                        </div>

                        {/* Errors */}
                        {scan.error_message && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Details</h3>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm text-red-700">{scan.error_message}</p>
                                </div>
                            </div>
                        )}

                        {/* Additional Details */}
                        {scan.scheduled_scan && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Scan Details</h3>
                                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm font-medium text-indigo-800">Schedule Name</p>
                                            <p className="text-sm text-indigo-700">{scan.scheduled_scan.name}</p>
                                        </div>
                                        {scanSummary.frequency && (
                                            <div>
                                                <p className="text-sm font-medium text-indigo-800">Frequency</p>
                                                <p className="text-sm text-indigo-700">{scanSummary.frequency}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Raw Data (for debugging) */}
                        {isDevelopment() && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Scan Data (Debug)</h3>
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <pre className="text-xs text-gray-600 overflow-auto max-h-64 whitespace-pre-wrap">
                                        {JSON.stringify(scan, null, 2)}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
