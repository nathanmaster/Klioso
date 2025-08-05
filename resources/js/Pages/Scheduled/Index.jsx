import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ScheduleModal from '@/Components/ScheduleModal';
import ScanProgressBar from '@/Components/ScanProgressBar';
import { 
    PlusIcon, 
    CalendarIcon, 
    ClockIcon, 
    PlayIcon, 
    PauseIcon,
    TrashIcon,
    EyeIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

export default function Index({ auth, scheduledScans, websites }) {
    const [showScheduleModal, setShowScheduleModal] = useState(false);

    const handleToggleActive = (scan) => {
        router.post(route('scheduled-scans.toggle', scan.id));
    };

    const handleRunNow = (scan) => {
        if (confirm(`Run "${scan.name}" immediately?`)) {
            router.post(route('scheduled-scans.run', scan.id));
        }
    };

    const handleDelete = (scan) => {
        if (confirm(`Are you sure you want to delete "${scan.name}"? This cannot be undone.`)) {
            router.delete(route('scheduled-scans.destroy', scan.id));
        }
    };

    const handleResetProgress = (scan) => {
        if (confirm(`Reset stuck progress for "${scan.name}"? This will stop any running scan.`)) {
            router.post(route('scheduled-scans.reset-progress', scan.id));
        }
    };

    const isScanStuck = (scan) => {
        // Consider a scan stuck if it's been running for more than 30 minutes
        if (scan.is_running && scan.started_at) {
            const startTime = new Date(scan.started_at);
            const now = new Date();
            const diffInMinutes = (now - startTime) / (1000 * 60);
            return diffInMinutes > 30;
        }
        // Consider queued for more than 1 hour as stuck
        if (scan.is_queued && scan.updated_at) {
            const updateTime = new Date(scan.updated_at);
            const now = new Date();
            const diffInHours = (now - updateTime) / (1000 * 60 * 60);
            return diffInHours > 1;
        }
        return false;
    };

    const getFrequencyIcon = (frequency) => {
        switch (frequency) {
            case 'daily': return '📅';
            case 'weekly': return '📊';
            case 'monthly': return '🗓️';
            default: return '⏰';
        }
    };

    const getStatusColor = (scan) => {
        // If scan is running or queued, show that status first
        if (scan.is_running) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 animate-pulse';
        if (scan.is_queued) return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
        if (scan.status === 'failed') return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        if (scan.status === 'completed') return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        
        // Fallback to active/inactive status
        if (!scan.is_active) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
        if (scan.failed_runs > 0 && scan.success_rate < 80) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        if (scan.total_runs === 0) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    };

    const getStatusText = (scan) => {
        // Show current status if scan is busy
        if (scan.is_running) return `Running (${scan.progress_percent || 0}%)`;
        if (scan.is_queued) return 'Queued';
        if (scan.status === 'failed') return 'Failed';
        if (scan.status === 'completed') return 'Completed';
        
        // Fallback to active/inactive status
        if (!scan.is_active) return 'Inactive';
        if (scan.failed_runs > 0 && scan.success_rate < 80) return 'Issues';
        if (scan.total_runs === 0) return 'Pending';
        return 'Active';
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Scheduled Scans
                    </h2>
                    <div className="flex gap-3">
                        <Link
                            href={route('scanner.history', { trigger: 'scheduled' })}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            View History
                        </Link>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Schedule New Scan
                        </button>
                    </div>
                </div>
            }
        >
            <Head title="Scheduled Scans" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {scheduledScans.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No scheduled scans</h3>
                                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                    Create automated scans to monitor your websites regularly.
                                </p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => setShowScheduleModal(true)}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                    >
                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                        Schedule Your First Scan
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {scheduledScans.map((scan) => (
                                <div key={scan.id} className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg">{getFrequencyIcon(scan.frequency)}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 leading-tight">
                                                        {scan.name || `${scan.scan_type === 'website' && scan.website ? scan.website.domain_name : scan.target} - ${scan.frequency.charAt(0).toUpperCase() + scan.frequency.slice(1)} Scan`}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {scan.scan_type === 'website' && scan.website 
                                                            ? scan.website.domain_name
                                                            : scan.target
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Link
                                                    href={route('scheduled-scans.show', scan.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                                                    title="View Details"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleActive(scan)}
                                                    className={`p-1 transition-colors ${scan.is_active ? 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300' : 'text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400'}`}
                                                    title={scan.is_active ? 'Pause Schedule' : 'Activate Schedule'}
                                                >
                                                    {scan.is_active ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleRunNow(scan)}
                                                    className="p-1 text-gray-400 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                    disabled={!scan.is_active || scan.is_busy}
                                                    title={scan.is_busy ? 'Scan is running' : 'Run Now'}
                                                >
                                                    {scan.is_running ? (
                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                    ) : (
                                                        <ClockIcon className="h-4 w-4" />
                                                    )}
                                                </button>
                                                {isScanStuck(scan) && (
                                                    <button
                                                        onClick={() => handleResetProgress(scan)}
                                                        className="p-1 text-gray-400 hover:text-orange-600 dark:text-gray-500 dark:hover:text-orange-400 transition-colors"
                                                        title="Reset Stuck Progress"
                                                    >
                                                        <ArrowPathIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(scan)}
                                                    className="p-1 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                                                    title="Delete Schedule"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scan)}`}>
                                                    {getStatusText(scan)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Frequency</span>
                                                <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-gray-100">
                                                    <span className="capitalize">{scan.frequency}</span>
                                                    <span className="text-gray-500 dark:text-gray-400">at {scan.scheduled_time}</span>
                                                </div>
                                            </div>

                                            {/* Enhanced Progress Bar for Running Scans */}
                                            {scan.is_running && (
                                                <div className="space-y-2">
                                                    <ScanProgressBar 
                                                        progress={{
                                                            percent: scan.progress_percent || 0,
                                                            stage: scan.current_stage || 'Scanning...',
                                                            timeLeft: null // Could be calculated based on start time and estimated duration
                                                        }}
                                                        isScanning={true}
                                                        size="small"
                                                        showTimeLeft={false}
                                                        className={isScanStuck(scan) ? 'opacity-75' : ''}
                                                    />
                                                    {isScanStuck(scan) && (
                                                        <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
                                                            <ExclamationTriangleIcon className="h-3 w-3" />
                                                            <span>Scan may be stuck - consider resetting</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            {/* Queue Status */}
                                            {scan.is_queued && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Queue Status</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`animate-spin rounded-full h-3 w-3 border-b-2 ${
                                                            isScanStuck(scan) 
                                                                ? 'border-orange-600 dark:border-orange-400' 
                                                                : 'border-yellow-600 dark:border-yellow-400'
                                                        }`}></div>
                                                        <span className={`text-sm ${
                                                            isScanStuck(scan) 
                                                                ? 'text-orange-600 dark:text-orange-400' 
                                                                : 'text-yellow-600 dark:text-yellow-400'
                                                        }`}>
                                                            {isScanStuck(scan) ? 'Queue stuck...' : 'Waiting to start...'}
                                                        </span>
                                                        {isScanStuck(scan) && (
                                                            <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" title="Queue may be stuck" />
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {scan.total_runs > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Success Rate</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-900 dark:text-gray-100">{scan.success_rate}%</span>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{scan.successful_runs}</span>
                                                            {scan.failed_runs > 0 && (
                                                                <>
                                                                    <XCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{scan.failed_runs}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {scan.last_run_at && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Last Run</span>
                                                    <div className="text-right">
                                                        <span className="text-sm text-gray-900 dark:text-gray-100 block">
                                                            {scan.last_run_formatted || new Date(scan.last_run_at).toLocaleDateString()}
                                                        </span>
                                                        {scan.last_run_relative && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {scan.last_run_relative}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {scan.next_run_at && scan.is_active && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600 dark:text-gray-400">Next Run</span>
                                                    <div className="text-right">
                                                        <span className="text-sm text-gray-900 dark:text-gray-100 block">
                                                            {scan.next_run_formatted || new Date(scan.next_run_at).toLocaleDateString()}
                                                        </span>
                                                        {scan.next_run_relative && (
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                                                {scan.next_run_relative}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {scan.last_error && (
                                                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded border-l-4 border-red-400 dark:border-red-500">
                                                    <div className="flex items-center gap-2">
                                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
                                                        <span className="text-xs text-red-800 dark:text-red-300">Last Error</span>
                                                    </div>
                                                    <p className="text-xs text-red-700 dark:text-red-300 mt-1 line-clamp-2">
                                                        {scan.last_error}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <ScheduleModal
                isOpen={showScheduleModal}
                onClose={() => setShowScheduleModal(false)}
                websites={websites}
            />
        </AuthenticatedLayout>
    );
}
