import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { safeRoute } from '@/Utils/safeRoute';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import { UserIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Edit({ auth, client }) {
    const { data, setData, put, errors, processing } = useForm({
        name: client.name || '',
        contact_email: client.contact_email || '',
        contact_phone: client.contact_phone || '',
        address: client.address || '',
        company: client.company || '',
        notes: client.notes || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(safeRoute('clients.update', { client: client.id }));
    };

    const pageActions = [
        {
            label: 'Back to Client',
            href: safeRoute('clients.show', { client: client.id }),
            variant: 'secondary',
            icon: ArrowLeftIcon
        }
    ];

    return (
        <UniversalPageLayout
            auth={auth}
            title={`Edit Client: ${client.name}`}
            subtitle="Update client information and details"
            breadcrumbs={[
                { label: 'Clients', href: '/clients' },
                { label: client.name, href: safeRoute('clients.show', { client: client.id }) },
                { label: 'Edit', current: true }
            ]}
            actions={pageActions}
        >
            <Head title={`Edit Client: ${client.name}`} />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
                <Form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Form.Input
                            label="Name"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            error={errors?.name}
                            required
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
                            label="Company"
                            value={data.company}
                            onChange={e => setData('company', e.target.value)}
                            error={errors?.company}
                        />
                    </div>
                    
                    <Form.Input
                        label="Address"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        error={errors?.address}
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
                            {processing ? 'Updating...' : 'Update Client'}
                        </Button>
                    </div>
                </Form>
            </div>
        </UniversalPageLayout>
    );
}
