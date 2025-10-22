import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { Head, Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import { PencilIcon, ArrowTopRightOnSquareIcon, CalendarIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, template }) {
    const pageActions = [
        {
            label: 'Edit Template',
            href: `/templates/${template.id}/edit`,
            variant: 'primary',
            icon: PencilIcon
        }
    ];

    return (
        <UniversalPageLayout
            auth={auth}
            title={`Template: ${template.name}`}
            subtitle="View template details and information"
            actions={pageActions}
        >
            <Head title={`Template: ${template.name}`} />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
                            {template.name}
                        </h2>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Description
                                </label>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {template.description || 'No description provided'}
                                </p>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Source URL
                                </label>
                                <div className="text-gray-900 dark:text-gray-100">
                                    {template.source_url ? (
                                        <a 
                                            href={template.source_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                                        >
                                            {template.source_url}
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                                        </a>
                                    ) : (
                                        'No source URL provided'
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                    Notes
                                </label>
                                <p className="text-gray-900 dark:text-gray-100">
                                    {template.notes || 'No notes'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-5 w-5 text-gray-500" />
                                <div>
                                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                        Created
                                    </label>
                                    <p className="text-gray-900 dark:text-gray-100">
                                        {new Date(template.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            
                            {template.updated_at && template.updated_at !== template.created_at && (
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="h-5 w-5 text-gray-500" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                            Last Updated
                                        </label>
                                        <p className="text-gray-900 dark:text-gray-100">
                                            {new Date(template.updated_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </UniversalPageLayout>
    );
}
