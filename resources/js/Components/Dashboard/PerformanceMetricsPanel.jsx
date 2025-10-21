import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
    Activity, 
    Clock, 
    TrendingUp, 
    TrendingDown,
    Eye
} from 'lucide-react';
import { router } from '@inertiajs/react';

export default function PerformanceMetricsPanel({ data = {}, config = {}, onConfigChange }) {
    const { 
        avgResponseTime = 0, 
        avgUptime = 0, 
        avgHealthScore = 0, 
        trends = [] 
    } = data;
    
    const { showTrends = true, metric = 'responseTime' } = config;

    const getHealthColor = (score) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const handleViewDetails = () => {
        router.visit('/analytics/performance');
    };

    return (
        <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-lg font-semibold dark:text-gray-200 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-blue-500" />
                        Performance Metrics
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        Website performance overview
                    </CardDescription>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewDetails}
                    className="dark:text-gray-200 dark:hover:text-gray-100"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    Details
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-750">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-xs font-medium text-muted-foreground">Response</span>
                        </div>
                        <div className="text-lg font-bold dark:text-white">
                            {avgResponseTime}s
                        </div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-750">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-xs font-medium text-muted-foreground">Uptime</span>
                        </div>
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                            {avgUptime}%
                        </div>
                    </div>
                    
                    <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-gray-750">
                        <div className="flex items-center justify-center gap-1 mb-1">
                            <Activity className="h-4 w-4 text-yellow-500" />
                            <span className="text-xs font-medium text-muted-foreground">Health</span>
                        </div>
                        <div className={`text-lg font-bold ${getHealthColor(avgHealthScore)}`}>
                            {avgHealthScore}/10
                        </div>
                    </div>
                </div>

                {/* Trend Chart */}
                {showTrends && trends.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium dark:text-gray-200 mb-2">7-Day Trend</h4>
                        <ResponsiveContainer width="100%" height={120}>
                            <LineChart data={trends}>
                                <CartesianGrid strokeDasharray="3 3" className="dark:stroke-gray-600" />
                                <XAxis 
                                    dataKey="date" 
                                    className="dark:fill-gray-400"
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis hide />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'rgb(31 41 55)',
                                        border: '1px solid rgb(75 85 99)',
                                        borderRadius: '6px',
                                        color: 'rgb(229 231 235)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey={metric} 
                                    stroke="#3b82f6" 
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Quick Stats */}
                <div className="pt-2 border-t dark:border-gray-600">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Last updated: {new Date().toLocaleTimeString()}</span>
                        <div className="flex items-center gap-1">
                            {avgHealthScore > 8 ? (
                                <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span>
                                {avgHealthScore > 8 ? 'Improving' : 'Needs attention'}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
