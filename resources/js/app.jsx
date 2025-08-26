import '../css/app.css';
import './bootstrap';
import { setupGlobalErrorHandling, Logger } from './Utils/errorHandler.jsx';
import { Toaster } from 'react-hot-toast';

// Setup global error handling
setupGlobalErrorHandling();

// Initialize theme immediately
(() => {
    const theme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // Apply dark mode if:
    // 1. Theme is explicitly set to 'dark', OR
    // 2. Theme is 'system' and system prefers dark
    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
})();

// Log application startup
Logger.info('Application initializing', {
    appName: import.meta.env.VITE_APP_NAME,
    environment: import.meta.env.MODE,
    timestamp: new Date().toISOString()
});

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Ziggy } from './ziggy';

// Simple, efficient route function
function route(name, params = {}) {
    if (!name) {
        return {
            current: (pattern) => {
                if (!pattern) return false;
                const path = window.location.pathname;
                return pattern.endsWith('.*') 
                    ? path.includes('/' + pattern.replace('.*', ''))
                    : path === '/' + pattern.replace(/\./g, '/');
            }
        };
    }
    
    const routes = window.Ziggy?.routes || {};
    const route = routes[name];
    
    if (!route) {
        console.warn(`Route [${name}] not found`);
        return '#';
    }
    
    let url = route.uri;
    Object.entries(params).forEach(([key, value]) => {
        url = url.replace(`{${key}}`, value);
    });
    
    return '/' + url;
}

// Make route function available globally
window.route = route;

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        // Make Ziggy routes available to route() helper - use fresh Ziggy first, fallback to props
        window.Ziggy = Ziggy;
        if (props.initialPage.props.ziggy) {
            Object.assign(window.Ziggy.routes, props.initialPage.props.ziggy.routes || {});
        }
        
        // Store current route name globally for route().current()
        window.currentRouteName = props.initialPage.url;

        root.render(
            <>
                <App {...props} />
                <Toaster 
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            background: 'var(--toast-bg)',
                            color: 'var(--toast-color)',
                            border: '1px solid var(--toast-border)',
                        },
                        success: {
                            duration: 3000,
                            iconTheme: {
                                primary: '#10b981',
                                secondary: '#ffffff',
                            },
                        },
                        error: {
                            duration: 5000,
                            iconTheme: {
                                primary: '#ef4444',
                                secondary: '#ffffff',
                            },
                        },
                    }}
                />
            </>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
