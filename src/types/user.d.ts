import { Timestamp } from 'firebase/firestore';
export interface UserProfile {
    displayName: string;
    fullName?: string;
    email: string;
    photoURL: string | null;
    createdAt: Timestamp | null;
    isOnline: boolean;
    bio?: string;
    location?: string;
    website?: string;
    preferredCategories?: string[];
    languagePreferences?: string[];
    cvUrl?: string;
    ideasSubmitted?: number;
    offersReceived?: number;
    offersMade?: number;
    ideasPurchased?: number;
}
export interface UserStats {
    ideasSubmitted: number;
    offersReceived: number;
    offersMade: number;
    ideasPurchased: number;
    lastUpdated: Timestamp;
}
