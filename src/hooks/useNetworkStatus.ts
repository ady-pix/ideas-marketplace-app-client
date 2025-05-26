import { useState, useEffect } from 'react'

interface NetworkStatus {
    isOnline: boolean
    isApiReachable: boolean
    lastChecked: Date | null
}

export const useNetworkStatus = () => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isOnline: navigator.onLine,
        isApiReachable: true,
        lastChecked: null,
    })

    const checkApiHealth = async () => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/health`,
                {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(5000), // 5 second timeout
                }
            )

            const isReachable = response.ok
            setNetworkStatus((prev) => ({
                ...prev,
                isApiReachable: isReachable,
                lastChecked: new Date(),
            }))

            return isReachable
        } catch (error) {
            console.warn('API health check failed:', error)
            setNetworkStatus((prev) => ({
                ...prev,
                isApiReachable: false,
                lastChecked: new Date(),
            }))
            return false
        }
    }

    useEffect(() => {
        const handleOnline = () => {
            setNetworkStatus((prev) => ({ ...prev, isOnline: true }))
            // Check API when coming back online
            checkApiHealth()
        }

        const handleOffline = () => {
            setNetworkStatus((prev) => ({
                ...prev,
                isOnline: false,
                isApiReachable: false,
            }))
        }

        // Listen for network status changes
        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Initial API health check
        checkApiHealth()

        // Periodic health checks (every 30 seconds)
        const interval = setInterval(checkApiHealth, 30000)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(interval)
        }
    }, [])

    return {
        ...networkStatus,
        checkApiHealth,
    }
}
