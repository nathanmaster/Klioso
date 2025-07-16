import { Link } from '@inertiajs/react';
import Table from '@/Components/Table';

export default function Show({ website, plugins }) {
    const columns = [
        { label: 'Plugin', key: 'name', render: plugin => <Link href={`/plugins/${plugin.id}`}>{plugin.name}</Link> },
        { label: 'Version', key: 'pivot.version', render: plugin => plugin.pivot.version || '-' },
        { label: 'Status', key: 'pivot.is_active', render: plugin => plugin.pivot.is_active ? 'Active' : 'Inactive' }
    ];

    return (
        <div>
            <h1>Website Details</h1>
            {/* ...existing website details... */}
            <h2>Installed Plugins</h2>
            <Table columns={columns} data={plugins} />
            {/* ...existing code... */}
        </div>
    );
}