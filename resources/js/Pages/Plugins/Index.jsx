import TableLayout from '@/Layouts/TableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ plugins, filters }) {
    const columns = [
        { label: 'Name', key: 'name', render: plugin => <Link href={`/plugins/${plugin.id}`}>{plugin.name}</Link> },
        { label: 'Description', key: 'description', render: plugin => plugin.description || '-' },
        { label: 'Paid', key: 'is_paid', render: plugin => plugin.is_paid ? 'Yes' : 'No' },
        { label: 'Purchase URL', key: 'purchase_url', render: plugin => plugin.purchase_url ? <a href={plugin.purchase_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{plugin.purchase_url}</a> : '-' },
        { label: 'Install Source', key: 'install_source', render: plugin => plugin.install_source || '-' },
        { label: 'Actions', key: 'actions', render: plugin => (
            <div className="flex gap-2">
                <Button as={Link} href={`/plugins/${plugin.id}`} size="sm" variant="outline">View</Button>
                <Button as={Link} href={`/plugins/${plugin.id}/edit`} size="sm">Edit</Button>
                <DeleteButton
                    resource={plugin}
                    resourceName="plugin"
                    deleteRoute={`/plugins/${plugin.id}`}
                />
            </div>
        )}
    ];

    return (
        <TableLayout
            title="Plugins"
            data={plugins}
            columns={columns}
            createRoute="/plugins/create"
            createButtonText="Add Plugin"
            searchPlaceholder="Search plugins..."
            searchRoute="/plugins"
            emptyStateMessage="No plugins found."
            filters={filters}
        />
    );
}