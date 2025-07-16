import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        name: '',
        description: '',
        is_paid: false,
        purchase_url: '',
        install_source: '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Add Plugin</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <Form onSubmit={e => { e.preventDefault(); post('/plugins'); }}>
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
                    <Button type="submit">Save</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
