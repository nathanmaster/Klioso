import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';

export default function Websites() {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Websites
                </h2>
            }
        >
            <Head title="Websites" />
            <div className="py-12">
                <div className="container mx-auto max-w-7xl px-4">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="text-gray-900">
                            Websites page content goes here.
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
