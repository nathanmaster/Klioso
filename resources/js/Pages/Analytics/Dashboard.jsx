import { useState } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
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

export default function AnalyticsDashboard({ auth, analytics, securityOverview, performanceData, recentAlerts }) {
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
        if (score >= 90) return 'text-green-600';
        if (score >= 70) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getHealthBadgeVariant = (score) => {
        if (score >= 90) return 'default';
        if (score >= 70) return 'secondary';
        return 'destructive';
    };

    // Chart colors
    const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
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
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{analytics.totalWebsites}</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className="text-green-600 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        +{analytics.websitesGrowth}%
                                    </span>
                                    from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Health Score</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getHealthColor(analytics.avgHealthScore)}`}>
                                    {analytics.avgHealthScore}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={analytics.healthTrend > 0 ? "text-green-600" : "text-red-600"}>
                                        {analytics.healthTrend > 0 ? 
                                            <TrendingUp className="h-3 w-3 mr-1 inline" /> : 
                                            <TrendingDown className="h-3 w-3 mr-1 inline" />
                                        }
                                        {Math.abs(analytics.healthTrend)}%
                                    </span>
                                    from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{securityOverview.activeAlerts}</div>
                                <p className="text-xs text-muted-foreground">
                                    {securityOverview.criticalAlerts} critical, {securityOverview.warningAlerts} warnings
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{performanceData.avgResponseTime}ms</div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={performanceData.responseTimeTrend < 0 ? "text-green-600" : "text-red-600"}>
                                        {performanceData.responseTimeTrend < 0 ? 
                                            <TrendingDown className="h-3 w-3 mr-1 inline" /> : 
                                            <TrendingUp className="h-3 w-3 mr-1 inline" />
                                        }
                                        {Math.abs(performanceData.responseTimeTrend)}%
                                    </span>
                                    from last period
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Health Score Trend */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Health Score Trend</CardTitle>
                                <CardDescription>Website health scores over time</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={analytics.healthTrendData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="avgHealth" stroke="#10b981" strokeWidth={2} />
                                        <Line type="monotone" dataKey="avgSecurity" stroke="#3b82f6" strokeWidth={2} />
                                        <Line type="monotone" dataKey="avgPerformance" stroke="#f59e0b" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Security Distribution */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Security Status Distribution</CardTitle>
                                <CardDescription>Current security status across all websites</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={securityOverview.statusDistribution}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {securityOverview.statusDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                            <CardDescription>Response time and uptime trends</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <BarChart data={performanceData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" />
                                    <YAxis yAxisId="right" orientation="right" />
                                    <Tooltip />
                                    <Legend />
                                    <Bar yAxisId="left" dataKey="responseTime" fill="#3b82f6" name="Response Time (ms)" />
                                    <Bar yAxisId="right" dataKey="uptime" fill="#10b981" name="Uptime %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Security Alerts</CardTitle>
                            <CardDescription>Latest security issues requiring attention</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentAlerts.map((alert, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            {alert.severity === 'critical' ? (
                                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                            ) : alert.severity === 'warning' ? (
                                                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 text-green-500" />
                                            )}
                                            <div>
                                                <h4 className="font-medium">{alert.title}</h4>
                                                <p className="text-sm text-gray-600">{alert.website} • {alert.timeAgo}</p>
                                            </div>
                                        </div>
                                        <Badge variant={
                                            alert.severity === 'critical' ? 'destructive' : 
                                            alert.severity === 'warning' ? 'secondary' : 'default'
                                        }>
                                            {alert.severity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
