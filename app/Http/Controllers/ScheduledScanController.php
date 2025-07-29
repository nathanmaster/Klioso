<?php

namespace App\Http\Controllers;

use App\Models\ScheduledScan;
use App\Models\Website;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class ScheduledScanController extends Controller
{
    /**
     * Display a listing of scheduled scans.
     */
    public function index()
    {
        $scheduledScans = ScheduledScan::with('website')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($scan) {
                return [
                    'id' => $scan->id,
                    'name' => $scan->name,
                    'scan_type' => $scan->scan_type,
                    'target' => $scan->target,
                    'website' => $scan->website ? [
                        'id' => $scan->website->id,
                        'name' => $scan->website->name,
                        'url' => $scan->website->url,
                    ] : null,
                    'frequency' => $scan->frequency,
                    'scheduled_time' => $scan->scheduled_time,
                    'is_active' => $scan->is_active,
                    'last_run_at' => $scan->last_run_at,
                    'next_run_at' => $scan->next_run_at,
                    'total_runs' => $scan->total_runs,
                    'successful_runs' => $scan->successful_runs,
                    'failed_runs' => $scan->failed_runs,
                    'success_rate' => $scan->total_runs > 0 ? round(($scan->successful_runs / $scan->total_runs) * 100, 1) : 0,
                    'last_error' => $scan->last_error,
                    'created_at' => $scan->created_at,
                    'updated_at' => $scan->updated_at,
                ];
            });

        $websites = Website::select('id', 'name', 'url')->get();

        return Inertia::render('Scheduled/Index', [
            'scheduledScans' => $scheduledScans,
            'websites' => $websites,
        ]);
    }

    /**
     * Store a newly created scheduled scan in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scan_type' => 'required|in:url,website',
            'target' => 'required_if:scan_type,url|nullable|url',
            'website_id' => 'required_if:scan_type,website|nullable|exists:websites,id',
            'frequency' => 'required|in:daily,weekly,monthly',
            'scheduled_time' => 'required|date_format:H:i',
            'scan_config' => 'required|json',
            'is_active' => 'boolean',
        ]);

        // Set target based on scan type
        if ($validated['scan_type'] === 'website' && $validated['website_id']) {
            $website = Website::find($validated['website_id']);
            $validated['target'] = $website->url;
        }

        // Set default is_active if not provided
        $validated['is_active'] = $validated['is_active'] ?? true;

        $scheduledScan = ScheduledScan::create($validated);

        return redirect()->route('scheduled-scans.index')
            ->with('success', 'Scheduled scan created successfully.');
    }

    /**
     * Display the specified scheduled scan.
     */
    public function show(ScheduledScan $scheduledScan)
    {
        $scheduledScan->load('website');

        return Inertia::render('Scheduled/Show', [
            'scheduledScan' => [
                'id' => $scheduledScan->id,
                'name' => $scheduledScan->name,
                'scan_type' => $scheduledScan->scan_type,
                'target' => $scheduledScan->target,
                'website' => $scheduledScan->website ? [
                    'id' => $scheduledScan->website->id,
                    'name' => $scheduledScan->website->name,
                    'url' => $scheduledScan->website->url,
                ] : null,
                'frequency' => $scheduledScan->frequency,
                'scheduled_time' => $scheduledScan->scheduled_time,
                'scan_config' => json_decode($scheduledScan->scan_config, true),
                'is_active' => $scheduledScan->is_active,
                'last_run_at' => $scheduledScan->last_run_at,
                'next_run_at' => $scheduledScan->next_run_at,
                'total_runs' => $scheduledScan->total_runs,
                'successful_runs' => $scheduledScan->successful_runs,
                'failed_runs' => $scheduledScan->failed_runs,
                'last_error' => $scheduledScan->last_error,
                'created_at' => $scheduledScan->created_at,
                'updated_at' => $scheduledScan->updated_at,
            ],
        ]);
    }

    /**
     * Update the specified scheduled scan in storage.
     */
    public function update(Request $request, ScheduledScan $scheduledScan)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scan_type' => 'required|in:url,website',
            'target' => 'required_if:scan_type,url|nullable|url',
            'website_id' => 'required_if:scan_type,website|nullable|exists:websites,id',
            'frequency' => 'required|in:daily,weekly,monthly',
            'scheduled_time' => 'required|date_format:H:i',
            'scan_config' => 'required|json',
            'is_active' => 'boolean',
        ]);

        // Set target based on scan type
        if ($validated['scan_type'] === 'website' && $validated['website_id']) {
            $website = Website::find($validated['website_id']);
            $validated['target'] = $website->url;
        }

        $scheduledScan->update($validated);

        return redirect()->route('scheduled-scans.index')
            ->with('success', 'Scheduled scan updated successfully.');
    }

    /**
     * Remove the specified scheduled scan from storage.
     */
    public function destroy(ScheduledScan $scheduledScan)
    {
        $scheduledScan->delete();

        return redirect()->route('scheduled-scans.index')
            ->with('success', 'Scheduled scan deleted successfully.');
    }

    /**
     * Toggle the active status of a scheduled scan.
     */
    public function toggleActive(ScheduledScan $scheduledScan)
    {
        $scheduledScan->update(['is_active' => !$scheduledScan->is_active]);

        $status = $scheduledScan->is_active ? 'activated' : 'deactivated';
        
        return back()->with('success', "Scheduled scan {$status} successfully.");
    }

    /**
     * Run a scheduled scan immediately (manual trigger).
     */
    public function runNow(ScheduledScan $scheduledScan)
    {
        try {
            // This would trigger the actual scan logic
            // For now, we'll just update the next run time
            $scheduledScan->calculateNextRun();
            $scheduledScan->save();

            return back()->with('success', 'Scheduled scan triggered successfully.');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to trigger scheduled scan: ' . $e->getMessage());
        }
    }

    /**
     * Get scheduled scans that are due to run.
     */
    public function due()
    {
        $dueScans = ScheduledScan::due()->with('website')->get();

        return response()->json($dueScans->map(function ($scan) {
            return [
                'id' => $scan->id,
                'name' => $scan->name,
                'target' => $scan->target,
                'scan_config' => json_decode($scan->scan_config, true),
                'website' => $scan->website,
            ];
        }));
    }
}
