import { type ReactNode } from 'react';
import { Timestamp } from 'firebase/firestore';
interface OnlineUser {
    id: string;
    displayName: string;
    photoURL: string;
    lastSeen: Timestamp | null;
}
interface OnlineUsersContextType {
    onlineUsers: OnlineUser[];
}
export declare const OnlineUsersContext: import("react").Context<OnlineUsersContextType>;
export declare function useOnlineUsers(): OnlineUsersContextType;
interface OnlineUsersProviderProps {
    children: ReactNode;
}
export declare function OnlineUsersProvider({ children }: OnlineUsersProviderProps): import("react/jsx-runtime").JSX.Element;
export {};
