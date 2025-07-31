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
        'status',
        'started_at',
        'current_stage',
        'progress_percent',
        'last_run_at',
        'next_run_at',
        'success_count',
        'failure_count',
        'last_error',
    ];

    protected $casts = [
        'scan_config' => 'array',
        'is_active' => 'boolean',
        'scheduled_time' => 'datetime:H:i:s',
        'started_at' => 'datetime',
        'last_run_at' => 'datetime',
        'next_run_at' => 'datetime',
        'success_count' => 'integer',
        'failure_count' => 'integer',
        'progress_percent' => 'integer',
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
        $this->increment('success_count');
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
        $this->increment('failure_count');
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
        $totalRuns = $this->success_count + $this->failure_count;
        if ($totalRuns === 0) {
            return 0;
        }
        
        return round(($this->success_count / $totalRuns) * 100, 1);
    }

    /**
     * Get total runs count
     */
    public function getTotalRunsAttribute(): int
    {
        return $this->success_count + $this->failure_count;
    }

    /**
     * Get successful runs count (alias for consistency)
     */
    public function getSuccessfulRunsAttribute(): int
    {
        return $this->success_count;
    }

    /**
     * Get failed runs count (alias for consistency)
     */
    public function getFailedRunsAttribute(): int
    {
        return $this->failure_count;
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

    /**
     * Check if the scan is currently running
     */
    public function isRunning(): bool
    {
        return $this->status === 'running';
    }

    /**
     * Check if the scan is queued
     */
    public function isQueued(): bool
    {
        return $this->status === 'queued';
    }

    /**
     * Check if the scan is busy (running or queued)
     */
    public function isBusy(): bool
    {
        return in_array($this->status, ['running', 'queued']);
    }

    /**
     * Start the scan
     */
    public function startScan(string $stage = 'Initializing scan...'): void
    {
        $this->update([
            'status' => 'running',
            'started_at' => now(),
            'current_stage' => $stage,
            'progress_percent' => 0,
            'last_error' => null,
        ]);
    }

    /**
     * Update scan progress
     */
    public function updateProgress(int $percent, string $stage): void
    {
        $this->update([
            'progress_percent' => min(100, max(0, $percent)),
            'current_stage' => $stage,
        ]);
    }

    /**
     * Complete the scan successfully
     */
    public function completeScan(): void
    {
        $this->update([
            'status' => 'completed',
            'progress_percent' => 100,
            'current_stage' => 'Scan completed successfully',
            'last_run_at' => now(),
            'success_count' => $this->success_count + 1,
        ]);

        // Calculate next run time
        $this->calculateNextRun();
        $this->update(['status' => 'idle']);
    }

    /**
     * Fail the scan with error
     */
    public function failScan(string $error): void
    {
        $this->update([
            'status' => 'failed',
            'current_stage' => 'Scan failed',
            'last_error' => $error,
            'last_run_at' => now(),
            'failure_count' => $this->failure_count + 1,
        ]);

        // Calculate next run time even for failed scans
        $this->calculateNextRun();
        $this->update(['status' => 'idle']);
    }

    /**
     * Queue the scan
     */
    public function queueScan(): void
    {
        $this->update([
            'status' => 'queued',
            'current_stage' => 'Waiting in queue...',
            'progress_percent' => 0,
        ]);
    }

    /**
     * Reset any stuck progress (scans that have been running too long)
     */
    public function resetStuckProgress(): void
    {
        // If a scan has been running for more than 30 minutes, consider it stuck
        if ($this->status === 'running' && $this->started_at && $this->started_at->diffInMinutes(now()) > 30) {
            $this->update([
                'status' => 'failed',
                'current_stage' => 'Scan timed out (over 30 minutes)',
                'last_error' => 'Scan exceeded maximum runtime and was automatically stopped',
                'progress_percent' => 0,
            ]);
        }
        
        // If queued for more than 1 hour, reset to idle
        if ($this->status === 'queued' && $this->updated_at->diffInHours(now()) > 1) {
            $this->update([
                'status' => 'idle',
                'current_stage' => null,
                'progress_percent' => 0,
            ]);
        }
    }

    /**
     * Get a comprehensive status for UI display
     */
    public function getDetailedStatusAttribute(): array
    {
        return [
            'status' => $this->status,
            'label' => $this->status_label,
            'color' => $this->status_color,
            'is_running' => $this->isRunning(),
            'is_queued' => $this->isQueued(),
            'is_busy' => $this->isBusy(),
            'progress_percent' => $this->progress_percent,
            'current_stage' => $this->current_stage,
            'started_at' => $this->started_at,
            'can_run' => $this->is_active && !$this->isBusy(),
        ];
    }

    /**
     * Get comprehensive stats for the UI
     */
    public function getStatsAttribute(): array
    {
        return [
            'total_runs' => $this->total_runs,
            'successful_runs' => $this->successful_runs,
            'failed_runs' => $this->failed_runs,
            'success_rate' => $this->success_rate,
            'last_run_at' => $this->last_run_at,
            'next_run_at' => $this->next_run_at,
            'last_error' => $this->last_error,
        ];
    }

    /**
     * Get status badge color
     */
    public function getStatusColorAttribute(): string
    {
        return match($this->status) {
            'idle' => $this->is_active ? 'green' : 'gray',
            'queued' => 'yellow',
            'running' => 'blue',
            'completed' => 'green',
            'failed' => 'red',
            default => 'gray',
        };
    }

    /**
     * Get status display text
     */
    public function getStatusLabelAttribute(): string
    {
        return match($this->status) {
            'idle' => $this->is_active ? 'Active' : 'Inactive',
            'queued' => 'Queued',
            'running' => 'Running',
            'completed' => 'Completed',
            'failed' => 'Failed',
            default => ucfirst($this->status),
        };
    }
}
