import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import { Link } from '@inertiajs/react';

export default function Edit({ plugin }) {
    const { data, setData, put, errors } = useForm({
        name: plugin.name || '',
        description: plugin.description || '',
        is_paid: plugin.is_paid,
        purchase_url: plugin.purchase_url || '',
        install_source: plugin.install_source || '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Edit Plugin</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">Hosting Providers</Link>
                </nav>
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-xl mx-auto">
                        <Form onSubmit={e => { e.preventDefault(); put(`/plugins/${plugin.id}`); }}>
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
                            <Button type="submit">Update</Button>
                        </Form>
                        {errors && <div className="mt-4 text-red-500 dark:text-red-400 text-sm">{Object.values(errors).join(', ')}</div>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
