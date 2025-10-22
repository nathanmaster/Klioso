import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { safeRoute } from '@/Utils/safeRoute';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Create({ auth }) {
    const { data, setData, post, errors, processing } = useForm({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        company: '',
        notes: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/clients');
    };

    const pageActions = [
        {
            label: 'Back to Clients',
            href: '/clients',
            variant: 'secondary',
            icon: ArrowLeftIcon
        }
    ];

    return (
        <UniversalPageLayout
            auth={auth}
            title="Create New Client"
            subtitle="Add a new client to your management system"
            breadcrumbs={[
                { label: 'Clients', href: '/clients' },
                { label: 'Create', current: true }
            ]}
            actions={pageActions}
        >
            <Head title="Create New Client" />
            
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute="/clients" />
                    <h2 className="text-lg font-semibold">New Client</h2>
                </div>
                <Form onSubmit={e => { e.preventDefault(); post('/clients'); }}>
                    <Form.Input
                        label="Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                        error={errors?.name}
                    />
                    <Form.Input
                        label="Contact Email"
                        type="email"
                        value={data.contact_email}
                        onChange={e => setData('contact_email', e.target.value)}
                        error={errors?.contact_email}
                    />
                    <Form.Input
                        label="Contact Phone"
                        value={data.contact_phone}
                        onChange={e => setData('contact_phone', e.target.value)}
                        error={errors?.contact_phone}
                    />
                    <Form.Input
                        label="Address"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        error={errors?.address}
                    />
                    <Form.Input
                        label="Company"
                        value={data.company}
                        onChange={e => setData('company', e.target.value)}
                        error={errors?.company}
                    />
                    <Form.Textarea
                        label="Notes"
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        error={errors?.notes}
                    />
                    <div className="flex justify-end space-x-4">
                        <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => window.history.back()}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Creating...' : 'Create Client'}
                        </Button>
                    </div>
                </Form>
            </div>
        </UniversalPageLayout>
    );
}
