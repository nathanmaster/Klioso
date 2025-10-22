<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Website;
use App\Services\HealthScoreService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class HealthScoreController extends Controller
{
    protected HealthScoreService $healthScoreService;

    public function __construct(HealthScoreService $healthScoreService)
    {
        $this->healthScoreService = $healthScoreService;
    }

    /**
     * Get health score for a specific website
     */
    public function website(Website $website): JsonResponse
    {
        try {
            $healthData = $this->healthScoreService->calculateHealthScore($website);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'website_id' => $website->id,
                    'website_name' => $website->name,
                    'website_url' => $website->url,
                    'health_data' => $healthData,
                    'calculated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate health score',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get health scores for all websites
     */
    public function all(): JsonResponse
    {
        try {
            $websites = Website::with('latestAnalytics')->get();
            $healthScores = [];
            
            foreach ($websites as $website) {
                $healthData = $this->healthScoreService->calculateHealthScore($website);
                $healthScores[] = [
                    'website_id' => $website->id,
                    'website_name' => $website->name,
                    'website_url' => $website->url,
                    'overall_score' => $healthData['overall_score'],
                    'grade' => $healthData['grade'],
                    'status' => $healthData['status'],
                    'critical_issues' => array_filter($healthData['issues'], fn($issue) => $issue['severity'] === 'critical'),
                ];
            }

            // Calculate summary statistics
            $scores = array_column($healthScores, 'overall_score');
            $averageScore = count($scores) > 0 ? round(array_sum($scores) / count($scores)) : 0;
            
            $distribution = [
                'excellent' => count(array_filter($scores, fn($score) => $score >= 90)),
                'good' => count(array_filter($scores, fn($score) => $score >= 80 && $score < 90)),
                'fair' => count(array_filter($scores, fn($score) => $score >= 60 && $score < 80)),
                'poor' => count(array_filter($scores, fn($score) => $score < 60)),
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'health_scores' => $healthScores,
                    'summary' => [
                        'total_websites' => count($healthScores),
                        'average_score' => $averageScore,
                        'distribution' => $distribution,
                        'healthy_websites' => $distribution['excellent'] + $distribution['good'],
                        'critical_websites' => $distribution['poor'],
                    ],
                    'calculated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to calculate health scores',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get health score trends for a website
     */
    public function trends(Website $website, Request $request): JsonResponse
    {
        try {
            $days = $request->get('days', 30);
            $startDate = now()->subDays($days);
            
            // Get historical analytics data
            $analytics = $website->analytics()
                ->where('scanned_at', '>=', $startDate)
                ->orderBy('scanned_at')
                ->get();
            
            $trends = [];
            foreach ($analytics as $analytic) {
                // Calculate health score for this point in time
                $mockWebsite = clone $website;
                $mockWebsite->setRelation('latestAnalytics', $analytic);
                
                $healthData = $this->healthScoreService->calculateHealthScore($mockWebsite);
                
                $trends[] = [
                    'date' => $analytic->scanned_at->format('Y-m-d'),
                    'overall_score' => $healthData['overall_score'],
                    'availability' => $healthData['components']['availability']['score'],
                    'performance' => $healthData['components']['performance']['score'],
                    'security' => $healthData['components']['security']['score'],
                    'maintenance' => $healthData['components']['maintenance']['score'],
                    'seo' => $healthData['components']['seo']['score'],
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'website_id' => $website->id,
                    'website_name' => $website->name,
                    'period_days' => $days,
                    'trends' => $trends,
                    'calculated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get health score trends',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get dashboard summary for health scores
     */
    public function dashboard(): JsonResponse
    {
        try {
            $websites = Website::with('latestAnalytics')->get();
            $healthScores = [];
            $totalHealthScore = 0;
            $criticalIssuesCount = 0;
            
            foreach ($websites as $website) {
                $healthData = $this->healthScoreService->calculateHealthScore($website);
                $healthScores[] = $healthData;
                $totalHealthScore += $healthData['overall_score'];
                
                // Count critical issues
                $criticalIssues = array_filter($healthData['issues'], fn($issue) => $issue['severity'] === 'critical');
                $criticalIssuesCount += count($criticalIssues);
            }
            
            $averageHealthScore = $websites->count() > 0 ? round($totalHealthScore / $websites->count()) : 0;
            
            // Calculate distribution
            $scores = array_column($healthScores, 'overall_score');
            $distribution = [
                'excellent' => count(array_filter($scores, fn($score) => $score >= 90)),
                'good' => count(array_filter($scores, fn($score) => $score >= 80 && $score < 90)),
                'fair' => count(array_filter($scores, fn($score) => $score >= 60 && $score < 80)),
                'poor' => count(array_filter($scores, fn($score) => $score < 60)),
            ];
            
            // Get top recommendations across all websites
            $allRecommendations = [];
            foreach ($healthScores as $healthData) {
                $allRecommendations = array_merge($allRecommendations, $healthData['recommendations']);
            }
            $topRecommendations = array_slice(array_unique($allRecommendations), 0, 5);

            return response()->json([
                'success' => true,
                'data' => [
                    'summary' => [
                        'total_websites' => $websites->count(),
                        'average_health_score' => $averageHealthScore,
                        'healthy_websites' => $distribution['excellent'] + $distribution['good'],
                        'critical_websites' => $distribution['poor'],
                        'critical_issues_count' => $criticalIssuesCount,
                    ],
                    'distribution' => $distribution,
                    'top_recommendations' => $topRecommendations,
                    'calculated_at' => now()->toISOString(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get dashboard data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}