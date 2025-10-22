import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

export default function HealthScoreWidget({ websiteId = null, showTrends = false }) {
    const [healthData, setHealthData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHealthScore = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const endpoint = websiteId 
                ? `/api/health-score/website/${websiteId}`
                : '/api/health-score/dashboard';
                
            const response = await fetch(endpoint);
            const result = await response.json();
            
            if (result.success) {
                setHealthData(result.data);
            } else {
                setError(result.message || 'Failed to fetch health score');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Health score fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHealthScore();
    }, [websiteId]);

    const getHealthColor = (score) => {
        if (score >= 90) return 'text-green-600 dark:text-green-400';
        if (score >= 80) return 'text-blue-600 dark:text-blue-400';
        if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
        if (score >= 60) return 'text-orange-600 dark:text-orange-400';
        return 'text-red-600 dark:text-red-400';
    };

    const getHealthBadgeVariant = (score) => {
        if (score >= 90) return 'default';
        if (score >= 80) return 'secondary';
        if (score >= 70) return 'outline';
        return 'destructive';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Excellent':
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case 'Good':
                return <TrendingUp className="h-4 w-4 text-blue-600" />;
            case 'Fair':
                return <TrendingDown className="h-4 w-4 text-yellow-600" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-red-600" />;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Loading Health Score...
                    </CardTitle>
                </CardHeader>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="text-red-600">Health Score Error</CardTitle>
                    <CardDescription>{error}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button onClick={fetchHealthScore} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Retry
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!healthData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Health Data Available</CardTitle>
                    <CardDescription>Health score data is not available for this website.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    // Single website health score display
    if (websiteId && healthData.health_data) {
        const { health_data } = healthData;
        
        return (
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                {getStatusIcon(health_data.status)}
                                Health Score
                            </CardTitle>
                            <CardDescription>{healthData.website_name}</CardDescription>
                        </div>
                        <Button onClick={fetchHealthScore} variant="ghost" size="sm">
                            <RefreshCw className="h-4 w-4" />
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Overall Score */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className={`text-3xl font-bold ${getHealthColor(health_data.overall_score)}`}>
                                    {health_data.overall_score}
                                </div>
                                <Badge variant={getHealthBadgeVariant(health_data.overall_score)}>
                                    Grade {health_data.grade}
                                </Badge>
                            </div>
                            <Badge variant="outline">{health_data.status}</Badge>
                        </div>

                        {/* Component Breakdown */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Component Scores</h4>
                            {Object.entries(health_data.components).map(([component, data]) => (
                                <div key={component} className="flex items-center justify-between text-sm">
                                    <span className="capitalize">{component}</span>
                                    <span className={getHealthColor(data.score)}>{data.score}</span>
                                </div>
                            ))}
                        </div>

                        {/* Issues */}
                        {health_data.issues.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Issues ({health_data.issues.length})</h4>
                                <div className="space-y-1">
                                    {health_data.issues.slice(0, 3).map((issue, index) => (
                                        <div key={index} className="flex items-center gap-2 text-xs">
                                            <Badge variant="outline" className="text-xs">
                                                {issue.severity}
                                            </Badge>
                                            <span className="text-gray-600 dark:text-gray-400">
                                                {issue.issue}
                                            </span>
                                        </div>
                                    ))}
                                    {health_data.issues.length > 3 && (
                                        <div className="text-xs text-gray-500">
                                            +{health_data.issues.length - 3} more issues
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Recommendations */}
                        {health_data.recommendations.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Top Recommendations</h4>
                                <div className="space-y-1">
                                    {health_data.recommendations.slice(0, 2).map((rec, index) => (
                                        <div key={index} className="text-xs text-blue-600 dark:text-blue-400">
                                            • {rec}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Dashboard summary display
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>Health Score Overview</CardTitle>
                    <Button onClick={fetchHealthScore} variant="ghost" size="sm">
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Summary Stats */}
                    {healthData.summary && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center">
                                <div className={`text-2xl font-bold ${getHealthColor(healthData.summary.average_health_score)}`}>
                                    {healthData.summary.average_health_score}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Average Score</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                    {healthData.summary.healthy_websites}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">Healthy Sites</div>
                            </div>
                        </div>
                    )}

                    {/* Distribution */}
                    {healthData.distribution && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Distribution</h4>
                            <div className="grid grid-cols-4 gap-2 text-xs">
                                <div className="text-center p-2 rounded bg-green-50 dark:bg-green-900/20">
                                    <div className="font-bold text-green-600">{healthData.distribution.excellent}</div>
                                    <div className="text-green-700 dark:text-green-300">Excellent</div>
                                </div>
                                <div className="text-center p-2 rounded bg-blue-50 dark:bg-blue-900/20">
                                    <div className="font-bold text-blue-600">{healthData.distribution.good}</div>
                                    <div className="text-blue-700 dark:text-blue-300">Good</div>
                                </div>
                                <div className="text-center p-2 rounded bg-yellow-50 dark:bg-yellow-900/20">
                                    <div className="font-bold text-yellow-600">{healthData.distribution.fair}</div>
                                    <div className="text-yellow-700 dark:text-yellow-300">Fair</div>
                                </div>
                                <div className="text-center p-2 rounded bg-red-50 dark:bg-red-900/20">
                                    <div className="font-bold text-red-600">{healthData.distribution.poor}</div>
                                    <div className="text-red-700 dark:text-red-300">Poor</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Top Recommendations */}
                    {healthData.top_recommendations && healthData.top_recommendations.length > 0 && (
                        <div className="space-y-2">
                            <h4 className="text-sm font-medium">Top Recommendations</h4>
                            <div className="space-y-1">
                                {healthData.top_recommendations.slice(0, 3).map((rec, index) => (
                                    <div key={index} className="text-xs text-blue-600 dark:text-blue-400">
                                        • {rec}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}