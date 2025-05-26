export const API_BASE_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Use this in your API calls
export const apiCall = async (endpoint: string, options?: RequestInit) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!response.ok) {
        throw new Error(`API call failed: ${response.statusText}`)
    }

    return response.json()
}
