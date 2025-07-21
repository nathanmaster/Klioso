import TableLayout from '@/Layouts/TableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ websites, filters }) {
    const columns = [
        { label: 'Domain Name', key: 'domain_name', render: website => <Link href={`/websites/${website.id}`} className="text-blue-600 hover:underline font-medium">{website.domain_name}</Link> },
        { label: 'Platform', key: 'platform', render: website => website.platform || '-' },
        { label: 'DNS Provider', key: 'dns_provider', render: website => website.dns_provider || '-' },
        { label: 'Client', key: 'client', render: website => website.client ? <Link href={`/clients/${website.client.id}`} className="text-blue-600 hover:underline">{website.client.name}</Link> : '-' },
        { label: 'Hosting Provider', key: 'hostingProvider', render: website => website.hostingProvider ? <Link href={`/hosting-providers/${website.hostingProvider.id}`} className="text-blue-600 hover:underline">{website.hostingProvider.name}</Link> : '-' },
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
                <DeleteButton
                    resource={website}
                    resourceName="website"
                    deleteRoute={`/websites/${website.id}`}
                />
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
