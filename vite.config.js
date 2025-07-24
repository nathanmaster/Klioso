import { defineConfig, loadEnv } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Default CORS origins for local development
    const defaultOrigins = [
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        'http://0.0.0.0:8000'
    ];
    
    // Add staging/production URLs from environment variables
    const additionalOrigins = env.VITE_CORS_ORIGINS 
        ? env.VITE_CORS_ORIGINS.split(',').map(url => url.trim())
        : [];
    
    return {
        plugins: [
            laravel({
                input: 'resources/js/app.jsx',
                refresh: true,
            }),
            react(),
        ],
        server: {
            host: '0.0.0.0',
            port: 5173,
            cors: {
                origin: [...defaultOrigins, ...additionalOrigins],
                credentials: true,
            },
            hmr: {
                host: 'localhost',
            },
        },
    };
});
