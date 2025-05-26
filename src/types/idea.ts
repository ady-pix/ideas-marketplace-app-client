export interface Idea {
    _id: string
    title: string
    category: string
    type: 'Product' | 'Service'
    problemDescription: string
    solutionDescription: string
    desiredPrice: number
    requireNDA: boolean
    createdAt: string
    creator: string
    creatorInfo: {
        displayName: string
        email: string
        photoURL: string | null
    }
    // Optional fields for editing
    protectionStatus?: string
    contactPreference?: string
    additionalNotes?: string
    photos?: string[]
}

export interface Filters {
    category: string
    type: string
    priceMin: string
    priceMax: string
    requireNDA: string
    search: string
}

export interface ApiResponse {
    ideas: Idea[]
    pagination: {
        currentPage: number
        totalPages: number
        totalCount: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
}
