import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';

export default function Edit({ auth, scheduledScan, websites }) {
    const { data, setData, put, errors, processing } = useForm({
        name: scheduledScan.name || '',
        scan_type: scheduledScan.scan_type || 'url',
        target: scheduledScan.scan_type === 'url' ? scheduledScan.target : '',
        website_id: scheduledScan.website_id || '',
        frequency: scheduledScan.frequency || 'daily',
        scheduled_time: scheduledScan.scheduled_time || '09:00',
        scan_config: scheduledScan.scan_config || '{}',
        is_active: scheduledScan.is_active ?? true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('scheduled-scans.update', scheduledScan.id));
    };

    const handleScanTypeChange = (scanType) => {
        setData({
            ...data,
            scan_type: scanType,
            target: scanType === 'url' ? data.target : '',
            website_id: scanType === 'website' ? data.website_id : '',
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Edit Scheduled Scan</h1>}
        >
            <Head title={`Edit ${scheduledScan.name}`} />

            <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute="/scheduled-scans" />
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Edit Scheduled Scan</h2>
                </div>

                <Form onSubmit={handleSubmit}>
                    <Form.Input
                        label="Scan Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                        placeholder="Enter scan name"
                        error={errors?.name}
                    />

                    <Form.Select
                        label="Scan Type"
                        value={data.scan_type}
                        onChange={e => handleScanTypeChange(e.target.value)}
                        required
                        error={errors?.scan_type}
                    >
                        <option value="url">URL Scan</option>
                        <option value="website">Website Scan</option>
                    </Form.Select>

                    {data.scan_type === 'url' ? (
                        <Form.Input
                            label="Target URL"
                            type="url"
                            value={data.target}
                            onChange={e => setData('target', e.target.value)}
                            required
                            placeholder="https://example.com"
                            error={errors?.target}
                        />
                    ) : (
                        <Form.Select
                            label="Website"
                            value={data.website_id}
                            onChange={e => setData('website_id', e.target.value)}
                            required
                            error={errors?.website_id}
                        >
                            <option value="">Select a website</option>
                            {websites?.map(website => (
                                <option key={website.id} value={website.id}>
                                    {website.domain_name}
                                </option>
                            ))}
                        </Form.Select>
                    )}

                    <Form.Select
                        label="Frequency"
                        value={data.frequency}
                        onChange={e => setData('frequency', e.target.value)}
                        required
                        error={errors?.frequency}
                    >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </Form.Select>

                    <Form.Input
                        label="Scheduled Time"
                        type="time"
                        value={data.scheduled_time}
                        onChange={e => setData('scheduled_time', e.target.value)}
                        required
                        error={errors?.scheduled_time}
                    />

                    <Form.Textarea
                        label="Scan Configuration (JSON)"
                        value={data.scan_config}
                        onChange={e => setData('scan_config', e.target.value)}
                        required
                        placeholder='{"timeout": 30, "follow_redirects": true}'
                        error={errors?.scan_config}
                        rows={4}
                    />

                    <div className="mb-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={data.is_active}
                                onChange={e => setData('is_active', e.target.checked)}
                                className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-indigo-600 shadow-sm focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:focus:ring-offset-gray-800"
                            />
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Active</span>
                        </label>
                        {errors?.is_active && (
                            <div className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.is_active}</div>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button 
                            type="submit" 
                            disabled={processing}
                            className="flex-1"
                        >
                            {processing ? 'Updating...' : 'Update Scheduled Scan'}
                        </Button>
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </Form>

                {errors && Object.keys(errors).length > 0 && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-md">
                        <div className="text-sm text-red-700 dark:text-red-300">
                            Please fix the following errors:
                            <ul className="mt-1 list-disc list-inside">
                                {Object.values(errors).map((error, index) => (
                                    <li key={index}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
