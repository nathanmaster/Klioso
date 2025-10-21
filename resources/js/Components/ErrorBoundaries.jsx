import React from 'react';
import { Logger } from '@/Utils/errorHandler.jsx';
import toast from 'react-hot-toast';

/**
 * Specialized Error Boundary for Form Components
 * Provides form-specific error handling and recovery options
 */
export class FormErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            errorId: null 
        };
    }

    static getDerivedStateFromError(error) {
        const errorId = `form-error-${Date.now()}`;
        return { 
            hasError: true, 
            error,
            errorId 
        };
    }

    componentDidCatch(error, errorInfo) {
        Logger.error('Form Error Boundary caught an error', {
            component: this.props.componentName || 'Form',
            formId: this.props.formId,
            errorInfo,
            userAction: this.props.userAction || 'form submission'
        }, error);

        // Show user-friendly toast notification
        toast.error('Form error occurred. Please try again or refresh the page.', {
            duration: 5000,
            id: this.state.errorId
        });
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null, errorId: null });
        
        // Call optional retry callback
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <div className="ml-3 flex-1">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Form Error
                            </h3>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                Something went wrong with the form. Your data may not have been saved.
                            </p>
                            <div className="mt-3 flex space-x-3">
                                <button
                                    onClick={this.handleRetry}
                                    className="bg-red-100 hover:bg-red-200 dark:bg-red-800 dark:hover:bg-red-700 text-red-800 dark:text-red-200 px-3 py-1 rounded text-sm font-medium"
                                >
                                    Try Again
                                </button>
                                <button
                                    onClick={() => window.location.reload()}
                                    className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-1 rounded text-sm font-medium"
                                >
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Specialized Error Boundary for Table/List Components
 * Provides table-specific error handling while preserving other page functionality
 */
export class TableErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            hasError: false, 
            error: null,
            retryCount: 0 
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        Logger.error('Table Error Boundary caught an error', {
            component: this.props.componentName || 'Table',
            tableType: this.props.tableType,
            dataLength: Array.isArray(this.props.data) ? this.props.data.length : 'unknown',
            errorInfo,
            retryCount: this.state.retryCount
        }, error);

        // Show toast notification for table errors
        toast.error('Table loading failed. Data may be temporarily unavailable.', {
            duration: 4000
        });
    }

    handleRetry = () => {
        this.setState(prevState => ({ 
            hasError: false, 
            error: null,
            retryCount: prevState.retryCount + 1
        }));
        
        // Call optional retry callback
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                        <svg className="h-8 w-8 text-yellow-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                            Unable to Load {this.props.tableType || 'Data'}
                        </h3>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
                            There was an error loading the table data. This might be temporary.
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={this.handleRetry}
                                className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-4 py-2 rounded text-sm font-medium"
                            >
                                Retry Loading {this.state.retryCount > 0 && `(${this.state.retryCount + 1})`}
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded text-sm font-medium"
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
 * Specialized Error Boundary for Chart/Visualization Components
 * Provides graceful degradation for data visualization errors
 */
export class ChartErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        Logger.error('Chart Error Boundary caught an error', {
            component: this.props.componentName || 'Chart',
            chartType: this.props.chartType,
            dataPoints: this.props.dataPoints || 'unknown',
            errorInfo
        }, error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center">
                        <svg className="h-8 w-8 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Chart Unavailable
                        </h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {this.props.chartType || 'Visualization'} could not be loaded
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export { FormErrorBoundary, TableErrorBoundary, ChartErrorBoundary };
