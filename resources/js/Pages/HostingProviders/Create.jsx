import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';

export default function Create() {
    const { data, setData, post, errors } = useForm({
        name: '',
        description: '',
        website: '',
        contact_info: '',
        notes: '',
        login_url: '',
        provides_hosting: false,
        provides_dns: false,
        provides_email: false,
        provides_domain_registration: false,
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Add Provider</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute="/hosting-providers" />
                    <h2 className="text-lg font-semibold">New Provider</h2>
                </div>
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
                    
                    <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Services Provided
                        </label>
                        <div className="space-y-3">
                            <Form.Checkbox
                                label="Web Hosting"
                                checked={data.provides_hosting}
                                onChange={e => setData('provides_hosting', e.target.checked)}
                                error={errors?.provides_hosting}
                            />
                            <Form.Checkbox
                                label="DNS Management"
                                checked={data.provides_dns}
                                onChange={e => setData('provides_dns', e.target.checked)}
                                error={errors?.provides_dns}
                            />
                            <Form.Checkbox
                                label="Email Services"
                                checked={data.provides_email}
                                onChange={e => setData('provides_email', e.target.checked)}
                                error={errors?.provides_email}
                            />
                            <Form.Checkbox
                                label="Domain Registration"
                                checked={data.provides_domain_registration}
                                onChange={e => setData('provides_domain_registration', e.target.checked)}
                                error={errors?.provides_domain_registration}
                            />
                        </div>
                    </div>
                    <Button type="submit">Save</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
