import UniversalPageLayout from '@/Components/UniversalPageLayout';
import { useForm } from '@inertiajs/react';
import { Head } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';

export default function Edit({ auth, plugin }) {
    const { data, setData, put, errors } = useForm({
        name: plugin.name || '',
        description: plugin.description || '',
        is_paid: plugin.is_paid,
        purchase_url: plugin.purchase_url || '',
        install_source: plugin.install_source || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(`/plugins/${plugin.id}`);
    };

    return (
        <UniversalPageLayout
            auth={auth}
            title={`Edit Plugin: ${plugin.name}`}
            subtitle="Update plugin information and details"
        >
            <Head title={`Edit Plugin: ${plugin.name}`} />
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <Form.Input
                        label="Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                        error={errors?.name}
                    />
                    <Form.Textarea
                        label="Description"
                        value={data.description}
                        onChange={e => setData('description', e.target.value)}
                        error={errors?.description}
                    />
                    <Form.Checkbox
                        label="Paid"
                        checked={data.is_paid}
                        onChange={e => setData('is_paid', e.target.checked)}
                        error={errors?.is_paid}
                    />
                    <Form.Input
                        label="Purchase URL"
                        value={data.purchase_url}
                        onChange={e => setData('purchase_url', e.target.value)}
                        error={errors?.purchase_url}
                    />
                    <Form.Input
                        label="Install Source"
                        value={data.install_source}
                        onChange={e => setData('install_source', e.target.value)}
                        required
                        error={errors?.install_source}
                    />
                    
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => window.history.back()}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <Button type="submit">Update Plugin</Button>
                    </div>
                </form>
                
                {errors && Object.keys(errors).length > 0 && (
                    <div className="mt-4 text-red-500 dark:text-red-400 text-sm">
                        {Object.values(errors).join(', ')}
                    </div>
                )}
            </div>
        </UniversalPageLayout>
    );
}
