import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { ShieldCheckIcon, ShieldExclamationIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SecurityDashboard({ websites, apiStatus, auth }) {
    const [scanningWebsites, setScanningWebsites] = useState(new Set());
    const [bulkScanInProgress, setBulkScanInProgress] = useState(false);
    const [selectedWebsites, setSelectedWebsites] = useState(new Set());

    // Check API status on component mount
    useEffect(() => {
        if (apiStatus?.error) {
            toast.error('WPScan API is not available. Please check your API token configuration.');
        } else {
            toast.success(`WPScan API is active. ${apiStatus.requests_remaining || 'Unknown'} requests remaining.`);
        }
    }, [apiStatus]);

    const scanWebsite = async (websiteId) => {
        setScanningWebsites(prev => new Set([...prev, websiteId]));
        
        try {
            const response = await fetch(`/security/scan/${websiteId}`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            const result = await response.json();

            if (result.success) {
                toast.success('Security scan completed successfully');
                router.reload({ only: ['websites'] });
            } else {
                toast.error(result.message || 'Security scan failed');
            }
        } catch (error) {
            toast.error('Failed to perform security scan');
            console.error('Security scan error:', error);
        } finally {
            setScanningWebsites(prev => {
                const newSet = new Set(prev);
                newSet.delete(websiteId);
                return newSet;
            });
        }
    };

    const bulkScan = async () => {
        if (selectedWebsites.size === 0) {
            toast.error('Please select websites to scan');
            return;
        }

        setBulkScanInProgress(true);
        
        try {
            const response = await fetch('/security/bulk-scan', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    website_ids: Array.from(selectedWebsites)
                }),
            });

            const result = await response.json();

            if (result.success) {
                const summary = result.summary;
                toast.success(`Bulk scan completed: ${summary.successful_scans}/${summary.total_scanned} websites scanned successfully`);
                setSelectedWebsites(new Set());
                router.reload({ only: ['websites'] });
            } else {
                toast.error(result.message || 'Bulk scan failed');
            }
        } catch (error) {
            toast.error('Failed to perform bulk security scan');
            console.error('Bulk scan error:', error);
        } finally {
            setBulkScanInProgress(false);
        }
    };

    const getSecurityStatusIcon = (website) => {
        const vulnerabilities = website.vulnerabilities_count || 0;
        
        if (website.scan_status === 'never_scanned') {
            return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />;
        } else if (vulnerabilities > 0) {
            return <ShieldExclamationIcon className="h-5 w-5 text-red-500" />;
        } else {
            return <ShieldCheckIcon className="h-5 w-5 text-green-500" />;
        }
    };

    const getSecurityStatusText = (website) => {
        const vulnerabilities = website.vulnerabilities_count || 0;
        
        if (website.scan_status === 'never_scanned') {
            return 'Not Scanned';
        } else if (vulnerabilities > 0) {
            return `${vulnerabilities} Vulnerabilities`;
        } else {
            return 'Secure';
        }
    };

    const getSecurityStatusClass = (website) => {
        const vulnerabilities = website.vulnerabilities_count || 0;
        
        if (website.scan_status === 'never_scanned') {
            return 'text-yellow-600 bg-yellow-50';
        } else if (vulnerabilities > 0) {
            return 'text-red-600 bg-red-50';
        } else {
            return 'text-green-600 bg-green-50';
        }
    };

    const toggleWebsiteSelection = (websiteId) => {
        setSelectedWebsites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(websiteId)) {
                newSet.delete(websiteId);
            } else {
                newSet.add(websiteId);
            }
            return newSet;
        });
    };

    const selectAllWebsites = () => {
        if (selectedWebsites.size === websites.length) {
            setSelectedWebsites(new Set());
        } else {
            setSelectedWebsites(new Set(websites.map(w => w.id)));
        }
    };

    const viewVulnerabilityReport = (websiteId) => {
        router.get(`/security/report/${websiteId}`);
    };

    const columns = [
        {
            key: 'selection',
            label: (
                <input
                    type="checkbox"
                    checked={selectedWebsites.size === websites.length && websites.length > 0}
                    onChange={selectAllWebsites}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
            ),
            render: (website) => (
                <input
                    type="checkbox"
                    checked={selectedWebsites.has(website.id)}
                    onChange={() => toggleWebsiteSelection(website.id)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:ring-blue-500"
                />
            ),
        },
        {
            key: 'website',
            label: 'Website',
            render: (website) => (
                <div>
                    <div className="font-medium text-gray-900">{website.name || website.url}</div>
                    <div className="text-sm text-gray-500">{website.url}</div>
                </div>
            ),
        },
        {
            key: 'security_status',
            label: 'Security Status',
            render: (website) => (
                <div className="flex items-center space-x-2">
                    {getSecurityStatusIcon(website)}
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSecurityStatusClass(website)}`}>
                        {getSecurityStatusText(website)}
                    </span>
                </div>
            ),
        },
        {
            key: 'last_scan',
            label: 'Last Scan',
            render: (website) => (
                <div className="text-sm text-gray-900">
                    {website.last_scan 
                        ? new Date(website.last_scan).toLocaleDateString() 
                        : 'Never'
                    }
                </div>
            ),
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (website) => (
                <div className="flex space-x-2">
                    <button
                        onClick={() => scanWebsite(website.id)}
                        disabled={scanningWebsites.has(website.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {scanningWebsites.has(website.id) ? 'Scanning...' : 'Scan'}
                    </button>
                    {website.scan_status !== 'never_scanned' && (
                        <button
                            onClick={() => viewVulnerabilityReport(website.id)}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Report
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const bulkActions = [
        {
            label: 'Scan Selected',
            action: bulkScan,
            disabled: selectedWebsites.size === 0 || bulkScanInProgress,
            className: 'bg-blue-600 hover:bg-blue-700 text-white',
        },
    ];

    return (
        <>
            <Head title="Security Dashboard" />
            <UniversalPageLayout
                title="Security Dashboard"
                subtitle="Monitor and manage WordPress security vulnerabilities"
                user={auth.user}
                data={websites}
                columns={columns}
                bulkActions={bulkActions}
                searchableColumns={['name', 'url']}
                filters={[
                    {
                        key: 'security_status',
                        label: 'Security Status',
                        type: 'select',
                        options: [
                            { value: 'secure', label: 'Secure' },
                            { value: 'vulnerabilities', label: 'Has Vulnerabilities' },
                            { value: 'never_scanned', label: 'Never Scanned' },
                        ],
                        filter: (item, value) => {
                            if (value === 'secure') return item.vulnerabilities_count === 0 && item.scan_status !== 'never_scanned';
                            if (value === 'vulnerabilities') return item.vulnerabilities_count > 0;
                            if (value === 'never_scanned') return item.scan_status === 'never_scanned';
                            return true;
                        },
                    },
                ]}
                emptyState={{
                    title: 'No websites found',
                    description: 'Add websites to start monitoring their security status.',
                    action: {
                        label: 'Add Website',
                        href: '/websites/create',
                    },
                }}
            >
                {/* API Status Card */}
                <div className="mb-6 bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    WPScan API Status
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    Vulnerability database connectivity and usage
                                </p>
                            </div>
                            <div className="flex items-center space-x-4">
                                {apiStatus?.error ? (
                                    <div className="flex items-center text-red-600">
                                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                                        <span className="text-sm font-medium">API Error</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center text-green-600">
                                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                                        <span className="text-sm font-medium">Connected</span>
                                    </div>
                                )}
                                {apiStatus?.requests_remaining && (
                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">{apiStatus.requests_remaining}</span> requests remaining
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Statistics */}
                <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShieldCheckIcon className="h-6 w-6 text-green-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Secure Websites
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {websites.filter(w => w.vulnerabilities_count === 0 && w.scan_status !== 'never_scanned').length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ShieldExclamationIcon className="h-6 w-6 text-red-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Vulnerable Websites
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {websites.filter(w => w.vulnerabilities_count > 0).length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">
                                            Never Scanned
                                        </dt>
                                        <dd className="text-lg font-medium text-gray-900">
                                            {websites.filter(w => w.scan_status === 'never_scanned').length}
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </UniversalPageLayout>
        </>
    );
}
