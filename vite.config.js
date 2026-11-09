import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
    base: './',
    server: { host: '127.0.0.1', port: 3000, strictPort: true },
    preview: { host: '127.0.0.1', port: 3000, strictPort: true },
    build: {
        sourcemap: true,
        rolldownOptions: {
            input: {
                game: fileURLToPath(new URL('./index.html', import.meta.url)),
                editor: fileURLToPath(new URL('./editor.html', import.meta.url)),
                menuPilot: fileURLToPath(new URL('./menu-pilot.html', import.meta.url)),
                menuProduction: fileURLToPath(new URL('./menu-production.html', import.meta.url)),
                dialogue: fileURLToPath(new URL('./dialogue.html', import.meta.url)),
                heroReview: fileURLToPath(new URL('./hero-review.html', import.meta.url)),
            },
        },
    },
});
