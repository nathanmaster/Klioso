<?php

namespace App\Services;

class FeatureService
{
    /**
     * Check if a feature is enabled
     *
     * @param string $feature Feature path (e.g., 'scanner.wordpress_scanner')
     * @return bool
     */
    public static function enabled(string $feature): bool
    {
        $keys = explode('.', $feature);
        $config = config('features');
        
        foreach ($keys as $key) {
            if (!isset($config[$key])) {
                return false;
            }
            $config = $config[$key];
        }
        
        return (bool) $config;
    }

    /**
     * Check if a feature is disabled
     *
     * @param string $feature Feature path
     * @return bool
     */
    public static function disabled(string $feature): bool
    {
        return !self::enabled($feature);
    }

    /**
     * Get all features in a category
     *
     * @param string $category
     * @return array
     */
    public static function getCategory(string $category): array
    {
        return config("features.{$category}", []);
    }

    /**
     * Check if any feature in a category is enabled
     *
     * @param string $category
     * @return bool
     */
    public static function anyCategoryEnabled(string $category): bool
    {
        $features = self::getCategory($category);
        return !empty(array_filter($features));
    }

    /**
     * Get all enabled features
     *
     * @return array
     */
    public static function getAllEnabled(): array
    {
        $config = config('features');
        $enabled = [];
        
        foreach ($config as $category => $features) {
            foreach ($features as $feature => $isEnabled) {
                if ($isEnabled) {
                    $enabled[] = "{$category}.{$feature}";
                }
            }
        }
        
        return $enabled;
    }

    /**
     * Get features for frontend (React)
     *
     * @return array
     */
    public static function getForFrontend(): array
    {
        $config = config('features');
        $frontend = [];
        
        foreach ($config as $category => $features) {
            foreach ($features as $feature => $isEnabled) {
                $frontend["{$category}_{$feature}"] = $isEnabled;
            }
        }
        
        return $frontend;
    }
}