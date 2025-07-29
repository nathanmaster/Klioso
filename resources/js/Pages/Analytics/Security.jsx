import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
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
    Search,
    Filter,
    Eye,
    Download,
    Zap
} from 'lucide-react';

export default function SecurityAnalytics({ auth, securityData, vulnerabilities, filters }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'critical': return 'text-red-600';
            case 'high': return 'text-orange-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-blue-600';
            default: return 'text-gray-600';
        }
    };

    const getSeverityBadgeVariant = (severity) => {
        switch (severity) {
            case 'critical': return 'destructive';
            case 'high': return 'destructive';
            case 'medium': return 'secondary';
            case 'low': return 'outline';
            default: return 'outline';
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'resolved': return 'default';
            case 'investigating': return 'secondary';
            case 'open': return 'destructive';
            default: return 'outline';
        }
    };

    const filteredVulnerabilities = vulnerabilities.filter(vuln => {
        const matchesSearch = vuln.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             vuln.website.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || vuln.severity === severityFilter;
        const matchesStatus = statusFilter === 'all' || vuln.status === statusFilter;
        
        return matchesSearch && matchesSeverity && matchesStatus;
    });

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Security Analytics
                    </h2>
                    <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                        </Button>
                        <Button size="sm">
                            <Zap className="h-4 w-4 mr-2" />
                            Run Security Scan
                        </Button>
                    </div>
                </div>
            }
        >
            <Head title="Security Analytics" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Security Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Vulnerabilities</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{securityData.totalVulnerabilities}</div>
                                <p className="text-xs text-muted-foreground">
                                    {securityData.newVulnerabilities} new this week
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
                                <Shield className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{securityData.criticalIssues}</div>
                                <p className="text-xs text-muted-foreground">
                                    Require immediate attention
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
                                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{securityData.resolvedIssues}</div>
                                <p className="text-xs text-muted-foreground">
                                    {securityData.resolvedThisWeek} resolved this week
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
                                <Clock className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{securityData.avgResolutionTime}</div>
                                <p className="text-xs text-muted-foreground">
                                    Days to resolve issues
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Severity Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vulnerability Severity Distribution</CardTitle>
                            <CardDescription>Current vulnerabilities by severity level</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {securityData.severityDistribution.map((item, index) => (
                                    <div key={index} className="text-center p-4 border rounded-lg">
                                        <div className={`text-2xl font-bold ${getSeverityColor(item.severity)}`}>
                                            {item.count}
                                        </div>
                                        <div className="text-sm text-gray-600 capitalize">{item.severity}</div>
                                        <div className="text-xs text-gray-500">
                                            {((item.count / securityData.totalVulnerabilities) * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Filters and Search */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Security Vulnerabilities</CardTitle>
                            <CardDescription>Detailed view of all security issues</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row gap-4 mb-6">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search vulnerabilities or websites..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-8"
                                        />
                                    </div>
                                </div>
                                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Severity" />
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
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="investigating">Investigating</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Vulnerabilities List */}
                            <div className="space-y-4">
                                {filteredVulnerabilities.map((vulnerability, index) => (
                                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <h4 className="font-semibold">{vulnerability.title}</h4>
                                                    <Badge variant={getSeverityBadgeVariant(vulnerability.severity)}>
                                                        {vulnerability.severity}
                                                    </Badge>
                                                    <Badge variant={getStatusBadgeVariant(vulnerability.status)}>
                                                        {vulnerability.status}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-2">{vulnerability.description}</p>
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span>
                                                        <strong>Website:</strong> 
                                                        <Link 
                                                            href={`/websites/${vulnerability.websiteId}`}
                                                            className="text-blue-600 hover:underline ml-1"
                                                        >
                                                            {vulnerability.website}
                                                        </Link>
                                                    </span>
                                                    <span><strong>Detected:</strong> {vulnerability.detectedAt}</span>
                                                    {vulnerability.resolvedAt && (
                                                        <span><strong>Resolved:</strong> {vulnerability.resolvedAt}</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                <Button variant="outline" size="sm">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View Details
                                                </Button>
                                                {vulnerability.status === 'open' && (
                                                    <Button size="sm">
                                                        Mark Resolved
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {vulnerability.recommendedActions && (
                                            <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                                <h5 className="text-sm font-medium text-blue-800 mb-1">Recommended Actions:</h5>
                                                <p className="text-sm text-blue-700">{vulnerability.recommendedActions}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {filteredVulnerabilities.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <Shield className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                    <p>No vulnerabilities found matching your criteria.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
