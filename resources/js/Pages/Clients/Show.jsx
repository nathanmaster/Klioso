import React from 'react';
import { Head, Link } from '@inertiajs/react';
import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { safeRoute } from '@/Utils/safeRoute';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';
import { PlusIcon, PencilIcon, UserIcon, EnvelopeIcon, PhoneIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, client }) {
    const pageActions = [
        {
            label: 'Edit Client',
            href: safeRoute('clients.edit', { client: client.id }),
            variant: 'primary',
            icon: PencilIcon
        }
    ];

    return (
        <UniversalPageLayout
            auth={auth}
            title={`Client: ${client.name}`}
            subtitle="View client details and information"
            breadcrumbs={[
                { label: 'Clients', href: '/clients' },
                { label: client.name, current: true }
            ]}
            actions={pageActions}
        >
            <Head title={`Client: ${client.name}`} />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute="/clients" />
                    <DeleteButton
                        resource={client}
                        resourceName="client"
                        deleteRoute={safeRoute('clients.destroy', { client: client.id })}
                        onSuccess={() => window.location.href = '/clients'}
                    />
                </div>

                {/* Client Information Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</label>
                                <p className="text-gray-900 dark:text-gray-100">{client.name}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <EnvelopeIcon className="h-5 w-5 text-gray-500" />
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Email</label>
                                <p className="text-gray-900 dark:text-gray-100">{client.contact_email || 'Not provided'}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                            <PhoneIcon className="h-5 w-5 text-gray-500" />
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Phone</label>
                                <p className="text-gray-900 dark:text-gray-100">{client.contact_phone || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                            <BuildingOfficeIcon className="h-5 w-5 text-gray-500" />
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company</label>
                                <p className="text-gray-900 dark:text-gray-100">{client.company || 'Not provided'}</p>
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
                            <p className="text-gray-900 dark:text-gray-100">{client.address || 'Not provided'}</p>
                        </div>
                        
                        {client.notes && (
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                                <p className="text-gray-900 dark:text-gray-100">{client.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </UniversalPageLayout>
    );
}
