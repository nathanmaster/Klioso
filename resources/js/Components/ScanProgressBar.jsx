import React from 'react';

/**
 * Reusable progress bar component for scans
 * Based on the WordPress scanner implementation
 */
export default function ScanProgressBar({ 
    progress = { percent: 0, stage: '', timeLeft: null }, 
    isScanning = false,
    showStage = true,
    showTimeLeft = true,
    className = '',
    size = 'default' // 'small', 'default', 'large'
}) {
    const sizeClasses = {
        small: 'h-2',
        default: 'h-3',
        large: 'h-4'
    };

    const textSizeClasses = {
        small: 'text-xs',
        default: 'text-sm',
        large: 'text-base'
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return null;
        
        if (seconds < 60) {
            return `${Math.round(seconds)}s`;
        } else {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = Math.round(seconds % 60);
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Progress Bar */}
            <div className={`w-full bg-gray-200 dark:bg-gray-700 rounded-full ${sizeClasses[size]} overflow-hidden`}>
                <div 
                    className="bg-blue-500 dark:bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress.percent || 0, 100)}%` }}
                />
            </div>

            {/* Progress Info */}
            <div className={`flex items-center justify-between ${textSizeClasses[size]} text-gray-600 dark:text-gray-400`}>
                <div className="flex items-center space-x-2">
                    {isScanning && (
                        <div className="animate-spin">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle 
                                    className="opacity-25" 
                                    cx="12" 
                                    cy="12" 
                                    r="10" 
                                    stroke="currentColor" 
                                    strokeWidth="4"
                                />
                                <path 
                                    className="opacity-75" 
                                    fill="currentColor" 
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                />
                            </svg>
                        </div>
                    )}
                    
                    <span className="font-medium">
                        {Math.round(progress.percent || 0)}%
                    </span>
                    
                    {showStage && progress.stage && (
                        <span className="text-gray-500 dark:text-gray-400">
                            - {progress.stage}
                        </span>
                    )}
                </div>

                {showTimeLeft && progress.timeLeft && (
                    <span className="text-gray-500 dark:text-gray-400">
                        {formatTime(progress.timeLeft)} remaining
                    </span>
                )}
            </div>
        </div>
    );
}
