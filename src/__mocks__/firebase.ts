// src/__mocks__/firebase.ts

const mockUser = {
    uid: 'mock-user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: 'https://example.com/photo.jpg',
}

export const auth = {
    currentUser: mockUser,
    onAuthStateChanged: (callback: (user: any) => void) => {
        // Immediately call with mock user
        setTimeout(() => callback(mockUser), 0)
        return () => {} // unsubscribe function
    },
    signInWithEmailAndPassword: async () => ({
        user: mockUser,
    }),
    createUserWithEmailAndPassword: async () => ({
        user: mockUser,
    }),
    signOut: async () => {},
    updateProfile: async () => {},
    GoogleAuthProvider: class {
        constructor() {}
    },
    signInWithPopup: async () => ({
        user: mockUser,
        additionalUserInfo: { isNewUser: false },
    }),
    getAdditionalUserInfo: () => ({ isNewUser: false }),
} as any

export const database = {
    // Mock basic Firestore interface
    collection: () => ({
        doc: () => ({}),
    }),
    doc: () => ({
        get: async () => ({
            exists: () => true,
            data: () => ({
                displayName: 'Test User',
                email: 'test@example.com',
                isOnline: true,
            }),
        }),
        set: async () => {},
        update: async () => {},
    }),
    getDoc: async () => ({
        exists: () => true,
        data: () => ({
            displayName: 'Test User',
            email: 'test@example.com',
            isOnline: true,
        }),
    }),
    setDoc: async () => {},
    updateDoc: async () => {},
    onSnapshot: () => () => {},
    serverTimestamp: () => ({ seconds: Date.now() / 1000 }),
    query: () => ({}),
    where: () => ({}),
} as any

export const storage = {
    // Mock basic Storage interface
    ref: () => ({
        name: 'mock-file.jpg',
        fullPath: 'mock/path/mock-file.jpg',
    }),
    uploadBytes: async () => ({
        ref: { name: 'mock-file.jpg' },
        metadata: { size: 1024 },
    }),
    getDownloadURL: async () => 'https://example.com/mock-file.jpg',
} as any
