import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ScanProgressBar from '@/Components/ScanProgressBar';
import { format } from 'date-fns';
import { 
    CalendarIcon, 
    ClockIcon, 
    PlayIcon, 
    PauseIcon,
    TrashIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    EyeIcon
} from '@heroicons/react/24/outline';

export default function Show({ auth, scheduledScan, scanHistory }) {
    const [scanProgress, setScanProgress] = useState({
        percent: 0,
        stage: '',
        timeLeft: null
    });
    const [isScanning, setIsScanning] = useState(false);

    // Update progress function (similar to WP scanner)
    const updateProgress = (percent, stage, timeLeft = null) => {
        setScanProgress({ percent, stage, timeLeft });
    };

    // Animate progress gradually (similar to WP scanner)
    const animateProgress = (targetPercent, stage, duration = 1000) => {
        const startPercent = scanProgress.percent;
        const difference = targetPercent - startPercent;
        const steps = 20;
        const stepSize = difference / steps;
        const stepDuration = duration / steps;

        let currentStep = 0;
        const timer = setInterval(() => {
            currentStep++;
            const newPercent = startPercent + (stepSize * currentStep);
            
            if (currentStep >= steps) {
                clearInterval(timer);
                updateProgress(targetPercent, stage, timeLeft);
            } else {
                updateProgress(newPercent, stage, timeLeft);
            }
        }, stepDuration);
    };

    // Monitor scan status and update progress
    useEffect(() => {
        if (scheduledScan.status === 'running' || scheduledScan.is_running) {
            setIsScanning(true);
            
            // Set progress based on current scan state
            const progressPercent = scheduledScan.progress_percent || 0;
            const stage = scheduledScan.current_stage || 'Scanning...';
            
            updateProgress(progressPercent, stage);

            // Poll for updates
            const pollInterval = setInterval(() => {
                router.reload({ only: ['scheduledScan'], preserveState: true });
            }, 2000);

            return () => clearInterval(pollInterval);
        } else {
            setIsScanning(false);
            if (scheduledScan.status === 'completed') {
                updateProgress(100, 'Scan completed');
            } else if (scheduledScan.status === 'failed') {
                updateProgress(0, `Scan failed: ${scheduledScan.last_error || 'Unknown error'}`);
            }
        }
    }, [scheduledScan.status, scheduledScan.progress_percent, scheduledScan.is_running]);

    // Format duration
    const formatDuration = (durationMs) => {
        if (!durationMs) return 'N/A';
        const seconds = Math.round(durationMs / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };
    const getStatusColor = (scan) => {
        // If scan is running or queued, show that status first
        if (scan.is_running) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 animate-pulse';
        if (scan.is_queued) return 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200';
        if (scan.status === 'failed') return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        if (scan.status === 'completed') return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
        
        // Fallback to legacy status logic
        if (!scan.is_active) return 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
        if (scan.failed_runs > 0 && scan.success_rate < 80) return 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200';
        if (scan.total_runs === 0) return 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200';
        return 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200';
    };

    const getStatusText = (scan) => {
        // Show current status if scan is busy
        if (scan.is_running) return `Running (${scan.progress_percent}%)`;
        if (scan.is_queued) return 'Queued';
        if (scan.status === 'failed') return 'Failed';
        if (scan.status === 'completed') return 'Completed';
        
        // Fallback to legacy status logic
        if (!scan.is_active) return 'Inactive';
        if (scan.failed_runs > 0 && scan.success_rate < 80) return 'Issues';
        if (scan.total_runs === 0) return 'Pending';
        return 'Active';
    };

    const getScanConfig = () => {
        try {
            return typeof scheduledScan.scan_config === 'string' 
                ? JSON.parse(scheduledScan.scan_config) 
                : scheduledScan.scan_config || {};
        } catch {
            return {};
        }
    };

    const scanConfig = getScanConfig();

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('scheduled-scans.index')}
                            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                            Back to Scheduled Scans
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title={`Scheduled Scan - ${scheduledScan.name || 'Unknown'}`} />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                        {scheduledScan.name || `${scheduledScan.scan_type === 'website' && scheduledScan.website ? scheduledScan.website.domain_name : scheduledScan.target} - ${scheduledScan.frequency.charAt(0).toUpperCase() + scheduledScan.frequency.slice(1)} Scan`}
                                    </h1>
                                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                                        {scheduledScan.scan_type === 'website' && scheduledScan.website 
                                            ? scheduledScan.website.domain_name
                                            : scheduledScan.target
                                        }
                                    </p>
                                </div>
                                <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(scheduledScan)}`}>
                                    {getStatusText(scheduledScan)}
                                </span>
                            </div>

                            {/* Main Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Schedule Details */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                            <CalendarIcon className="h-5 w-5" />
                                            Schedule Configuration
                                        </h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Frequency</label>
                                                <p className="text-gray-900 dark:text-gray-100 capitalize">{scheduledScan.frequency}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scheduled Time</label>
                                                <p className="text-gray-900 dark:text-gray-100">{scheduledScan.scheduled_time}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Scan Type</label>
                                                <p className="text-gray-900 dark:text-gray-100 capitalize">{scheduledScan.scan_type}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                                                <p className="text-gray-900 dark:text-gray-100">{scheduledScan.is_active ? 'Active' : 'Inactive'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Scan Configuration */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Scan Configuration
                                        </h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center">
                                                <CheckCircleIcon className={`h-5 w-5 mr-2 ${scanConfig.check_plugins ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className="text-gray-900 dark:text-gray-100">Check Plugins</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CheckCircleIcon className={`h-5 w-5 mr-2 ${scanConfig.check_themes ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className="text-gray-900 dark:text-gray-100">Check Themes</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CheckCircleIcon className={`h-5 w-5 mr-2 ${scanConfig.check_vulnerabilities ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className="text-gray-900 dark:text-gray-100">Check Vulnerabilities</span>
                                            </div>
                                            <div className="flex items-center">
                                                <CheckCircleIcon className={`h-5 w-5 mr-2 ${scanConfig.check_updates ? 'text-green-600' : 'text-gray-400'}`} />
                                                <span className="text-gray-900 dark:text-gray-100">Check for Updates</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Last Error */}
                                    {scheduledScan.last_error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
                                            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                                                <ExclamationTriangleIcon className="h-5 w-5" />
                                                Last Error
                                            </h2>
                                            <p className="text-red-700 dark:text-red-300">{scheduledScan.last_error}</p>
                                        </div>
                                    )}
                                </div>

                                {/* Sidebar */}
                                <div className="space-y-6">
                                    {/* Statistics */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Statistics
                                        </h2>
                                        <div className="space-y-4">
                                            {scheduledScan.total_runs > 0 && (
                                                <>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Success Rate</label>
                                                        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{scheduledScan.success_rate}%</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Successful</label>
                                                            <p className="text-lg font-semibold text-green-600 dark:text-green-400">{scheduledScan.successful_runs}</p>
                                                        </div>
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Failed</label>
                                                            <p className="text-lg font-semibold text-red-600 dark:text-red-400">{scheduledScan.failed_runs}</p>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Runs</label>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{scheduledScan.total_runs || 0}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Current Status & Progress */}
                                    {(scheduledScan.status === 'running' || scheduledScan.status === 'queued' || isScanning) && (
                                        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
                                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                                                {(scheduledScan.status === 'running' || isScanning) && (
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                                                )}
                                                {scheduledScan.status === 'queued' && (
                                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                                )}
                                                Current Status
                                            </h2>
                                            
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                        Status
                                                    </span>
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(scheduledScan)}`}>
                                                        {getStatusText(scheduledScan)}
                                                    </span>
                                                </div>
                                                
                                                {(scheduledScan.status === 'running' || isScanning) && (
                                                    <>
                                                        {/* Enhanced Progress Bar using WP Scanner component */}
                                                        <div className="space-y-3">
                                                            <ScanProgressBar 
                                                                progress={scanProgress}
                                                                isScanning={isScanning}
                                                                size="default"
                                                                className="bg-white dark:bg-gray-800 p-4 rounded-lg"
                                                            />
                                                        </div>
                                                        
                                                        {scheduledScan.started_at && (
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                                    Started At
                                                                </span>
                                                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                                                    {format(new Date(scheduledScan.started_at), 'MMM d, yyyy h:mm a')}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                                
                                                {scheduledScan.status === 'queued' && (
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                                                        <p className="flex items-center">
                                                            <svg className="w-4 h-4 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                            </svg>
                                                            This scan is queued and will start shortly.
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Run History */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Run History
                                        </h2>
                                        <div className="space-y-3">
                                            {scheduledScan.last_run_at && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Last Run</label>
                                                    <p className="text-gray-900 dark:text-gray-100">{new Date(scheduledScan.last_run_at).toLocaleString()}</p>
                                                </div>
                                            )}
                                            {scheduledScan.next_run_at && scheduledScan.is_active && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Next Run</label>
                                                    <p className="text-gray-900 dark:text-gray-100">{new Date(scheduledScan.next_run_at).toLocaleString()}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                            Actions
                                        </h2>
                                        <div className="space-y-3">
                                            <Link
                                                href={route('scheduled-scans.edit', scheduledScan.id)}
                                                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                Edit Schedule
                                            </Link>
                                            <button
                                                onClick={() => router.post(route('scheduled-scans.toggle', scheduledScan.id))}
                                                className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                                                    scheduledScan.is_active 
                                                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                                                        : 'bg-green-500 hover:bg-green-600 text-white'
                                                }`}
                                            >
                                                {scheduledScan.is_active ? (
                                                    <>
                                                        <PauseIcon className="h-4 w-4" />
                                                        Pause Schedule
                                                    </>
                                                ) : (
                                                    <>
                                                        <PlayIcon className="h-4 w-4" />
                                                        Activate Schedule
                                                    </>
                                                )}
                                            </button>
                                            {scheduledScan.is_active && (
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Run this scan immediately?')) {
                                                            setIsScanning(true);
                                                            updateProgress(0, 'Starting scan...');
                                                            
                                                            router.post(route('scheduled-scans.run', scheduledScan.id), {}, {
                                                                onSuccess: () => {
                                                                    animateProgress(25, 'Scan initiated');
                                                                },
                                                                onError: (errors) => {
                                                                    setIsScanning(false);
                                                                    updateProgress(0, `Failed to start: ${Object.values(errors)[0]}`);
                                                                }
                                                            });
                                                        }
                                                    }}
                                                    disabled={scheduledScan.status === 'running' || scheduledScan.status === 'queued' || isScanning}
                                                    className={`w-full px-4 py-2 rounded-lg flex items-center justify-center gap-2 ${
                                                        scheduledScan.status === 'running' || scheduledScan.status === 'queued' || isScanning
                                                            ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed' 
                                                            : 'bg-purple-500 hover:bg-purple-600 text-white'
                                                    }`}
                                                >
                                                    {scheduledScan.status === 'running' || isScanning ? (
                                                        <>
                                                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                            </svg>
                                                            Running...
                                                        </>
                                                    ) : scheduledScan.status === 'queued' ? (
                                                        <>
                                                            <ClockIcon className="h-4 w-4" />
                                                            Queued
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ClockIcon className="h-4 w-4" />
                                                            Run Now
                                                        </>
                                                    )}
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this scheduled scan? This cannot be undone.')) {
                                                        router.delete(route('scheduled-scans.destroy', scheduledScan.id));
                                                    }
                                                }}
                                                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2"
                                            >
                                                <TrashIcon className="h-4 w-4" />
                                                Delete Schedule
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Scan History Section */}
                            {scanHistory && scanHistory.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Recent Scan History
                                    </h2>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                                                <thead className="bg-gray-50 dark:bg-gray-600">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Results
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Duration
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Date
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                                                    {scanHistory.slice(0, 10).map((scan) => (
                                                        <tr key={scan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                                    scan.status === 'completed' 
                                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                                                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                                                }`}>
                                                                    {scan.status === 'completed' ? 'Success' : 'Failed'}
                                                                </span>
                                                                {scan.error_message && (
                                                                    <div className="text-xs text-red-600 dark:text-red-400 mt-1" title={scan.error_message}>
                                                                        {scan.error_message.length > 30 
                                                                            ? scan.error_message.substring(0, 30) + '...'
                                                                            : scan.error_message
                                                                        }
                                                                    </div>
                                                                )}
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
                                                                    {scan.total_items_found === 0 && (
                                                                        <span className="text-gray-400 dark:text-gray-500">No items found</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                {formatDuration(scan.scan_duration_ms)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                                <div className="text-sm">
                                                                    {scan.formatted_date}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {scan.relative_time}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                                {scan.status === 'completed' ? (
                                                                    <Link
                                                                        href={route('scanner.history') + '#scan-' + scan.id}
                                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-full transition-colors"
                                                                    >
                                                                        <EyeIcon className="h-3 w-3" />
                                                                        View Results
                                                                    </Link>
                                                                ) : (
                                                                    <span className="text-gray-400 dark:text-gray-500 text-xs">
                                                                        No results
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        {scanHistory.length > 10 && (
                                            <div className="px-6 py-3 bg-gray-50 dark:bg-gray-600 text-center">
                                                <Link
                                                    href={route('scanner.history') + '?trigger=scheduled&search=' + encodeURIComponent(scheduledScan.name)}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                                                >
                                                    View all {scanHistory.length} scan records →
                                                </Link>
                                            </div>
                                        )}
                                        <div className="px-6 py-3 bg-gray-50 dark:bg-gray-600 border-t border-gray-200 dark:border-gray-600">
                                            <div className="flex justify-between items-center">
                                                <Link
                                                    href={route('scanner.history') + '?trigger=scheduled'}
                                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 text-sm font-medium"
                                                >
                                                    View All Scheduled Scan History →
                                                </Link>
                                                <Link
                                                    href={route('scanner.history')}
                                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm"
                                                >
                                                    All Scan History
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* No scan history message */}
                            {(!scanHistory || scanHistory.length === 0) && (
                                <div className="mt-8">
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                                        Scan History
                                    </h2>
                                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
                                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                                        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No scan history yet</h3>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                            This scheduled scan hasn't been executed yet. History will appear here after the first run.
                                        </p>
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
