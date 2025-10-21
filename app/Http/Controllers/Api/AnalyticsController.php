<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class AnalyticsController extends Controller
{
    /**
     * Log frontend errors for analytics and monitoring
     */
    public function logError(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'level' => 'required|in:error,warn,info,debug',
            'message' => 'required|string|max:1000',
            'timestamp' => 'required|date',
            'url' => 'required|string|max:2000',
            'userAgent' => 'nullable|string|max:1000',
            'context' => 'nullable|array',
            'error' => 'nullable|array',
            'error.name' => 'nullable|string|max:255',
            'error.message' => 'nullable|string|max:1000',
            'error.stack' => 'nullable|string|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid error data',
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Add user context if authenticated
        if (auth()->check()) {
            $data['user_id'] = auth()->id();
            $data['user_email'] = auth()->user()->email;
        }

        // Add server context
        $data['server_context'] = [
            'ip' => $request->ip(),
            'session_id' => $request->session()->getId(),
            'request_id' => $request->header('X-Request-ID'),
            'timestamp_server' => now()->toISOString(),
        ];

        try {
            // Log to Laravel logs
            $logLevel = $data['level'] === 'warn' ? 'warning' : $data['level'];
            Log::$logLevel('Frontend Error', $data);

            // Here you could also send to external services like:
            // - Sentry
            // - LogRocket
            // - DataDog
            // - Custom analytics endpoint
            
            // Store in database for analytics if needed
            $this->storeErrorForAnalytics($data);

            return response()->json([
                'success' => true,
                'message' => 'Error logged successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to log frontend error', [
                'original_error' => $data,
                'logging_error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to log error'
            ], 500);
        }
    }

    /**
     * Store error data for analytics purposes
     */
    private function storeErrorForAnalytics($data)
    {
        // You can implement database storage here
        // For now, we'll just log it
        Log::channel('analytics')->info('Frontend Error Analytics', [
            'level' => $data['level'],
            'message' => $data['message'],
            'url' => $data['url'],
            'user_id' => $data['user_id'] ?? null,
            'context' => $data['context'] ?? [],
            'timestamp' => $data['timestamp'],
        ]);
    }

    /**
     * Get error analytics data (for admin dashboard)
     */
    public function getErrorAnalytics(Request $request)
    {
        // This would typically query a database table with stored errors
        // For now, return a basic response
        return response()->json([
            'success' => true,
            'data' => [
                'total_errors' => 0,
                'error_rate' => 0,
                'top_errors' => [],
                'error_trends' => []
            ]
        ]);
    }

    /**
     * Log page views and user interactions
     */
    public function logPageView(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'url' => 'required|string|max:2000',
            'title' => 'nullable|string|max:255',
            'referrer' => 'nullable|string|max:2000',
            'load_time' => 'nullable|numeric',
            'user_agent' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $data = $validator->validated();
        
        // Add user context
        if (auth()->check()) {
            $data['user_id'] = auth()->id();
        }

        $data['ip'] = $request->ip();
        $data['timestamp'] = now();

        // Log page view
        Log::channel('analytics')->info('Page View', $data);

        return response()->json(['success' => true]);
    }
}
