<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ScanHistory extends Model
{
    protected $fillable = [
        'scan_type',
        'target',
        'website_id',
        'scan_results',
        'scan_summary',
        'plugins_found',
        'themes_found',
        'vulnerabilities_found',
        'auto_sync_enabled',
        'plugins_added_to_db',
        'status',
        'error_message',
        'scan_duration_ms'
    ];

    protected $casts = [
        'scan_results' => 'array',
        'scan_summary' => 'array',
        'auto_sync_enabled' => 'boolean',
        'plugins_found' => 'integer',
        'themes_found' => 'integer',
        'vulnerabilities_found' => 'integer',
        'plugins_added_to_db' => 'integer',
        'scan_duration_ms' => 'integer',
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
}
