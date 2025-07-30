<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebsiteAnalytics extends Model
{
    use HasFactory;

    protected $fillable = [
        'website_id',
        'load_time',
        'response_code',
        'is_online',
        'uptime_percentage',
        'security_score',
        'vulnerabilities',
        'ssl_valid',
        'ssl_expiry',
        'seo_score',
        'gdpr_compliant',
        'accessibility_compliant',
        'wp_version',
        'wp_updates_available',
        'plugin_count',
        'outdated_plugins',
        'health_score',
        'health_issues',
        'scanned_at',
        'scan_type',
        'notes',
    ];

    protected $casts = [
        'vulnerabilities' => 'array',
        'health_issues' => 'array',
        'ssl_valid' => 'boolean',
        'is_online' => 'boolean',
        'gdpr_compliant' => 'boolean',
        'accessibility_compliant' => 'boolean',
        'wp_updates_available' => 'boolean',
        'scanned_at' => 'datetime',
        'ssl_expiry' => 'datetime',
        'load_time' => 'decimal:3',
        'uptime_percentage' => 'decimal:2',
    ];

    /**
     * Get the website that owns this analytics record
     */
    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /**
     * Get the latest analytics for a website
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('scanned_at', 'desc');
    }

    /**
     * Get analytics for a specific scan type
     */
    public function scopeByScanType($query, $type)
    {
        return $query->where('scan_type', $type);
    }

    /**
     * Get analytics within a date range
     */
    public function scopeDateRange($query, $start, $end)
    {
        return $query->whereBetween('scanned_at', [$start, $end]);
    }

    /**
     * Get the health status based on score
     */
    public function getHealthStatusAttribute()
    {
        if ($this->health_score >= 90) return 'excellent';
        if ($this->health_score >= 75) return 'good';
        if ($this->health_score >= 50) return 'fair';
        return 'poor';
    }

    /**
     * Get the security status based on score
     */
    public function getSecurityStatusAttribute()
    {
        if ($this->security_score >= 90) return 'secure';
        if ($this->security_score >= 70) return 'moderate';
        if ($this->security_score >= 50) return 'at_risk';
        return 'vulnerable';
    }
}
