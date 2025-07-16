import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        name: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        company: '',
        notes: '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Add Client</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <Form onSubmit={e => { e.preventDefault(); post('/clients'); }}>
                    <Form.Input
                        label="Name"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        required
                        error={errors?.name}
                    />
                    <Form.Input
                        label="Contact Email"
                        type="email"
                        value={data.contact_email}
                        onChange={e => setData('contact_email', e.target.value)}
                        error={errors?.contact_email}
                    />
                    <Form.Input
                        label="Contact Phone"
                        value={data.contact_phone}
                        onChange={e => setData('contact_phone', e.target.value)}
                        error={errors?.contact_phone}
                    />
                    <Form.Input
                        label="Address"
                        value={data.address}
                        onChange={e => setData('address', e.target.value)}
                        error={errors?.address}
                    />
                    <Form.Input
                        label="Company"
                        value={data.company}
                        onChange={e => setData('company', e.target.value)}
                        error={errors?.company}
                    />
                    <Form.Textarea
                        label="Notes"
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        error={errors?.notes}
                    />
                    <Button type="submit">Save</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
