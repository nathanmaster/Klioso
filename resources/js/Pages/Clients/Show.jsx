import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';
import Button from '@/Components/Button';
import BackButton from '@/Components/BackButton';
import DeleteButton from '@/Components/DeleteButton';

export default function Show({ client }) {
    return (
        <AuthenticatedLayout header={<h1 className="text-2xl font-bold text-gray-800">Client Details</h1>}>
            <div className="flex gap-8 py-8">
                {/* Sidebar Navigation */}
                <nav className="w-64 bg-white rounded-lg shadow p-6 flex flex-col gap-4">
                    <Link href="/clients" className="text-blue-600 hover:underline font-medium">Clients</Link>
                    <Link href="/websites" className="text-blue-600 hover:underline font-medium">Websites</Link>
                    <Link href="/plugins" className="text-blue-600 hover:underline font-medium">Plugins</Link>
                    <Link href="/templates" className="text-blue-600 hover:underline font-medium">Templates</Link>
                    <Link href="/hosting-providers" className="text-blue-600 hover:underline font-medium">Hosting Providers</Link>
                    <Button as={Link} href={`/clients/${client.id}/edit`} size="sm" className="mt-4">Edit Client</Button>
                </nav>
                {/* Main Content */}
                <div className="flex-1">
                    <div className="bg-white rounded-lg shadow p-6 max-w-xl mx-auto">
                        <div className="flex justify-between items-center mb-4">
                            <BackButton fallbackRoute="/clients" />
                            <div className="flex gap-2">
                                <Button as={Link} href={`/clients/${client.id}/edit`} size="sm">Edit</Button>
                                <DeleteButton
                                    resource={client}
                                    resourceName="client"
                                    deleteRoute={`/clients/${client.id}`}
                                    onSuccess={() => window.location.href = '/clients'}
                                />
                            </div>
                        </div>
                        <h2 className="text-xl font-bold mb-4">{client.name}</h2>
                        <div className="mb-2"><strong>Contact Email:</strong> {client.contact_email}</div>
                        <div className="mb-2"><strong>Contact Phone:</strong> {client.contact_phone}</div>
                        <div className="mb-2"><strong>Address:</strong> {client.address}</div>
                        <div className="mb-2"><strong>Company:</strong> {client.company}</div>
                        <div className="mb-2"><strong>Notes:</strong> {client.notes}</div>
                        {/* ...other columns as needed... */}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
