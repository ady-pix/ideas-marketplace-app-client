import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { IoGrid, IoList, IoFilter, IoClose } from 'react-icons/io5'
import DataTable from '../components/table/DataTable'
import IdeaCard from '../components/ideas/IdeaCard'
import { useCategories } from '../hooks/useCategories'
import LoadingSpinner, { LoadingSkeleton } from '../components/LoadingSpinner'
import { NetworkErrorDisplay } from '../components/common/ErrorDisplay'
import { useNetworkStatus } from '../hooks/useNetworkStatus'
import { useAuth } from '../context/AuthContext'
import { Idea, Filters, ApiResponse } from '../types/idea'

export default function IdeasPage() {
    const { categoryNames } = useCategories()
    const categories = ['All Categories', ...categoryNames]
    const { isOnline, isApiReachable } = useNetworkStatus()
    const { currentUser } = useAuth()
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const [ideas, setIdeas] = useState<Idea[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch creator name for display
    const fetchCreatorName = useCallback(async (creatorId: string) => {
        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/ideas/user/${creatorId}`
            )
            if (response.ok) {
                const userData = await response.json()
                setCreatorName(userData.displayName || 'Unknown User')
            }
        } catch (error) {
            console.error('Error fetching creator name:', error)
            setCreatorName('Unknown User')
        }
    }, [])
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards')
    const [showFilters, setShowFilters] = useState(false)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNextPage: false,
        hasPrevPage: false,
    })
    const [filters, setFilters] = useState<Filters>({
        category: 'All Categories',
        type: 'All Types',
        priceMin: '',
        priceMax: '',
        requireNDA: 'All',
        search: '',
    })
    const [itemsPerPage, setItemsPerPage] = useState(20)
    const showMyIdeas = useRef(false)
    const [showMyIdeasUI, setShowMyIdeasUI] = useState(false) // For UI updates
    const [creatorFilter, setCreatorFilter] = useState<string | null>(null)
    const [creatorName, setCreatorName] = useState<string>('')

    const isInitialLoad = useRef(true)
    const urlParamsProcessed = useRef(false)
    const lastFetchParams = useRef<string>('')

    // Handle URL parameters on component mount
    useEffect(() => {
        const filterParam = searchParams.get('filter')
        const creatorParam = searchParams.get('creator')

        if (filterParam === 'my-ideas') {
            showMyIdeas.current = true
            setShowMyIdeasUI(true)
        }

        if (creatorParam) {
            setCreatorFilter(creatorParam)
            // Fetch creator name for display
            fetchCreatorName(creatorParam)
        }

        urlParamsProcessed.current = true
    }, [searchParams, fetchCreatorName])

    const buildQueryString = (
        page: number = 1,
        itemsPerPage = 20,
        filterParams?: Filters,
        includeMyIdeas: boolean = false,
        creatorId?: string | null
    ) => {
        const params = new URLSearchParams()

        // Add mine parameter if showing my ideas
        if (includeMyIdeas) {
            params.append('mine', 'true')
        }

        // For creator filtering, we need to fetch a large number of ideas
        // to ensure we get all the creator's ideas for client-side filtering
        if (creatorId) {
            params.append('limit', '1000')
            params.append('page', '1')
        } else {
            params.append('page', page.toString())
            params.append('limit', itemsPerPage.toString())
        }

        if (filterParams) {
            if (filterParams.category !== 'All Categories') {
                params.append('category', filterParams.category)
            }
            if (filterParams.type !== 'All Types') {
                params.append('type', filterParams.type)
            }
            if (filterParams.priceMin) {
                params.append('priceMin', filterParams.priceMin)
            }
            if (filterParams.priceMax) {
                params.append('priceMax', filterParams.priceMax)
            }
            if (filterParams.requireNDA !== 'All') {
                params.append('requireNDA', filterParams.requireNDA)
            }
            if (filterParams.search.trim()) {
                params.append('search', filterParams.search.trim())
            }
        }

        return params.toString()
    }

    const fetchIdeas = useCallback(
        async (
            page: number = 1,
            itemsPerPage: number = 20,
            filterParams?: Filters,
            retryCount: number = 0
        ) => {
            try {
                setLoading(true)
                setError(null)

                const queryString = buildQueryString(
                    page,
                    itemsPerPage,
                    filterParams,
                    showMyIdeas.current,
                    creatorFilter
                )

                // Add timeout to prevent hanging requests
                const controller = new AbortController()
                const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

                // Prepare headers
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json',
                }

                // Add auth token if showing my ideas and user is authenticated
                if (showMyIdeas.current && currentUser) {
                    const token = await currentUser.getIdToken()
                    headers.Authorization = `Bearer ${token}`
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/api/ideas?${queryString}`,
                    {
                        signal: controller.signal,
                        headers,
                    }
                )

                clearTimeout(timeoutId)

                if (!response.ok) {
                    throw new Error(
                        `Server error: ${response.status} ${response.statusText}`
                    )
                }

                const data: ApiResponse = await response.json()

                // Filter by creator if specified
                if (creatorFilter) {
                    const filteredIdeas = data.ideas.filter(
                        (idea) => idea.creator === creatorFilter
                    )

                    // Apply pagination to filtered results
                    const startIndex = (page - 1) * itemsPerPage
                    const endIndex = startIndex + itemsPerPage
                    const paginatedIdeas = filteredIdeas.slice(
                        startIndex,
                        endIndex
                    )

                    setIdeas(paginatedIdeas)
                    // Update pagination for filtered results
                    const totalPages = Math.ceil(
                        filteredIdeas.length / itemsPerPage
                    )
                    setPagination({
                        currentPage: page,
                        totalPages: totalPages,
                        totalCount: filteredIdeas.length,
                        hasNextPage: page < totalPages,
                        hasPrevPage: page > 1,
                    })
                } else {
                    setIdeas(data.ideas)
                    setPagination(data.pagination)
                }
            } catch (err) {
                console.error('Fetch ideas error:', err)

                // Handle specific error types
                if (err instanceof Error) {
                    // Network errors that might be temporary
                    if (
                        err.name === 'AbortError' ||
                        err.message.includes('ECONNRESET') ||
                        err.message.includes('fetch') ||
                        err.message.includes('NetworkError') ||
                        err.message.includes('Failed to fetch')
                    ) {
                        // Retry up to 3 times for network errors
                        if (retryCount < 3) {
                            console.log(
                                `Retrying fetch (attempt ${
                                    retryCount + 1
                                }/3)...`
                            )
                            setTimeout(() => {
                                fetchIdeas(
                                    page,
                                    itemsPerPage,
                                    filterParams,
                                    retryCount + 1
                                )
                            }, 1000 * (retryCount + 1)) // Exponential backoff
                            return
                        } else {
                            setError(
                                'Unable to connect to server. Please check your internet connection and try again.'
                            )
                        }
                    } else {
                        setError(err.message)
                    }
                } else {
                    setError('An unexpected error occurred. Please try again.')
                }
            } finally {
                setLoading(false)
            }
        },
        [currentUser, creatorFilter]
    )

    // Convenience function to fetch all ideas without filters
    const fetchAllIdeas = (page: number = 1) => {
        fetchIdeas(page, itemsPerPage)
    }

    // Handle initial load and filter changes
    useEffect(() => {
        // Don't run until URL params are processed
        if (!urlParamsProcessed.current) {
            return
        }

        // Create a unique key for current parameters to prevent duplicate calls
        const currentParams = JSON.stringify({
            filters,
            itemsPerPage,
            showMyIdeas: showMyIdeas.current,
            creatorFilter,
            page: 1,
        })

        // Skip if we already made this exact call
        if (lastFetchParams.current === currentParams) {
            return
        }

        const isInitial = isInitialLoad.current

        if (isInitial) {
            // Initial load - no debounce
            fetchIdeas(1, itemsPerPage, filters)
            isInitialLoad.current = false
            lastFetchParams.current = currentParams
        } else {
            // Subsequent changes - with debounce
            const timeoutId = setTimeout(() => {
                fetchIdeas(1, itemsPerPage, filters)
                lastFetchParams.current = currentParams
            }, 1000)

            return () => {
                clearTimeout(timeoutId)
            }
        }
    }, [filters, itemsPerPage, creatorFilter, fetchIdeas]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleFilterChange = (key: keyof Filters, value: string) => {
        setFilters((prev) => ({ ...prev, [key]: value }))
    }

    const clearFilters = () => {
        const clearedFilters = {
            category: 'All Categories',
            type: 'All Types',
            priceMin: '',
            priceMax: '',
            requireNDA: 'All',
            search: '',
        }
        setFilters(clearedFilters)
        fetchIdeas(1, itemsPerPage, clearedFilters)
    }

    const handleMyIdeasToggle = () => {
        const newShowMyIdeas = !showMyIdeas.current
        showMyIdeas.current = newShowMyIdeas
        setShowMyIdeasUI(newShowMyIdeas) // Update UI state

        // Update URL to reflect the change
        if (newShowMyIdeas) {
            navigate('/ideas?filter=my-ideas')
        } else {
            navigate('/ideas')
        }

        // Manually trigger fetch since we're using ref instead of state
        fetchIdeas(1, itemsPerPage, filters)
    }

    const handlePageChange = (page: number) => {
        fetchIdeas(page, itemsPerPage, filters)
    }

    const handleItemsPerPageChange = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage)
        // Reset to page 1 when changing items per page
        fetchIdeas(1, newItemsPerPage, filters)
    }

    const tableColumns = [
        {
            field: 'title',
            header: 'Title',
            render: (idea: Idea) => (
                <Link
                    to={`/ideas/${idea._id}`}
                    className='text-primary hover:underline font-semibold'
                >
                    {idea.title}
                </Link>
            ),
        },
        {
            field: 'creatorInfo',
            header: 'Creator',
            render: (idea: Idea) => (
                <Link
                    to={`/profile/${idea.creator}`}
                    className='flex items-center gap-2 hover:bg-gray-50 p-1 rounded transition-colors'
                >
                    <img
                        src={idea.creatorInfo.photoURL || '/default-avatar.png'}
                        alt={idea.creatorInfo.displayName}
                        className='w-8 h-8 rounded-full object-cover'
                        onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNiAyNmMwLTUuNTIzIDQuNDc3LTEwIDEwLTEwczEwIDQuNDc3IDEwIDEwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                        }}
                    />
                    <div className='flex flex-col'>
                        <span className='text-sm font-medium text-gray-900 hover:text-primary'>
                            {idea.creatorInfo.displayName}
                        </span>
                        <span className='text-xs text-gray-500'>
                            {idea.creatorInfo.email}
                        </span>
                    </div>
                </Link>
            ),
        },
        {
            field: 'category',
            header: 'Category',
            render: (idea: Idea) => (
                <span className='px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm'>
                    {idea.category}
                </span>
            ),
        },
        {
            field: 'type',
            header: 'Type',
            render: (idea: Idea) => (
                <span
                    className={`px-2 py-1 text-xs rounded ${
                        idea.type === 'Product'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                    }`}
                >
                    {idea.type}
                </span>
            ),
        },
        {
            field: 'desiredPrice',
            header: 'Price',
            render: (idea: Idea) => (
                <span className='font-bold text-green-600'>
                    ${idea.desiredPrice.toLocaleString()}
                </span>
            ),
        },
        {
            field: 'requireNDA',
            header: 'NDA',
            render: (idea: Idea) =>
                idea.requireNDA ? (
                    <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs'>
                        Required
                    </span>
                ) : (
                    <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs'>
                        Not Required
                    </span>
                ),
        },
        {
            field: 'createdAt',
            header: 'Created',
            render: (idea: Idea) => (
                <span className='text-gray-600 text-sm'>
                    {new Date(idea.createdAt).toLocaleDateString()}
                </span>
            ),
        },
    ]

    if (error) {
        return (
            <div className='max-w-7xl mx-auto px-4 py-8'>
                <NetworkErrorDisplay
                    onRetry={() => fetchAllIdeas(1)}
                    backUrl='/'
                    size='lg'
                />
            </div>
        )
    }

    return (
        <div className='max-w-7xl mx-auto px-4 py-8'>
            {/* Network Status Indicator */}
            {(!isOnline || !isApiReachable) && (
                <div className='mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                    <div className='flex items-center gap-2 text-yellow-800'>
                        <svg
                            className='w-5 h-5'
                            fill='currentColor'
                            viewBox='0 0 20 20'
                        >
                            <path
                                fillRule='evenodd'
                                d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                                clipRule='evenodd'
                            />
                        </svg>
                        <span className='text-sm font-medium'>
                            {!isOnline
                                ? 'No internet connection'
                                : 'Server connection issues'}
                        </span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
                <div>
                    <h1 className='title-primary-page'>
                        {showMyIdeasUI
                            ? 'Browse My Ideas'
                            : creatorFilter
                            ? `Browse ${creatorName}'s Ideas`
                            : 'Browse Ideas'}
                    </h1>
                    <p className='text-gray-600 mt-2'>
                        {ideas.length} of {pagination.totalCount} ideas
                        {pagination.totalPages > 1 && (
                            <span className='ml-2 text-sm'>
                                (Page {pagination.currentPage} of{' '}
                                {pagination.totalPages})
                            </span>
                        )}
                    </p>
                </div>

                <div className='flex items-center gap-4'>
                    {/* Back to All Ideas when filtering by creator */}
                    {creatorFilter && (
                        <button
                            onClick={() => {
                                setCreatorFilter(null)
                                setCreatorName('')
                                navigate('/ideas')
                            }}
                            className='px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors font-primary font-medium'
                        >
                            ← Back to All Ideas
                        </button>
                    )}

                    {/* My Ideas Toggle - Hidden when viewing creator ideas */}
                    {currentUser && !creatorFilter && (
                        <button
                            onClick={handleMyIdeasToggle}
                            className={`px-4 py-2 rounded-lg border transition-colors font-primary font-medium ${
                                showMyIdeasUI
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-white text-primary border-gray-300 hover:border-primary'
                            }`}
                        >
                            {showMyIdeasUI ? 'Show All Ideas' : 'Show My Ideas'}
                        </button>
                    )}

                    {/* View Toggle - Hidden on mobile */}
                    <div className='hidden md:flex bg-gray-100 rounded-lg p-1'>
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'cards'
                                    ? 'bg-white shadow-sm text-primary'
                                    : 'text-gray-600 hover:text-primary'
                            }`}
                            title='Card View'
                        >
                            <IoGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'table'
                                    ? 'bg-white shadow-sm text-primary'
                                    : 'text-gray-600 hover:text-primary'
                            }`}
                            title='Table View'
                        >
                            <IoList size={20} />
                        </button>
                    </div>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors font-primary font-medium ${
                            showFilters
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white text-primary border-gray-300 hover:border-primary'
                        }`}
                    >
                        <IoFilter size={16} />
                        Filters
                    </button>
                </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
                <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-lg font-semibold text-primary'>
                            Filters
                        </h3>
                        <div className='flex gap-2'>
                            <button
                                onClick={clearFilters}
                                className='text-sm text-gray-600 hover:text-primary'
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => setShowFilters(false)}
                                className='text-gray-400 hover:text-gray-600'
                            >
                                <IoClose size={20} />
                            </button>
                        </div>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
                        {/* Search */}
                        <div className='xl:col-span-2'>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Search
                            </label>
                            <input
                                type='text'
                                value={filters.search}
                                onChange={(e) =>
                                    handleFilterChange('search', e.target.value)
                                }
                                placeholder='Search ideas...'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
                            />
                        </div>

                        {/* Category */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Category
                            </label>
                            <select
                                value={filters.category}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'category',
                                        e.target.value
                                    )
                                }
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
                            >
                                {categories.map((category: string) => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Type
                            </label>
                            <select
                                value={filters.type}
                                onChange={(e) =>
                                    handleFilterChange('type', e.target.value)
                                }
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
                            >
                                <option value='All Types'>All Types</option>
                                <option value='Product'>Product</option>
                                <option value='Service'>Service</option>
                            </select>
                        </div>

                        {/* Price Min */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Min Price
                            </label>
                            <input
                                type='number'
                                value={filters.priceMin}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'priceMin',
                                        e.target.value
                                    )
                                }
                                placeholder='0'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
                            />
                        </div>

                        {/* Price Max */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                Max Price
                            </label>
                            <input
                                type='number'
                                value={filters.priceMax}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'priceMax',
                                        e.target.value
                                    )
                                }
                                placeholder='No limit'
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
                            />
                        </div>

                        {/* NDA */}
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>
                                NDA Required
                            </label>
                            <select
                                value={filters.requireNDA}
                                onChange={(e) =>
                                    handleFilterChange(
                                        'requireNDA',
                                        e.target.value
                                    )
                                }
                                className='w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent'
                            >
                                <option value='All'>All</option>
                                <option value='Yes'>Yes</option>
                                <option value='No'>No</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                // Loading state for ideas section
                <div className='space-y-6'>
                    {/* Always show cards loading on mobile, respect viewMode on desktop */}
                    <div className='md:hidden'>
                        <div className='grid grid-cols-1 gap-6'>
                            {Array.from({ length: itemsPerPage }).map(
                                (_, index) => (
                                    <LoadingSkeleton key={index} />
                                )
                            )}
                        </div>
                    </div>
                    <div className='hidden md:block'>
                        {viewMode === 'cards' ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {Array.from({ length: itemsPerPage }).map(
                                    (_, index) => (
                                        <LoadingSkeleton key={index} />
                                    )
                                )}
                            </div>
                        ) : (
                            <div className='bg-white rounded-lg shadow-md p-8'>
                                <LoadingSpinner
                                    size='lg'
                                    text='Loading ideas...'
                                    className='py-12'
                                />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile: Always show cards */}
                    <div className='md:hidden'>
                        <div className='grid grid-cols-1 gap-6'>
                            {ideas.map((idea) => (
                                <IdeaCard key={idea._id} idea={idea} />
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Respect viewMode */}
                    <div className='hidden md:block'>
                        {viewMode === 'cards' ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                                {ideas.map((idea) => (
                                    <IdeaCard key={idea._id} idea={idea} />
                                ))}
                            </div>
                        ) : (
                            <div className='bg-white rounded-lg shadow-md overflow-hidden'>
                                <DataTable
                                    data={ideas}
                                    columns={tableColumns}
                                    showActions={false}
                                />
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Pagination and Items Per Page */}
            <div className='flex flex-col sm:flex-row justify-between items-center mt-8 gap-4'>
                {/* Items Per Page Selector */}
                <div className='flex items-center gap-2'>
                    <span className='text-sm text-gray-600'>Show:</span>
                    <select
                        value={itemsPerPage}
                        onChange={(e) =>
                            handleItemsPerPageChange(Number(e.target.value))
                        }
                        className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-transparent'
                    >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                    <span className='text-sm text-gray-600'>per page</span>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={() =>
                                handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={!pagination.hasPrevPage}
                            className={`px-4 py-2 rounded-md ${
                                pagination.hasPrevPage
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Previous
                        </button>

                        <span className='text-gray-600'>
                            Page {pagination.currentPage} of{' '}
                            {pagination.totalPages}
                        </span>

                        <button
                            onClick={() =>
                                handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={!pagination.hasNextPage}
                            className={`px-4 py-2 rounded-md ${
                                pagination.hasNextPage
                                    ? 'bg-primary text-white hover:bg-primary/90'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {ideas.length === 0 && !loading && (
                <div className='text-center py-12'>
                    <p className='text-gray-500 text-lg'>
                        No ideas match your current filters.
                    </p>
                    <div className='mt-4 space-x-4'>
                        <button
                            onClick={clearFilters}
                            className='text-primary hover:underline'
                        >
                            Clear filters
                        </button>
                        <span className='text-gray-400'>or</span>
                        <button
                            onClick={() => fetchAllIdeas(1)}
                            className='text-primary hover:underline'
                        >
                            Show all ideas
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
