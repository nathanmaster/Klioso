import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import WebsitePlugins from '@/Components/WebsitePlugins';

export default function Edit({ website, clients, hostingProviders, allPlugins = [] }) {
    const { data, setData, put, errors } = useForm({
        domain_name: website.domain_name || '',
        platform: website.platform || '',
        client_id: website.client_id || '',
        hosting_provider_id: website.hosting_provider_id || '',
        dns_provider_id: website.dns_provider_id || '',
        email_provider_id: website.email_provider_id || '',
        domain_registrar_id: website.domain_registrar_id || '',
        status: website.status || 'active',
        notes: website.notes || '',
    });

    // Filter providers by service type
    const hostingProviders_filtered = hostingProviders?.filter(p => p.provides_hosting) || [];
    const dnsProviders = hostingProviders?.filter(p => p.provides_dns) || [];
    const emailProviders = hostingProviders?.filter(p => p.provides_email) || [];
    const domainRegistrars = hostingProviders?.filter(p => p.provides_domain_registration) || [];

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Edit Website</h1>}>
            <div className="max-w-4xl mx-auto space-y-6 mt-8">
                {/* Website Details Form */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <BackButton fallbackRoute={`/websites/${website.id}`} />
                        <h2 className="text-lg font-semibold">Edit Website</h2>
                    </div>
                    <Form onSubmit={e => { e.preventDefault(); put(`/websites/${website.id}`); }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                        <Form.Textarea
                            label="Notes"
                            value={data.notes}
                            onChange={e => setData('notes', e.target.value)}
                            error={errors?.notes}
                        />
                        <Button type="submit">Update Website</Button>
                    </Form>
                    {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
                </div>

                {/* Website Plugins Management */}
                <div className="bg-white rounded-lg shadow p-6">
                    <WebsitePlugins 
                        website={website}
                        allPlugins={allPlugins}
                        websitePlugins={website.plugins || []}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
