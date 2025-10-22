import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    Shield, 
    AlertTriangle, 
    CheckCircle, 
    Clock, 
    Eye,
    Search, 
    Filter, 
    RefreshCw, 
    Download,
    Play,
    Users,
    Zap,
    Settings
} from 'lucide-react';

export default function Security({ 
    auth, 
    securityOverview = {}, 
    recentAudits = [], 
    criticalAlerts = [], 
    websites = [], 
    filters = {} 
}) {
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [severityFilter, setSeverityFilter] = useState(filters.severity || 'all');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [refreshing, setRefreshing] = useState(false);
    const [scanningWebsites, setScanningWebsites] = useState(new Set());
    const [bulkScanning, setBulkScanning] = useState(false);
    const [selectedWebsites, setSelectedWebsites] = useState(new Set());

    // Helper functions for badge variants
    const getSeverityBadgeVariant = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'open': return 'destructive';
            case 'investigating': return 'secondary';
            case 'resolved': return 'default';
            default: return 'outline';
        }
    };

    // Safely filter audits with null checks
    const filteredAudits = (recentAudits || []).filter((audit) => {
        if (!audit) return false;
        
        const websiteName = audit.website?.name || '';
        const issueType = audit.issue_type || '';
        const details = audit.details || '';
        
        const matchesSearch = !searchTerm || 
            websiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            details.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesSeverity = severityFilter === 'all' || 
            (audit.risk_level && audit.risk_level.toLowerCase() === severityFilter);
        const matchesStatus = statusFilter === 'all' || 
            (audit.status && audit.status.toLowerCase() === statusFilter);
        
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    const handleRefresh = () => {
        setRefreshing(true);
        router.reload({
            onFinish: () => setRefreshing(false)
        });
    };

    const handleExport = () => {
        router.post('/analytics/export', {
            type: 'security',
            filters: { searchTerm, severityFilter, statusFilter }
        });
    };

    const handleWebsiteScan = async (websiteId, scanType = 'comprehensive') => {
        setScanningWebsites(prev => new Set([...prev, websiteId]));
        
        try {
            const response = await fetch('/analytics/security/scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    website_id: websiteId,
                    scan_type: scanType,
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                // Show success message and refresh
                router.reload();
            } else {
                console.error('Scan failed:', result.message);
            }
        } catch (error) {
            console.error('Scan error:', error);
        } finally {
            setScanningWebsites(prev => {
                const newSet = new Set(prev);
                newSet.delete(websiteId);
                return newSet;
            });
        }
    };

    const handleBulkScan = async (scanType = 'comprehensive') => {
        if (selectedWebsites.size === 0) return;
        
        setBulkScanning(true);
        
        try {
            const response = await fetch('/analytics/security/bulk-scan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({
                    website_ids: Array.from(selectedWebsites),
                    scan_type: scanType,
                }),
            });

            const result = await response.json();
            
            if (result.success) {
                setSelectedWebsites(new Set());
                router.reload();
            } else {
                console.error('Bulk scan failed:', result.message);
            }
        } catch (error) {
            console.error('Bulk scan error:', error);
        } finally {
            setBulkScanning(false);
        }
    };

    const toggleWebsiteSelection = (websiteId) => {
        setSelectedWebsites(prev => {
            const newSet = new Set(prev);
            if (newSet.has(websiteId)) {
                newSet.delete(websiteId);
            } else {
                newSet.add(websiteId);
            }
            return newSet;
        });
    };

    const selectAllWebsites = () => {
        if (selectedWebsites.size === websites.length) {
            setSelectedWebsites(new Set());
        } else {
            setSelectedWebsites(new Set(websites.map(w => w.id)));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
                        Security Analytics
                    </h2>
                    <div className="flex space-x-2">
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
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Security Analytics" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    {/* Security Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">
                                    Total Vulnerabilities
                                </CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-gray-200">
                                    {securityOverview?.totalVulnerabilities || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {(securityOverview?.activeAlerts || 0) > 0 ? (
                                        <span className="text-red-500">
                                            {securityOverview.activeAlerts} active
                                        </span>
                                    ) : (
                                        <span className="text-green-500">All resolved</span>
                                    )}
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">
                                    Critical Issues
                                </CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {securityOverview?.critical_issues || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Require immediate attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">
                                    Websites Monitored
                                </CardTitle>
                                <Eye className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold dark:text-gray-200">
                                    {securityOverview?.monitored_websites || websites?.length || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Active security monitoring
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="dark:bg-gray-800 dark:border-gray-700">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium dark:text-gray-200">
                                    Last Scan
                                </CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm font-bold dark:text-gray-200">
                                    {securityOverview?.last_scan ? 
                                        new Date(securityOverview.last_scan).toLocaleDateString() : 
                                        'Never'
                                    }
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {securityOverview?.last_scan ? 
                                        `${Math.floor((new Date() - new Date(securityOverview.last_scan)) / (1000 * 60 * 60 * 24))} days ago` :
                                        'No scans performed'
                                    }
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Scanner Section */}
                    <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-200 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Security Scanner
                            </CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Run vulnerability scans on your websites to detect security issues
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Bulk Actions */}
                                <div className="flex flex-wrap items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={selectAllWebsites}
                                    >
                                        {selectedWebsites.size === websites.length ? 'Deselect All' : 'Select All'}
                                    </Button>
                                    <Button
                                        onClick={() => handleBulkScan('quick')}
                                        disabled={selectedWebsites.size === 0 || bulkScanning}
                                        size="sm"
                                    >
                                        <Play className={`h-4 w-4 mr-2 ${bulkScanning ? 'animate-spin' : ''}`} />
                                        Quick Scan ({selectedWebsites.size})
                                    </Button>
                                    <Button
                                        onClick={() => handleBulkScan('comprehensive')}
                                        disabled={selectedWebsites.size === 0 || bulkScanning}
                                        size="sm"
                                    >
                                        <Settings className={`h-4 w-4 mr-2 ${bulkScanning ? 'animate-spin' : ''}`} />
                                        Comprehensive Scan ({selectedWebsites.size})
                                    </Button>
                                    {bulkScanning && (
                                        <span className="text-sm text-muted-foreground">
                                            Scanning {selectedWebsites.size} websites...
                                        </span>
                                    )}
                                </div>

                                {/* Website List */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {websites.map((website) => (
                                        <Card key={website.id} className="dark:bg-gray-700 dark:border-gray-600">
                                            <CardContent className="pt-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedWebsites.has(website.id)}
                                                            onChange={() => toggleWebsiteSelection(website.id)}
                                                            className="rounded"
                                                        />
                                                        <div>
                                                            <h3 className="font-medium dark:text-gray-200 text-sm">
                                                                {website.name}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground">
                                                                {website.url}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleWebsiteScan(website.id, 'quick')}
                                                            disabled={scanningWebsites.has(website.id)}
                                                        >
                                                            <Play className={`h-3 w-3 ${scanningWebsites.has(website.id) ? 'animate-spin' : ''}`} />
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleWebsiteScan(website.id, 'comprehensive')}
                                                            disabled={scanningWebsites.has(website.id)}
                                                        >
                                                            <Settings className={`h-3 w-3 ${scanningWebsites.has(website.id) ? 'animate-spin' : ''}`} />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters */}
                    <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-200 flex items-center gap-2">
                                <Filter className="h-5 w-5" />
                                Filter Security Audits
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search audits..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Severities</SelectItem>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Filter by status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Audits List */}
                    <Card className="dark:bg-gray-800 dark:border-gray-700">
                        <CardHeader>
                            <CardTitle className="dark:text-gray-200">Recent Security Audits</CardTitle>
                            <CardDescription className="dark:text-gray-400">
                                Security findings from website scans and monitoring
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {filteredAudits.length === 0 ? (
                                <div className="text-center py-8">
                                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                                    <h3 className="text-lg font-semibold mb-2 dark:text-gray-200">
                                        No Security Issues Found
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {recentAudits.length === 0 
                                            ? "No security audits have been performed yet." 
                                            : "No audits match your current filters."
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredAudits.map((audit) => (
                                        <div key={audit.id} className="border rounded-lg p-4 dark:border-gray-700">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-semibold dark:text-gray-200">
                                                            {audit.website?.name || 'Unknown Website'}
                                                        </h3>
                                                        <Badge variant={getSeverityBadgeVariant(audit.risk_level)}>
                                                            {audit.risk_level || 'Unknown'}
                                                        </Badge>
                                                        <Badge variant={getStatusBadgeVariant(audit.status)}>
                                                            {audit.status || 'Unknown'}
                                                        </Badge>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="font-medium text-sm dark:text-gray-300">
                                                            Issue Type: 
                                                        </span>
                                                        <span className="text-sm text-muted-foreground ml-2">
                                                            {audit.issue_type || 'Not specified'}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {audit.details || 'No details available'}
                                                    </p>
                                                    <div className="text-xs text-muted-foreground">
                                                        Detected: {audit.created_at ? 
                                                            new Date(audit.created_at).toLocaleString() : 
                                                            'Unknown'
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}