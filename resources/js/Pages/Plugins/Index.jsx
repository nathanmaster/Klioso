import ResponsiveTableLayout from '@/Layouts/ResponsiveTableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ plugins, pagination, sortBy, sortDirection, filters }) {
    const columns = [
        { 
            label: 'Name', 
            key: 'name', 
            sortable: true,
            render: plugin => (
                <Link 
                    href={`/plugins/${plugin.id}`} 
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    {plugin.name}
                </Link>
            )
        },
        { 
            label: 'Description', 
            key: 'description', 
            sortable: true,
            hideOnMobile: true,
            render: plugin => (
                <div className="max-w-xs truncate" title={plugin.description}>
                    {plugin.description || '-'}
                </div>
            )
        },
        { 
            label: 'Type', 
            key: 'is_paid', 
            sortable: true,
            render: plugin => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    plugin.is_paid 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-green-100 text-green-800'
                }`}>
                    {plugin.is_paid ? 'Paid' : 'Free'}
                </span>
            )
        },
        { 
            label: 'Purchase URL', 
            key: 'purchase_url', 
            sortable: false,
            hideOnMobile: true,
            render: plugin => plugin.purchase_url ? (
                <a 
                    href={plugin.purchase_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                    title={plugin.purchase_url}
                >
                    View
                </a>
            ) : '-'
        },
        { 
            label: 'Install Source', 
            key: 'install_source', 
            sortable: true,
            hideOnMobile: true,
            render: plugin => plugin.install_source || '-'
        },
        { 
            label: 'Actions', 
            key: 'actions', 
            sortable: false,
            render: plugin => (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button as={Link} href={`/plugins/${plugin.id}`} size="sm" variant="outline">
                        View
                    </Button>
                    <Button as={Link} href={`/plugins/${plugin.id}/edit`} size="sm">
                        Edit
                    </Button>
                    <DeleteButton
                        resource={plugin}
                        resourceName="plugin"
                        deleteRoute={`/plugins/${plugin.id}`}
                        size="sm"
                    />
                </div>
            )
        }
    ];

    return (
        <ResponsiveTableLayout
            title="Plugins"
            data={plugins}
            columns={columns}
            createRoute="/plugins/create"
            createButtonText="Add Plugin"
            searchPlaceholder="Search plugins by name or description..."
            searchRoute="/plugins"
            emptyStateMessage="No plugins found. Start by adding your first plugin."
            filters={filters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            pagination={pagination}
        />
    );
}