import React from 'react';
import { Head } from '@inertiajs/react';

export default function Index({ auth, hostingProviders }) {
    return (
        <>
            <Head title="Hosting Providers" />
            <div className="p-6">
                <h1 className="text-2xl font-bold">HOSTING PROVIDERS PAGE WORKING</h1>
                <p>This is the clean minimal version.</p>
                <p>User: {auth?.user?.name || 'Guest'}</p>
                <p>Providers Count: {hostingProviders?.data?.length || 0}</p>
            </div>
        </>
    );
}
