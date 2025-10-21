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
            return this.props.fallback || 'Something went wrong. Please refresh the page.';
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
