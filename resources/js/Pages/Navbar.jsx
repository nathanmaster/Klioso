import { Link } from '@inertiajs/react';

export default function Navbar() {
    return (
        <nav>
            <ul>
                <li><Link href="/clients">Clients</Link></li>
                <li><Link href="/hosting-providers">Hosting Providers</Link></li>
                <li><Link href="/websites">Websites</Link></li>
            </ul>
        </nav>
    );
}