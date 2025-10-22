<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\SecurityAudit;
use App\Models\Website;
use App\Models\Client;
use Illuminate\Foundation\Testing\RefreshDatabase;

class HealthScoringTest extends TestCase
{
    use RefreshDatabase;

    /** @test */
    public function it_correctly_formats_risk_scores()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        $audit = SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'wordpress_core',
            'severity' => 'critical',
            'title' => 'Test Vulnerability',
            'description' => 'Test description',
            'risk_score' => 85,
            'status' => 'open',
            'detected_at' => now()
        ]);

        $formattedScore = $audit->formatted_risk_score;

        $this->assertEquals(85, $formattedScore['score']);
        $this->assertEquals('red', $formattedScore['color']);
        $this->assertEquals('Critical', $formattedScore['level']);
    }

    /** @test */
    public function it_calculates_age_correctly()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        $audit = SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'plugin',
            'severity' => 'medium',
            'title' => 'Old Vulnerability',
            'description' => 'Test description',
            'detected_at' => now()->subDays(15),
            'status' => 'open'
        ]);

        $this->assertEquals(15, $audit->age_in_days);
    }

    /** @test */
    public function it_identifies_stale_audits()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        // Create a 35-day old unresolved audit
        $staleAudit = SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'wordpress_core',
            'severity' => 'high',
            'title' => 'Stale Vulnerability',
            'description' => 'Test description',
            'detected_at' => now()->subDays(35),
            'status' => 'open'
        ]);

        // Create a recent audit
        $recentAudit = SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'plugin',
            'severity' => 'medium',
            'title' => 'Recent Vulnerability',
            'description' => 'Test description',
            'detected_at' => now()->subDays(5),
            'status' => 'open'
        ]);

        $this->assertTrue($staleAudit->is_stale);
        $this->assertFalse($recentAudit->is_stale);
    }

    /** @test */
    public function it_can_mark_audits_as_resolved()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        $audit = SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'wordpress_core',
            'severity' => 'critical',
            'title' => 'Test Vulnerability',
            'description' => 'Test description',
            'status' => 'open',
            'detected_at' => now()
        ]);

        $this->assertFalse($audit->is_resolved);

        $audit->markResolved();
        $audit->refresh();

        $this->assertTrue($audit->is_resolved);
        $this->assertEquals('fixed', $audit->status);
        $this->assertNotNull($audit->resolved_at);
    }

    /** @test */
    public function it_can_mark_audits_as_false_positive()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        $audit = SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'plugin',
            'severity' => 'medium',
            'title' => 'False Positive',
            'description' => 'Test description',
            'status' => 'open',
            'detected_at' => now()
        ]);

        $audit->markFalsePositive('Not actually a vulnerability');
        $audit->refresh();

        $this->assertTrue($audit->is_resolved);
        $this->assertEquals('false_positive', $audit->status);
        $this->assertTrue($audit->false_positive);
        $this->assertNotNull($audit->resolved_at);
        $this->assertEquals('Not actually a vulnerability', $audit->metadata['false_positive_reason']);
    }

    /** @test */
    public function it_generates_correct_audit_summary()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        // Create various audits
        SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'wordpress_core',
            'severity' => 'critical',
            'title' => 'Critical Issue',
            'status' => 'open',
            'risk_score' => 90,
            'detected_at' => now()
        ]);

        SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'plugin',
            'severity' => 'high',
            'title' => 'High Issue',
            'status' => 'open',
            'risk_score' => 75,
            'detected_at' => now()
        ]);

        SecurityAudit::create([
            'website_id' => $website->id,
            'audit_type' => 'theme',
            'severity' => 'medium',
            'title' => 'Medium Issue',
            'status' => 'fixed',
            'risk_score' => 50,
            'detected_at' => now()->subDays(40)
        ]);

        $summary = SecurityAudit::getSummaryForWebsite($website->id);

        $this->assertEquals(3, $summary['total']);
        $this->assertEquals(2, $summary['open']);
        $this->assertEquals(1, $summary['critical']);
        $this->assertEquals(1, $summary['high']);
        $this->assertEquals(3, $summary['recent']); // All within 30 days (recent is defined as 30 days)
        $this->assertEquals(71.67, round($summary['average_risk_score'], 2));
    }

    /** @test */
    public function it_creates_bulk_audits_from_scan_results()
    {
        $client = Client::factory()->create();
        $website = Website::factory()->create(['client_id' => $client->id]);
        
        $scanResults = [
            'vulnerabilities' => [
                [
                    'type' => 'wordpress_core',
                    'severity' => 'critical',
                    'title' => 'Core Vulnerability 1',
                    'description' => 'Critical core issue',
                    'risk_score' => 95
                ],
                [
                    'type' => 'plugin',
                    'severity' => 'high',
                    'title' => 'Plugin Vulnerability 1',
                    'description' => 'High plugin issue',
                    'risk_score' => 80
                ]
            ]
        ];

        $audits = SecurityAudit::createFromScanResults($website->id, $scanResults, 'test_scan_456');

        $this->assertCount(2, $audits);
        
        foreach ($audits as $audit) {
            $this->assertEquals($website->id, $audit->website_id);
            $this->assertEquals('test_scan_456', $audit->scan_id);
            $this->assertEquals('open', $audit->status);
            $this->assertNotNull($audit->detected_at);
        }
    }
}