import { Timestamp } from 'firebase/firestore'

export interface UserProfile {
    // Basic Info
    displayName: string
    fullName?: string
    email: string
    photoURL: string | null
    createdAt: Timestamp | null
    isOnline: boolean

    // Extended Profile Fields
    bio?: string
    location?: string
    website?: string
    preferredCategories?: string[]
    languagePreferences?: string[]
    cvUrl?: string

    // Activity Stats (computed fields)
    ideasSubmitted?: number
    offersReceived?: number
    offersMade?: number
    ideasPurchased?: number
}

export interface UserStats {
    ideasSubmitted: number
    offersReceived: number
    offersMade: number
    ideasPurchased: number
    lastUpdated: Timestamp
}
