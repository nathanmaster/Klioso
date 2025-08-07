import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { 
    Plus, 
    Settings, 
    RefreshCw, 
    Grid3X3, 
    LayoutDashboard,
    Trash2
} from 'lucide-react';

// Import dashboard panels
import SecurityAlertsPanel from '@/Components/Dashboard/SecurityAlertsPanel';
import PerformanceMetricsPanel from '@/Components/Dashboard/PerformanceMetricsPanel';
import WebsiteStatusPanel from '@/Components/Dashboard/WebsiteStatusPanel';
import AnalyticsOverviewPanel from '@/Components/Dashboard/AnalyticsOverviewPanel';
import RecentScansPanel from '@/Components/Dashboard/RecentScansPanel';

// Panel component mapping
const PANEL_COMPONENTS = {
    SecurityAlertsPanel,
    PerformanceMetricsPanel,
    WebsiteStatusPanel,
    AnalyticsOverviewPanel,
    RecentScansPanel,
};

export default function CustomizableDashboard({ 
    auth, 
    panels = [], 
    panelData = {}, 
    availableTypes = {},
    layout = 'main' 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [draggedPanel, setDraggedPanel] = useState(null);

    const handleRefresh = async () => {
        setRefreshing(true);
        router.reload({
            onFinish: () => setRefreshing(false)
        });
    };

    const handleAddPanel = (type) => {
        const availableType = availableTypes[type];
        if (!availableType) return;

        router.post('/dashboard/panels', {
            title: availableType.name,
            type: type,
            position: { x: 0, y: 0 },
            size: availableType.size,
            dashboard_layout: layout,
        }, {
            preserveState: true,
            onSuccess: () => {
                // Panel added successfully
            }
        });
    };

    const handleRemovePanel = (panelId) => {
        if (confirm('Are you sure you want to remove this panel?')) {
            router.delete(`/dashboard/panels/${panelId}`, {
                preserveState: true
            });
        }
    };

    const handleResetLayout = () => {
        if (confirm('Reset dashboard to default layout? This will remove all custom panels.')) {
            router.post('/dashboard/reset', { layout }, {
                preserveState: true
            });
        }
    };

    const renderPanel = (panel) => {
        const PanelComponent = PANEL_COMPONENTS[panel.component];
        if (!PanelComponent) {
            return (
                <Card key={panel.id} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-6">
                        <p className="text-muted-foreground">Unknown panel type: {panel.component}</p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div 
                key={panel.id} 
                className={`relative ${isEditing ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
                style={{
                    gridColumn: `span ${panel.size.w}`,
                    gridRow: `span ${panel.size.h}`,
                }}
            >
                {isEditing && (
                    <div className="absolute top-2 right-2 z-10 flex gap-1">
                        <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleRemovePanel(panel.id)}
                        >
                            <Trash2 className="h-3 w-3" />
                        </Button>
                    </div>
                )}
                <PanelComponent
                    data={panelData[panel.id] || {}}
                    config={panel.config || {}}
                    onConfigChange={(newConfig) => {
                        router.patch(`/dashboard/panels/${panel.id}`, {
                            config: newConfig
                        }, { preserveState: true });
                    }}
                />
            </div>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        {layout === 'main' ? 'Dashboard' : `${layout.charAt(0).toUpperCase() + layout.slice(1)} Dashboard`}
                    </h2>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className={isEditing ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            {isEditing ? 'Done Editing' : 'Customize'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={refreshing}
                        >
                            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleResetLayout}
                        >
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Reset
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Add Panel Section (shown when editing) */}
                    {isEditing && (
                        <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader>
                                <CardTitle className="dark:text-gray-200 flex items-center gap-2">
                                    <Plus className="h-5 w-5" />
                                    Add Panel
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {Object.entries(availableTypes).map(([type, typeInfo]) => (
                                        <Button
                                            key={type}
                                            variant="outline"
                                            className="h-auto p-4 flex flex-col items-center gap-2"
                                            onClick={() => handleAddPanel(type)}
                                        >
                                            <div className="text-2xl">📊</div>
                                            <div className="text-center">
                                                <div className="font-medium text-sm">{typeInfo.name}</div>
                                                <div className="text-xs text-muted-foreground">{typeInfo.description}</div>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dashboard Grid */}
                    <div 
                        className="grid grid-cols-12 gap-6 auto-rows-fr"
                        style={{ minHeight: '200px' }}
                    >
                        {panels.map(renderPanel)}
                    </div>

                    {/* Empty State */}
                    {panels.length === 0 && (
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardContent className="text-center py-12">
                                <Grid3X3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                                    Your dashboard is empty
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    Click "Customize" to add panels and create your personalized dashboard.
                                </p>
                                <Button onClick={() => setIsEditing(true)}>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Start Customizing
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    {/* Quick Actions Panel (always visible) */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardContent className="p-4">
                                <Button 
                                    className="w-full" 
                                    onClick={() => router.visit('/websites/create')}
                                >
                                    Add Website
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardContent className="p-4">
                                <Button 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => router.visit('/scheduled-scans/create')}
                                >
                                    Schedule Scan
                                </Button>
                            </CardContent>
                        </Card>
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardContent className="p-4">
                                <Button 
                                    variant="outline" 
                                    className="w-full" 
                                    onClick={() => router.visit('/analytics/security')}
                                >
                                    Security Report
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
