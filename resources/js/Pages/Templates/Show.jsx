import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';

export default function Show({ template }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Template Details</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href={`/templates/${template.id}/edit`} size="sm" className="mt-4">Edit Template</Button>
                </nav>
                
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-xl mx-auto">
                        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">{template.name}</h2>
                        <div className="mb-2 text-gray-900 dark:text-gray-100"><strong>Description:</strong> {template.description || '-'}</div>
                        <div className="mb-2 text-gray-900 dark:text-gray-100">
                            <strong>Source URL:</strong> 
                            {template.source_url ? (
                                <a href={template.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline ml-1">
                                    {template.source_url}
                                </a>
                            ) : '-'}
                        </div>
                        <div className="mb-2 text-gray-900 dark:text-gray-100"><strong>Notes:</strong> {template.notes || '-'}</div>
                        <div className="mb-2 text-gray-900 dark:text-gray-100"><strong>Created:</strong> {new Date(template.created_at).toLocaleDateString()}</div>
                        {template.updated_at && template.updated_at !== template.created_at && (
                            <div className="mb-2 text-gray-900 dark:text-gray-100"><strong>Updated:</strong> {new Date(template.updated_at).toLocaleDateString()}</div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
