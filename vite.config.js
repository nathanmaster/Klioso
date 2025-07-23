import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
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
            origin: [
                'https://webman-keyconn-net.us.stackstaging.com',
                'http://localhost:8000',
                'http://127.0.0.1:8000',
                'http://0.0.0.0:8000'
            ],
            credentials: true,
        },
        hmr: {
            host: 'localhost',
        },
    },
});
