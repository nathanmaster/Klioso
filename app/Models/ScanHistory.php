<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScanHistory extends Model
{
    protected $table = 'scan_histories';
    
    protected $fillable = [
        'scan_type',
        'scan_trigger',
        'target',
        'website_id',
        'scheduled_scan_id',
        'scan_results',
        'scan_summary',
        'security_data',
        'type',
        'plugins_found',
        'themes_found',
        'vulnerabilities_found',
        'auto_sync_enabled',
        'plugins_added_to_db',
        'status',
        'error_message',
        'scan_duration_ms',
        'scan_started_at',
        'scan_completed_at'
    ];

    protected $casts = [
        'scan_results' => 'array',
        'scan_summary' => 'array',
        'security_data' => 'array',
        'auto_sync_enabled' => 'boolean',
        'plugins_found' => 'integer',
        'themes_found' => 'integer',
        'vulnerabilities_found' => 'integer',
        'plugins_added_to_db' => 'integer',
        'scan_duration_ms' => 'integer',
        'scan_started_at' => 'datetime',
        'scan_completed_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the website that this scan belongs to.
     */
    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /**
     * Get the scheduled scan that triggered this scan (if any).
     */
    public function scheduledScan(): BelongsTo
    {
        return $this->belongsTo(ScheduledScan::class);
    }

    /**
     * Scope for filtering by scan type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('scan_type', $type);
    }

    /**
     * Scope for successful scans only
     */
    public function scopeSuccessful($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * Scope for failed scans only
     */
    public function scopeFailed($query)
    {
        return $query->where('status', 'failed');
    }

    /**
     * Get scan duration in human readable format
     */
    public function getDurationAttribute()
    {
        if (!$this->scan_duration_ms) {
            return 'Unknown';
        }

        $seconds = $this->scan_duration_ms / 1000;
        
        if ($seconds < 1) {
            return $this->scan_duration_ms . 'ms';
        } elseif ($seconds < 60) {
            return number_format($seconds, 1) . 's';
        } else {
            $minutes = floor($seconds / 60);
            $seconds = $seconds % 60;
            return $minutes . 'm ' . number_format($seconds, 1) . 's';
        }
    }

    /**
     * Get total items found (plugins + themes + vulnerabilities)
     */
    public function getTotalItemsFoundAttribute()
    {
        return $this->plugins_found + $this->themes_found + $this->vulnerabilities_found;
    }

    /**
     * Get formatted scan trigger label
     */
    public function getScanTriggerLabelAttribute(): string
    {
        return match($this->scan_trigger) {
            'manual' => 'Manual Scan',
            'scheduled' => 'Scheduled Scan',
            'api' => 'API Triggered',
            default => ucfirst($this->scan_trigger ?? 'manual'),
        };
    }

    /**
     * Get scan source information (scheduled scan name or manual)
     */
    public function getScanSourceAttribute(): string
    {
        if ($this->scheduled_scan_id && $this->scheduledScan) {
            return $this->scheduledScan->name;
        }
        
        return $this->scan_trigger_label;
    }

    /**
     * Get formatted date time
     */
    public function getFormattedDateAttribute(): string
    {
        return $this->created_at->format('M j, Y \a\t g:i A');
    }

    /**
     * Get relative time (e.g., "2 hours ago")
     */
    public function getRelativeTimeAttribute(): string
    {
        return $this->created_at->diffForHumans();
    }
}
