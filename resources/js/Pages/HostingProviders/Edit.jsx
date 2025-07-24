import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';

export default function Edit({ hostingProvider }) {
    const { data, setData, put, errors } = useForm({
        name: hostingProvider.name || '',
        description: hostingProvider.description || '',
        website: hostingProvider.website || '',
        contact_info: hostingProvider.contact_info || '',
        notes: hostingProvider.notes || '',
        login_url: hostingProvider.login_url || '',
        provides_hosting: hostingProvider.provides_hosting || false,
        provides_dns: hostingProvider.provides_dns || false,
        provides_email: hostingProvider.provides_email || false,
        provides_domain_registration: hostingProvider.provides_domain_registration || false,
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Edit Provider</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute={`/hosting-providers/${hostingProvider.id}`} />
                    <h2 className="text-lg font-semibold">Edit {hostingProvider.name}</h2>
                </div>
                <Form onSubmit={e => { e.preventDefault(); put(`/hosting-providers/${hostingProvider.id}`); }}>
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
                    <Button type="submit">Update</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
