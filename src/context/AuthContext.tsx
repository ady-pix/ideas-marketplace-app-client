// src/context/AuthContext.tsx
import {
    createContext,
    useState,
    useEffect,
    useContext,
    ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, database } from '../services/firebase'

interface AuthContextType {
    currentUser: User | null
    loading: boolean
    signup: (
        email: string,
        password: string,
        displayName: string
    ) => Promise<void>
    login: (email: string, password: string) => Promise<void>
    loginWithGoogle: () => Promise<void>
    logout: () => Promise<void>
    userProfile: UserProfile | null
}

interface UserProfile {
    displayName: string
    email: string
    photoURL: string
    createdAt: any // Using any for serverTimestamp
    isOnline: boolean
}

interface AuthProviderProps {
    children: ReactNode
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch user profile data from Firestore
    const fetchUserProfile = async (user: User) => {
        try {
            const userDoc = await getDoc(doc(database, 'users', user.uid))
            if (userDoc.exists()) {
                setUserProfile(userDoc.data() as UserProfile)
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    // Sign up function
    async function signup(
        email: string,
        password: string,
        displayName: string
    ) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            )
            const user = userCredential.user
            // Set display name
            await updateProfile(user, { displayName })
            // Create a user profile in Firestore
            const userProfile = {
                displayName,
                email,
                photoURL: user.photoURL || '',
                createdAt: serverTimestamp(),
                isOnline: true,
            }
            await setDoc(doc(database, 'users', user.uid), userProfile)
            setUserProfile(userProfile as UserProfile)
        } catch (error) {
            console.error('Error during signup:', error)
            // You could do additional error handling here
            throw error // Now re-throwing after handling
        }
    }

    // Login function
    async function login(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            )
            // Update online status
            if (userCredential.user) {
                await setDoc(
                    doc(database, 'users', userCredential.user.uid),
                    {
                        isOnline: true,
                    },
                    { merge: true }
                )
            }
        } catch (error) {
            console.error('Error during login:', error)
            throw error
        }
    }

    // Google login function
    async function loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider()
            const userCredential = await signInWithPopup(auth, provider)
            const user = userCredential.user
            // Get the additional user info from the credential
            const additionalUserInfo = getAdditionalUserInfo(userCredential)
            const isNewUser = additionalUserInfo.isNewUser
            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(database, 'users', user.uid))

            if (isNewUser) {
                // Create a new user profile if it doesn't exist
                const userProfile = {
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    isOnline: true,
                }

                await setDoc(doc(database, 'users', user.uid), userProfile)
                setUserProfile(userProfile as UserProfile)
            } else {
                // Just update online status
                await setDoc(
                    doc(database, 'users', user.uid),
                    {
                        isOnline: true,
                    },
                    { merge: true }
                )
            }
        } catch (error) {
            console.error('Error during loginWithGoogle:', error)
            throw error
        }
    }

    async function logout() {
        console.log('Logout function called')
        try {
            // Update online status before signing out
            if (currentUser) {
                await setDoc(
                    doc(database, 'users', currentUser.uid),
                    {
                        isOnline: false,
                    },
                    { merge: true }
                )
                console.log('Updated online status to false')
            }

            console.log('About to sign out')
            await signOut(auth)
            console.log('Successfully signed out')
            return
        } catch (error) {
            console.error('Error during logout process:', error)
            throw error
        }
    }

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user)
            if (user) {
                fetchUserProfile(user)
            } else {
                setUserProfile(null)
            }
            setLoading(false)
        })

        return unsubscribe
    }, [])

    const value = {
        currentUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        userProfile,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
