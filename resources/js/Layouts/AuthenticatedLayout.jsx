import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import ThemeToggle from '@/Components/ThemeToggle';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const navLinks = [
        { name: 'Dashboard', route: 'dashboard' },
        { name: 'Clients', route: 'clients.index', match: 'clients.*' },
        {
            name: 'Hosting Providers',
            route: 'hosting-providers.index',
            match: 'hosting-providers.*',
        },
        { name: 'Websites', route: 'websites.index', match: 'websites.*' },
        { name: 'Groups', route: 'groups.index', match: 'groups.*' },
        { name: 'Plugins', route: 'plugins.index', match: 'plugins.*' },
        { name: 'Templates', route: 'templates.index', match: 'templates.*' },
    ];

    const scannerMenuActive = route().current('scanner.*') || route().current('scheduled-scans.*');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
            <nav className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" aria-label="Go to homepage">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-gray-800 dark:text-gray-200" />
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                {navLinks.map((link) => (
                                    <NavLink
                                        key={link.name}
                                        href={route(link.route)}
                                        active={route().current(
                                            link.match ?? link.route,
                                        )}
                                    >
                                        {link.name}
                                    </NavLink>
                                ))}
                                
                                {/* Klioso Scanner Dropdown */}
                                <div className="relative inline-flex items-center">
                                    <Dropdown>
                                        <Dropdown.Trigger>
                                            <button
                                                className={`inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:outline-none ${
                                                    scannerMenuActive
                                                        ? 'border-indigo-400 dark:border-indigo-500 text-gray-900 dark:text-gray-100 focus:border-indigo-700 dark:focus:border-indigo-400'
                                                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 focus:border-gray-300 dark:focus:border-gray-600 focus:text-gray-700 dark:focus:text-gray-300'
                                                }`}
                                            >
                                                Klioso Scanner
                                                <ChevronDownIcon className="ml-1 h-4 w-4" />
                                            </button>
                                        </Dropdown.Trigger>
                                        <Dropdown.Content>
                                            <Dropdown.Link href={route('scanner.index')}>
                                                Scanner
                                            </Dropdown.Link>
                                            <Dropdown.Link href={route('scanner.history')}>
                                                Scan History
                                            </Dropdown.Link>
                                            <hr className="border-gray-200 dark:border-gray-600" />
                                            <Dropdown.Link href={route('scheduled-scans.index')}>
                                                Scheduled Scans
                                            </Dropdown.Link>
                                        </Dropdown.Content>
                                    </Dropdown>
                                </div>

                                {/* Email Testing Link (Development) */}
                                <NavLink
                                    href={route('email-test.index')}
                                    active={route().current('email-test.*')}
                                    className="text-orange-600 dark:text-orange-400"
                                >
                                    Email Test
                                </NavLink>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center space-x-4">
                            <ThemeToggle />
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none dark:bg-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                                aria-label="User account menu"
                                                aria-haspopup="true"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-400 dark:focus:bg-gray-700"
                                aria-label="Toggle navigation menu"
                                aria-expanded={showingNavigationDropdown}
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-600'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        {navLinks.map((link) => (
                            <ResponsiveNavLink
                                key={link.name}
                                href={route(link.route)}
                                active={route().current(
                                    link.match ?? link.route,
                                )}
                            >
                                {link.name}
                            </ResponsiveNavLink>
                        ))}
                        
                        {/* Klioso Scanner Menu */}
                        <div className="px-4 py-2">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">
                                Klioso Scanner
                            </div>
                            <div className="ml-4 space-y-1">
                                <ResponsiveNavLink
                                    href={route('scanner.index')}
                                    active={route().current('scanner.index')}
                                >
                                    Scanner
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('scanner.history')}
                                    active={route().current('scanner.history')}
                                >
                                    Scan History
                                </ResponsiveNavLink>
                                <ResponsiveNavLink
                                    href={route('scheduled-scans.index')}
                                    active={route().current('scheduled-scans.*')}
                                >
                                    Scheduled Scans
                                </ResponsiveNavLink>
                            </div>
                        </div>

                        {/* Email Testing Link (Development) */}
                        <ResponsiveNavLink
                            href={route('email-test.index')}
                            active={route().current('email-test.*')}
                            className="text-orange-600 dark:text-orange-400"
                        >
                            Email Test
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4 dark:border-gray-600">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow dark:bg-gray-800 dark:shadow-gray-700">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}