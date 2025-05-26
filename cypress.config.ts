import { defineConfig } from 'cypress'

export default defineConfig({
    component: {
        devServer: {
            framework: 'react',
            bundler: 'vite',
        },
        env: {
            VITE_USE_MOCK_FIREBASE: 'true',
        },
    },
    e2e: {
        baseUrl: 'http://localhost:3000',
        supportFile: false,
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
})
