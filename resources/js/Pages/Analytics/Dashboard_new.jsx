import { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    Shield, 
    Activity, 
    Globe, 
    AlertTriangle, 
    CheckCircle, 
    Clock,
    Download,
    RefreshCw
} from 'lucide-react';

export default function AnalyticsDashboard({ 
    auth, 
    analytics = {}, 
    securityOverview = {}, 
    performanceData = {}, 
    recentAlerts = [] 
}) {
    const [timeRange, setTimeRange] = useState('7d');
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        // Simulate refresh
        setTimeout(() => setRefreshing(false), 2000);
    };

    const handleExport = () => {
        router.visit(`/analytics/export?period=${timeRange}`, { preserveState: true });
    };

    // Health score color mapping
    const getHealthColor = (score) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getHealthBadgeVariant = (score) => {
        if (score >= 90) return 'default';
        if (score >= 70) return 'secondary';
        return 'destructive';
    };

    // Severity badge styling for alerts
    const getSeverityBadge = (severity) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        switch (severity) {
            case 'critical':
                return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400`;
            case 'high':
                return `${baseClasses} bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400`;
            case 'medium':
                return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400`;
            case 'low':
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400`;
        }
    };

    // Chart colors
    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Analytics Dashboard
                    </h2>
                    <div className="flex space-x-2">
                        <Select value={timeRange} onValueChange={setTimeRange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="24h">24 Hours</SelectItem>
                                <SelectItem value="7d">7 Days</SelectItem>
                                <SelectItem value="30d">30 Days</SelectItem>
                                <SelectItem value="90d">90 Days</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleExport}>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Analytics Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">Total Websites</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-white">{analytics.totalWebsites || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={`flex items-center ${analytics.websitesGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {analytics.websitesGrowth >= 0 ? 
                                            <TrendingUp className="h-3 w-3 mr-1" /> : 
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                        }
                                        {Math.abs(analytics.websitesGrowth || 0)}%
                                    </span>
                                    from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">Total Scans</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-white">{analytics.totalScans || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={`flex items-center ${analytics.scansGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {analytics.scansGrowth >= 0 ? 
                                            <TrendingUp className="h-3 w-3 mr-1" /> : 
                                            <TrendingDown className="h-3 w-3 mr-1" />
                                        }
                                        {Math.abs(analytics.scansGrowth || 0)}%
                                    </span>
                                    from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">Security Alerts</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{securityOverview.activeAlerts || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {securityOverview.totalVulnerabilities || 0} total, {securityOverview.resolvedIssues || 0} resolved
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">Avg Response Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-white">{performanceData.avgResponseTime || 0}s</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600 dark:text-green-400 flex items-center">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {performanceData.uptimePercentage || 0}% uptime
                                    </span>
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Trends */}
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="dark:text-gray-200">Performance Trends</CardTitle>
                                <CardDescription className="dark:text-gray-400">Response time and health metrics over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={performanceData.trends || []}>
                                        <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                                        <XAxis 
                                            dataKey="date" 
                                            className="dark:fill-gray-400"
                                        />
                                        <YAxis className="dark:fill-gray-400" />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'rgb(31 41 55)',
                                                border: '1px solid rgb(75 85 99)',
                                                borderRadius: '6px',
                                                color: 'rgb(229 231 235)'
                                            }}
                                        />
                                        <Legend />
                                        <Line 
                                            type="monotone" 
                                            dataKey="responseTime" 
                                            stroke="#10b981" 
                                            strokeWidth={2}
                                            name="Response Time (s)"
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="healthScore" 
                                            stroke="#3b82f6" 
                                            strokeWidth={2}
                                            name="Health Score"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Security Trends */}
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="dark:text-gray-200">Security Trends</CardTitle>
                                <CardDescription className="dark:text-gray-400">Security alerts and resolutions over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={securityOverview.trends || []}>
                                        <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                                        <XAxis 
                                            dataKey="date" 
                                            className="dark:fill-gray-400"
                                        />
                                        <YAxis className="dark:fill-gray-400" />
                                        <Tooltip 
                                            contentStyle={{
                                                backgroundColor: 'rgb(31 41 55)',
                                                border: '1px solid rgb(75 85 99)',
                                                borderRadius: '6px',
                                                color: 'rgb(229 231 235)'
                                            }}
                                        />
                                        <Legend />
                                        <Bar dataKey="alerts" fill="#ef4444" name="New Alerts" />
                                        <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Security Alerts */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-200">Recent Security Alerts</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Latest security issues requiring attention
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentAlerts.length > 0 ? (
                                    recentAlerts.map((alert) => (
                                        <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg dark:border-gray-600 dark:bg-gray-750">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-medium dark:text-gray-200">{alert.title}</h4>
                                                    <span className={getSeverityBadge(alert.severity)}>
                                                        {alert.severity}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    {alert.description}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                                    <span>Website: {alert.website}</span>
                                                    <span>{alert.time}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge 
                                                    variant={alert.status === 'open' ? 'destructive' : 'secondary'}
                                                    className="dark:text-gray-200"
                                                >
                                                    {alert.status}
                                                </Badge>
                                                <AlertTriangle className="h-4 w-4 text-red-500" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                                        <p>No active security alerts</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
