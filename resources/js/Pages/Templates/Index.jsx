import TableLayout from '@/Layouts/TableLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Index({ templates, filters }) {
    const columns = [
        { label: 'Name', key: 'name', render: template => <Link href={`/templates/${template.id}`}>{template.name}</Link> },
        { label: 'Description', key: 'description', render: template => template.description || '-' },
        { label: 'Source URL', key: 'source_url', render: template => template.source_url ? <a href={template.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{template.source_url}</a> : '-' },
        { label: 'Notes', key: 'notes', render: template => template.notes ? (template.notes.length > 50 ? `${template.notes.substring(0, 50)}...` : template.notes) : '-' },
        { label: 'Actions', key: 'actions', render: template => (
            <div className="flex gap-2">
                <Button as={Link} href={`/templates/${template.id}`} size="sm" variant="outline">View</Button>
                <Button as={Link} href={`/templates/${template.id}/edit`} size="sm">Edit</Button>
            </div>
        )}
    ];

    return (
        <TableLayout
            title="Templates"
            data={templates}
            columns={columns}
            createRoute="/templates/create"
            createButtonText="Add Template"
            searchPlaceholder="Search templates..."
            searchRoute="/templates"
            emptyStateMessage="No templates found."
            filters={filters}
        />
    );
}
