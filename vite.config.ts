import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/file-uploadify/',
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/client/test-setup.ts'],
        globals: true,
        env: {
            NODE_ENV: 'test',
        },
    },
});
