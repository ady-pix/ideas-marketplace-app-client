import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import IdeaForm, { type IdeaFormData } from '../components/forms/IdeaForm'

export default function CreateIdeaPage() {
    const navigate = useNavigate()
    const { currentUser } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const handleSubmit = async (data: IdeaFormData, files: File[]) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
            if (!currentUser) {
                throw new Error('Please sign in to submit an idea')
            }

            const token = await currentUser.getIdToken()

            // Include uploaded photo URLs if any
            const submitData = {
                ...data,
                photos: files.map((file) => file.name), // Replace with actual upload URLs
            }

            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/ideas`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify(submitData),
                }
            )

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Failed to submit idea')
            }

            navigate('/ideas/success')
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

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            <IdeaForm
                mode='create'
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                submitError={submitError}
            />
        </div>
    )
}
