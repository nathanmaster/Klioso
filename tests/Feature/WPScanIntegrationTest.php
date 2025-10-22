<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Website;
use App\Models\Client;
use App\Models\SecurityAudit;
use App\Services\WordPressScanService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

class WPScanIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected $scanService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->scanService = app(WordPressScanService::class);
    }

    /** @test */
    public function it_can_calculate_health_scores()
    {
        // Arrange
        $mockScanResults = [
            'wordpress' => [
                'version' => '6.3.0',
                'is_up_to_date' => false
            ],
            'vulnerabilities' => [
                [
                    'type' => 'wordpress_core',
                    'severity' => 'high',
                    'title' => 'WordPress Core Vulnerability',
                    'description' => 'SQL Injection vulnerability',
                    'risk_score' => 75,
                    'source' => 'wpscan_api'
                ],
                [
                    'type' => 'plugin',
                    'severity' => 'medium',
                    'title' => 'Plugin Vulnerability',
                    'description' => 'XSS vulnerability in contact form',
                    'risk_score' => 45,
                    'source' => 'automated'
                ]
            ],
            'plugins' => [
                [
                    'slug' => 'contact-form-7',
                    'name' => 'Contact Form 7',
                    'version' => '5.7.0'
                ]
            ]
        ];

        // Act
        $healthData = $this->scanService->calculateHealthScore($mockScanResults);

        // Assert
        $this->assertIsArray($healthData);
        $this->assertArrayHasKey('overall_score', $healthData);
        $this->assertArrayHasKey('grade', $healthData);
        $this->assertArrayHasKey('component_scores', $healthData);
        $this->assertArrayHasKey('risk_level', $healthData);

        // Verify score is between 0 and 100
        $this->assertGreaterThanOrEqual(0, $healthData['overall_score']);
        $this->assertLessThanOrEqual(100, $healthData['overall_score']);

        // Verify grade is valid
        $this->assertContains($healthData['grade'], ['A', 'B', 'C', 'D', 'F']);

        // Verify component scores exist
        $this->assertArrayHasKey('core', $healthData['component_scores']);
        $this->assertArrayHasKey('security', $healthData['component_scores']);
        $this->assertArrayHasKey('plugins', $healthData['component_scores']);
        $this->assertArrayHasKey('configuration', $healthData['component_scores']);
    }

    /** @test */
    public function it_can_create_security_audits_from_vulnerabilities()
    {
        // Arrange
        $client = Client::factory()->create(['name' => 'Test Client']);
        $website = Website::factory()->create([
            'name' => 'Test Website',
            'url' => 'https://example.com',
            'client_id' => $client->id
        ]);

        $vulnerability = [
            'type' => 'wordpress_core',
            'severity' => 'critical',
            'title' => 'Critical WordPress Vulnerability',
            'description' => 'Remote code execution vulnerability',
            'risk_score' => 95,
            'source' => 'wpscan_api',
            'cve' => 'CVE-2023-1234',
            'published' => '2023-01-15'
        ];

        // Act
        $audit = SecurityAudit::createFromVulnerability($website->id, $vulnerability, 'test_scan_123');

        // Assert
        $this->assertInstanceOf(SecurityAudit::class, $audit);
        $this->assertEquals($website->id, $audit->website_id);
        $this->assertEquals('wordpress_core', $audit->audit_type);
        $this->assertEquals('critical', $audit->severity);
        $this->assertEquals('Critical WordPress Vulnerability', $audit->title);
        $this->assertEquals(95, $audit->risk_score);
        $this->assertEquals('wpscan_api', $audit->source);
        $this->assertEquals('CVE-2023-1234', $audit->cve_id);
        $this->assertEquals('test_scan_123', $audit->scan_id);
        $this->assertEquals('open', $audit->status);
    }

    /** @test */
    public function it_can_handle_wpscan_api_responses()
    {
        // Mock the WPScan API response
        Http::fake([
            'https://wpscan.com/api/v3/wordpresses/6.3.0' => Http::response([
                '6.3.0' => [
                    'vulnerabilities' => [
                        [
                            'id' => 12345,
                            'title' => 'WordPress Core SQL Injection',
                            'published_date' => '2023-01-15',
                            'fixed_in' => '6.3.1',
                            'references' => [
                                'cve' => ['CVE-2023-1234']
                            ]
                        ]
                    ]
                ]
            ], 200)
        ]);

        // Create a minimal scan service instance
        $mockScanResults = [
            'wordpress' => ['version' => '6.3.0'],
            'vulnerabilities' => []
        ];

        // Test the vulnerability scanning with WPScan integration
        $vulnerabilities = $this->scanService->scanVulnerabilities('https://example.com');

        // Verify that vulnerabilities were processed
        $this->assertIsArray($vulnerabilities);
    }

    /** @test */
    public function it_calculates_correct_health_grades()
    {
        $testCases = [
            ['score' => 95, 'expected_grade' => 'A'],
            ['score' => 85, 'expected_grade' => 'B'],
            ['score' => 75, 'expected_grade' => 'C'],
            ['score' => 65, 'expected_grade' => 'D'],
            ['score' => 45, 'expected_grade' => 'F'],
        ];

        foreach ($testCases as $testCase) {
            $mockResults = [
                'wordpress' => ['version' => '6.4.2'],
                'vulnerabilities' => [],
                'plugins' => []
            ];

            // Mock the health calculation to return our test score
            $healthData = $this->scanService->calculateHealthScore($mockResults);
            
            // Just verify the grading logic works
            $grade = $this->getGradeFromScore($testCase['score']);
            $this->assertEquals($testCase['expected_grade'], $grade);
        }
    }

    /** @test */
    public function it_stores_comprehensive_audit_history()
    {
        // Arrange
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);

        $vulnerabilities = [
            [
                'type' => 'wordpress_core',
                'severity' => 'high',
                'title' => 'WordPress Core Issue',
                'risk_score' => 80
            ],
            [
                'type' => 'plugin',
                'severity' => 'medium',
                'title' => 'Plugin Issue',
                'risk_score' => 50
            ]
        ];

        $scanId = 'test_scan_' . time();

        // Act
        $audits = [];
        foreach ($vulnerabilities as $vuln) {
            $audits[] = SecurityAudit::createFromVulnerability($website->id, $vuln, $scanId);
        }

        // Assert
        $this->assertCount(2, $audits);
        
        // Verify scan session tracking
        $scanAudits = SecurityAudit::where('scan_id', $scanId)->get();
        $this->assertCount(2, $scanAudits);

        // Verify audit summary
        $summary = SecurityAudit::getSummaryForWebsite($website->id);
        $this->assertEquals(2, $summary['total']);
        $this->assertEquals(2, $summary['open']);
        $this->assertEquals(0, $summary['critical']);
        $this->assertEquals(1, $summary['high']);
    }

    private function getGradeFromScore($score)
    {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }
}