import ResponsiveTableLayout from '@/Layouts/ResponsiveTableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

// Clients Index Page
export default function Index({ clients, pagination, sortBy, sortDirection, filters }) {
    const columns = [
        { 
            label: 'Name', 
            key: 'name', 
            sortable: true,
            render: client => (
                <Link 
                    href={`/clients/${client.id}`} 
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    {client.name}
                </Link>
            )
        },
        { 
            label: 'Contact Email', 
            key: 'contact_email', 
            sortable: true,
            render: client => client.contact_email || '-'
        },
        { 
            label: 'Phone', 
            key: 'contact_phone', 
            sortable: false,
            hideOnMobile: true,
            render: client => client.contact_phone || '-'
        },
        { 
            label: 'Company', 
            key: 'company', 
            sortable: false,
            hideOnMobile: true,
            render: client => client.company || '-'
        },
        { 
            label: 'Notes', 
            key: 'notes', 
            sortable: false,
            hideOnMobile: true,
            render: client => client.notes ? (
                <div className="max-w-xs truncate" title={client.notes}>
                    {client.notes.length > 50 ? `${client.notes.substring(0, 50)}...` : client.notes}
                </div>
            ) : '-'
        },
        { 
            label: 'Actions', 
            key: 'actions', 
            sortable: false,
            render: client => (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button as={Link} href={`/clients/${client.id}`} size="sm" variant="outline">
                        View
                    </Button>
                    <Button as={Link} href={`/clients/${client.id}/edit`} size="sm">
                        Edit
                    </Button>
                    <DeleteButton
                        resource={client}
                        resourceName="client"
                        deleteRoute={`/clients/${client.id}`}
                        size="sm"
                    />
                </div>
            )
        }
    ];

    return (
        <ResponsiveTableLayout
            title="Clients"
            data={clients}
            columns={columns}
            createRoute="/clients/create"
            createButtonText="Add Client"
            searchPlaceholder="Search clients by name or email..."
            searchRoute="/clients"
            emptyStateMessage="No clients found. Start by adding your first client."
            filters={filters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            pagination={pagination}
        />
    );
}
