import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Shield, TrendingUp, Globe, Activity, Users, AlertTriangle, Clock, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';

export default function Dashboard({ stats = {}, recentScans = [], healthOverview = {} }) {
    const getHealthScoreColor = (score) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 80) return 'text-blue-600 dark:text-blue-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 60) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getHealthScoreBadge = (score) => {
        if (score >= 90) return 'default';
        if (score >= 80) return 'secondary';
        if (score >= 70) return 'outline';
        return 'destructive';
    };

    const getHealthGrade = (score) => {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

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

                    {/* Enhanced Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Overall Health Score */}
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Health Score</CardTitle>
                                <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className={`text-3xl font-bold ${getHealthScoreColor(stats.averageHealthScore || 0)}`}>
                                        {stats.averageHealthScore || 0}
                                    </div>
                                    <Badge variant={getHealthScoreBadge(stats.averageHealthScore || 0)}>
                                        Grade {getHealthGrade(stats.averageHealthScore || 0)}
                                    </Badge>
                                </div>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    {stats.healthyWebsites || 0} healthy • {stats.criticalWebsites || 0} critical
                                </p>
                            </CardContent>
                        </Card>

                        {/* Security Dashboard */}
                        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Security Issues</CardTitle>
                                <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                                        {stats.criticalSecurityIssues || 0}
                                    </div>
                                    {stats.criticalSecurityIssues > 0 && (
                                        <Badge variant="destructive">Critical</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                    {stats.totalSecurityIssues || 0} total issues • 
                                    <Link href="/analytics/security" className="underline ml-1">Review</Link>
                                </p>
                            </CardContent>
                        </Card>

                        {/* Performance Metrics */}
                        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Avg Load Time</CardTitle>
                                <Zap className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className={`text-3xl font-bold ${stats.avgLoadTime > 3 ? 'text-red-600 dark:text-red-400' : stats.avgLoadTime > 2 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                        {stats.avgLoadTime || 0}s
                                    </div>
                                    {stats.avgLoadTime > 3 && (
                                        <Badge variant="destructive">Slow</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    {stats.totalWebsites || 0} websites monitored
                                </p>
                            </CardContent>
                        </Card>

                        {/* Maintenance Alerts */}
                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-orange-800 dark:text-orange-200">Updates Needed</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center space-x-2">
                                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                                        {stats.outdatedWebsites || 0}
                                    </div>
                                    {stats.outdatedWebsites > 0 && (
                                        <Badge variant="outline">Sites</Badge>
                                    )}
                                </div>
                                <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                    {stats.pluginUpdatesNeeded || 0} plugin updates needed
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Health Score Distribution */}
                    {healthOverview.distribution && (
                        <div className="mb-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Website Health Distribution</CardTitle>
                                    <CardDescription>
                                        Overview of your website health scores
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-4 gap-4">
                                        <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                                {healthOverview.distribution.excellent || 0}
                                            </div>
                                            <div className="text-sm text-green-700 dark:text-green-300">Excellent (90-100)</div>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                                {healthOverview.distribution.good || 0}
                                            </div>
                                            <div className="text-sm text-blue-700 dark:text-blue-300">Good (80-89)</div>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                                {healthOverview.distribution.fair || 0}
                                            </div>
                                            <div className="text-sm text-yellow-700 dark:text-yellow-300">Fair (60-79)</div>
                                        </div>
                                        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                                {healthOverview.distribution.poor || 0}
                                            </div>
                                            <div className="text-sm text-red-700 dark:text-red-300">Poor (0-59)</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Legacy Quick Stats for Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Websites</CardTitle>
                                <Globe className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalWebsites || 0}</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {stats.totalWebsites > 0 ? `${stats.healthyWebsites || 0} healthy websites` : 'Add your first website to get started'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Scans</CardTitle>
                                <Activity className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalScans || 0}</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {stats.totalScans > 0 ? `${recentScans.length} recent scans` : 'No scans performed yet'}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Security Score</CardTitle>
                                <Shield className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${stats.criticalSecurityIssues > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                    {stats.criticalSecurityIssues === 0 ? 'Good' : 'Issues'}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {stats.criticalSecurityIssues === 0 ? 'No critical security issues' : `${stats.criticalSecurityIssues} critical issues found`}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">Clients</CardTitle>
                                <Users className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalClients || 0}</div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {stats.totalClients > 0 ? `Managing ${stats.totalClients} clients` : 'No clients added yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            
        </AuthenticatedLayout>
    );
}
