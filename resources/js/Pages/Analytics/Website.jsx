import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
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
    Shield, 
    TrendingUp, 
    TrendingDown,
    Globe,
    Download,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    ExternalLink,
    Zap
} from 'lucide-react';

export default function WebsiteAnalytics({ auth, website, analytics, timeRange: initialTimeRange }) {
    const [timeRange, setTimeRange] = useState(initialTimeRange || '7d');

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

    const handleRunScan = () => {
        // Trigger a new scan for this website
        window.location.href = `/websites/${website.id}/scan`;
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            Website Analytics: {website.domain_name}
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            <a 
                                href={`https://${website.domain_name}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline inline-flex items-center"
                            >
                                {website.domain_name}
                                <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                        </p>
                    </div>
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
                        <Button size="sm" onClick={handleRunScan}>
                            <Zap className="h-4 w-4 mr-2" />
                            Run Scan
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title={`Analytics - ${website.domain_name}`} />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Health Score</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getHealthColor(analytics.healthScore)}`}>
                                    {analytics.healthScore}%
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
                                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getHealthColor(analytics.securityScore)}`}>
                                    {analytics.securityScore}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {analytics.vulnerabilities} active vulnerabilities
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getHealthColor(analytics.performanceScore)}`}>
                                    {analytics.performanceScore}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {analytics.avgResponseTime}ms avg response time
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${getHealthColor(analytics.uptime)}`}>
                                    {analytics.uptime}%
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Last checked: {analytics.lastChecked}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Analytics Tabs */}
                    <Card>
                        <CardContent className="p-0">
                            <Tabs defaultValue="performance" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="performance">Performance</TabsTrigger>
                                    <TabsTrigger value="security">Security</TabsTrigger>
                                    <TabsTrigger value="uptime">Uptime</TabsTrigger>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                </TabsList>

                                <TabsContent value="performance" className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Response Time Trends</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <LineChart data={analytics.performanceChart}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="timestamp" />
                                                    <YAxis />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value}ms`, 'Response Time']}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Line 
                                                        type="monotone" 
                                                        dataKey="responseTime" 
                                                        stroke="#3b82f6" 
                                                        strokeWidth={2}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Average Response Time</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold">{analytics.avgResponseTime}ms</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Fastest Response</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold text-green-600">{analytics.fastestResponse}ms</div>
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle className="text-sm">Slowest Response</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="text-2xl font-bold text-red-600">{analytics.slowestResponse}ms</div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="security" className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Security Overview</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-sm">SSL Certificate</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="flex items-center space-x-2">
                                                            {analytics.sslValid ? (
                                                                <>
                                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                                    <span className="text-green-600">Valid</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <AlertCircle className="h-5 w-5 text-red-600" />
                                                                    <span className="text-red-600">Invalid</span>
                                                                </>
                                                            )}
                                                        </div>
                                                        {analytics.sslExpiry && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                Expires: {analytics.sslExpiry}
                                                            </p>
                                                        )}
                                                    </CardContent>
                                                </Card>

                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle className="text-sm">WordPress Version</CardTitle>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="text-lg font-medium">{analytics.wpVersion || 'Unknown'}</div>
                                                        {analytics.wpVersion && (
                                                            <Badge variant={analytics.wpUpToDate ? 'default' : 'destructive'}>
                                                                {analytics.wpUpToDate ? 'Up to date' : 'Update available'}
                                                            </Badge>
                                                        )}
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>

                                        {analytics.securityIssues && analytics.securityIssues.length > 0 && (
                                            <div>
                                                <h4 className="text-md font-medium mb-3">Active Security Issues</h4>
                                                <div className="space-y-3">
                                                    {analytics.securityIssues.map((issue, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex items-center space-x-3">
                                                                <AlertCircle className={`h-5 w-5 ${
                                                                    issue.severity === 'critical' ? 'text-red-500' :
                                                                    issue.severity === 'high' ? 'text-orange-500' :
                                                                    issue.severity === 'medium' ? 'text-yellow-500' :
                                                                    'text-blue-500'
                                                                }`} />
                                                                <div>
                                                                    <h5 className="font-medium">{issue.title}</h5>
                                                                    <p className="text-sm text-gray-600">{issue.description}</p>
                                                                </div>
                                                            </div>
                                                            <Badge variant={
                                                                issue.severity === 'critical' ? 'destructive' :
                                                                issue.severity === 'high' ? 'destructive' :
                                                                issue.severity === 'medium' ? 'secondary' : 'outline'
                                                            }>
                                                                {issue.severity}
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="uptime" className="p-6">
                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="text-lg font-medium mb-4">Uptime History</h3>
                                            <ResponsiveContainer width="100%" height={300}>
                                                <AreaChart data={analytics.uptimeChart}>
                                                    <defs>
                                                        <linearGradient id="colorUptime" x1="0" y1="0" x2="0" y2="1">
                                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                                                        </linearGradient>
                                                    </defs>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="timestamp" />
                                                    <YAxis domain={[95, 100]} />
                                                    <Tooltip 
                                                        formatter={(value) => [`${value}%`, 'Uptime']}
                                                        labelFormatter={(label) => `Time: ${label}`}
                                                    />
                                                    <Area 
                                                        type="monotone" 
                                                        dataKey="uptime" 
                                                        stroke="#10b981" 
                                                        fillOpacity={1} 
                                                        fill="url(#colorUptime)" 
                                                    />
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {analytics.downtimeEvents && analytics.downtimeEvents.length > 0 && (
                                            <div>
                                                <h4 className="text-md font-medium mb-3">Recent Downtime Events</h4>
                                                <div className="space-y-3">
                                                    {analytics.downtimeEvents.map((event, index) => (
                                                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div>
                                                                <h5 className="font-medium">{event.title}</h5>
                                                                <p className="text-sm text-gray-600">
                                                                    {event.startTime} - {event.endTime} ({event.duration})
                                                                </p>
                                                            </div>
                                                            <Badge variant="destructive">
                                                                Downtime
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="details" className="p-6">
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Website Information</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">URL</label>
                                                        <p>{website.domain_name}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Client</label>
                                                        <p>{website.client?.name || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Created</label>
                                                        <p>{website.created_at}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Last Scan</label>
                                                        <p>{analytics.lastScan || 'Never'}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Technical Details</CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-3">
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Server</label>
                                                        <p>{analytics.serverInfo || 'Unknown'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">IP Address</label>
                                                        <p>{analytics.ipAddress || 'Unknown'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Location</label>
                                                        <p>{analytics.serverLocation || 'Unknown'}</p>
                                                    </div>
                                                    <div>
                                                        <label className="text-sm font-medium text-gray-600">Content Type</label>
                                                        <p>{analytics.contentType || 'Unknown'}</p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>

                                        {analytics.plugins && analytics.plugins.length > 0 && (
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Detected Plugins</CardTitle>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {analytics.plugins.map((plugin, index) => (
                                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                                <div>
                                                                    <h5 className="font-medium">{plugin.name}</h5>
                                                                    <p className="text-sm text-gray-600">v{plugin.version}</p>
                                                                </div>
                                                                <Badge variant={plugin.upToDate ? 'default' : 'secondary'}>
                                                                    {plugin.upToDate ? 'Updated' : 'Update Available'}
                                                                </Badge>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
