// src/services/firebase.ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Use mock values when testing to avoid Firebase initialization errors
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'mock-api-key',
    authDomain:
        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
        'mock-project.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mock-project',
    storageBucket:
        import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
        'mock-project.appspot.com',
    messagingSenderId:
        import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
    appId:
        import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abcdef123456',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const database = getFirestore(app)
export const storage = getStorage(app)

export default app
