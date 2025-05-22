// src/__mocks__/firebase.ts

export const auth = {
    onAuthStateChanged: () => () => {},
    signInWithEmailAndPassword: async () => ({
        user: { uid: '123', email: 'test@example.com' },
    }),
    createUserWithEmailAndPassword: async () => ({
        user: { uid: '123', email: 'test@example.com' },
    }),
    signOut: async () => {},
    updateProfile: async () => {},
    GoogleAuthProvider: class {},
    signInWithPopup: async () => ({
        user: { uid: '123', email: 'test@example.com' },
    }),
} as any

export const database = {
    // Mock basic Firestore interface
    collection: () => ({}),
    doc: () => ({}),
    getDoc: async () => ({ exists: () => false }),
    setDoc: async () => {},
    onSnapshot: () => () => {},
    serverTimestamp: () => new Date(),
} as any
