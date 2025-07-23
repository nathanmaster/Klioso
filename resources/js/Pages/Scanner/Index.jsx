import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Button from '@/Components/Button';
import Form from '@/Components/Form';

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

    const handleUrlScan = async (e) => {
        e.preventDefault();
        if (!scanForm.url) {
            setError('URL is required to perform the scan.');
            return;
        }

        setIsScanning(true);
        setError('');
        setScanResults(null);

        try {
            // Get CSRF token safely
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
            } else if (response.status === 422) {
                // Validation error
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
        }
    };

    const handleWebsiteScan = async (e) => {
        e.preventDefault();
        if (!selectedWebsite) return;

        setIsScanning(true);
        setError('');
        setScanResults(null);

        try {
            // Get CSRF token safely
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
            } else {
                setError(data.message || 'Scan failed');
            }

        } catch (err) {
            setError('Failed to perform scan: ' + err.message);
        } finally {
            setIsScanning(false);
        }
    };

    const addPluginToDatabase = async (plugin) => {
        try {
            // Get CSRF token safely
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                alert('CSRF token not found. Please refresh the page.');
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
                alert('Failed to add plugin to database');
            }

        } catch (err) {
            alert('Failed to add plugin: ' + err.message);
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    WordPress Scanner
                </h2>
            }
        >
            <Head title="WordPress Scanner" />
            
            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="bg-white shadow sm:rounded-lg">
                        <div className="p-6">
                            {/* Tab Navigation */}
                            <div className="mb-6 border-b border-gray-200">
                                <nav className="-mb-px flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('url')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'url'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Scan URL
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('website')}
                                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                            activeTab === 'website'
                                                ? 'border-indigo-500 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Scan Website
                                    </button>
                                </nav>
                            </div>

                            {/* URL Scan Tab */}
                            {activeTab === 'url' && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                                            Scan Custom URL
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Enter any WordPress website URL to scan for plugins, themes, and potential vulnerabilities.
                                        </p>
                                    </div>

                                    <form onSubmit={handleUrlScan} className="space-y-4">
                                        <Form.Input
                                            label="Website URL"
                                            value={scanForm.url}
                                            onChange={(e) => setScanForm(prev => ({ ...prev, url: e.target.value }))}
                                            placeholder="https://example.com"
                                            required
                                        />

                                        <Form.Select
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
                                            label="Auto-sync discovered plugins to website"
                                            checked={scanForm.autoSync}
                                            onChange={(e) => setScanForm(prev => ({ ...prev, autoSync: e.target.checked }))}
                                        />

                                        <Button type="submit" disabled={isScanning}>
                                            {isScanning ? 'Scanning...' : 'Start Scan'}
                                        </Button>
                                    </form>
                                </div>
                            )}

                            {/* Error Display */}
                            {error && (
                                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
                                    <div className="flex">
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">
                                                Scan Error
                                            </h3>
                                            <div className="mt-2 text-sm text-red-700">
                                                {error}
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
                                            {scanResults.wp_version && (
                                                <div>
                                                    <span className="font-medium">WP Version:</span>
                                                    <span className="ml-2">{scanResults.wp_version}</span>
                                                </div>
                                            )}
                                            <div>
                                                <span className="font-medium">Scan Type:</span>
                                                <span className="ml-2 capitalize">{scanResults.scan_type}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Plugins Results */}
                                    {scanResults.plugins && scanResults.plugins.length > 0 && (
                                        <div>
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">
                                                Detected Plugins ({scanResults.plugins.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {scanResults.plugins.map((plugin, index) => (
                                                    <div key={index} className="bg-white border rounded-lg p-4">
                                                        <div className="flex justify-between items-start">
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
                                                                    <span className={`px-2 py-1 rounded text-xs ${
                                                                        plugin.in_database 
                                                                            ? 'bg-blue-100 text-blue-800' 
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {plugin.in_database ? 'In Database' : 'Not in Database'}
                                                                    </span>
                                                                    {plugin.is_paid !== null && (
                                                                        <span className={`px-2 py-1 rounded text-xs ${
                                                                            plugin.is_paid 
                                                                                ? 'bg-orange-100 text-orange-800' 
                                                                                : 'bg-green-100 text-green-800'
                                                                        }`}>
                                                                            {plugin.is_paid ? 'Paid' : 'Free'}
                                                                        </span>
                                                                    )}
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
                                            <h4 className="text-lg font-medium text-red-900 mb-4">
                                                Security Vulnerabilities ({scanResults.vulnerabilities.length})
                                            </h4>
                                            <div className="space-y-3">
                                                {scanResults.vulnerabilities.map((vuln, index) => (
                                                    <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                                                        <h5 className="font-medium text-red-800">{vuln.title}</h5>
                                                        {vuln.description && (
                                                            <p className="text-sm text-red-700 mt-1">{vuln.description}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* No Results */}
                                    {(!scanResults.plugins || scanResults.plugins.length === 0) && 
                                     (!scanResults.themes || scanResults.themes.length === 0) && 
                                     (!scanResults.vulnerabilities || scanResults.vulnerabilities.length === 0) && (
                                        <div className="text-center py-8 text-gray-500">
                                            <p>No {scanResults.scan_type} found or WordPress not properly detected.</p>
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
