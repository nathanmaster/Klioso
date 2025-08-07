import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Link } from '@inertiajs/react';
import { 
    MagnifyingGlass, 
    Clock, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Eye,
    RefreshCw,
    Calendar
} from 'lucide-react';

export default function RecentScansPanel({ data = {}, config = {}, onConfigChange }) {
    const { recentScans = [], scanStats = {} } = data;
    const [refreshing, setRefreshing] = useState(false);

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'failed':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'running':
                return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
            default:
                return <Clock className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'default';
            case 'failed':
                return 'destructive';
            case 'running':
                return 'secondary';
            default:
                return 'outline';
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical':
                return 'text-red-600';
            case 'high':
                return 'text-orange-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        if (seconds < 60) return `${Math.round(seconds)}s`;
        if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
        return `${Math.round(seconds / 3600)}h`;
    };

    return (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="dark:text-gray-200 flex items-center gap-2">
                    <MagnifyingGlass className="h-5 w-5" />
                    Recent Scans
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/scanner/history">
                        View All
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {/* Scan Statistics */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {scanStats.completed_today || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Completed Today</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {scanStats.running || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Running</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {scanStats.failed_today || 0}
                        </div>
                        <div className="text-xs text-muted-foreground">Failed Today</div>
                    </div>
                </div>

                {/* Recent Scans List */}
                <div className="space-y-3">
                    {recentScans.length === 0 ? (
                        <div className="text-center py-8">
                            <MagnifyingGlass className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                            <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                                No Recent Scans
                            </h3>
                            <p className="text-muted-foreground mb-4">
                                No scans have been performed recently.
                            </p>
                            <Button size="sm" asChild>
                                <Link href="/scanner">
                                    Start Scanning
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        recentScans.map((scan) => (
                            <div key={scan.id} className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(scan.status)}
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-medium text-sm dark:text-gray-200 truncate">
                                            {scan.website?.name || scan.domain_name || 'Unknown Website'}
                                        </h4>
                                        <Badge variant={getStatusBadgeVariant(scan.status)} className="text-xs">
                                            {scan.status || 'Unknown'}
                                        </Badge>
                                    </div>
                                    
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {scan.created_at ? 
                                                new Date(scan.created_at).toLocaleString() : 
                                                'Unknown time'
                                            }
                                        </span>
                                        
                                        {scan.duration_seconds && (
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDuration(scan.duration_seconds)}
                                            </span>
                                        )}
                                        
                                        {scan.issues_found !== undefined && (
                                            <span className={`flex items-center gap-1 ${
                                                scan.issues_found > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                                            }`}>
                                                <AlertTriangle className="h-3 w-3" />
                                                {scan.issues_found} issues
                                            </span>
                                        )}
                                    </div>
                                    
                                    {scan.error_message && (
                                        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                                            Error: {scan.error_message}
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-shrink-0">
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href={scan.website_id ? `/websites/${scan.website_id}` : `/scanner/history/${scan.id}`}>
                                            <Eye className="h-4 w-4" />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Quick Actions */}
                {recentScans.length > 0 && (
                    <div className="mt-6 pt-4 border-t dark:border-gray-700">
                        <div className="flex gap-2 justify-between">
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/scanner">
                                        New Scan
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/scheduled-scans">
                                        Schedule Scan
                                    </Link>
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/scanner/history">
                                    View History
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
