import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    LineChart, 
    Line, 
    AreaChart, 
    Area,
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { 
    Activity, 
    Clock, 
    Zap, 
    TrendingUp, 
    TrendingDown,
    Globe,
    Search,
    Download,
    RefreshCw,
    AlertCircle
} from 'lucide-react';

export default function PerformanceAnalytics({ auth, performanceData, websites, timeRange: initialTimeRange }) {
    const [timeRange, setTimeRange] = useState(initialTimeRange || '7d');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedWebsite, setSelectedWebsite] = useState('all');

    const getPerformanceColor = (value, type) => {
        if (type === 'responseTime') {
            if (value <= 200) return 'text-green-600';
            if (value <= 500) return 'text-yellow-600';
            return 'text-red-600';
        }
        if (type === 'uptime') {
            if (value >= 99.9) return 'text-green-600';
            if (value >= 99.0) return 'text-yellow-600';
            return 'text-red-600';
        }
        return 'text-gray-600';
    };

    const getBadgeVariant = (value, type) => {
        if (type === 'responseTime') {
            if (value <= 200) return 'default';
            if (value <= 500) return 'secondary';
            return 'destructive';
        }
        if (type === 'uptime') {
            if (value >= 99.9) return 'default';
            if (value >= 99.0) return 'secondary';
            return 'destructive';
        }
        return 'outline';
    };

    const filteredWebsites = websites.filter(website => {
        const matchesSearch = website.domain_name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Performance Analytics
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
                        <Button variant="outline" size="sm">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Performance Analytics" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Performance Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.avgResponseTime, 'responseTime')}`}>
                                    {performanceData.avgResponseTime}ms
                                </div>
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

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Average Uptime</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getPerformanceColor(performanceData.avgUptime, 'uptime')}`}>
                                    {performanceData.avgUptime}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    <span className={performanceData.uptimeTrend > 0 ? "text-green-600" : "text-red-600"}>
                                        {performanceData.uptimeTrend > 0 ? 
                                            <TrendingUp className="h-3 w-3 mr-1 inline" /> : 
                                            <TrendingDown className="h-3 w-3 mr-1 inline" />
                                        }
                                        {Math.abs(performanceData.uptimeTrend)}%
                                    </span>
                                    from last period
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Performance Issues</CardTitle>
                                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{performanceData.activeIssues}</div>
                                <p className="text-xs text-muted-foreground">
                                    {performanceData.criticalIssues} critical issues
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Monitored Sites</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{performanceData.totalSites}</div>
                                <p className="text-xs text-muted-foreground">
                                    {performanceData.activeSites} actively monitored
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Trend Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Response Time Trends</CardTitle>
                            <CardDescription>Average response times over the selected period</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={400}>
                                <AreaChart data={performanceData.responseTimeChart}>
                                    <defs>
                                        <linearGradient id="colorResponseTime" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis />
                                    <Tooltip 
                                        formatter={(value) => [`${value}ms`, 'Response Time']}
                                        labelFormatter={(label) => `Time: ${label}`}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="responseTime" 
                                        stroke="#3b82f6" 
                                        fillOpacity={1} 
                                        fill="url(#colorResponseTime)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Uptime Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Uptime Monitoring</CardTitle>
                            <CardDescription>Website availability over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={performanceData.uptimeChart}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timestamp" />
                                    <YAxis domain={[95, 100]} />
                                    <Tooltip 
                                        formatter={(value) => [`${value}%`, 'Uptime']}
                                        labelFormatter={(label) => `Time: ${label}`}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="uptime" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Website Performance Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Website Performance Overview</CardTitle>
                            <CardDescription>Individual website performance metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search websites..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-3">Website</th>
                                            <th className="text-left p-3">Response Time</th>
                                            <th className="text-left p-3">Uptime</th>
                                            <th className="text-left p-3">SSL Status</th>
                                            <th className="text-left p-3">Last Check</th>
                                            <th className="text-left p-3">Status</th>
                                            <th className="text-left p-3">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredWebsites.map((website, index) => (
                                            <tr key={index} className="border-b hover:bg-gray-50">
                                                <td className="p-3">
                                                    <div>
                                                        <div className="font-medium">{website.domain_name}</div>
                                                        <div className="text-sm text-gray-500">{website.domain_name}</div>
                                                    </div>
                                                </td>
                                                <td className="p-3">
                                                    <span className={getPerformanceColor(website.responseTime, 'responseTime')}>
                                                        {website.responseTime}ms
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={getPerformanceColor(website.uptime, 'uptime')}>
                                                        {website.uptime}%
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={website.sslValid ? 'default' : 'destructive'}>
                                                        {website.sslValid ? 'Valid' : 'Invalid'}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-sm text-gray-500">
                                                    {website.lastCheck}
                                                </td>
                                                <td className="p-3">
                                                    <Badge variant={getBadgeVariant(website.status === 'online' ? 200 : 500, 'responseTime')}>
                                                        {website.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/analytics/website/${website.id}`}
                                                            className="text-blue-600 hover:underline text-sm"
                                                        >
                                                            View Details
                                                        </Link>
                                                        <Button variant="outline" size="sm">
                                                            <Zap className="h-3 w-3 mr-1" />
                                                            Test Now
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {filteredWebsites.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No websites found matching your criteria.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Performance Recommendations */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Recommendations</CardTitle>
                            <CardDescription>Suggestions to improve website performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {performanceData.recommendations.map((rec, index) => (
                                    <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
                                        <div className="flex-shrink-0">
                                            {rec.priority === 'high' ? (
                                                <AlertCircle className="h-5 w-5 text-red-500" />
                                            ) : rec.priority === 'medium' ? (
                                                <Clock className="h-5 w-5 text-yellow-500" />
                                            ) : (
                                                <Zap className="h-5 w-5 text-blue-500" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium">{rec.title}</h4>
                                            <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                                            <div className="flex items-center space-x-2 mt-2">
                                                <Badge variant={
                                                    rec.priority === 'high' ? 'destructive' : 
                                                    rec.priority === 'medium' ? 'secondary' : 'outline'
                                                }>
                                                    {rec.priority} priority
                                                </Badge>
                                                <span className="text-sm text-gray-500">Impact: {rec.impact}</span>
                                            </div>
                                        </div>
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
