import TableLayout from '@/Layouts/TableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ hostingProviders, filters }) {
    const columns = [
        { label: 'Name', key: 'name', render: provider => <Link href={`/hosting-providers/${provider.id}`} className="text-blue-600 hover:underline font-medium">{provider.name}</Link> },
        { label: 'Description', key: 'description', render: provider => provider.description ? (provider.description.length > 80 ? `${provider.description.substring(0, 80)}...` : provider.description) : '-' },
        { label: 'Website', key: 'website', render: provider => provider.website ? <a href={provider.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{provider.website}</a> : '-' },
        { label: 'Login URL', key: 'login_url', render: provider => provider.login_url ? <a href={provider.login_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Login</a> : '-' },
        { label: 'Contact Info', key: 'contact_info', render: provider => provider.contact_info ? (provider.contact_info.length > 40 ? `${provider.contact_info.substring(0, 40)}...` : provider.contact_info) : '-' },
        { label: 'Actions', key: 'actions', render: provider => (
            <div className="flex gap-2">
                <Button as={Link} href={`/hosting-providers/${provider.id}`} size="sm" variant="outline">View</Button>
                <Button as={Link} href={`/hosting-providers/${provider.id}/edit`} size="sm">Edit</Button>
                <DeleteButton
                    resource={provider}
                    resourceName="hosting provider"
                    deleteRoute={`/hosting-providers/${provider.id}`}
                />
            </div>
        )}
    ];

    return (
        <TableLayout
            title="Hosting Providers"
            data={hostingProviders}
            columns={columns}
            createRoute="/hosting-providers/create"
            createButtonText="Add Provider"
            searchPlaceholder="Search hosting providers..."
            searchRoute="/hosting-providers"
            emptyStateMessage="No hosting providers found."
            filters={filters}
        />
    );
}
