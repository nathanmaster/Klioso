import ResponsiveTableLayout from '@/Layouts/ResponsiveTableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import DeleteButton from '@/Components/DeleteButton';

export default function Index({ templates, pagination, sortBy, sortDirection, filters }) {
    const columns = [
        { 
            label: 'Name', 
            key: 'name', 
            sortable: true,
            render: template => (
                <Link 
                    href={`/templates/${template.id}`}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                >
                    {template.name}
                </Link>
            )
        },
        { 
            label: 'Description', 
            key: 'description', 
            sortable: true,
            render: template => template.description ? (
                <div className="max-w-xs truncate" title={template.description}>
                    {template.description}
                </div>
            ) : '-'
        },
        { 
            label: 'Source URL', 
            key: 'source_url', 
            sortable: false,
            hideOnMobile: true,
            render: template => template.source_url ? (
                <a 
                    href={template.source_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:text-blue-800 truncate block max-w-xs"
                    title={template.source_url}
                >
                    View Source
                </a>
            ) : '-'
        },
        { 
            label: 'Notes', 
            key: 'notes', 
            sortable: false,
            hideOnMobile: true,
            render: template => template.notes ? (
                <div className="max-w-xs truncate" title={template.notes}>
                    {template.notes.length > 50 ? `${template.notes.substring(0, 50)}...` : template.notes}
                </div>
            ) : '-'
        },
        { 
            label: 'Actions', 
            key: 'actions', 
            sortable: false,
            render: template => (
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button as={Link} href={`/templates/${template.id}`} size="sm" variant="outline">
                        View
                    </Button>
                    <Button as={Link} href={`/templates/${template.id}/edit`} size="sm">
                        Edit
                    </Button>
                    <DeleteButton
                        resource={template}
                        resourceName="template"
                        deleteRoute={`/templates/${template.id}`}
                        size="sm"
                    />
                </div>
            )
        }
    ];

    return (
        <ResponsiveTableLayout
            title="Templates"
            data={templates}
            columns={columns}
            createRoute="/templates/create"
            createButtonText="Add Template"
            searchPlaceholder="Search templates by name or description..."
            searchRoute="/templates"
            emptyStateMessage="No templates found. Start by adding your first template."
            filters={filters}
            sortBy={sortBy}
            sortDirection={sortDirection}
            pagination={pagination}
        />
    );
}
