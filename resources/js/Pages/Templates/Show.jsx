import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Show({ template }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Template Details</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href={`/templates/${template.id}/edit`} size="sm" className="mt-4">Edit Template</Button>
                </nav>
                
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4">{template.name}</h2>
                        <div className="mb-2"><strong>Description:</strong> {template.description || '-'}</div>
                        <div className="mb-2">
                            <strong>Source URL:</strong> 
                            {template.source_url ? (
                                <a href={template.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                                    {template.source_url}
                                </a>
                            ) : '-'}
                        </div>
                        <div className="mb-2"><strong>Notes:</strong> {template.notes || '-'}</div>
                        <div className="mb-2"><strong>Created:</strong> {new Date(template.created_at).toLocaleDateString()}</div>
                        {template.updated_at && template.updated_at !== template.created_at && (
                            <div className="mb-2"><strong>Updated:</strong> {new Date(template.updated_at).toLocaleDateString()}</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
