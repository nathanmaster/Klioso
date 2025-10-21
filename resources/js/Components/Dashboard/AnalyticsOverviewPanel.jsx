import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { 
    TrendingUp, 
    TrendingDown, 
    Globe, 
    Shield, 
    Activity,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function AnalyticsOverviewPanel({ data = {}, config = {}, onConfigChange }) {
    const {
        stats = {},
        chartData = [],
        securityOverview = {},
        recentActivity = [],
        performanceMetrics = {}
    } = data;

    const chartType = config.chartType || 'bar';
    const showMetrics = config.showMetrics !== false;
    const showRecentActivity = config.showRecentActivity !== false;

    const handleConfigChange = (newConfig) => {
        if (onConfigChange) {
            onConfigChange({ ...config, ...newConfig });
        }
    };

    const renderChart = () => {
        if (!chartData || chartData.length === 0) {
            return (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                        <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No chart data available</p>
                    </div>
                </div>
            );
        }

        switch (chartType) {
            case 'line':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                                dataKey="name" 
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis 
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px'
                                }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="#0088FE" 
                                strokeWidth={2}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                );
            case 'pie':
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                );
            default:
                return (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                            <XAxis 
                                dataKey="name" 
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <YAxis 
                                className="text-xs"
                                tick={{ fill: 'currentColor' }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '6px'
                                }}
                            />
                            <Bar dataKey="value" fill="#0088FE" />
                        </BarChart>
                    </ResponsiveContainer>
                );
        }
    };

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="dark:text-gray-200 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Analytics Overview
                </CardTitle>
                <div className="flex gap-1">
                    <Button
                        variant={chartType === 'bar' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigChange({ chartType: 'bar' })}
                        className="text-xs"
                    >
                        Bar
                    </Button>
                    <Button
                        variant={chartType === 'line' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigChange({ chartType: 'line' })}
                        className="text-xs"
                    >
                        Line
                    </Button>
                    <Button
                        variant={chartType === 'pie' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleConfigChange({ chartType: 'pie' })}
                        className="text-xs"
                    >
                        Pie
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {/* Key Metrics */}
                {showMetrics && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mx-auto mb-2">
                                <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-2xl font-bold dark:text-gray-200">
                                {stats.total_websites || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Websites</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg mx-auto mb-2">
                                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {stats.healthy_websites || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Healthy</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg mx-auto mb-2">
                                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {stats.critical_issues || 0}
                            </div>
                            <div className="text-xs text-muted-foreground">Critical</div>
                        </div>
                        
                        <div className="text-center">
                            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg mx-auto mb-2">
                                <Shield className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-xl font-bold dark:text-gray-200">
                                {securityOverview.overall_score || 0}%
                            </div>
                            <div className="text-xs text-muted-foreground">Security</div>
                        </div>
                    </div>
                )}

                {/* Chart */}
                <div className="mb-6">
                    {renderChart()}
                </div>

                {/* Performance Metrics */}
                {performanceMetrics && Object.keys(performanceMetrics).length > 0 && (
                    <div className="mb-6">
                        <h4 className="font-semibold mb-3 dark:text-gray-200 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Performance Trends
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Avg Load Time</span>
                                    <span className="text-sm font-medium dark:text-gray-200">
                                        {performanceMetrics.avg_load_time || 'N/A'}
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Uptime</span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                        {performanceMetrics.uptime_percentage || 'N/A'}%
                                    </span>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Last Scan</span>
                                    <span className="text-sm font-medium dark:text-gray-200">
                                        {performanceMetrics.last_scan ? 
                                            new Date(performanceMetrics.last_scan).toLocaleDateString() : 
                                            'Never'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                {showRecentActivity && recentActivity && recentActivity.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-3 dark:text-gray-200 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Recent Activity
                        </h4>
                        <div className="space-y-3">
                            {recentActivity.slice(0, 5).map((activity, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                                    <div className="flex-shrink-0">
                                        {activity.type === 'scan' && <Activity className="h-4 w-4 text-blue-500" />}
                                        {activity.type === 'security' && <Shield className="h-4 w-4 text-red-500" />}
                                        {activity.type === 'website' && <Globe className="h-4 w-4 text-green-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium dark:text-gray-200 truncate">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {activity.timestamp ? 
                                                new Date(activity.timestamp).toLocaleString() : 
                                                'Unknown time'
                                            }
                                        </p>
                                    </div>
                                    {activity.website_id && (
                                        <Link 
                                            href={`/websites/${activity.website_id}`}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            View
                                        </Link>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6 pt-4 border-t dark:border-gray-700">
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/analytics">
                                View Full Analytics
                            </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/analytics/security">
                                Security Report
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
