import { usePage } from '@inertiajs/react';

/**
 * React hook to check feature flags
 * @returns {Object} Feature checking functions
 */
export function useFeatures() {
    const { features } = usePage().props;

    /**
     * Check if a feature is enabled
     * @param {string} feature - Feature name (e.g., 'scanner_wordpress_scanner')
     * @returns {boolean}
     */
    const isEnabled = (feature) => {
        return Boolean(features?.[feature]);
    };

    /**
     * Check if a feature is disabled
     * @param {string} feature - Feature name
     * @returns {boolean}
     */
    const isDisabled = (feature) => {
        return !isEnabled(feature);
    };

    /**
     * Check if any features in a category are enabled
     * @param {string} category - Category prefix (e.g., 'scanner')
     * @returns {boolean}
     */
    const anyCategoryEnabled = (category) => {
        if (!features) return false;
        
        return Object.keys(features).some(key => 
            key.startsWith(`${category}_`) && features[key]
        );
    };

    /**
     * Get all enabled features in a category
     * @param {string} category - Category prefix
     * @returns {Object}
     */
    const getCategoryFeatures = (category) => {
        if (!features) return {};
        
        return Object.keys(features)
            .filter(key => key.startsWith(`${category}_`))
            .reduce((acc, key) => {
                acc[key] = features[key];
                return acc;
            }, {});
    };

    return {
        isEnabled,
        isDisabled,
        anyCategoryEnabled,
        getCategoryFeatures,
        features: features || {}
    };
}