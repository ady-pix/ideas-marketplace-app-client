import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useEffect } from 'react'
import { Switch } from '@headlessui/react'
import { useCategories } from '../../hooks/useCategories'
import LoadingSpinner from '../LoadingSpinner'
import { IoSave, IoAdd, IoWarning } from 'react-icons/io5'
import type { Idea } from '../../types/idea'

// Configuration constants
const protections = ['None', 'Patent', 'Trademark', 'Copyright', 'Trade Secret']
const contactPreferences = ['Email', 'Phone', 'Messaging']
const ideaTypes = ['Product', 'Service'] as const

// Form validation schema
const formSchema = z.object({
    title: z.string().min(3, 'Title must be at least 3 characters'),
    category: z.string().min(1, 'Please select a category'),
    type: z.enum(['Product', 'Service'], {
        required_error: 'Please select a type',
    }),
    problemDescription: z
        .string()
        .min(10, 'Problem description must be at least 10 characters'),
    solutionDescription: z
        .string()
        .min(10, 'Solution description must be at least 10 characters'),
    protectionStatus: z.string().min(1, 'Please select protection status'),
    requireNDA: z.boolean(),
    desiredPrice: z
        .number({
            required_error: 'Price is required',
            invalid_type_error: 'Price must be a valid number',
        })
        .min(1, 'Price must be greater than zero')
        .max(10000000, 'Price cannot exceed $10,000,000'),
    contactPreference: z.string().min(1, 'Please select contact preference'),
    additionalNotes: z.string().optional(),
    photos: z.array(z.string()).optional(),
})

export type IdeaFormData = z.infer<typeof formSchema>

interface IdeaFormProps {
    mode: 'create' | 'edit'
    initialData?: Partial<Idea>
    onSubmit: (data: IdeaFormData, files: File[]) => Promise<void>
    isSubmitting: boolean
    submitError: string | null
    onCancel?: () => void
}

