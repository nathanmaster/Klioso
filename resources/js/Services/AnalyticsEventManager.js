// import Echo from 'laravel-echo';

class AnalyticsEventManager {
    constructor() {
        this.listeners = new Map();
        this.setupEcho();
    }

    setupEcho() {
        // Only set up Echo if it's available and we're not in development
        if (typeof window !== 'undefined' && window.Echo) {
            this.echo = window.Echo;
        }
    }

    /**
     * Subscribe to analytics updates for a specific timeframe
     */
    subscribeToAnalyticsUpdates(callback, timeRange = '7d') {
        const channelName = `analytics.${timeRange}`;
        
        if (this.echo) {
            const channel = this.echo.channel(channelName);
            
            channel.listen('AnalyticsUpdated', (event) => {
                callback(event.data);
            });

            channel.listen('SecurityAlertCreated', (event) => {
                callback({
                    type: 'security_alert',
                    alert: event.alert
                });
            });

            channel.listen('PerformanceMetricUpdated', (event) => {
                callback({
                    type: 'performance_update',
                    metrics: event.metrics
                });
            });

            this.listeners.set(channelName, channel);
        }

        // Fallback to polling for real-time updates
        this.startPolling(callback, timeRange);
    }

    /**
     * Fallback polling mechanism
     */
    startPolling(callback, timeRange) {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`/analytics/realtime?period=${timeRange}`, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    callback({
                        type: 'polling_update',
                        ...data
                    });
                }
            } catch (error) {
                console.warn('Analytics polling failed:', error);
            }
        }, 30000); // Poll every 30 seconds

        this.listeners.set(`polling_${timeRange}`, pollInterval);
    }

    /**
     * Unsubscribe from analytics updates
     */
    unsubscribeFromAnalyticsUpdates(timeRange = '7d') {
        const channelName = `analytics.${timeRange}`;
        
        // Clean up Echo channel
        if (this.listeners.has(channelName)) {
            const channel = this.listeners.get(channelName);
            if (channel && typeof channel.stopListening === 'function') {
                channel.stopListening();
            }
            this.listeners.delete(channelName);
        }

        // Clean up polling
        const pollingKey = `polling_${timeRange}`;
        if (this.listeners.has(pollingKey)) {
            clearInterval(this.listeners.get(pollingKey));
            this.listeners.delete(pollingKey);
        }
    }

    /**
     * Manually refresh analytics data
     */
    async refreshAnalytics(timeRange = '7d') {
        try {
            const response = await fetch(`/analytics/refresh?period=${timeRange}`, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                return await response.json();
            }
            
            throw new Error('Failed to refresh analytics');
        } catch (error) {
            console.error('Analytics refresh failed:', error);
            throw error;
        }
    }

    /**
     * Export analytics data
     */
    async exportAnalytics(timeRange = '7d', format = 'csv') {
        try {
            const response = await fetch(`/analytics/export?period=${timeRange}&format=${format}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.${format}`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                throw new Error('Failed to export analytics');
            }
        } catch (error) {
            console.error('Analytics export failed:', error);
            throw error;
        }
    }

    /**
     * Get current analytics summary
     */
    async getAnalyticsSummary(timeRange = '7d') {
        try {
            const response = await fetch(`/analytics/summary?period=${timeRange}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            if (response.ok) {
                return await response.json();
            }
            
            throw new Error('Failed to get analytics summary');
        } catch (error) {
            console.error('Analytics summary failed:', error);
            throw error;
        }
    }

    /**
     * Clean up all listeners and intervals
     */
    cleanup() {
        for (const [key, value] of this.listeners) {
            if (key.startsWith('polling_')) {
                clearInterval(value);
            } else if (value && typeof value.stopListening === 'function') {
                value.stopListening();
            }
        }
        this.listeners.clear();
    }
}

export default AnalyticsEventManager;
