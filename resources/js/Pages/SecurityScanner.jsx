import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Progress } from '@/Components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { 
    Shield, 
    AlertTriangle, 
    CheckCircle, 
    RefreshCw, 
    Search,
    Eye,
    Clock,
    Globe,
    Zap,
    Heart,
    Activity,
    TrendingUp,
    TrendingDown,
    Award,
    AlertCircle
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
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');
    const [scanLog, setScanLog] = useState([]);

    const logScanStep = (message, isError = false) => {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}`;
        console.log(isError ? `❌ ${logEntry}` : `✅ ${logEntry}`);
        setScanLog(prev => [...prev, { message: logEntry, isError, timestamp }]);
    };

    const updateProgress = (progress, status) => {
        setScanProgress(progress);
        setScanStatus(status);
        logScanStep(status);
    };

    const handleSecurityScan = async () => {
        console.log('🔒 Starting Security Scan Process');
        setScanning(true);
        setScanProgress(0);
        setScanStatus('Initializing scan...');
        setScanLog([]);
        
        try {
            updateProgress(10, 'Preparing scan configuration...');
            
            const endpoint = selectedWebsite === 'all' 
                ? '/scanner/bulk-scan' 
                : `/websites/${selectedWebsite}/scan`;
            
            logScanStep(`Selected endpoint: ${endpoint}`);
            logScanStep(`Selected website: ${selectedWebsite}`);
            logScanStep(`Total websites to scan: ${selectedWebsite === 'all' ? websites.length : 1}`);
            
            updateProgress(20, 'Getting CSRF token...');
            
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            if (!csrfToken) {
                throw new Error('CSRF token not found in page meta tags');
            }
            logScanStep('CSRF token retrieved successfully');
            
            updateProgress(30, 'Building scan payload...');
            
            // Prepare the data payload
            const scanData = {
                scan_type: 'security',
                include_vulnerabilities: true
            };
            
            // For bulk scan, we need to include website IDs
            if (selectedWebsite === 'all') {
                scanData.website_ids = websites.map(w => w.id);
                scanData.scan_config = {
                    scan_type: 'security',
                    include_vulnerabilities: true
                };
                logScanStep(`Bulk scan configured for ${scanData.website_ids.length} websites`);
            } else {
                logScanStep(`Single website scan for ID: ${selectedWebsite}`);
            }
            
            updateProgress(40, 'Sending scan request to server...');
            
            // Add timeout to the fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
                logScanStep('Request timed out after 5 minutes', true);
            }, 300000); // 5 minute timeout
            
            logScanStep('Making HTTP request to server...');
            
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'same-origin',
                body: JSON.stringify(scanData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            updateProgress(60, 'Processing server response...');
            logScanStep(`Received response with status: ${response.status} ${response.statusText}`);
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            
            updateProgress(70, 'Parsing response data...');
            
            // Try to parse JSON, but handle HTML responses gracefully
            const contentType = response.headers.get('content-type');
            logScanStep(`Response content type: ${contentType}`);
            
            if (contentType && contentType.includes('application/json')) {
                updateProgress(80, 'Reading JSON response...');
                const result = await response.json();
                
                logScanStep(`Response parsed successfully. Success: ${result.success}`);
                
                if (result.success) {
                    updateProgress(90, 'Processing scan results...');
                    setScanResults(result.data);
                    
                    logScanStep(`Scan completed successfully`);
                    if (result.data) {
                        logScanStep(`Results contain ${Object.keys(result.data).length} data points`);
                        logScanStep(`Website: ${result.data.website || 'Unknown'}`);
                        logScanStep(`Vulnerabilities found: ${result.data.vulnerabilities?.length || 0}`);
                        logScanStep(`Health score: ${result.data.health_score || 'Not calculated'}`);
                        console.log('Full scan results:', result.data);
                    }
                    
                    updateProgress(100, 'Refreshing page data...');
                    // Refresh the page data
                    router.reload({ only: ['securityOverview', 'recentVulnerabilities', 'securityAudits'] });
                    
                    logScanStep('Page data refreshed successfully');
                } else {
                    const errorMsg = result.message || 'Unknown server error';
                    logScanStep(`Scan failed: ${errorMsg}`, true);
                    alert('Scan failed: ' + errorMsg);
                }
            } else {
                // If we get HTML instead of JSON, it's likely an error page
                updateProgress(75, 'Error: Received HTML instead of JSON');
                const text = await response.text();
                const preview = text.substring(0, 200);
                logScanStep('Expected JSON but got HTML response', true);
                logScanStep(`HTML preview: ${preview}`, true);
                console.error('Full HTML response:', text);
                alert('Server returned an error page instead of scan results. Check console for details.');
            }
        } catch (error) {
            updateProgress(0, 'Scan failed');
            
            if (error.name === 'AbortError') {
                logScanStep('Scan was aborted due to timeout', true);
                alert('Scan timed out after 5 minutes. This may indicate server performance issues.');
            } else if (error.message.includes('Failed to fetch')) {
                logScanStep('Network error: Failed to reach server', true);
                alert('Network error: Could not connect to server. Check your internet connection.');
            } else {
                logScanStep(`Unexpected error: ${error.message}`, true);
                console.error('Security scan error details:', error);
                alert('Network error occurred during scan: ' + error.message);
            }
        } finally {
            setScanning(false);
            if (scanProgress === 100) {
                setTimeout(() => {
                    setScanProgress(0);
                    setScanStatus('');
                }, 3000); // Clear progress after 3 seconds
            }
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

    // Helper functions for health score display
    const getHealthGrade = (score) => {
        if (!score) return 'N/A';
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    };

    const getHealthBadgeColor = (score) => {
        if (!score) return 'bg-gray-500';
        if (score >= 90) return 'bg-green-500';
        if (score >= 80) return 'bg-blue-500';
        if (score >= 70) return 'bg-yellow-500';
        if (score >= 60) return 'bg-orange-500';
        return 'bg-red-500';
    };

    const getGradeBadgeColor = (grade) => {
        switch (grade) {
            case 'A': return 'bg-green-500';
            case 'B': return 'bg-blue-500';
            case 'C': return 'bg-yellow-500';
            case 'D': return 'bg-orange-500';
            case 'F': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getRiskVariant = (riskLevel) => {
        switch (riskLevel) {
            case 'low': return 'default';
            case 'medium': return 'secondary';
            case 'high': return 'destructive';
            case 'critical': return 'destructive';
            default: return 'secondary';
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

                    {/* Health Score Dashboard */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Heart className="h-5 w-5 text-red-500" />
                                Website Health Dashboard
                            </CardTitle>
                            <CardDescription>
                                Comprehensive health scores and security metrics for all monitored websites
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Health Overview</TabsTrigger>
                                    <TabsTrigger value="sites">Site Health</TabsTrigger>
                                    <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                                    <TabsTrigger value="history">Health History</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="overview" className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Average Health</p>
                                                        <div className="flex items-center space-x-2">
                                                            <div className="text-2xl font-bold">
                                                                {securityOverview.average_health_score || 'N/A'}
                                                            </div>
                                                            <Badge className={getHealthBadgeColor(securityOverview.average_health_score)}>
                                                                {getHealthGrade(securityOverview.average_health_score)}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Activity className="h-8 w-8 text-blue-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Healthy Sites</p>
                                                        <div className="text-2xl font-bold text-green-600">
                                                            {securityOverview.healthy_sites || 0}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Score ≥ 80
                                                        </p>
                                                    </div>
                                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">At Risk Sites</p>
                                                        <div className="text-2xl font-bold text-orange-600">
                                                            {securityOverview.at_risk_sites || 0}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Score 40-79
                                                        </p>
                                                    </div>
                                                    <AlertTriangle className="h-8 w-8 text-orange-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                        
                                        <Card>
                                            <CardContent className="pt-6">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-muted-foreground">Critical Sites</p>
                                                        <div className="text-2xl font-bold text-red-600">
                                                            {securityOverview.critical_sites || 0}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Score &lt; 40
                                                        </p>
                                                    </div>
                                                    <AlertCircle className="h-8 w-8 text-red-500" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    
                                    {/* Health Score Distribution */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Health Score Distribution</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3">
                                                {['A', 'B', 'C', 'D', 'F'].map((grade) => {
                                                    const count = securityOverview.grade_distribution?.[grade] || 0;
                                                    const percentage = websites.length > 0 ? (count / websites.length) * 100 : 0;
                                                    return (
                                                        <div key={grade} className="flex items-center space-x-3">
                                                            <div className="w-8 text-center">
                                                                <Badge className={getGradeBadgeColor(grade)}>{grade}</Badge>
                                                            </div>
                                                            <div className="flex-1">
                                                                <Progress value={percentage} className="h-2" />
                                                            </div>
                                                            <div className="w-12 text-sm text-muted-foreground">
                                                                {count}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                
                                <TabsContent value="sites" className="space-y-4">
                                    <div className="grid gap-4">
                                        {websites.map((website) => (
                                            <Card key={website.id}>
                                                <CardContent className="pt-6">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="font-medium">{website.display_name || website.domain_name}</h4>
                                                                {website.health_score && (
                                                                    <>
                                                                        <Badge className={getHealthBadgeColor(website.health_score)}>
                                                                            {getHealthGrade(website.health_score)}
                                                                        </Badge>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            Score: {website.health_score}
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                                <span>Client: {website.client?.name || 'Unknown'}</span>
                                                                {website.last_health_check && (
                                                                    <span>Last Check: {new Date(website.last_health_check).toLocaleDateString()}</span>
                                                                )}
                                                                {website.risk_level && (
                                                                    <Badge variant={getRiskVariant(website.risk_level)}>
                                                                        {website.risk_level} risk
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-2">
                                                            {website.health_score ? (
                                                                <div className="text-right">
                                                                    <div className="text-2xl font-bold">
                                                                        {website.health_score}
                                                                    </div>
                                                                    <Progress value={website.health_score} className="w-20 h-2" />
                                                                </div>
                                                            ) : (
                                                                <div className="text-muted-foreground">
                                                                    No scan data
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="vulnerabilities" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recent Vulnerabilities</CardTitle>
                                            <CardDescription>
                                                Latest security vulnerabilities found across all websites
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {recentVulnerabilities && recentVulnerabilities.length > 0 ? (
                                                    recentVulnerabilities.map((vuln, index) => (
                                                        <div key={index} className="border rounded-lg p-4">
                                                            <div className="flex items-start justify-between">
                                                                <div className="flex-1">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        {getSeverityIcon(vuln.severity)}
                                                                        <h4 className="font-medium">{vuln.title}</h4>
                                                                        <Badge className={getSeverityColor(vuln.severity)}>
                                                                            {vuln.severity}
                                                                        </Badge>
                                                                        {vuln.website && (
                                                                            <Badge variant="outline">
                                                                                {vuln.website.name || vuln.website.domain_name}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                                        {vuln.description}
                                                                    </p>
                                                                    {vuln.recommendation && (
                                                                        <p className="text-sm text-blue-600 dark:text-blue-400">
                                                                            <strong>Recommendation:</strong> {vuln.recommendation}
                                                                        </p>
                                                                    )}
                                                                    {vuln.created_at && (
                                                                        <p className="text-xs text-gray-500 mt-2">
                                                                            Found: {new Date(vuln.created_at).toLocaleString()}
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
                                                        <p className="text-gray-600">Run security scans to check for vulnerabilities</p>
                                                    </div>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                
                                <TabsContent value="history" className="space-y-4">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Health Score Trends</CardTitle>
                                            <CardDescription>
                                                Historical health score data and trends
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-center py-8 text-muted-foreground">
                                                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                                                <p>Health history tracking coming soon...</p>
                                                <p className="text-sm">Run security scans to start building health history</p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

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
                                            <SelectItem value="all">
                                                <div className="flex items-center">
                                                    <Globe className="h-4 w-4 mr-2 text-blue-600" />
                                                    <span className="font-medium">All Websites</span>
                                                    <span className="text-sm text-gray-500 ml-2">({websites.length} sites)</span>
                                                </div>
                                            </SelectItem>
                                            {websites.map((website) => (
                                                <SelectItem key={website.id} value={website.id.toString()}>
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center">
                                                            <Globe className="h-3 w-3 mr-2 text-gray-500" />
                                                            <span className="font-medium">
                                                                {website.display_name || website.domain_name || 'Unknown Website'}
                                                            </span>
                                                        </div>
                                                        <div className="text-xs text-gray-500 ml-5">
                                                            {website.domain_name && website.domain_name !== website.display_name ? website.domain_name : ''}
                                                            {website.client ? ` • ${website.client.name}` : ''}
                                                            {website.platform ? ` • ${website.platform}` : ''}
                                                        </div>
                                                    </div>
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

                            {/* Selected Websites Preview */}
                            {selectedWebsite && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center mb-2">
                                        <Eye className="h-4 w-4 mr-2 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                                            Scan Preview
                                        </span>
                                    </div>
                                    {selectedWebsite === 'all' ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                <strong>Bulk Scan:</strong> All {websites.length} websites will be scanned
                                            </p>
                                            <div className="max-h-32 overflow-y-auto">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                                                    {websites.slice(0, 10).map((website) => (
                                                        <div key={website.id} className="flex items-center text-blue-600 dark:text-blue-400">
                                                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                                            <span>{website.display_name || website.domain_name}</span>
                                                        </div>
                                                    ))}
                                                    {websites.length > 10 && (
                                                        <div className="text-blue-600 dark:text-blue-400 italic">
                                                            ... and {websites.length - 10} more websites
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            {(() => {
                                                const website = websites.find(w => w.id.toString() === selectedWebsite);
                                                return website ? (
                                                    <div>
                                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                                            <strong>Single Site Scan:</strong> {website.display_name || website.domain_name}
                                                        </p>
                                                        <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                                                            {website.domain_name && (
                                                                <div>🌐 Domain: {website.domain_name}</div>
                                                            )}
                                                            {website.client && (
                                                                <div>👤 Client: {website.client.name}</div>
                                                            )}
                                                            {website.platform && (
                                                                <div>⚙️ Platform: {website.platform}</div>
                                                            )}
                                                            {website.last_scan && (
                                                                <div>🕒 Last Scan: {new Date(website.last_scan).toLocaleDateString()}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-red-600">Website not found</p>
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Progress Bar and Status */}
                            {scanning && (
                                <div className="mt-6 space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {scanStatus || 'Processing...'}
                                        </span>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            {scanProgress}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div 
                                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                                            style={{ width: `${scanProgress}%` }}
                                        ></div>
                                    </div>
                                    
                                    {/* Live Console Log */}
                                    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4 max-h-40 overflow-y-auto">
                                        <div className="flex items-center mb-2">
                                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Live Console
                                            </span>
                                        </div>
                                        <div className="space-y-1 font-mono text-xs">
                                            {scanLog.map((log, index) => (
                                                <div 
                                                    key={index} 
                                                    className={`${log.isError ? 'text-red-600 dark:text-red-400' : 'text-gray-600 dark:text-gray-400'}`}
                                                >
                                                    {log.message}
                                                </div>
                                            ))}
                                            {scanLog.length === 0 && (
                                                <div className="text-gray-500 dark:text-gray-500 italic">
                                                    Waiting for scan to start...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Scan Results */}
                    {scanResults && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <span>Latest Scan Results</span>
                                    {scanResults.website && (
                                        <Badge variant="outline">
                                            {scanResults.website}
                                        </Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>
                                    Results from the most recent security scan
                                    {scanResults.scan_date && (
                                        <span className="block text-xs mt-1">
                                            Scanned: {new Date(scanResults.scan_date).toLocaleString()}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Health Score Summary */}
                                {scanResults.health_score !== undefined && (
                                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">Health Score</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                    Overall website security health
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-2xl font-bold">
                                                    {scanResults.health_score}/100
                                                </div>
                                                <Badge className={getGradeBadgeColor(getHealthGrade(scanResults.health_score))}>
                                                    Grade: {getHealthGrade(scanResults.health_score)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <Progress value={scanResults.health_score} className="mt-3 h-3" />
                                    </div>
                                )}
                                
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