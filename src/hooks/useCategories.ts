import { useState, useEffect } from 'react'

export interface Category {
    id: string
    name: string
    description?: string
    isActive: boolean
    sortOrder?: number
    icon?: string
    color?: string
}

interface UseCategoriesReturn {
    categories: Category[]
    categoryNames: string[]
    loading: boolean
    error: string | null
    refetch: () => Promise<void>
}

export const useCategories = (): UseCategoriesReturn => {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchCategories = async () => {
        try {
            setLoading(true)
            setError(null)
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories')
            }
            
            const data = await response.json()
            
            if (data.success && data.categories) {
                setCategories(data.categories)
            } else {
                throw new Error('Invalid response format')
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            console.error('Error fetching categories:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    const categoryNames = categories.map(category => category.name)

    return {
        categories,
        categoryNames,
        loading,
        error,
        refetch: fetchCategories
    }
} 