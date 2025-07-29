import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ScheduleModal from '@/Components/ScheduleModal';
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
    ExclamationTriangleIcon
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

    const getFrequencyIcon = (frequency) => {
        switch (frequency) {
            case 'daily': return '📅';
            case 'weekly': return '📊';
            case 'monthly': return '🗓️';
            default: return '⏰';
        }
    };

    const getStatusColor = (scan) => {
        if (!scan.is_active) return 'bg-gray-100 text-gray-600';
        if (scan.failed_runs > 0 && scan.success_rate < 80) return 'bg-red-100 text-red-800';
        if (scan.total_runs === 0) return 'bg-blue-100 text-blue-800';
        return 'bg-green-100 text-green-800';
    };

    const getStatusText = (scan) => {
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
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Scheduled Scans
                    </h2>
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Schedule New Scan
                    </button>
                </div>
            }
        >
            <Head title="Scheduled Scans" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {scheduledScans.length === 0 ? (
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6 text-center">
                                <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">No scheduled scans</h3>
                                <p className="mt-1 text-sm text-gray-500">
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
                                <div key={scan.id} className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <span className="text-lg">{getFrequencyIcon(scan.frequency)}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-medium text-gray-900 leading-tight">
                                                        {scan.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        {scan.scan_type === 'website' && scan.website 
                                                            ? `${scan.website.name}`
                                                            : scan.target
                                                        }
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                <Link
                                                    href={route('scheduled-scans.show', scan.id)}
                                                    className="p-1 text-gray-400 hover:text-gray-600"
                                                >
                                                    <EyeIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleActive(scan)}
                                                    className={`p-1 hover:text-blue-600 ${scan.is_active ? 'text-green-600' : 'text-gray-400'}`}
                                                >
                                                    {scan.is_active ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleRunNow(scan)}
                                                    className="p-1 text-gray-400 hover:text-blue-600"
                                                    disabled={!scan.is_active}
                                                >
                                                    <ClockIcon className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(scan)}
                                                    className="p-1 text-gray-400 hover:text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Status</span>
                                                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(scan)}`}>
                                                    {getStatusText(scan)}
                                                </span>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <span className="text-sm text-gray-600">Frequency</span>
                                                <div className="flex items-center gap-1 text-sm text-gray-900">
                                                    <span className="capitalize">{scan.frequency}</span>
                                                    <span className="text-gray-500">at {scan.scheduled_time}</span>
                                                </div>
                                            </div>

                                            {scan.total_runs > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Success Rate</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-gray-900">{scan.success_rate}%</span>
                                                        <div className="flex items-center gap-1">
                                                            <CheckCircleIcon className="h-4 w-4 text-green-600" />
                                                            <span className="text-xs text-gray-500">{scan.successful_runs}</span>
                                                            {scan.failed_runs > 0 && (
                                                                <>
                                                                    <XCircleIcon className="h-4 w-4 text-red-600" />
                                                                    <span className="text-xs text-gray-500">{scan.failed_runs}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {scan.last_run_at && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Last Run</span>
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(scan.last_run_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}

                                            {scan.next_run_at && scan.is_active && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Next Run</span>
                                                    <span className="text-sm text-gray-900">
                                                        {new Date(scan.next_run_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}

                                            {scan.last_error && (
                                                <div className="p-2 bg-red-50 rounded border-l-4 border-red-400">
                                                    <div className="flex items-center gap-2">
                                                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                                                        <span className="text-xs text-red-800">Last Error</span>
                                                    </div>
                                                    <p className="text-xs text-red-700 mt-1 line-clamp-2">
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