export default function IdeaForm({
    mode,
    initialData,
    onSubmit,
    isSubmitting,
    submitError,
    onCancel,
}: IdeaFormProps) {
    const {
        categoryNames,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories()
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([])

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        reset,
        formState: { errors },
    } = useForm<IdeaFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            requireNDA: false,
            protectionStatus: 'None',
            type: 'Product',
            ...initialData,
        },
    })

    // Populate form with initial data when it changes (for edit mode)
    useEffect(() => {
        if (initialData && mode === 'edit') {
            const formData = {
                title: initialData.title || '',
                category: initialData.category || '',
                type: initialData.type || 'Product',
                problemDescription: initialData.problemDescription || '',
                solutionDescription: initialData.solutionDescription || '',
                protectionStatus: initialData.protectionStatus || 'None',
                requireNDA: initialData.requireNDA || false,
                desiredPrice: initialData.desiredPrice || 0,
                contactPreference: initialData.contactPreference || 'Email',
                additionalNotes: initialData.additionalNotes || '',
                photos: initialData.photos || [],
            }
            reset(formData)
        }
    }, [initialData, mode, reset])

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        setUploadedFiles(files)
    }

    const handleFormSubmit = async (data: IdeaFormData) => {
        await onSubmit(data, uploadedFiles)
    }

    const inputClass = 'form-input'
    const labelClass = 'form-label'
    const errorClass = 'form-label-error'

    return (
        <div className='bg-white shadow-lg rounded-lg p-8'>
            <h1 className='title-primary-page'>
                {mode === 'create' ? 'Submit Your Idea' : 'Edit Your Idea'}
            </h1>
            <p className='title-secondary-page'>
                {mode === 'create'
                    ? 'Share your innovative idea with potential investors and collaborators'
                    : 'Update your idea details and information'}
            </p>

            {submitError && (
                <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2'>
                    <IoWarning className='w-5 h-5 text-red-500 flex-shrink-0' />
                    <span>{submitError}</span>
                </div>
            )}

            {categoriesError && (
                <div className='bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6'>
                    Warning: Failed to load categories. Please refresh the page.
                </div>
            )}

            <form
                onSubmit={handleSubmit(handleFormSubmit)}
                className='space-y-6'
            >
                {/* Title */}
                <div>
                    <label className={labelClass}>Idea Title *</label>
                    <input
                        {...register('title')}
                        className={inputClass}
                        placeholder='Enter a catchy title for your idea'
                    />
                    {errors.title && (
                        <p className={errorClass}>{errors.title.message}</p>
                    )}
                </div>

                {/* Category and Type Row */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <label className={labelClass}>Category *</label>
                        <select
                            {...register('category')}
                            className={inputClass}
                            disabled={categoriesLoading}
                        >
                            <option value=''>
                                {categoriesLoading
                                    ? 'Loading categories...'
                                    : 'Select a category'}
                            </option>
                            {categoryNames.map((categoryName) => (
                                <option key={categoryName} value={categoryName}>
                                    {categoryName}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className={errorClass}>
                                {errors.category.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>Type *</label>
                        <div className='flex gap-6 mt-2'>
                            {ideaTypes.map((t) => (
                                <label key={t} className='flex items-center'>
                                    <input
                                        {...register('type')}
                                        type='radio'
                                        value={t}
                                        className='mr-2 text-blue-600'
                                    />
                                    <span className='text-sm font-medium text-gray-700'>
                                        {t}
                                    </span>
                                </label>
                            ))}
                        </div>
                        {errors.type && (
                            <p className={errorClass}>{errors.type.message}</p>
                        )}
                    </div>
                </div>

                {/* Problem Description */}
                <div>
                    <label className={labelClass}>Problem Description *</label>
                    <textarea
                        {...register('problemDescription')}
                        className={inputClass}
                        rows={4}
                        placeholder='Describe the problem your idea solves...'
                    />
                    {errors.problemDescription && (
                        <p className={errorClass}>
                            {errors.problemDescription.message}
                        </p>
                    )}
                </div>

                {/* Solution Description */}
                <div>
                    <label className={labelClass}>Solution Description *</label>
                    <textarea
                        {...register('solutionDescription')}
                        className={inputClass}
                        rows={4}
                        placeholder='Explain how your idea solves the problem...'
                    />
                    {errors.solutionDescription && (
                        <p className={errorClass}>
                            {errors.solutionDescription.message}
                        </p>
                    )}
                </div>

                {/* Photos Upload */}
                <div>
                    <label className={labelClass}>Photos (Optional)</label>
                    <input
                        type='file'
                        multiple
                        accept='image/*'
                        onChange={handleFileUpload}
                        className={inputClass}
                    />
                    {uploadedFiles.length > 0 && (
                        <p className='text-sm text-gray-500 mt-1'>
                            {uploadedFiles.length} file(s) selected
                        </p>
                    )}
                </div>

                {/* Protection Status and Price Row */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <label className={labelClass}>
                            Current Protection Status *
                        </label>
                        <select
                            {...register('protectionStatus')}
                            className={inputClass}
                        >
                            {protections.map((p) => (
                                <option key={p} value={p}>
                                    {p}
                                </option>
                            ))}
                        </select>
                        {errors.protectionStatus && (
                            <p className={errorClass}>
                                {errors.protectionStatus.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className={labelClass}>
                            Desired Price ($) *
                        </label>
                        <input
                            {...register('desiredPrice', {
                                valueAsNumber: true,
                            })}
                            type='number'
                            className={inputClass}
                            step='0.01'
                            min='1'
                            placeholder='10000'
                        />
                        {errors.desiredPrice && (
                            <p className={errorClass}>
                                {errors.desiredPrice.message}
                            </p>
                        )}
                    </div>
                </div>

                {/* NDA Requirement */}
                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-md'>
                    <Switch
                        checked={watch('requireNDA')}
                        onChange={(checked) => setValue('requireNDA', checked)}
                        className={`${
                            watch('requireNDA') ? 'bg-primary' : 'bg-gray-200'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2`}
                    >
                        <span
                            className={`${
                                watch('requireNDA')
                                    ? 'translate-x-6'
                                    : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                    </Switch>
                    <label className='text-sm font-medium text-gray-700'>
                        Require NDA for viewers?
                    </label>
                </div>

                {/* Contact Preference */}
                <div>
                    <label className={labelClass}>
                        Preferred Contact Method *
                    </label>
                    <select
                        {...register('contactPreference')}
                        className={inputClass}
                    >
                        <option value=''>Select contact preference</option>
                        {contactPreferences.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                    {errors.contactPreference && (
                        <p className={errorClass}>
                            {errors.contactPreference.message}
                        </p>
                    )}
                </div>

                {/* Additional Notes */}
                <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea
                        {...register('additionalNotes')}
                        className={inputClass}
                        rows={3}
                        placeholder='Any additional information, requirements, or details...'
                    />
                </div>

                {/* Submit Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 pt-6'>
                    <button
                        type='submit'
                        disabled={isSubmitting}
                        className='submit-button flex items-center justify-center gap-2'
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size='sm' />
                                {mode === 'create'
                                    ? 'Submitting...'
                                    : 'Updating...'}
                            </>
                        ) : (
                            <>
                                {mode === 'create' ? (
                                    <IoAdd size={20} />
                                ) : (
                                    <IoSave size={20} />
                                )}
                                {mode === 'create'
                                    ? 'Submit Idea'
                                    : 'Update Idea'}
                            </>
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type='button'
                            onClick={onCancel}
                            className='px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:border-gray-400 hover:text-gray-900 transition-colors text-center font-medium'
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
