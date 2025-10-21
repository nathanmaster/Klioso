import React from 'react';
import { useFeatures } from '@/Hooks/useFeatures';

/**
 * Component to conditionally render content based on feature flags
 * 
 * @param {Object} props
 * @param {string} props.feature - Feature flag name to check
 * @param {React.ReactNode} props.children - Content to render if feature is enabled
 * @param {React.ReactNode} props.fallback - Content to render if feature is disabled
 * @param {boolean} props.invert - If true, renders children when feature is disabled
 * @returns {React.ReactElement|null}
 */
export default function FeatureWrapper({ 
    feature, 
    children, 
    fallback = null, 
    invert = false 
}) {
    const { isEnabled } = useFeatures();
    
    const shouldRender = invert ? !isEnabled(feature) : isEnabled(feature);
    
    return shouldRender ? children : fallback;
}

/**
 * HOC to wrap components with feature flag checking
 * 
 * @param {React.Component} WrappedComponent 
 * @param {string} feature - Feature flag name
 * @param {React.ReactNode} fallback - Fallback component if feature is disabled
 * @returns {React.Component}
 */
export function withFeature(WrappedComponent, feature, fallback = null) {
    return function FeatureGuard(props) {
        return (
            <FeatureWrapper feature={feature} fallback={fallback}>
                <WrappedComponent {...props} />
            </FeatureWrapper>
        );
    };
}