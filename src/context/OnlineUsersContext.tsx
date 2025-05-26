// src/context/OnlineUsersContext.tsx - Modified to use Firestore
import {
    createContext,
    useState,
    useEffect,
    useContext,
    type ReactNode,
} from 'react'
import {
    doc,
    collection,
    onSnapshot,
    setDoc,
    query,
    where,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore'
import { database } from '../services/firebase' // Keep using your existing Firestore reference
import { useAuth } from './AuthContext'

interface OnlineUser {
    id: string
    displayName: string
    photoURL: string
    lastSeen: Timestamp | null
}

interface OnlineUsersContextType {
    onlineUsers: OnlineUser[]
}

export const OnlineUsersContext = createContext<OnlineUsersContextType>({
    onlineUsers: [],
})

export function useOnlineUsers() {
    return useContext(OnlineUsersContext)
}

interface OnlineUsersProviderProps {
    children: ReactNode
}

export function OnlineUsersProvider({ children }: OnlineUsersProviderProps) {
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
    const { currentUser } = useAuth()

    useEffect(() => {
        if (!currentUser) return

        // Set the user as online when they connect
        const updateOnlineStatus = async () => {
            const userRef = doc(database, 'users', currentUser.uid)
            await setDoc(
                userRef,
                {
                    isOnline: true,
                    lastSeen: serverTimestamp(),
                },
                { merge: true }
            )
        }

        updateOnlineStatus()

        // Use browser events to detect when user goes offline
        const handleOfflineStatus = async () => {
            const userRef = doc(database, 'users', currentUser.uid)
            await setDoc(
                userRef,
                {
                    isOnline: false,
                    lastSeen: serverTimestamp(),
                },
                { merge: true }
            )
        }

        // Set up event listeners for online/offline status
        window.addEventListener('beforeunload', handleOfflineStatus)
        window.addEventListener('offline', handleOfflineStatus)

        // Listen for all online users
        const usersQuery = query(
            collection(database, 'users'),
            where('isOnline', '==', true)
        )

        const unsubscribeOnlineUsers = onSnapshot(usersQuery, (snapshot) => {
            const users: OnlineUser[] = []

            snapshot.forEach((doc) => {
                const userData = doc.data()
                users.push({
                    id: doc.id,
                    displayName: userData.displayName || 'Anonymous',
                    photoURL: userData.photoURL || '',
                    lastSeen: userData.lastSeen,
                })
            })

            setOnlineUsers(users)
        })

        return () => {
            window.removeEventListener('beforeunload', handleOfflineStatus)
            window.removeEventListener('offline', handleOfflineStatus)
            unsubscribeOnlineUsers()
        }
    }, [currentUser])

    return (
        <OnlineUsersContext.Provider value={{ onlineUsers }}>
            {children}
        </OnlineUsersContext.Provider>
    )
}
