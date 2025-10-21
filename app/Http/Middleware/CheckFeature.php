<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\FeatureService;
use Symfony\Component\HttpFoundation\Response;

class CheckFeature
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $feature): Response
    {
        if (FeatureService::disabled($feature)) {
            if ($request->expectsJson()) {
                return response()->json([
                    'message' => 'This feature is currently disabled.',
                    'feature' => $feature
                ], 404);
            }
            
            abort(404, 'This feature is currently disabled.');
        }

        return $next($request);
    }
}