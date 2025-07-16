import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Link } from '@inertiajs/react';

export default function Plugins() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Plugins
                </h2>
            }
        >
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
                    <div className="bg-white rounded-lg shadow p-6">
                        Plugins page content goes here.
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
