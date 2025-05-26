// src/context/AuthContext.tsx
import {
    createContext,
    useState,
    useEffect,
    useContext,
    type ReactNode,
} from 'react'
import type { User } from 'firebase/auth'
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    getAdditionalUserInfo,
    onAuthStateChanged,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

import { auth, database, storage } from '../services/firebase'

interface AuthContextType {
    currentUser: User | null
    userProfile: UserProfile | null
    loading: boolean
    login: (email: string, password: string) => Promise<void>
    signup: (
        email: string,
        password: string,
        displayName: string,
        profileData?: Partial<UserProfile>,
        photoFile?: File | null
    ) => Promise<void>
    logout: () => Promise<void>
    loginWithGoogle: () => Promise<void>
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>
}

import type { UserProfile } from '../types/user'

interface AuthProviderProps {
    children: ReactNode
    firebaseAuth?: typeof auth
    firebaseDb?: typeof database
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({
    children,
    firebaseAuth = auth,
    firebaseDb = database,
}: AuthProviderProps) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    // Fetch user profile data from Firestore
    const fetchUserProfile = async (user: User) => {
        try {
            const userDoc = await getDoc(doc(firebaseDb, 'users', user.uid))
            if (userDoc.exists()) {
                const data = userDoc.data()
                setUserProfile({
                    displayName: data.displayName || '',
                    fullName: data.fullName || '',
                    email: data.email || '',
                    photoURL: data.photoURL || null,
                    createdAt: data.createdAt || null,
                    isOnline: data.isOnline || false,
                    bio: data.bio || '',
                    location: data.location || '',
                    website: data.website || '',
                    preferredCategories: data.preferredCategories || [],
                    languagePreferences: data.languagePreferences || [],
                    cvUrl: data.cvUrl || '',
                })
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    // Sign up function
    async function signup(
        email: string,
        password: string,
        displayName: string,
        profileData?: Partial<UserProfile>,
        photoFile?: File | null
    ) {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                firebaseAuth,
                email,
                password
            )
            const user = userCredential.user

            let photoURL = user.photoURL || ''

            // Upload profile photo if provided
            if (photoFile) {
                const imageRef = ref(storage, `profile_images/${user.uid}`)
                await uploadBytes(imageRef, photoFile)
                photoURL = await getDownloadURL(imageRef)
            }

            // Set display name and photo URL
            await updateProfile(user, { displayName, photoURL })

            // Create user profile data with additional fields
            const userProfileData = {
                displayName,
                email,
                photoURL,
                createdAt: serverTimestamp(),
                isOnline: true,
                // Add additional profile fields if provided
                fullName: profileData?.fullName || '',
                bio: profileData?.bio || '',
                location: profileData?.location || '',
                website: profileData?.website || '',
                preferredCategories: profileData?.preferredCategories || [],
                languagePreferences: profileData?.languagePreferences || [],
            }

            // Save to Firestore
            await setDoc(doc(firebaseDb, 'users', user.uid), userProfileData)

            // Set local state (without serverTimestamp since it's a FieldValue)
            setUserProfile({
                displayName,
                fullName: profileData?.fullName || '',
                email,
                photoURL: photoURL || null,
                createdAt: null, // Will be fetched on next read
                isOnline: true,
                bio: profileData?.bio || '',
                location: profileData?.location || '',
                website: profileData?.website || '',
                preferredCategories: profileData?.preferredCategories || [],
                languagePreferences: profileData?.languagePreferences || [],
                cvUrl: '',
            })
        } catch (error) {
            console.error('Error during signup:', error)
            throw error
        }
    }

    // Login function
    async function login(email: string, password: string) {
        try {
            const userCredential = await signInWithEmailAndPassword(
                firebaseAuth,
                email,
                password
            )
            // Update online status
            if (userCredential.user) {
                await setDoc(
                    doc(firebaseDb, 'users', userCredential.user.uid),
                    {
                        isOnline: true,
                    },
                    { merge: true }
                )
                // Fetch the updated profile
                await fetchUserProfile(userCredential.user)
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
            const userCredential = await signInWithPopup(firebaseAuth, provider)
            const user = userCredential.user

            // Get the additional user info from the credential
            const additionalUserInfo = getAdditionalUserInfo(userCredential)
            const isNewUser = additionalUserInfo?.isNewUser || false

            if (isNewUser) {
                // Create a new user profile
                const userProfileData = {
                    displayName: user.displayName || '',
                    email: user.email || '',
                    photoURL: user.photoURL || '',
                    createdAt: serverTimestamp(),
                    isOnline: true,
                }

                await setDoc(
                    doc(firebaseDb, 'users', user.uid),
                    userProfileData
                )

                // Set local state
                setUserProfile({
                    displayName: user.displayName || '',
                    fullName: '',
                    email: user.email || '',
                    photoURL: user.photoURL || null,
                    createdAt: null, // Will be fetched on next read
                    isOnline: true,
                    bio: '',
                    location: '',
                    website: '',
                    preferredCategories: [],
                    languagePreferences: [],
                    cvUrl: '',
                })
            } else {
                // Just update online status
                await setDoc(
                    doc(firebaseDb, 'users', user.uid),
                    {
                        isOnline: true,
                    },
                    { merge: true }
                )
                // Fetch the updated profile
                await fetchUserProfile(user)
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
                    doc(firebaseDb, 'users', currentUser.uid),
                    {
                        isOnline: false,
                    },
                    { merge: true }
                )
                console.log('Updated online status to false')
            }

            console.log('About to sign out')
            await signOut(firebaseAuth)
            console.log('Successfully signed out')
            return
        } catch (error) {
            console.error('Error during logout process:', error)
            throw error
        }
    }

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
            setCurrentUser(user)
            if (user) {
                fetchUserProfile(user)
            } else {
                setUserProfile(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [firebaseAuth])

    const updateUserProfile = async (data: Partial<UserProfile>) => {
        if (!currentUser || !userProfile) return

        try {
            await setDoc(doc(firebaseDb, 'users', currentUser.uid), data, {
                merge: true,
            })
            setUserProfile({ ...userProfile, ...data })
        } catch (error) {
            console.error('Error updating user profile:', error)
            throw error
        }
    }

    const value = {
        currentUser,
        loading,
        signup,
        login,
        loginWithGoogle,
        logout,
        userProfile,
        updateUserProfile,
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export { AuthContext }
