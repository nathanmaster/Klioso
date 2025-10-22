<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SecurityAudit extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id',
        'audit_type',
        'severity',
        'title',
        'description',
        'recommendation',
        'affected_file',
        'line_number',
        'metadata',
        'status',
        'detected_at',
        'resolved_at',
        'risk_score',
        'exploitable',
        'affected_versions',
        'scan_id',
        'vulnerability_id',
        'cve_id',
        'wpvulndb_id',
        'source',
        'published_date',
        'fixed_in_version',
        'references',
        'health_score_impact',
        'scan_type',
        'scan_duration',
        'false_positive',
        'verified_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'affected_versions' => 'array',
        'references' => 'array',
        'exploitable' => 'boolean',
        'false_positive' => 'boolean',
        'detected_at' => 'datetime',
        'resolved_at' => 'datetime',
        'published_date' => 'datetime',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the website that owns this security audit
     */
    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /**
     * Scope for open issues
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * Scope for critical severity
     */
    public function scopeCritical($query)
    {
        return $query->where('severity', 'critical');
    }

    /**
     * Scope for high severity
     */
    public function scopeHigh($query)
    {
        return $query->where('severity', 'high');
    }

    /**
     * Scope by audit type
     */
    public function scopeByType($query, $type)
    {
        return $query->where('audit_type', $type);
    }

    /**
     * Get the severity color for UI
     */
    public function getSeverityColorAttribute()
    {
        return match($this->severity) {
            'critical' => 'red',
            'high' => 'orange',
            'medium' => 'yellow',
            'low' => 'green',
            default => 'gray'
        };
    }

    /**
     * Check if the issue is resolved
     */
    public function getIsResolvedAttribute()
    {
        return in_array($this->status, ['fixed', 'false_positive']);
    }

    /**
     * Scope for unresolved issues
     */
    public function scopeUnresolved($query)
    {
        return $query->whereNotIn('status', ['fixed', 'false_positive']);
    }

    /**
     * Scope by source (wpscan_api, manual, automated)
     */
    public function scopeBySource($query, $source)
    {
        return $query->where('source', $source);
    }

    /**
     * Scope for recent audits (within specified days)
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('detected_at', '>=', now()->subDays($days));
    }

    /**
     * Scope for high-risk issues (critical and high severity)
     */
    public function scopeHighRisk($query)
    {
        return $query->whereIn('severity', ['critical', 'high']);
    }

    /**
     * Get formatted risk score with color coding
     */
    public function getFormattedRiskScoreAttribute()
    {
        $score = $this->risk_score ?? 0;
        
        if ($score >= 80) {
            return ['score' => $score, 'color' => 'red', 'level' => 'Critical'];
        } elseif ($score >= 60) {
            return ['score' => $score, 'color' => 'orange', 'level' => 'High'];
        } elseif ($score >= 40) {
            return ['score' => $score, 'color' => 'yellow', 'level' => 'Medium'];
        } else {
            return ['score' => $score, 'color' => 'green', 'level' => 'Low'];
        }
    }

    /**
     * Get age of the audit in days
     */
    public function getAgeInDaysAttribute()
    {
        return $this->detected_at ? $this->detected_at->diffInDays(now()) : 0;
    }

    /**
     * Check if audit is stale (old and unresolved)
     */
    public function getIsStaleAttribute()
    {
        return !$this->is_resolved && $this->age_in_days > 30;
    }

    /**
     * Mark audit as resolved
     */
    public function markResolved($status = 'fixed')
    {
        $this->update([
            'status' => $status,
            'resolved_at' => now()
        ]);
    }

    /**
     * Mark as false positive
     */
    public function markFalsePositive($reason = null)
    {
        $metadata = $this->metadata ?? [];
        if ($reason) {
            $metadata['false_positive_reason'] = $reason;
        }
        
        $this->update([
            'status' => 'false_positive',
            'false_positive' => true,
            'resolved_at' => now(),
            'metadata' => $metadata
        ]);
    }

    /**
     * Create audit from vulnerability data
     */
    public static function createFromVulnerability($websiteId, $vulnerability, $scanId = null)
    {
        return self::create([
            'website_id' => $websiteId,
            'scan_id' => $scanId,
            'audit_type' => $vulnerability['type'] ?? 'vulnerability',
            'severity' => $vulnerability['severity'] ?? 'medium',
            'title' => $vulnerability['title'] ?? 'Security Issue',
            'description' => $vulnerability['description'] ?? '',
            'recommendation' => $vulnerability['recommendation'] ?? '',
            'risk_score' => $vulnerability['risk_score'] ?? 50,
            'source' => $vulnerability['source'] ?? 'automated',
            'cve_id' => $vulnerability['cve'] ?? null,
            'wpvulndb_id' => $vulnerability['wpvulndb_id'] ?? null,
            'vulnerability_id' => $vulnerability['id'] ?? null,
            'references' => $vulnerability['references'] ?? [],
            'published_date' => isset($vulnerability['published']) ? 
                new \DateTime($vulnerability['published']) : null,
            'fixed_in_version' => $vulnerability['fixed_in'] ?? null,
            'affected_versions' => $vulnerability['affected_versions'] ?? [],
            'metadata' => $vulnerability,
            'status' => 'open',
            'detected_at' => now()
        ]);
    }

    /**
     * Bulk create audits from scan results
     */
    public static function createFromScanResults($websiteId, $scanResults, $scanId = null)
    {
        $audits = [];
        $vulnerabilities = $scanResults['vulnerabilities'] ?? [];
        
        foreach ($vulnerabilities as $vulnerability) {
            $audits[] = self::createFromVulnerability($websiteId, $vulnerability, $scanId);
        }
        
        return $audits;
    }

    /**
     * Get summary statistics for website audits
     */
    public static function getSummaryForWebsite($websiteId)
    {
        $audits = self::where('website_id', $websiteId);
        
        return [
            'total' => $audits->count(),
            'open' => $audits->open()->count(),
            'critical' => $audits->critical()->count(),
            'high' => $audits->high()->count(),
            'recent' => $audits->recent(30)->count(),
            'stale' => $audits->unresolved()->where('detected_at', '<', now()->subDays(30))->count(),
            'average_risk_score' => $audits->avg('risk_score') ?? 0
        ];
    }

    /**
     * Scope for filtering by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('detected_at', [$startDate, $endDate]);
    }
}