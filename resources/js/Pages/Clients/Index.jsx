import TableLayout from '@/Layouts/TableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';

// Clients Index Page
export default function Index({ clients, filters }) {
    const columns = [
        { label: 'Name', key: 'name', render: client => <Link href={`/clients/${client.id}`} className="text-blue-600 hover:underline font-medium">{client.name}</Link> },
        { label: 'Contact Email', key: 'contact_email', render: client => client.contact_email || '-' },
        { label: 'Contact Phone', key: 'contact_phone', render: client => client.contact_phone || '-' },
        { label: 'Address', key: 'address', render: client => client.address || '-' },
        { label: 'Company', key: 'company', render: client => client.company || '-' },
        { label: 'Notes', key: 'notes', render: client => client.notes ? (client.notes.length > 50 ? `${client.notes.substring(0, 50)}...` : client.notes) : '-' },
        { label: 'Actions', key: 'actions', render: client => (
            <div className="flex gap-2">
                <Button as={Link} href={`/clients/${client.id}`} size="sm" variant="outline">View</Button>
                <Button as={Link} href={`/clients/${client.id}/edit`} size="sm">Edit</Button>
            </div>
        )}
    ];

    return (
        <TableLayout
            title="Clients"
            data={clients}
            columns={columns}
            createRoute="/clients/create"
            createButtonText="Add Client"
            searchPlaceholder="Search clients..."
            searchRoute="/clients"
            emptyStateMessage="No clients found."
            filters={filters}
        />
    );
}
