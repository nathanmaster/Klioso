import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';

export default function Edit({ website, clients, hostingProviders }) {
    const { data, setData, put, errors } = useForm({
        domain_name: website.domain_name || '',
        platform: website.platform || '',
        dns_provider: website.dns_provider || '',
        client_id: website.client_id || '',
        hosting_provider_id: website.hosting_provider_id || '',
        status: website.status || 'active',
        notes: website.notes || '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Edit Website</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute={`/websites/${website.id}`} />
                    <h2 className="text-lg font-semibold">Edit Website</h2>
                </div>
                <Form onSubmit={e => { e.preventDefault(); put(`/websites/${website.id}`); }}>
                    <Form.Input
                        label="Domain Name"
                        value={data.domain_name}
                        onChange={e => setData('domain_name', e.target.value)}
                        required
                        placeholder="example.com"
                        error={errors?.domain_name}
                    />
                    <Form.Input
                        label="Platform"
                        value={data.platform}
                        onChange={e => setData('platform', e.target.value)}
                        required
                        placeholder="WordPress, Laravel, etc."
                        error={errors?.platform}
                    />
                    <Form.Input
                        label="DNS Provider"
                        value={data.dns_provider}
                        onChange={e => setData('dns_provider', e.target.value)}
                        required
                        placeholder="Cloudflare, Route 53, etc."
                        error={errors?.dns_provider}
                    />
                    <Form.Select
                        label="Client"
                        value={data.client_id}
                        onChange={e => setData('client_id', e.target.value)}
                        error={errors?.client_id}
                    >
                        <option value="">Select a client</option>
                        {clients?.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        label="Hosting Provider"
                        value={data.hosting_provider_id}
                        onChange={e => setData('hosting_provider_id', e.target.value)}
                        error={errors?.hosting_provider_id}
                    >
                        <option value="">Select a hosting provider</option>
                        {hostingProviders?.map(provider => (
                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        label="Status"
                        value={data.status}
                        onChange={e => setData('status', e.target.value)}
                        error={errors?.status}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="development">Development</option>
                    </Form.Select>
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
