import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        target: 'es2022', // Support for top-level await
        // Alternative: specify modern browsers
        // target: ['chrome100', 'firefox100', 'safari15', 'edge100']
    },
    esbuild: {
        target: 'es2022', // Ensure esbuild also uses modern target
    },
})
