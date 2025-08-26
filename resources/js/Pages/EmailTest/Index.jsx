import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { 
    EnvelopeIcon,
    ShieldCheckIcon,
    CogIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    ClockIcon
} from '@heroicons/react/24/outline';

// Define stable objects outside component to prevent recreation
const EMPTY_DATA = [];
const EMPTY_FILTERS = {};

export default function Index({ auth, mailConfig, websites, flash }) {
    const [formData, setFormData] = useState({
        email: auth.user?.email || '',
        type: 'basic',
        website_id: websites.length > 0 ? websites[0].id : '',
        count: 5
    });
    const [testing, setTesting] = useState(false);
    const [configTesting, setConfigTesting] = useState(false);
    const [configResult, setConfigResult] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        setTesting(true);
        
        router.post(route('email-test.send'), formData, {
            onFinish: () => setTesting(false)
        });
    };

    const handleBulkTest = (e) => {
        e.preventDefault();
        setTesting(true);
        
        router.post(route('email-test.bulk'), {
            email: formData.email,
            count: formData.count
        }, {
            onFinish: () => setTesting(false)
        });
    };

    const testConfig = async () => {
        setConfigTesting(true);
        try {
            const response = await fetch(route('email-test.config'));
            const result = await response.json();
            setConfigResult(result);
        } catch (error) {
            setConfigResult({
                status: 'error',
                message: 'Failed to test configuration: ' + error.message
            });
        } finally {
            setConfigTesting(false);
        }
    };

    const configCards = [
        {
            title: 'Mail Driver',
            value: mailConfig.mailer,
            icon: CogIcon,
            status: mailConfig.mailer === 'smtp' ? 'success' : 'warning'
        },
        {
            title: 'SMTP Host',
            value: mailConfig.host,
            icon: EnvelopeIcon,
            status: mailConfig.host === '127.0.0.1' ? 'success' : 'info'
        },
        {
            title: 'SMTP Port',
            value: mailConfig.port,
            icon: CogIcon,
            status: mailConfig.port == 1025 ? 'success' : 'warning'
        },
        {
            title: 'From Address',
            value: mailConfig.from_address,
            icon: EnvelopeIcon,
            status: 'info'
        }
    ];

    return (
        <>
            <Head title="Email Testing - Mailpit" />
            
            <UniversalPageLayout
                title="Email Testing with Mailpit"
                auth={auth}
                data={EMPTY_DATA} // Use stable empty data array
                filters={EMPTY_FILTERS} // Use stable empty filters object
                allowViewToggle={false} // Disable view toggle
                allowBulkActions={false} // Disable bulk actions
                allowSearch={false} // Disable search
                showCreateButton={false}
            >
                <div className="space-y-6">
                    {/* Flash Messages */}
                    {flash?.success && (
                        <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-4">
                            <div className="flex items-center">
                                <CheckCircleIcon className="h-5 w-5 text-green-400 mr-3" />
                                <p className="text-green-800 dark:text-green-200">{flash.success}</p>
                            </div>
                        </div>
                    )}

                    {flash?.error && (
                        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                            <div className="flex items-center">
                                <ExclamationTriangleIcon className="h-5 w-5 text-red-400 mr-3" />
                                <p className="text-red-800 dark:text-red-200">{flash.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Email Configuration Status */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Email Configuration Status
                                </h2>
                                <button
                                    onClick={testConfig}
                                    disabled={configTesting}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {configTesting ? (
                                        <>
                                            <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                                            Testing...
                                        </>
                                    ) : (
                                        <>
                                            <CogIcon className="h-4 w-4 mr-2" />
                                            Test Config
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                {configCards.map((card, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <card.icon className={`h-8 w-8 mr-3 ${
                                                card.status === 'success' ? 'text-green-500' :
                                                card.status === 'warning' ? 'text-yellow-500' :
                                                'text-blue-500'
                                            }`} />
                                            <div>
                                                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                                                    {card.title}
                                                </p>
                                                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                                    {card.value || 'Not Set'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {configResult && (
                                <div className={`rounded-lg p-4 ${
                                    configResult.status === 'success' 
                                        ? 'bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700'
                                        : 'bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700'
                                }`}>
                                    <p className={`font-medium ${
                                        configResult.status === 'success' 
                                            ? 'text-green-800 dark:text-green-200'
                                            : 'text-red-800 dark:text-red-200'
                                    }`}>
                                        {configResult.message}
                                    </p>
                                    {configResult.mailpit_url && (
                                        <p className="mt-2 text-sm text-green-600 dark:text-green-300">
                                            Mailpit Interface: <a href={configResult.mailpit_url} target="_blank" className="underline">
                                                {configResult.mailpit_url}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                                    Mailpit Setup Instructions:
                                </h3>
                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                    <li>• Mailpit should be running on port 1025 (SMTP) and 8025 (Web Interface)</li>
                                    <li>• In Laragon, Mailpit is usually auto-started with the services</li>
                                    <li>• Access the web interface at: <a href="http://localhost:8025" target="_blank" className="underline">http://localhost:8025</a></li>
                                    <li>• All emails sent from your app will be captured and displayed there</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Email Testing Form */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Send Test Emails
                            </h2>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Recipient Email
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Email Type
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    >
                                        <option value="basic">Basic Test Email</option>
                                        <option value="security">Security Alert Email</option>
                                    </select>
                                </div>

                                {formData.type === 'security' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Test Website
                                        </label>
                                        <select
                                            value={formData.website_id}
                                            onChange={(e) => setFormData({...formData, website_id: e.target.value})}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                            required
                                        >
                                            {websites.map(website => (
                                                <option key={website.id} value={website.id}>
                                                    {website.domain_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex space-x-4">
                                    <button
                                        type="submit"
                                        disabled={testing}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {testing ? (
                                            <>
                                                <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                <EnvelopeIcon className="h-4 w-4 mr-2" />
                                                Send Test Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Bulk Email Testing */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Bulk Email Testing
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Test email performance and queue processing
                            </p>
                        </div>
                        
                        <div className="p-6">
                            <form onSubmit={handleBulkTest} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Number of Emails (1-50)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formData.count}
                                        onChange={(e) => setFormData({...formData, count: parseInt(e.target.value)})}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={testing}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {testing ? (
                                        <>
                                            <ClockIcon className="h-4 w-4 mr-2 animate-spin" />
                                            Sending Bulk...
                                        </>
                                    ) : (
                                        <>
                                            <EnvelopeIcon className="h-4 w-4 mr-2" />
                                            Send Bulk Test
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </UniversalPageLayout>
        </>
    );
}
