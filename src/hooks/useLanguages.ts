import { useState, useEffect } from 'react'

export interface Language {
    id: string
    name: string
    nativeName?: string
    code: string
    isActive: boolean
    sortOrder?: number
    flag?: string
}

interface UseLanguagesReturn {
    languages: Language[]
    languageNames: string[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export const useLanguages = (): UseLanguagesReturn => {
    const [languages, setLanguages] = useState<Language[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchLanguages = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/languages`
            )

            if (!response.ok) {
                throw new Error('Failed to fetch languages')
            }

            const data = await response.json()

            if (data.success && data.languages) {
                setLanguages(data.languages)
            } else {
                throw new Error('Invalid response format')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            console.error('Error fetching languages:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLanguages()
    }, [])

    const languageNames = languages.map((language) => language.name)

    return {
        languages,
        languageNames,
        loading,
        error,
        refetch: fetchLanguages,
    }
}
