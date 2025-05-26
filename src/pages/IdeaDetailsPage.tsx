import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { type Idea } from '../types/idea'
import LoadingSpinner from '../components/LoadingSpinner'
import {
    LoadingErrorDisplay,
    NotFoundErrorDisplay,
} from '../components/common/ErrorDisplay'
import {
    IoArrowBack,
    IoPencil,
    IoTrash,
    IoCalendar,
    IoPricetag,
    IoShield,
    IoDocument,
} from 'react-icons/io5'

export default function IdeaDetailsPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [idea, setIdea] = useState<Idea | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const fetchIdea = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            }

            // Add auth token if user is signed in
            if (currentUser) {
                const token = await currentUser.getIdToken()
                headers.Authorization = `Bearer ${token}`
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/ideas/${id}`,
                { headers }
            )

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Idea not found')
                }
                throw new Error('Failed to fetch idea details')
            }

            const data = await response.json()
            setIdea(data)
        } catch (err) {
            console.error('Error fetching idea:', err)
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }, [id, currentUser])

    useEffect(() => {
        fetchIdea()
    }, [fetchIdea])

    const handleDelete = async () => {
        if (!currentUser || !idea) return

        try {
            setDeleteLoading(true)
            const token = await currentUser.getIdToken()

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/ideas/${id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                throw new Error('Failed to delete idea')
            }

            navigate('/ideas', {
                state: { message: 'Idea deleted successfully' },
            })
        } catch (err) {
            console.error('Error deleting idea:', err)
            setError(
                err instanceof Error ? err.message : 'Failed to delete idea'
            )
        } finally {
            setDeleteLoading(false)
            setShowDeleteConfirm(false)
        }
    }

    if (loading) {
        return (
            <div className='max-w-4xl mx-auto px-4 py-8'>
                <LoadingSpinner size='lg' text='Loading idea details...' />
            </div>
        )
    }

    if (error) {
        return (
            <LoadingErrorDisplay
                onRetry={fetchIdea}
                backUrl='/ideas'
                itemName='idea'
                size='lg'
            />
        )
    }

    if (!idea) {
        return (
            <NotFoundErrorDisplay itemName='idea' backUrl='/ideas' size='lg' />
        )
    }

    const isCreator = currentUser?.uid === idea.creator
    const isNDAProtected = idea.requireNDA && !isCreator

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            {/* Header with navigation */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
                <div>
                    <Link
                        to='/ideas'
                        className='flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-primary mb-2'
                    >
                        <IoArrowBack size={20} />
                        Back to Ideas
                    </Link>
                    <h1 className='title-primary-page'>Idea Details</h1>
                    <p className='title-secondary-page'>
                        View and explore this innovative idea
                    </p>
                </div>

                {isCreator && (
                    <div className='flex items-center gap-3'>
                        <Link
                            to={`/ideas/${id}/edit`}
                            className='px-4 py-2 font-primary button-primary transition-colors flex items-center gap-2'
                        >
                            <IoPencil size={16} />
                            Edit
                        </Link>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className='px-4 py-2 font-primary button-secondary transition-colors flex items-center gap-2'
                        >
                            <IoTrash size={16} />
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Main content */}
            <div className='bg-white shadow-lg rounded-lg p-8'>
                {/* Title and Price Header */}
                <div className='mb-8 pb-6 border-b-2 border-gray-200'>
                    <div className='flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 mb-4'>
                        <h2 className='title-primary-page'>{idea.title}</h2>
                        <div className='text-left sm:text-right'>
                            <div className='text-3xl sm:text-4xl font-bold text-accent font-primary bg-primary p-2 rounded-md'>
                                ${idea.desiredPrice.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className='flex flex-wrap items-center gap-3'>
                        <span
                            className={`px-3 py-1 rounded-lg text-sm font-medium border-2 ${
                                idea.type === 'Product'
                                    ? 'border-blue-300 bg-blue-100 text-blue-800'
                                    : 'border-green-300 bg-green-100 text-green-800'
                            }`}
                        >
                            {idea.type}
                        </span>
                        <span className='px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded-lg text-sm font-medium text-gray-700'>
                            {idea.category}
                        </span>
                        {idea.requireNDA && (
                            <span className='inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium border-2 border-yellow-300'>
                                <IoShield size={14} />
                                NDA Required
                            </span>
                        )}
                    </div>
                </div>

                {/* Content section */}
                <div>
                    {isNDAProtected ? (
                        <div className='text-center py-12'>
                            <IoDocument
                                size={64}
                                className='mx-auto text-secondary mb-6'
                            />
                            <h3 className='text-2xl font-bold text-secondary mb-4 font-primary'>
                                NDA Required
                            </h3>
                            <p className='text-gray-600 mb-8 max-w-2xl mx-auto'>
                                This idea requires a Non-Disclosure Agreement to
                                view full details. Please contact the creator to
                                proceed.
                            </p>
                            {idea.creatorInfo && (
                                <div className='max-w-md mx-auto'>
                                    <label className='form-label text-center block mb-4'>
                                        Contact Creator
                                    </label>
                                    <Link
                                        to={`/profile/${idea.creator}`}
                                        className='form-input bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer block'
                                    >
                                        <div className='flex items-center gap-4'>
                                            <img
                                                src={
                                                    idea.creatorInfo.photoURL ||
                                                    '/default-avatar.png'
                                                }
                                                alt={
                                                    idea.creatorInfo.displayName
                                                }
                                                className='w-12 h-12 rounded-full object-cover border-2 border-primary'
                                                onError={(e) => {
                                                    ;(
                                                        e.target as HTMLImageElement
                                                    ).src =
                                                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDUyYzAtMTEuMDQ2IDguOTU0LTIwIDIwLTIwczIwIDguOTU0IDIwIDIwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                                                }}
                                            />
                                            <div className='text-left'>
                                                <p className='font-semibold text-primary font-primary hover:text-primary-dark'>
                                                    {
                                                        idea.creatorInfo
                                                            .displayName
                                                    }
                                                </p>
                                                <p className='text-gray-600 text-sm'>
                                                    {idea.creatorInfo.email}
                                                </p>
                                                {idea.contactPreference && (
                                                    <p className='text-gray-500 text-xs mt-1'>
                                                        Preferred contact:{' '}
                                                        {idea.contactPreference}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className='space-y-6'>
                            {/* Problem Description */}
                            <div>
                                <label className='form-label'>
                                    Problem Description
                                </label>
                                <div className='form-input min-h-[120px] p-4 bg-gray-50 border-gray-300'>
                                    <p className='text-gray-700 leading-relaxed'>
                                        {idea.problemDescription}
                                    </p>
                                </div>
                            </div>

                            {/* Solution Description */}
                            <div>
                                <label className='form-label'>
                                    Proposed Solution
                                </label>
                                <div className='form-input min-h-[120px] p-4 bg-gray-50 border-gray-300'>
                                    <p className='text-gray-700 leading-relaxed'>
                                        {idea.solutionDescription}
                                    </p>
                                </div>
                            </div>

                            {/* Photos */}
                            {idea.photos && idea.photos.length > 0 && (
                                <div>
                                    <label className='form-label'>Photos</label>
                                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                                        {idea.photos.map((photo, index) => (
                                            <div
                                                key={index}
                                                className='relative group'
                                            >
                                                <img
                                                    src={photo}
                                                    alt={`Idea photo ${
                                                        index + 1
                                                    }`}
                                                    className='w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-primary transition-colors cursor-pointer'
                                                    onClick={() =>
                                                        window.open(
                                                            photo,
                                                            '_blank'
                                                        )
                                                    }
                                                />
                                                <div className='absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center'>
                                                    <span className='text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium'>
                                                        Click to view full size
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Additional Notes */}
                            {idea.additionalNotes && (
                                <div>
                                    <label className='form-label'>
                                        Additional Notes
                                    </label>
                                    <div className='form-input min-h-[80px] p-4 bg-gray-50 border-gray-300'>
                                        <p className='text-gray-700 leading-relaxed'>
                                            {idea.additionalNotes}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Additional Details Grid */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t-2 border-gray-200'>
                                {/* Additional Information */}
                                <div>
                                    <label className='form-label'>
                                        Additional Information
                                    </label>
                                    <div className='form-input bg-gray-50 border-gray-300 space-y-3'>
                                        <div className='flex items-center gap-3 text-gray-700'>
                                            <IoPricetag
                                                size={18}
                                                className='text-secondary'
                                            />
                                            <span className='text-sm'>
                                                Desired Price:
                                                <span className='text-primary font-semibold ml-2'>
                                                    $
                                                    {idea.desiredPrice.toLocaleString()}
                                                </span>
                                            </span>
                                        </div>
                                        <div className='flex items-center gap-3 text-gray-700'>
                                            <IoCalendar
                                                size={18}
                                                className='text-secondary'
                                            />
                                            <span className='text-sm'>
                                                Created:{' '}
                                                {new Date(
                                                    idea.createdAt
                                                ).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {idea.requireNDA && (
                                            <div className='flex items-center gap-3 text-yellow-700'>
                                                <IoShield
                                                    size={18}
                                                    className='text-yellow-600'
                                                />
                                                <span className='text-sm font-medium'>
                                                    NDA Required
                                                </span>
                                            </div>
                                        )}
                                        {idea.protectionStatus && (
                                            <div className='flex items-center gap-3 text-gray-700'>
                                                <IoShield
                                                    size={18}
                                                    className='text-secondary'
                                                />
                                                <span className='text-sm'>
                                                    Protection Status:
                                                    <span className='text-primary font-semibold ml-2'>
                                                        {idea.protectionStatus}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                        {idea.contactPreference && (
                                            <div className='flex items-center gap-3 text-gray-700'>
                                                <IoDocument
                                                    size={18}
                                                    className='text-secondary'
                                                />
                                                <span className='text-sm'>
                                                    Contact Preference:
                                                    <span className='text-primary font-semibold ml-2'>
                                                        {idea.contactPreference}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Creator Info */}
                                {idea.creatorInfo && (
                                    <div>
                                        <label className='form-label'>
                                            👤 Creator Details
                                        </label>
                                        <Link
                                            to={`/profile/${idea.creator}`}
                                            className='form-input bg-gray-50 border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer block'
                                        >
                                            <div className='flex items-center gap-4'>
                                                <img
                                                    src={
                                                        idea.creatorInfo
                                                            .photoURL ||
                                                        '/default-avatar.png'
                                                    }
                                                    alt={
                                                        idea.creatorInfo
                                                            .displayName
                                                    }
                                                    className='w-12 h-12 rounded-full object-cover border-2 border-primary'
                                                    onError={(e) => {
                                                        ;(
                                                            e.target as HTMLImageElement
                                                        ).src =
                                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDUyYzAtMTEuMDQ2IDguOTU0LTIwIDIwLTIwczIwIDguOTU0IDIwIDIwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                                                    }}
                                                />
                                                <div>
                                                    <p className='font-semibold text-primary font-primary hover:text-primary-dark'>
                                                        {
                                                            idea.creatorInfo
                                                                .displayName
                                                        }
                                                    </p>
                                                    <p className='text-gray-600 text-sm'>
                                                        {idea.creatorInfo.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
                    <div className='bg-white rounded-lg p-8 max-w-md w-full shadow-lg border-2 border-gray-200'>
                        <div className='text-center mb-6'>
                            <IoTrash
                                size={48}
                                className='mx-auto text-secondary mb-4'
                            />
                            <h3 className='form-label text-secondary  mb-2'>
                                Delete Idea
                            </h3>
                            <p className='text-primary text-lg font-primary'>
                                Are you sure you want to delete
                                <span className='font-bold text-primary'>
                                    {' '}
                                    "{idea.title}"
                                </span>
                                ?
                            </p>
                            <p className='text-red-500 text-sm mt-2 font-medium'>
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className='flex flex-col sm:flex-row justify-center gap-3'>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className='button-primary p-4'
                                disabled={deleteLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleteLoading}
                                className='button-secondary p-4'
                            >
                                {deleteLoading ? (
                                    <>
                                        <LoadingSpinner size='sm' />
                                        Deleting...
                                    </>
                                ) : (
                                    <>Delete Idea</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
