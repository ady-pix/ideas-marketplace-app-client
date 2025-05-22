// src/services/firebase.ts
let auth: any
let database: any
let storage: any
let app: any

async function initializeFirebase() {
    if (import.meta.env.VITE_USE_MOCK_FIREBASE === 'true') {
        // ✅ Use mock modules during tests
        const mock = await import('../__mocks__/firebase')
        auth = mock.auth
        database = mock.database
        storage = mock.storage || {} // optional
        app = {}
    } else {
        // ✅ Use real Firebase modules
        const { initializeApp } = await import('firebase/app')
        const { getAuth } = await import('firebase/auth')
        const { getFirestore } = await import('firebase/firestore')
        const { getStorage } = await import('firebase/storage')

        const firebaseConfig = {
            apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
            authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
            projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
            storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: import.meta.env
                .VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: import.meta.env.VITE_FIREBASE_APP_ID,
        }

        app = initializeApp(firebaseConfig)
        auth = getAuth(app)
        database = getFirestore(app)
        storage = getStorage(app)
    }
}

// 🔁 Immediately initialize at module load time (important!)
await initializeFirebase()

export { auth, database, storage }
export default app
