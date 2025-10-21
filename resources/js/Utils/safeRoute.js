/**
 * Safe route helper with fallback to manual URL construction
 * Provides a backup when Ziggy routes are not available or failing
 */

export const safeRoute = (routeName, params = {}) => {
    try {
        const url = route(routeName, params);
        
        // Check if route failed or returned template pattern
        if (url === '#' || 
            !url || 
            url.startsWith('Route [') || 
            url.includes('{') || 
            url.includes('%7B') ||  // URL-encoded {
            url.includes('%7D')) {  // URL-encoded }
            
            return fallbackRoute(routeName, params);
        }
        return url;
    } catch (error) {
        console.error('Route error:', error);
        return fallbackRoute(routeName, params);
    }
};

/**
 * Manual URL construction fallback for common routes
 */
const fallbackRoute = (routeName, params) => {
    // Enhanced parameter handling
    let paramValue = '';
    
    if (typeof params === 'object' && params !== null) {
        // If it's an object, try to extract the ID or first value
        paramValue = params.id || params.website || params.template || params.group || params.client || Object.values(params)[0] || '';
    } else {
        // If it's a primitive value, use it directly
        paramValue = params || '';
    }
    
    // Convert to string and ensure it's not empty
    paramValue = String(paramValue);
    
    if (!paramValue) {
        console.warn(`safeRoute: No valid parameter found for route ${routeName}`, params);
        return '#';
    }

    // Route mapping for common patterns
    const routes = {
        // Website routes
        'websites.show': `/websites/${paramValue}`,
        'websites.edit': `/websites/${paramValue}/edit`,
        'websites.destroy': `/websites/${paramValue}`,
        
        // Group routes
        'groups.show': `/groups/${paramValue}`,
        'groups.edit': `/groups/${paramValue}/edit`,
        'groups.destroy': `/groups/${paramValue}`,
        
        // Template routes
        'templates.show': `/templates/${paramValue}`,
        'templates.edit': `/templates/${paramValue}/edit`,
        'templates.destroy': `/templates/${paramValue}`,
        
        // Plugin routes
        'plugins.show': `/plugins/${paramValue}`,
        'plugins.edit': `/plugins/${paramValue}/edit`,
        'plugins.destroy': `/plugins/${paramValue}`,
        
        // Client routes
        'clients.show': `/clients/${paramValue}`,
        'clients.edit': `/clients/${paramValue}/edit`,
        'clients.destroy': `/clients/${paramValue}`,
        
        // Hosting Provider routes
        'hosting-providers.show': `/hosting-providers/${paramValue}`,
        'hosting-providers.edit': `/hosting-providers/${paramValue}/edit`,
        'hosting-providers.destroy': `/hosting-providers/${paramValue}`,
        
        // Scheduled Scan routes
        'scheduled-scans.show': `/scheduled-scans/${paramValue}`,
        'scheduled-scans.edit': `/scheduled-scans/${paramValue}/edit`,
        'scheduled-scans.destroy': `/scheduled-scans/${paramValue}`,
    };

    if (routes[routeName]) {
        return routes[routeName];
    }

    // Generic fallback for unknown routes
    const parts = routeName.split('.');
    if (parts.length === 2) {
        const [resource, action] = parts;
        switch (action) {
            case 'show':
                return `/${resource}/${paramValue}`;
            case 'edit':
                return `/${resource}/${paramValue}/edit`;
            case 'destroy':
                return `/${resource}/${paramValue}`;
            default:
                return `/${resource}`;
        }
    }

    console.warn(`Unknown route: ${routeName}`);
    return '#';
};

export default safeRoute;
