import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';

export default function Edit({ template }) {
    const { data, setData, put, errors } = useForm({
        name: template.name || '',
        description: template.description || '',
        source_url: template.source_url || '',
        notes: template.notes || '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Edit Template</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute={`/templates/${template.id}`} />
                    <h2 className="text-lg font-semibold">Edit {template.name}</h2>
                </div>
                <Form onSubmit={e => { e.preventDefault(); put(`/templates/${template.id}`); }}>
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
                    <Form.Input
                        label="Source URL"
                        value={data.source_url}
                        onChange={e => setData('source_url', e.target.value)}
                        placeholder="https://example.com/template"
                        error={errors?.source_url}
                    />
                    <Form.Textarea
                        label="Notes"
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        error={errors?.notes}
                    />
                    <Button type="submit">Update</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
