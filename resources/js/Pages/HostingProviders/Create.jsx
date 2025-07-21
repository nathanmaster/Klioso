import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        name: '',
        description: '',
        website: '',
        contact_info: '',
        notes: '',
        login_url: '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Add Hosting Provider</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <Form onSubmit={e => { e.preventDefault(); post('/hosting-providers'); }}>
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
                        label="Website"
                        value={data.website}
                        onChange={e => setData('website', e.target.value)}
                        placeholder="https://hostingprovider.com"
                        error={errors?.website}
                    />
                    <Form.Textarea
                        label="Contact Info"
                        value={data.contact_info}
                        onChange={e => setData('contact_info', e.target.value)}
                        placeholder="Email, phone, support URL, etc."
                        error={errors?.contact_info}
                    />
                    <Form.Textarea
                        label="Notes"
                        value={data.notes}
                        onChange={e => setData('notes', e.target.value)}
                        error={errors?.notes}
                    />
                    <Form.Input
                        label="Login URL"
                        value={data.login_url}
                        onChange={e => setData('login_url', e.target.value)}
                        placeholder="https://cpanel.hostingprovider.com"
                        error={errors?.login_url}
                    />
                    <Button type="submit">Save</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
