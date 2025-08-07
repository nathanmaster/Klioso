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
    ];

    protected $casts = [
        'metadata' => 'array',
        'affected_versions' => 'array',
        'exploitable' => 'boolean',
        'detected_at' => 'datetime',
        'resolved_at' => 'datetime',
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
     * Scope for filtering by date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('detected_at', [$startDate, $endDate]);
    }
}