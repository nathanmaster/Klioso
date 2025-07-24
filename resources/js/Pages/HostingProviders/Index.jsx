import ResponsiveTableLayout from '@/Layouts/ResponsiveTableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ hostingProviders, pagination, sortBy, sortDirection, filters }) {
    const columns = [
        { 
            label: 'Name', 
            key: 'name', 
            sortable: true,
            render: provider => (
                <Link 
                    href={`/hosting-providers/${provider.id}`} 
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    {provider.name}
                </Link>
            )
        },
        { 
            label: 'Description', 
            key: 'description', 
            sortable: true,
            render: provider => provider.description ? (
                <div className="max-w-xs truncate" title={provider.description}>
                    {provider.description.length > 80 ? `${provider.description.substring(0, 80)}...` : provider.description}
                </div>
            ) : '-'
        },
        { 
            label: 'Website', 
            key: 'website', 
            sortable: false,
            hideOnMobile: true,
            render: provider => provider.website ? (
                <a 
                    href={provider.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                    title={provider.website}
                >
                    Visit Website
                </a>
            ) : '-'
        },
        { 
            label: 'Login', 
            key: 'login_url', 
            sortable: false,
            hideOnMobile: true,
            render: provider => provider.login_url ? (
                <a 
                    href={provider.login_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 hover:bg-indigo-200"
                >
                    Login Portal
                </a>
            ) : '-'
        },
        { 
            label: 'Contact Info', 
            key: 'contact_info', 
            sortable: false,
            hideOnMobile: true,
            render: provider => provider.contact_info ? (
                <div className="max-w-xs truncate" title={provider.contact_info}>
                    {provider.contact_info.length > 40 ? `${provider.contact_info.substring(0, 40)}...` : provider.contact_info}
                </div>
            ) : '-'
        },
        { 
            label: 'Actions', 
            key: 'actions', 
            sortable: false,
            render: provider => (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button as={Link} href={`/hosting-providers/${provider.id}`} size="sm" variant="outline">
                        View
                    </Button>
                    <Button as={Link} href={`/hosting-providers/${provider.id}/edit`} size="sm">
                        Edit
                    </Button>
                    <DeleteButton
                        resource={provider}
                        resourceName="hosting provider"
                        deleteRoute={`/hosting-providers/${provider.id}`}
                        size="sm"
                    />
                </div>
            )
        }
    ];

    return (
        <ResponsiveTableLayout
            title="Hosting Providers"
            data={hostingProviders}
            columns={columns}
            createRoute="/hosting-providers/create"
            createButtonText="Add Provider"
            searchPlaceholder="Search hosting providers by name or description..."
            searchRoute="/hosting-providers"
            emptyStateMessage="No hosting providers found. Start by adding your first provider."
            filters={filters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            pagination={pagination}
        />
    );
}
