import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { 
    Shield, 
    ShieldAlert, 
    ShieldCheck, 
    AlertTriangle, 
    Eye,
    ExternalLink
} from 'lucide-react';
import { router } from '@inertiajs/react';

export default function SecurityAlertsPanel({ data = {}, config = {}, onConfigChange }) {
    const { alerts = [], totalCritical = 0, totalHigh = 0 } = data;
    const { showCount = 5, showOnlyCritical = false } = config;

    const displayedAlerts = showOnlyCritical 
        ? alerts.filter(alert => alert.severity === 'critical').slice(0, showCount)
        : alerts.slice(0, showCount);

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

    const handleViewAll = () => {
        router.visit('/analytics/security');
    };

    return (
        <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div>
                    <CardTitle className="text-lg font-semibold dark:text-gray-200 flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-red-500" />
                        Security Alerts
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">
                        {totalCritical} critical, {totalHigh} high priority
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
                {displayedAlerts.length > 0 ? (
                    displayedAlerts.map((alert) => (
                        <div key={alert.id} className="flex items-start justify-between p-3 rounded-lg border dark:border-gray-600 dark:bg-gray-750 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-sm dark:text-gray-200 truncate">
                                        {alert.title}
                                    </h4>
                                    <span className={getSeverityBadge(alert.severity)}>
                                        {alert.severity}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                                    {alert.website}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {alert.detected_at}
                                </p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm"
                                className="ml-2 p-1 h-6 w-6"
                                onClick={() => router.visit(`/security-audits/${alert.id}`)}
                            >
                                <ExternalLink className="h-3 w-3" />
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-6 text-muted-foreground">
                        <ShieldCheck className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <p className="text-sm">No active security alerts</p>
                    </div>
                )}
                
                {alerts.length > showCount && (
                    <div className="pt-2 border-t dark:border-gray-600">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full" 
                            onClick={handleViewAll}
                        >
                            View {alerts.length - showCount} more alerts
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
