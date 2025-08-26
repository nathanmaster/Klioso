/**
 * Error Handling and Logging Utilities
 * Provides consistent error handling, logging, and analytics integration
 */

import React from 'react';

// Error logging levels
export const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug'
};

/**
 * Enhanced console logging with context and analytics integration
 */
export class Logger {
    static log(level, message, context = {}, error = null) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            context,
            url: window.location.href,
            userAgent: navigator.userAgent,
            ...(error && {
                error: {
                    name: error.name,
                    message: error.message,
                    stack: error.stack
                }
            })
        };

        // Console logging with better formatting
        const consoleMethod = console[level] || console.log;
        consoleMethod(
            `%c[${timestamp}] ${level.toUpperCase()}: ${message}`,
            this.getConsoleStyle(level),
            context,
            ...(error ? [error] : [])
        );

        // Send to analytics/monitoring service if configured
        this.sendToAnalytics(logEntry);

        // Store in session for debugging
        this.storeInSession(logEntry);
    }

    static getConsoleStyle(level) {
        const styles = {
            error: 'color: #ef4444; font-weight: bold;',
            warn: 'color: #f59e0b; font-weight: bold;',
            info: 'color: #3b82f6; font-weight: bold;',
            debug: 'color: #6b7280;'
        };
        return styles[level] || '';
    }

    static sendToAnalytics(logEntry) {
        // Only send errors and warnings to analytics to avoid spam
        if (logEntry.level === LOG_LEVELS.ERROR || logEntry.level === LOG_LEVELS.WARN) {
            try {
                // Send to backend analytics endpoint
                fetch('/api/analytics/error', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
                    },
                    body: JSON.stringify(logEntry)
                }).catch(err => {
                    console.warn('Failed to send error to analytics:', err);
                });
            } catch (err) {
                console.warn('Analytics logging failed:', err);
            }
        }
    }

    static storeInSession(logEntry) {
        try {
            const logs = JSON.parse(sessionStorage.getItem('app_logs') || '[]');
            logs.push(logEntry);
            
            // Keep only last 100 logs
            if (logs.length > 100) {
                logs.splice(0, logs.length - 100);
            }
            
            sessionStorage.setItem('app_logs', JSON.stringify(logs));
        } catch (err) {
            console.warn('Failed to store log in session:', err);
        }
    }

    static error(message, context = {}, error = null) {
        this.log(LOG_LEVELS.ERROR, message, context, error);
    }

    static warn(message, context = {}) {
        this.log(LOG_LEVELS.WARN, message, context);
    }

    static info(message, context = {}) {
        this.log(LOG_LEVELS.INFO, message, context);
    }

    static debug(message, context = {}) {
        this.log(LOG_LEVELS.DEBUG, message, context);
    }
}

/**
 * Safe prop access with error logging
 */
export const safeGet = (obj, path, defaultValue = null, context = '') => {
    try {
        const keys = path.split('.');
        let current = obj;
        
        for (const key of keys) {
            if (current === null || current === undefined) {
                Logger.warn(`Safe access failed: ${path} is undefined`, {
                    context,
                    attemptedPath: path,
                    failedAt: key,
                    objectType: typeof obj
                });
                return defaultValue;
            }
            current = current[key];
        }
        
        return current !== undefined ? current : defaultValue;
    } catch (error) {
        Logger.error(`Error accessing path ${path}`, {
            context,
            attemptedPath: path,
            objectType: typeof obj
        }, error);
        return defaultValue;
    }
};

/**
 * React Error Boundary Component
 */
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        Logger.error('React Error Boundary caught an error', {
            component: this.props.componentName || 'Unknown',
            errorInfo
        }, error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                    <div className="max-w-md w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="mt-4 text-center">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                Something went wrong
                            </h3>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                We've encountered an error. Please refresh the page or contact support if the problem persists.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Refresh Page
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Global error handler for unhandled promise rejections and errors
 */
export const setupGlobalErrorHandling = () => {
    window.addEventListener('error', (event) => {
        Logger.error('Uncaught JavaScript error', {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        }, event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
        Logger.error('Unhandled promise rejection', {
            reason: event.reason
        });
    });
};

export default {
    Logger,
    safeGet,
    ErrorBoundary,
    setupGlobalErrorHandling,
    LOG_LEVELS
};
