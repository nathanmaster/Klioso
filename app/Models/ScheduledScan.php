<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ScheduledScan extends Model
{
    protected $fillable = [
        'name',
        'scan_type',
        'target',
        'website_id',
        'frequency',
        'scheduled_time',
        'scan_config',
        'is_active',
        'last_run_at',
        'next_run_at',
        'total_runs',
        'successful_runs',
        'failed_runs',
        'last_error',
    ];

    protected $casts = [
        'scan_config' => 'array',
        'is_active' => 'boolean',
        'scheduled_time' => 'datetime:H:i:s',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime',
        'total_runs' => 'integer',
        'successful_runs' => 'integer',
        'failed_runs' => 'integer',
    ];

    /**
     * Get the website that this scheduled scan belongs to.
     */
    public function website(): BelongsTo
    {
        return $this->belongsTo(Website::class);
    }

    /**
     * Get the scan history records for this scheduled scan.
     */
    public function scanHistory(): HasMany
    {
        return $this->hasMany(ScanHistory::class, 'scheduled_scan_id');
    }

    /**
     * Scope for active schedules only
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for schedules that are due to run
     */
    public function scopeDue($query)
    {
        return $query->active()
            ->where('next_run_at', '<=', now())
            ->whereNotNull('next_run_at');
    }

    /**
     * Calculate the next run time based on frequency
     */
    public function calculateNextRun(): Carbon
    {
        $baseTime = now()->setTimeFromTimeString($this->scheduled_time->format('H:i:s'));
        
        // If the scheduled time for today has passed, start from tomorrow
        if ($baseTime->isPast()) {
            $baseTime->addDay();
        }

        switch ($this->frequency) {
            case 'daily':
                return $baseTime;
            case 'weekly':
                return $baseTime->addWeek();
            case 'monthly':
                return $baseTime->addMonth();
            default:
                return $baseTime;
        }
    }

    /**
     * Update next run time after execution
     */
    public function updateNextRun(): void
    {
        $this->update([
            'next_run_at' => $this->calculateNextRun(),
        ]);
    }

    /**
     * Mark scan as successful
     */
    public function markSuccessful(): void
    {
        $this->increment('total_runs');
        $this->increment('successful_runs');
        $this->update([
            'last_run_at' => now(),
            'last_error' => null,
        ]);
        $this->updateNextRun();
    }

    /**
     * Mark scan as failed
     */
    public function markFailed(string $error): void
    {
        $this->increment('total_runs');
        $this->increment('failed_runs');
        $this->update([
            'last_run_at' => now(),
            'last_error' => $error,
        ]);
        $this->updateNextRun();
    }

    /**
     * Get success rate percentage
     */
    public function getSuccessRateAttribute(): float
    {
        if ($this->total_runs === 0) {
            return 0;
        }
        
        return round(($this->successful_runs / $this->total_runs) * 100, 1);
    }

    /**
     * Get human readable frequency
     */
    public function getFrequencyLabelAttribute(): string
    {
        return match($this->frequency) {
            'daily' => 'Daily',
            'weekly' => 'Weekly',
            'monthly' => 'Monthly',
            default => ucfirst($this->frequency),
        };
    }

    /**
     * Get next run time in human readable format
     */
    public function getNextRunHumanAttribute(): string
    {
        if (!$this->next_run_at) {
            return 'Not scheduled';
        }

        if ($this->next_run_at->isPast()) {
            return 'Overdue';
        }

        return $this->next_run_at->diffForHumans();
    }
}
