import { Link } from '@inertiajs/react';

export default function AppLayout({ children }) {
    return (
        <div>
            <nav>
                <ul>
                    <li><Link href="/dashboard">Dashboard</Link></li>
                    <li><Link href="/clients">Clients</Link></li>
                    <li><Link href="/hosting-providers">Hosting Providers</Link></li>
                    <li><Link href="/websites">Websites</Link></li>
                    <li><Link href="/plugins">Plugins</Link></li>
                    <li><Link href="/templates">Templates</Link></li>
                </ul>
            </nav>
            <main>
                {children}
            </main>
        </div>
    );
}