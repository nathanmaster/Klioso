import TableLayout from '@/Layouts/TableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Index({ websites, filters }) {
    const columns = [
        { label: 'Name', key: 'name', render: website => <Link href={`/websites/${website.id}`}>{website.name}</Link> },
        { label: 'URL', key: 'url', render: website => website.url ? <a href={website.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{website.url}</a> : '-' },
        { label: 'Client', key: 'client', render: website => website.client ? <Link href={`/clients/${website.client.id}`}>{website.client.name}</Link> : '-' },
        { label: 'Hosting Provider', key: 'hosting_provider', render: website => website.hosting_provider ? <Link href={`/hosting-providers/${website.hosting_provider.id}`}>{website.hosting_provider.name}</Link> : '-' },
        { label: 'Status', key: 'status', render: website => (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                website.status === 'active' ? 'bg-green-100 text-green-800' :
                website.status === 'inactive' ? 'bg-red-100 text-red-800' :
                website.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
            }`}>
                {website.status || 'Unknown'}
            </span>
        )},
        { label: 'Actions', key: 'actions', render: website => (
            <div className="flex gap-2">
                <Button as={Link} href={`/websites/${website.id}`} size="sm" variant="outline">View</Button>
                <Button as={Link} href={`/websites/${website.id}/edit`} size="sm">Edit</Button>
            </div>
        )}
    ];

    return (
        <TableLayout
            title="Websites"
            data={websites}
            columns={columns}
            createRoute="/websites/create"
            createButtonText="Add Website"
            searchPlaceholder="Search websites..."
            searchRoute="/websites"
            emptyStateMessage="No websites found."
            filters={filters}
        />
    );
}
