import { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Form from '@/Components/Form';
import toast from 'react-hot-toast';

export default function Scanner({ websites = [] }) {
    const [activeTab, setActiveTab] = useState('url');
    const [scanForm, setScanForm] = useState({
        url: '',
        scanType: 'plugins',
        autoSync: false,
    });
    const [selectedWebsite, setSelectedWebsite] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [scanResults, setScanResults] = useState(null);
    const [error, setError] = useState('');
    
    // Enhanced state for progress tracking and bulk actions
    const [scanProgress, setScanProgress] = useState(null);
    const [selectedPlugins, setSelectedPlugins] = useState(new Set());
    const [successMessage, setSuccessMessage] = useState('');
    const [bulkActionLoading, setBulkActionLoading] = useState(false);

    // Auto-clear success and error messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 8000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    // Progress simulation for better UX
    const simulateProgress = () => {
        const stages = [
            { percent: 15, stage: 'Connecting to website...', duration: 1000 },
            { percent: 30, stage: 'Detecting WordPress installation...', duration: 1500 },
            { percent: 55, stage: 'Scanning plugins and themes...', duration: 2000 },
            { percent: 75, stage: 'Checking security vulnerabilities...', duration: 1500 },
            { percent: 90, stage: 'Analyzing results...', duration: 1000 },
            { percent: 100, stage: 'Finalizing scan...', duration: 500 }
        ];

        const totalTime = stages.reduce((sum, stage) => sum + stage.duration, 0);
        let currentStageIndex = 0;
        let elapsedTime = 0;

        setScanProgress({ percent: 0, stage: 'Initializing scan...', timeLeft: totalTime });

        const interval = setInterval(() => {
            if (currentStageIndex < stages.length) {
                const currentStage = stages[currentStageIndex];
                const timeLeft = totalTime - elapsedTime;
                
                setScanProgress({
                    percent: currentStage.percent,
                    stage: currentStage.stage,
                    timeLeft: Math.max(0, timeLeft)
                });

                elapsedTime += currentStage.duration;
                currentStageIndex++;
            } else {
                clearInterval(interval);
                setScanProgress(null);
            }
        }, 800);

        return interval;
    };

    const handleUrlScan = async (e) => {
        e.preventDefault();
        if (!scanForm.url) {
            setError('URL is required to perform the scan.');
            return;
        }

        setIsScanning(true);
        setError('');
        setScanResults(null);
        setSuccessMessage('');
        setSelectedPlugins(new Set());

        const progressInterval = simulateProgress();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page.');
            }

            const response = await fetch('/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    url: scanForm.url,
                    scan_type: scanForm.scanType,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setScanResults(data.data);
                
                // Set success message with scan summary
                const pluginCount = data.data.plugins ? data.data.plugins.length : 0;
                const themeCount = data.data.themes ? data.data.themes.length : 0;
                
                let successMsg = `Scan completed successfully! Found ${pluginCount} plugins`;
                if (themeCount > 0) {
                    successMsg += ` and ${themeCount} themes`;
                }
                successMsg += '.';
                
                if (scanForm.autoSync && data.data.auto_sync_results) {
                    const syncedCount = data.data.auto_sync_results.synced_plugins || 0;
                    successMsg += ` Auto-sync added ${syncedCount} new plugins to the database.`;
                }
                
                setSuccessMessage(successMsg);
                
                // Auto-select all plugins for convenience if auto-sync is disabled
                if (!scanForm.autoSync && data.data.plugins) {
                    setSelectedPlugins(new Set(data.data.plugins.map((_, index) => index)));
                }
            } else if (response.status === 422) {
                const errorMessages = data.errors 
                    ? Object.values(data.errors).flat().join(', ')
                    : data.message || 'Validation failed';
                setError('Validation error: ' + errorMessages);
            } else {
                setError(data.message || `Request failed with status ${response.status}`);
            }

        } catch (err) {
            setError('Failed to perform scan: ' + err.message);
        } finally {
            setIsScanning(false);
            clearInterval(progressInterval);
            setScanProgress(null);
        }
    };

    const handleWebsiteScan = async (e) => {
        e.preventDefault();
        if (!selectedWebsite) return;

        setIsScanning(true);
        setError('');
        setScanResults(null);
        setSuccessMessage('');
        setSelectedPlugins(new Set());

        const progressInterval = simulateProgress();

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page.');
            }

            const response = await fetch(`/websites/${selectedWebsite}/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    scan_type: scanForm.scanType,
                    auto_sync: scanForm.autoSync,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setScanResults(data.data);
                
                // Set success message with scan summary
                const pluginCount = data.data.plugins ? data.data.plugins.length : 0;
                const themeCount = data.data.themes ? data.data.themes.length : 0;
                
                let successMsg = `Website scan completed successfully! Found ${pluginCount} plugins`;
                if (themeCount > 0) {
                    successMsg += ` and ${themeCount} themes`;
                }
                successMsg += '.';
                
                if (scanForm.autoSync && data.data.auto_sync_results) {
                    const syncedCount = data.data.auto_sync_results.synced_plugins || 0;
                    successMsg += ` Auto-sync added ${syncedCount} new plugins to the website database.`;
                }
                
                setSuccessMessage(successMsg);
                
                // Auto-select all plugins for convenience if auto-sync is disabled
                if (!scanForm.autoSync && data.data.plugins) {
                    setSelectedPlugins(new Set(data.data.plugins.map((_, index) => index)));
                }
            } else {
                setError(data.message || 'Scan failed');
            }

        } catch (err) {
            setError('Failed to perform scan: ' + err.message);
        } finally {
            setIsScanning(false);
            clearInterval(progressInterval);
            setScanProgress(null);
        }
    };

    const addPluginToDatabase = async (plugin) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                toast.error('Session expired. Please refresh the page.');
                return;
            }

            const response = await fetch('/scanner/add-plugin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    name: plugin.name,
                    description: plugin.description,
                    slug: plugin.slug,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update the scan results to reflect the plugin is now in database
                setScanResults(prev => ({
                    ...prev,
                    plugins: prev.plugins.map(p => 
                        p.name === plugin.name 
                            ? { ...p, in_database: true, database_id: data.plugin.id }
                            : p
                    )
                }));
            } else {
                toast.error('Failed to add plugin to database');
            }

        } catch (err) {
            toast.error(`Failed to add plugin: ${err.message}`);
        }
    };

    // Bulk plugin management functions
    const handlePluginSelect = (index, isSelected) => {
        const newSelected = new Set(selectedPlugins);
        if (isSelected) {
            newSelected.add(index);
        } else {
            newSelected.delete(index);
        }
        setSelectedPlugins(newSelected);
    };

    const handleSelectAll = (selectAll) => {
        if (selectAll && scanResults?.plugins) {
            setSelectedPlugins(new Set(scanResults.plugins.map((_, index) => index)));
        } else {
            setSelectedPlugins(new Set());
        }
    };

    const handleBulkAddPlugins = async () => {
        if (selectedPlugins.size === 0) {
            setError('Please select plugins to add to database.');
            return;
        }

        setBulkActionLoading(true);
        setError('');

        try {
            const pluginItems = Array.from(selectedPlugins).map(index => ({
                index,
                plugin: scanResults.plugins[index],
            })).filter(item => !item.plugin.in_database);

            if (pluginItems.length === 0) {
                setError('All selected plugins are already in the database.');
                setBulkActionLoading(false);
                return;
            }

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                setError('CSRF token not found. Please refresh the page.');
                setBulkActionLoading(false);
                return;
            }

            const response = await fetch('/scanner/bulk-add-plugins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    plugins: pluginItems.map(item => ({
                        name: item.plugin.name,
                        description: item.plugin.description,
                        slug: item.plugin.slug,
                    }))
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update the scan results to reflect plugins are now in database
                setScanResults(prev => ({
                    ...prev,
                    plugins: prev.plugins.map((plugin, index) => {
                        const pluginItem = pluginItems.find(item => item.index === index);
                        if (pluginItem) {
                            const addedPlugin = data.plugins.find(p => p.name === plugin.name);
                            return { 
                                ...plugin, 
                                in_database: true, 
                                database_id: addedPlugin?.id 
                            };
                        }
                        return plugin;
                    })
                }));

                // Clear selection and show success message
                setSelectedPlugins(new Set());
                setSuccessMessage(`Successfully added ${data.plugins.length} plugins to the database!`);
            } else {
                setError(data.message || 'Failed to add plugins to database');
            }

        } catch (err) {
            setError('Failed to add plugins: ' + err.message);
        } finally {
            setBulkActionLoading(false);
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="WordPress Scanner" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">WordPress Scanner</h2>
                            </div>

                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('url')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'url'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        URL Scan
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('website')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'website'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Website Scan
                                    </button>
                                </nav>
                            </div>

                            {/* URL Scan Tab */}
                            {activeTab === 'url' && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Scan WordPress Website
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Enter a website URL to scan for WordPress installation, plugins, themes, and security vulnerabilities.
                                        </p>
                                    </div>

                                    <form onSubmit={handleUrlScan} className="space-y-4">
                                        <Form.Input
                                            id="url"
                                            label="Website URL"
                                            type="url"
                                            value={scanForm.url}
                                            onChange={(e) => setScanForm(prev => ({ ...prev, url: e.target.value }))}
                                            placeholder="https://example.com"
                                            required
                                        />

                                        <Form.Select
                                            id="scan-type"
                                            label="Scan Type"
                                            value={scanForm.scanType}
                                            onChange={(e) => setScanForm(prev => ({ ...prev, scanType: e.target.value }))}
                                        >
                                            <option value="plugins">Plugins Only</option>
                                            <option value="themes">Themes Only</option>
                                            <option value="vulnerabilities">Vulnerabilities Only</option>
                                            <option value="all">All (Comprehensive)</option>
                                        </Form.Select>

                                        <Button type="submit" disabled={isScanning}>
                                            {isScanning ? 'Scanning...' : 'Start Scan'}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {/* Website Scan Tab */}
                            {activeTab === 'website' && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Scan Existing Website
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Select a website from your database to scan and optionally sync the results.
                                        </p>
                                    </div>

                                    <form onSubmit={handleWebsiteScan} className="space-y-4">
                                        <Form.Select
                                            id="website-select"
                                            label="Website"
                                            value={selectedWebsite}
                                            onChange={(e) => setSelectedWebsite(e.target.value)}
                                            required
                                        >
                                            <option value="">Select a website</option>
                                            {websites.map(website => (
                                                <option key={website.id} value={website.id}>
                                                    {website.domain_name} {website.client_name && `(${website.client_name})`}
                                                </option>
                                            ))}
                                        </Form.Select>

                                        <Form.Select
                                            id="website-scan-type"
                                            label="Scan Type"
                                            value={scanForm.scanType}
                                            onChange={(e) => setScanForm(prev => ({ ...prev, scanType: e.target.value }))}
                                        >
                                            <option value="plugins">Plugins Only</option>
                                            <option value="themes">Themes Only</option>
                                            <option value="vulnerabilities">Vulnerabilities Only</option>
                                            <option value="all">All (Comprehensive)</option>
                                        </Form.Select>

                                        <Form.Checkbox
                                            id="auto-sync"
                                            label="Auto-sync discovered plugins to website"
                                            aria-describedby="auto-sync-description"
                                            checked={scanForm.autoSync}
                                            onChange={(e) => setScanForm(prev => ({ ...prev, autoSync: e.target.checked }))}
                                        />
                                        <p id="auto-sync-description" className="text-xs text-gray-500 -mt-2">
                                            Automatically synchronize discovered plugins with the selected website's database.
                                        </p>

                                        <Button type="submit" disabled={isScanning}>
                                            {isScanning ? 'Scanning...' : 'Start Scan'}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {/* Progress Bar */}
                            {scanProgress && (
                                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Scanning in Progress</h4>
                                        <div className="flex items-center text-sm text-blue-700 dark:text-blue-300">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400 mr-2"></div>
                                            {Math.floor(scanProgress.timeLeft / 1000)}s remaining
                                        </div>
                                    </div>
                                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5 mb-2">
                                        <div 
                                            className="bg-blue-600 dark:bg-blue-400 h-2.5 rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${scanProgress.percent}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        {scanProgress.stage} ({scanProgress.percent}%)
                                    </p>
                                </div>
                            )}

                            {/* Success Message */}
                            {successMessage && (
                                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-green-400 dark:text-green-300" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                                {successMessage}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                                <p>{error}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Scan Results */}
                            {scanResults && (
                                <div className="mt-8 space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Scan Results
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">WordPress Detected:</span>
                                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                                    scanResults.wordpress_detected 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {scanResults.wordpress_detected ? 'Yes' : 'No'}
                                                </span>
                                            </div>
                                            {scanResults.wordpress_version && (
                                                <div>
                                                    <span className="font-medium">Version:</span>
                                                    <span className="ml-2">{scanResults.wordpress_version}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Scan Time:</span>
                                                <span className="ml-2">{new Date().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plugins Results */}
                                    {scanResults.plugins && scanResults.plugins.length > 0 && (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="text-lg font-medium text-gray-900">
                                                    Detected Plugins ({scanResults.plugins.length})
                                                </h4>
                                                
                                                {/* Bulk Actions */}
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center text-sm text-gray-600">
                                                        <input
                                                            type="checkbox"
                                                            id="select-all-plugins"
                                                            className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                            checked={selectedPlugins.size === scanResults.plugins.length && scanResults.plugins.length > 0}
                                                            onChange={(e) => handleSelectAll(e.target.checked)}
                                                        />
                                                        <label htmlFor="select-all-plugins">
                                                            Select All ({selectedPlugins.size} selected)
                                                        </label>
                                                    </div>
                                                    
                                                    {selectedPlugins.size > 0 && (
                                                        <Button
                                                            onClick={handleBulkAddPlugins}
                                                            disabled={bulkActionLoading}
                                                            size="sm"
                                                            variant="outline"
                                                        >
                                                            {bulkActionLoading 
                                                                ? `Adding ${selectedPlugins.size} plugins...` 
                                                                : `Add ${selectedPlugins.size} to Database`
                                                            }
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-3">
                                                {scanResults.plugins.map((plugin, index) => (
                                                    <div key={index} className="bg-white border rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <input
                                                                    type="checkbox"
                                                                    id={`plugin-${index}`}
                                                                    className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                                                    checked={selectedPlugins.has(index)}
                                                                    onChange={(e) => handlePluginSelect(index, e.target.checked)}
                                                                />
                                                                <div className="flex-1">
                                                                    <h5 className="font-medium">{plugin.name}</h5>
                                                                    {plugin.description && (
                                                                        <p className="text-sm text-gray-600 mt-1">
                                                                            {plugin.description}
                                                                        </p>
                                                                    )}
                                                                    <div className="flex gap-4 mt-2 text-sm">
                                                                        {plugin.version && (
                                                                            <span>
                                                                                <strong>Version:</strong> {plugin.version}
                                                                            </span>
                                                                        )}
                                                                        {plugin.slug && (
                                                                            <span>
                                                                                <strong>Slug:</strong> {plugin.slug}
                                                                            </span>
                                                                        )}
                                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                                            plugin.status === 'active' 
                                                                                ? 'bg-green-100 text-green-800' 
                                                                                : 'bg-gray-100 text-gray-800'
                                                                        }`}>
                                                                            {plugin.status}
                                                                        </span>
                                                                        {plugin.in_database !== undefined && (
                                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                                plugin.in_database 
                                                                                    ? 'bg-blue-100 text-blue-800' 
                                                                                    : 'bg-yellow-100 text-yellow-800'
                                                                            }`}>
                                                                                {plugin.in_database ? 'In Database' : 'Not in Database'}
                                                                            </span>
                                                                        )}
                                                                        {plugin.is_paid !== undefined && (
                                                                            <span className={`px-2 py-1 rounded text-xs ${
                                                                                plugin.is_paid 
                                                                                    ? 'bg-purple-100 text-purple-800' 
                                                                                    : 'bg-green-100 text-green-800'
                                                                            }`}>
                                                                                {plugin.is_paid ? 'Paid' : 'Free'}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="ml-4">
                                                                {!plugin.in_database && (
                                                                    <Button
                                                                        onClick={() => addPluginToDatabase(plugin)}
                                                                        size="sm"
                                                                        variant="outline"
                                                                    >
                                                                        Add to Database
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Themes Results */}
                                    {scanResults.themes && scanResults.themes.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                                Detected Themes ({scanResults.themes.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {scanResults.themes.map((theme, index) => (
                                                    <div key={index} className="bg-white border rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-medium">{theme.name}</h5>
                                                                <div className="flex gap-4 mt-2 text-sm">
                                                                    {theme.slug && (
                                                                        <span>
                                                                            <strong>Slug:</strong> {theme.slug}
                                                                        </span>
                                                                    )}
                                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                                        theme.status === 'active' 
                                                                            ? 'bg-green-100 text-green-800' 
                                                                            : 'bg-gray-100 text-gray-800'
                                                                    }`}>
                                                                        {theme.status}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Vulnerabilities Results */}
                                    {scanResults.vulnerabilities && scanResults.vulnerabilities.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                                Security Vulnerabilities ({scanResults.vulnerabilities.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {scanResults.vulnerabilities.map((vuln, index) => (
                                                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h5 className="font-medium text-red-900">{vuln.title}</h5>
                                                                <p className="text-sm text-red-700 mt-1">{vuln.description}</p>
                                                                <div className="flex gap-4 mt-2 text-sm">
                                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                                        vuln.severity === 'high' 
                                                                            ? 'bg-red-100 text-red-800' 
                                                                            : vuln.severity === 'medium'
                                                                            ? 'bg-yellow-100 text-yellow-800'
                                                                            : 'bg-blue-100 text-blue-800'
                                                                    }`}>
                                                                        {vuln.severity} severity
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results Message */}
                                    {(!scanResults.plugins || scanResults.plugins.length === 0) && 
                                     (!scanResults.themes || scanResults.themes.length === 0) && 
                                     (!scanResults.vulnerabilities || scanResults.vulnerabilities.length === 0) && (
                                        <div className="text-center py-8">
                                            <p className="text-gray-500">No plugins, themes, or vulnerabilities found.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
