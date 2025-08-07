import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { 
    Globe, 
    CheckCircle, 
    XCircle, 
    AlertTriangle,
    Eye,
    ExternalLink
} from 'lucide-react';
import { router } from '@inertiajs/react';

export default function WebsiteStatusPanel({ data = {}, config = {}, onConfigChange }) {
    const { websites = [], totalOnline = 0, totalOffline = 0 } = data;
    const { showCount = 5, statusFilter = 'all' } = config;

    const getStatusIcon = (status) => {
        switch (status) {
            case 'online':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'offline':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            case 'critical':
                return <XCircle className="h-4 w-4 text-red-600" />;
            default:
                return <AlertTriangle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'online':
                return 'default';
            case 'offline':
                return 'destructive';
            case 'warning':
                return 'secondary';
            case 'critical':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const getHealthColor = (score) => {
        if (score >= 8) return 'text-green-600 dark:text-green-400';
        if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    };

    const filteredWebsites = statusFilter === 'all' 
        ? websites.slice(0, showCount)
        : websites.filter(site => site.status === statusFilter).slice(0, showCount);

    const handleViewAll = () => {
        router.visit('/websites');
    };

    return (
        <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-lg font-semibold dark:text-gray-200 flex items-center gap-2">
                        <Globe className="h-5 w-5 text-blue-500" />
                        Website Status
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {totalOnline} online, {totalOffline} offline
                    </CardDescription>
                </div>
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleViewAll}
                    className="dark:text-gray-200 dark:hover:text-gray-100"
                >
                    <Eye className="h-4 w-4 mr-1" />
                    View All
                </Button>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Status Summary */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <div>
                            <div className="text-sm font-medium text-green-700 dark:text-green-400">
                                {totalOnline}
                            </div>
                            <div className="text-xs text-green-600 dark:text-green-500">
                                Online
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <div>
                            <div className="text-sm font-medium text-red-700 dark:text-red-400">
                                {totalOffline}
                            </div>
                            <div className="text-xs text-red-600 dark:text-red-500">
                                Issues
                            </div>
                        </div>
                    </div>
                </div>

                {/* Website List */}
                <div className="space-y-2">
                    {filteredWebsites.length > 0 ? (
                        filteredWebsites.map((website) => (
                            <div key={website.id} className="flex items-center justify-between p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    {getStatusIcon(website.status)}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium text-sm dark:text-gray-200 truncate">
                                                {website.name}
                                            </h4>
                                            <Badge variant={getStatusBadge(website.status)} className="text-xs">
                                                {website.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs text-muted-foreground">
                                                Health: <span className={getHealthColor(website.health_score)}>
                                                    {website.health_score}/10
                                                </span>
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                Uptime: {website.uptime}%
                                            </span>
                                            {website.critical_issues > 0 && (
                                                <span className="text-xs text-red-600 dark:text-red-400">
                                                    {website.critical_issues} alerts
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="ml-2 p-1 h-6 w-6"
                                    onClick={() => router.visit(`/websites/${website.id}`)}
                                >
                                    <ExternalLink className="h-3 w-3" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-muted-foreground">
                            <Globe className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm">No websites to display</p>
                        </div>
                    )}
                </div>

                {websites.length > showCount && (
                    <div className="pt-2 border-t dark:border-gray-600">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            onClick={handleViewAll}
                        >
                            View {websites.length - showCount} more websites
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
