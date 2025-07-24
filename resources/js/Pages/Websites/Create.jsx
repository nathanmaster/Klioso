import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';

export default function Create({ clients, hostingProviders }) {
    const { data, setData, post, errors } = useForm({
        domain_name: '',
        platform: '',
        client_id: '',
        hosting_provider_id: '',
        dns_provider_id: '',
        email_provider_id: '',
        domain_registrar_id: '',
        status: 'active',
        notes: '',
    });

    // Filter providers by service type
    const hostingProviders_filtered = hostingProviders?.filter(p => p.provides_hosting) || [];
    const dnsProviders = hostingProviders?.filter(p => p.provides_dns) || [];
    const emailProviders = hostingProviders?.filter(p => p.provides_email) || [];
    const domainRegistrars = hostingProviders?.filter(p => p.provides_domain_registration) || [];

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Add Website</h1>}>
            <div className="max-w-xl mx-auto bg-white rounded-lg shadow p-6 mt-8">
                <div className="flex justify-between items-center mb-6">
                    <BackButton fallbackRoute="/websites" />
                    <h2 className="text-lg font-semibold">New Website</h2>
                </div>
                <Form onSubmit={e => { e.preventDefault(); post('/websites'); }}>
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
                    <Form.Select
                        label="Client (Optional)"
                        value={data.client_id}
                        onChange={e => setData('client_id', e.target.value)}
                        error={errors?.client_id}
                    >
                        <option value="">No client / Internal / Development</option>
                        {clients?.map(client => (
                            <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        label="Hosting Provider (Optional)"
                        value={data.hosting_provider_id}
                        onChange={e => setData('hosting_provider_id', e.target.value)}
                        error={errors?.hosting_provider_id}
                    >
                        <option value="">No hosting / TBD</option>
                        {hostingProviders_filtered?.map(provider => (
                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        label="DNS Provider (Optional)"
                        value={data.dns_provider_id}
                        onChange={e => setData('dns_provider_id', e.target.value)}
                        error={errors?.dns_provider_id}
                    >
                        <option value="">No DNS provider / TBD</option>
                        {dnsProviders?.map(provider => (
                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        label="Email Provider (Optional)"
                        value={data.email_provider_id}
                        onChange={e => setData('email_provider_id', e.target.value)}
                        error={errors?.email_provider_id}
                    >
                        <option value="">No email provider / TBD</option>
                        {emailProviders?.map(provider => (
                            <option key={provider.id} value={provider.id}>{provider.name}</option>
                        ))}
                    </Form.Select>
                    <Form.Select
                        label="Domain Registrar (Optional)"
                        value={data.domain_registrar_id}
                        onChange={e => setData('domain_registrar_id', e.target.value)}
                        error={errors?.domain_registrar_id}
                    >
                        <option value="">No domain registrar / TBD</option>
                        {domainRegistrars?.map(provider => (
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
                    <Button type="submit">Save</Button>
                </Form>
                {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
            </div>
        </AuthenticatedLayout>
    );
}
