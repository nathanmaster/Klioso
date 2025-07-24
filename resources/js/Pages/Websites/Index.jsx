import ResponsiveTableLayout from '@/Layouts/ResponsiveTableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ websites, pagination, sortBy, sortDirection, filters }) {
    const columns = [
        { 
            label: 'Domain Name', 
            key: 'domain_name', 
            sortable: true,
            render: website => (
                <Link 
                    href={`/websites/${website.id}`} 
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    {website.domain_name}
                </Link>
            )
        },
        { 
            label: 'Platform', 
            key: 'platform', 
            sortable: true,
            render: website => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {website.platform || 'Unknown'}
                </span>
            )
        },
        { 
            label: 'Client', 
            key: 'client', 
            sortable: false,
            render: website => website.client ? (
                <Link 
                    href={`/clients/${website.client.id}`} 
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    {website.client.name}
                </Link>
            ) : (
                <span className="text-gray-500 italic">No Client</span>
            )
        },
        { 
            label: 'Status', 
            key: 'status', 
            sortable: true,
            render: website => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    website.status === 'active' ? 'bg-green-100 text-green-800' :
                    website.status === 'inactive' ? 'bg-red-100 text-red-800' :
                    website.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                }`}>
                    {website.status || 'Unknown'}
                </span>
            )
        },
        { 
            label: 'Hosting Provider', 
            key: 'hostingProvider', 
            sortable: false,
            hideOnMobile: true,
            render: website => website.hostingProvider ? (
                <Link 
                    href={`/hosting-providers/${website.hostingProvider.id}`} 
                    className="text-indigo-600 hover:text-indigo-900"
                >
                    {website.hostingProvider.name}
                </Link>
            ) : (
                <span className="text-gray-500 italic">No Host</span>
            )
        },
        { 
            label: 'Providers', 
            key: 'providers', 
            sortable: false,
            hideOnMobile: true,
            render: website => (
                <div className="text-xs space-y-1">
                    {website.dnsProvider && (
                        <div className="text-blue-600">DNS: {website.dnsProvider.name}</div>
                    )}
                    {website.emailProvider && (
                        <div className="text-green-600">Email: {website.emailProvider.name}</div>
                    )}
                    {website.domainRegistrar && (
                        <div className="text-purple-600">Domain: {website.domainRegistrar.name}</div>
                    )}
                    {!website.dnsProvider && !website.emailProvider && !website.domainRegistrar && '-'}
                </div>
            )
        },
        { 
            label: 'Actions', 
            key: 'actions', 
            sortable: false,
            render: website => (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button as={Link} href={`/websites/${website.id}`} size="sm" variant="outline">
                        View
                    </Button>
                    <Button as={Link} href={`/websites/${website.id}/edit`} size="sm">
                        Edit
                    </Button>
                    <DeleteButton
                        resource={website}
                        resourceName="website"
                        deleteRoute={`/websites/${website.id}`}
                        size="sm"
                    />
                </div>
            )
        }
    ];

    return (
        <ResponsiveTableLayout
            title="Websites"
            data={websites}
            columns={columns}
            createRoute="/websites/create"
            createButtonText="Add Website"
            searchPlaceholder="Search websites by domain, platform, or client..."
            searchRoute="/websites"
            emptyStateMessage="No websites found. Start by adding your first website."
            filters={filters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            pagination={pagination}
        />
    );
}
