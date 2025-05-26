export declare const useNetworkStatus: () => {
    checkApiHealth: () => Promise<boolean>;
    isOnline: boolean;
    isApiReachable: boolean;
    lastChecked: Date | null;
};
