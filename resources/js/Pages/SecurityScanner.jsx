import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { 
    Shield, 
    AlertTriangle, 
    CheckCircle, 
    RefreshCw, 
    Search,
    Eye,
    Clock,
    Globe,
    Zap
} from 'lucide-react';

export default function SecurityScanner({ 
    auth, 
    websites = [], 
    securityOverview = {}, 
    recentVulnerabilities = [],
    securityAudits = []
}) {
    const [scanning, setScanning] = useState(false);
    const [selectedWebsite, setSelectedWebsite] = useState('all');
    const [scanResults, setScanResults] = useState(null);

    const handleSecurityScan = async () => {
        setScanning(true);
        
        try {
            const endpoint = selectedWebsite === 'all' 
                ? '/scanner/bulk-scan' 
                : `/websites/${selectedWebsite}/scan`;
                
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    scan_type: 'security',
                    include_vulnerabilities: true
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                setScanResults(result.data);
                // Refresh the page data
                router.reload({ only: ['securityOverview', 'recentVulnerabilities', 'securityAudits'] });
            } else {
                alert('Scan failed: ' + (result.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Security scan error:', error);
            alert('Network error occurred during scan');
        } finally {
            setScanning(false);
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
            case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
            case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
            case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
        }
    };

    const getSeverityIcon = (severity) => {
        switch (severity?.toLowerCase()) {
            case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
            case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
            case 'medium': return <Eye className="h-4 w-4 text-yellow-600" />;
            case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
            default: return <Shield className="h-4 w-4 text-gray-600" />;
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Security Scanner
                    </h2>
                </div>
            }
        >
            <Head title="Security Scanner" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Security Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Websites</CardTitle>
                                <Globe className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{websites.length}</div>
                                <p className="text-xs text-muted-foreground">
                                    Monitored for security
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                    {securityOverview.critical_issues || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Require immediate attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                                <Shield className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className={`text-2xl font-bold ${securityOverview.average_score >= 80 ? 'text-green-600' : securityOverview.average_score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                                    {securityOverview.average_score || 0}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Average across all sites
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Last Scan</CardTitle>
                                <Clock className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {securityOverview.last_scan || 'Never'}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Most recent security scan
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Scanner Controls */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Security Scanner
                            </CardTitle>
                            <CardDescription>
                                Perform security scans to identify vulnerabilities and security issues
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 items-end">
                                <div className="flex-1">
                                    <label className="text-sm font-medium mb-2 block">Select Website</label>
                                    <Select value={selectedWebsite} onValueChange={setSelectedWebsite}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choose website to scan" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Websites</SelectItem>
                                            {websites.map((website) => (
                                                <SelectItem key={website.id} value={website.id.toString()}>
                                                    {website.name || website.url}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button 
                                    onClick={handleSecurityScan} 
                                    disabled={scanning}
                                    className="min-w-[140px]"
                                >
                                    {scanning ? (
                                        <>
                                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <Search className="h-4 w-4 mr-2" />
                                            Start Scan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Scan Results */}
                    {scanResults && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Latest Scan Results</CardTitle>
                                <CardDescription>
                                    Results from the most recent security scan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {scanResults.vulnerabilities?.length > 0 ? (
                                        scanResults.vulnerabilities.map((vuln, index) => (
                                            <div key={index} className="border rounded-lg p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            {getSeverityIcon(vuln.severity)}
                                                            <h4 className="font-medium">{vuln.title}</h4>
                                                            <Badge className={getSeverityColor(vuln.severity)}>
                                                                {vuln.severity}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            {vuln.description}
                                                        </p>
                                                        {vuln.recommendation && (
                                                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                                                <strong>Recommendation:</strong> {vuln.recommendation}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-green-600">No Vulnerabilities Found</h3>
                                            <p className="text-gray-600">Your website appears to be secure!</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Historical Security Issues */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Audit History</CardTitle>
                            <CardDescription>
                                Recent security issues and their status
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {securityAudits.length > 0 ? (
                                    securityAudits.slice(0, 10).map((audit) => (
                                        <div key={audit.id} className="border rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        {getSeverityIcon(audit.severity)}
                                                        <h4 className="font-medium">{audit.title}</h4>
                                                        <Badge className={getSeverityColor(audit.severity)}>
                                                            {audit.severity}
                                                        </Badge>
                                                        <Badge variant={audit.status === 'resolved' ? 'default' : 'secondary'}>
                                                            {audit.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                        {audit.description}
                                                    </p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                                        <span>Website: {audit.website?.name || 'Unknown'}</span>
                                                        <span>Detected: {new Date(audit.detected_at).toLocaleDateString()}</span>
                                                        {audit.resolved_at && (
                                                            <span>Resolved: {new Date(audit.resolved_at).toLocaleDateString()}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-600">No Security Audits</h3>
                                        <p className="text-gray-500">Run a security scan to start monitoring vulnerabilities</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}