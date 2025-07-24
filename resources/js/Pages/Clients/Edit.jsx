import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useForm } from '@inertiajs/react';
import Form from '@/Components/Form';
import Button from '@/Components/Button';
import { Link } from '@inertiajs/react';
import BackButton from '@/Components/BackButton';

export default function Edit({ client }) {
    const { data, setData, put, errors } = useForm({
        name: client.name || '',
        contact_email: client.contact_email || '',
        contact_phone: client.contact_phone || '',
        address: client.address || '',
        company: client.company || '',
        notes: client.notes || '',
    });

    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Edit Client</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                </nav>
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <BackButton fallbackRoute={`/clients/${client.id}`} />
                            <h2 className="text-lg font-semibold">Edit {client.name}</h2>
                        </div>
                        <Form onSubmit={e => { e.preventDefault(); put(`/clients/${client.id}`); }}>
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
                            <Button type="submit">Update</Button>
                        </Form>
                        {errors && <div className="mt-4 text-red-500 text-sm">{Object.values(errors).join(', ')}</div>}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
