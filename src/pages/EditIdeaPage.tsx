import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { type Idea } from '../types/idea'
import LoadingSpinner from '../components/LoadingSpinner'
import IdeaForm, { type IdeaFormData } from '../components/forms/IdeaForm'
import { LoadingErrorDisplay } from '../components/common/ErrorDisplay'
import { IoArrowBack } from 'react-icons/io5'

export default function EditIdeaPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [idea, setIdea] = useState<Idea | null>(null)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const fetchIdea = useCallback(async () => {
        if (!id || !currentUser) return

        try {
            setLoading(true)
            setFetchError(null)

            const token = await currentUser.getIdToken()
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/ideas/${id}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Idea not found')
                }
                if (response.status === 403) {
                    throw new Error('You are not authorized to edit this idea')
                }
                throw new Error('Failed to fetch idea details')
            }

            const data = await response.json()

            // Check if user is the creator
            if (data.creator !== currentUser.uid) {
                throw new Error('You are not authorized to edit this idea')
            }

            setIdea(data)
        } catch (err) {
            console.error('Error fetching idea:', err)
            setFetchError(
                err instanceof Error ? err.message : 'An error occurred'
            )
        } finally {
            setLoading(false)
        }
    }, [id, currentUser])

    useEffect(() => {
        if (currentUser) {
            fetchIdea()
        }
    }, [fetchIdea, currentUser])

    const handleSubmit = async (data: IdeaFormData, files: File[]) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            if (!currentUser || !id) {
                throw new Error('Please sign in to update the idea')
            }

            const token = await currentUser.getIdToken()

            // Include uploaded photo URLs if any
            const submitData = {
                ...data,
                photos: files.map((file) => file.name), // Replace with actual upload URLs
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/ideas/${id}`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(submitData),
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to update idea')
            }

            navigate(`/ideas/${id}`, {
                state: { message: 'Idea updated successfully!' },
            })
        } catch (err) {
            setSubmitError(
                err instanceof Error
                    ? err.message
                    : 'An unexpected error occurred'
            )
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleCancel = () => {
        navigate(`/ideas/${id}`)
    }

    if (loading) {
        return (
            <div className='max-w-4xl mx-auto px-4 py-8'>
                <LoadingSpinner size='lg' text='Loading idea details...' />
            </div>
        )
    }

    if (fetchError) {
        return (
            <LoadingErrorDisplay
                onRetry={fetchIdea}
                backUrl='/ideas'
                itemName='idea'
                size='lg'
            />
        )
    }

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
                <Link
                    to={`/ideas/${id}`}
                    className='flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-primary'
                >
                    <IoArrowBack size={20} />
                    Back to Idea Details
                </Link>
            </div>

            <IdeaForm
                mode='edit'
                initialData={idea || undefined}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
                onCancel={handleCancel}
            />
        </div>
    )
}
