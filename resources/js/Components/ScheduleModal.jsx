import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { ClockIcon, CalendarIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ScheduleModal({ isOpen, onClose, websites }) {
    const [formData, setFormData] = useState({
        name: '',
        scan_type: 'website',
        target: '',
        website_id: '',
        frequency: 'weekly',
        scheduled_time: '02:00',
        scan_config: JSON.stringify({
            check_plugins: true,
            check_themes: true,
            check_vulnerabilities: true,
            check_updates: true,
        }),
        is_active: true,
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const submitData = {
            ...formData,
            scan_config: typeof formData.scan_config === 'string' 
                ? formData.scan_config 
                : JSON.stringify(formData.scan_config)
        };

        router.post(route('scheduled-scans.store'), submitData, {
            onError: (errors) => {
                setErrors(errors);
                setLoading(false);
            },
            onSuccess: () => {
                onClose();
                setFormData({
                    name: '',
                    scan_type: 'website',
                    target: '',
                    website_id: '',
                    frequency: 'weekly',
                    scheduled_time: '02:00',
                    scan_config: JSON.stringify({
                        check_plugins: true,
                        check_themes: true,
                        check_vulnerabilities: true,
                        check_updates: true,
                    }),
                    is_active: true,
                });
                setErrors({});
                setLoading(false);
            },
        });
    };

    const handleScanConfigChange = (key, value) => {
        const config = typeof formData.scan_config === 'string' 
            ? JSON.parse(formData.scan_config) 
            : formData.scan_config;
        
        const updatedConfig = { ...config, [key]: value };
        setFormData({ ...formData, scan_config: JSON.stringify(updatedConfig) });
    };

    const getScanConfig = () => {
        try {
            return typeof formData.scan_config === 'string' 
                ? JSON.parse(formData.scan_config) 
                : formData.scan_config;
        } catch {
            return {
                check_plugins: true,
                check_themes: true,
                check_vulnerabilities: true,
                check_updates: true,
            };
        }
    };

    if (!isOpen) return null;

    const scanConfig = getScanConfig();

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5" />
                            Schedule Automated Scan
                        </h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Schedule Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                    errors.name ? 'border-red-300' : ''
                                }`}
                                placeholder="e.g., Weekly Website Security Scan"
                                required
                            />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Scan Type *
                                </label>
                                <select
                                    value={formData.scan_type}
                                    onChange={(e) => setFormData({...formData, scan_type: e.target.value})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="website">Specific Website</option>
                                    <option value="url">Custom URL</option>
                                </select>
                            </div>

                            {formData.scan_type === 'website' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Website *
                                    </label>
                                    <select
                                        value={formData.website_id}
                                        onChange={(e) => setFormData({...formData, website_id: e.target.value})}
                                        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.website_id ? 'border-red-300' : ''
                                        }`}
                                        required
                                    >
                                        <option value="">Select a website</option>
                                        {websites.map((website) => (
                                            <option key={website.id} value={website.id}>
                                                {website.name} ({website.url})
                                            </option>
                                        ))}
                                    </select>
                                    {errors.website_id && <p className="mt-1 text-sm text-red-600">{errors.website_id}</p>}
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Target URL *
                                    </label>
                                    <input
                                        type="url"
                                        value={formData.target}
                                        onChange={(e) => setFormData({...formData, target: e.target.value})}
                                        className={`w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 ${
                                            errors.target ? 'border-red-300' : ''
                                        }`}
                                        placeholder="https://example.com"
                                        required
                                    />
                                    {errors.target && <p className="mt-1 text-sm text-red-600">{errors.target}</p>}
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Frequency *
                                </label>
                                <select
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Scheduled Time *
                                </label>
                                <input
                                    type="time"
                                    value={formData.scheduled_time}
                                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Scan Configuration
                            </label>
                            <div className="space-y-2 bg-gray-50 p-3 rounded-md">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={scanConfig.check_plugins}
                                        onChange={(e) => handleScanConfigChange('check_plugins', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Check Plugins</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={scanConfig.check_themes}
                                        onChange={(e) => handleScanConfigChange('check_themes', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Check Themes</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={scanConfig.check_vulnerabilities}
                                        onChange={(e) => handleScanConfigChange('check_vulnerabilities', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Check Vulnerabilities</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={scanConfig.check_updates}
                                        onChange={(e) => handleScanConfigChange('check_updates', e.target.checked)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-700">Check for Updates</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active (schedule will run automatically)</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <CalendarIcon className="h-4 w-4" />
                                        Create Schedule
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
