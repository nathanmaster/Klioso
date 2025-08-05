import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Shield, TrendingUp, Globe, Activity, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Klioso Dashboard
                    </h2>
                    <Link href="/analytics">
                        <Button aria-label="View Analytics Dashboard">
                            <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
                            View Analytics
                        </Button>
                    </Link>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Section */}
                    <div className="mb-8">
                        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 text-white border-0">
                            <CardHeader>
                                <CardTitle className="text-2xl text-white">Welcome to Klioso</CardTitle>
                                <CardDescription className="text-blue-100 dark:text-blue-200">
                                    Your WordPress management and analytics platform
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        <Link href="/analytics" aria-label="Go to Analytics Dashboard">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:shadow-gray-300 dark:hover:shadow-gray-700">
                                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                    <BarChart3 className="h-8 w-8 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                                    <div className="ml-4">
                                        <CardTitle className="text-lg">Analytics Dashboard</CardTitle>
                                        <CardDescription>View performance metrics and insights</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/websites" aria-label="Go to Website Management">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:shadow-gray-300 dark:hover:shadow-gray-700">
                                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                    <Globe className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
                                    <div className="ml-4">
                                        <CardTitle className="text-lg">Manage Websites</CardTitle>
                                        <CardDescription>Add and monitor your WordPress sites</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>

                        <Link href="/analytics/security" aria-label="Go to Security Monitor">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer hover:shadow-gray-300 dark:hover:shadow-gray-700">
                                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                                    <Shield className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
                                    <div className="ml-4">
                                        <CardTitle className="text-lg">Security Monitor</CardTitle>
                                        <CardDescription>Track security status and alerts</CardDescription>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Websites</CardTitle>
                                <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Add your first website to get started
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Scans</CardTitle>
                                <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    No active scans running
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Health Score</CardTitle>
                                <TrendingUp className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">--</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    Add websites to see health metrics
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Clients</CardTitle>
                                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">0</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    No clients added yet
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
        </AuthenticatedLayout>
    );
}
