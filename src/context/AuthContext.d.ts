import { type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { auth, database } from '../services/firebase';
interface AuthContextType {
    currentUser: User | null;
    userProfile: UserProfile | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, displayName: string, profileData?: Partial<UserProfile>, photoFile?: File | null) => Promise<void>;
    logout: () => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}
import type { UserProfile } from '../types/user';
interface AuthProviderProps {
    children: ReactNode;
    firebaseAuth?: typeof auth;
    firebaseDb?: typeof database;
}
declare const AuthContext: import("react").Context<AuthContextType | null>;
export declare const AuthProvider: ({ children, firebaseAuth, firebaseDb, }: AuthProviderProps) => import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export { AuthContext };
