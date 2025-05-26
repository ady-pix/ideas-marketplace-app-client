import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile as updateFirebaseProfile } from 'firebase/auth'
import { database, storage } from '../services/firebase'
import { UserProfile } from '../types/user'
import { useCategories } from '../hooks/useCategories'
import { useLanguages } from '../hooks/useLanguages'
import LoadingSpinner from '../components/LoadingSpinner'
import {
    IoCamera,
    IoPerson,
    IoMail,
    IoLocation,
    IoGlobe,
    IoDocument,
    IoLanguage,
    IoCheckmark,
    IoAdd,
    IoClose,
    IoArrowBack,
    IoSave,
} from 'react-icons/io5'

function EditProfilePage() {
    const { currentUser, userProfile } = useAuth()
    const navigate = useNavigate()

    // Form state
    const [formData, setFormData] = useState<Partial<UserProfile>>({})
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [cvFile, setCvFile] = useState<File | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<string>('')

    // Category and language selection
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)

    // Fetch dynamic data
    const {
        categoryNames,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories()
    const {
        languageNames,
        loading: languagesLoading,
        error: languagesError,
    } = useLanguages()

    // Load user data when component mounts
    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }

        // Initialize form data
        setFormData({
            displayName:
                userProfile?.displayName || currentUser.displayName || '',
            fullName: userProfile?.fullName || '',
            email: userProfile?.email || currentUser.email || '',
            photoURL: userProfile?.photoURL || currentUser.photoURL || '',
            bio: userProfile?.bio || '',
            location: userProfile?.location || '',
            website: userProfile?.website || '',
            preferredCategories: userProfile?.preferredCategories || [],
            languagePreferences: userProfile?.languagePreferences || [],
            cvUrl: userProfile?.cvUrl || '',
        })
    }, [currentUser, userProfile, navigate])

    // Handle form input changes
    const handleInputChange = (
        field: keyof UserProfile,
        value: string | string[]
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Handle profile image change
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0])
            // Show preview
            const previewUrl = URL.createObjectURL(e.target.files[0])
            setFormData((prev) => ({ ...prev, photoURL: previewUrl }))
        }
    }

    // Handle CV file change
    const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setCvFile(e.target.files[0])
        }
    }

    // Handle category selection
    const toggleCategory = (category: string) => {
        const current = formData.preferredCategories || []
        const updated = current.includes(category)
            ? current.filter((c) => c !== category)
            : [...current, category]
        handleInputChange('preferredCategories', updated)
    }

    // Handle language selection
    const toggleLanguage = (language: string) => {
        const current = formData.languagePreferences || []
        const updated = current.includes(language)
            ? current.filter((l) => l !== language)
            : [...current, language]
        handleInputChange('languagePreferences', updated)
    }

    // Handle profile update
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!currentUser) return

        try {
            setLoading(true)
            setError('')

            const updateData = { ...formData }

            // Upload profile image if changed
            if (photoFile) {
                const imageRef = ref(
                    storage,
                    `profile_images/${currentUser.uid}`
                )
                await uploadBytes(imageRef, photoFile)
                updateData.photoURL = await getDownloadURL(imageRef)
            }

            // Upload CV if changed
            if (cvFile) {
                const cvRef = ref(
                    storage,
                    `cvs/${currentUser.uid}_${cvFile.name}`
                )
                await uploadBytes(cvRef, cvFile)
                updateData.cvUrl = await getDownloadURL(cvRef)
            }

            // Update Firebase Authentication profile
            await updateFirebaseProfile(currentUser, {
                displayName: updateData.displayName,
                photoURL: updateData.photoURL || null,
            })

            // Update Firestore user document
            await updateDoc(doc(database, 'users', currentUser.uid), updateData)

            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                navigate('/profile')
            }, 2000)
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to update profile'
            setError(errorMessage)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    // Show loading spinner while fetching categories and languages
    if (categoriesLoading || languagesLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <LoadingSpinner size='lg' text='Loading profile form...' />
            </div>
        )
    }

    // Show error if failed to load categories or languages
    if (categoriesError || languagesError) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold text-red-600 mb-2'>
                        Failed to load profile form
                    </h2>
                    <p className='text-gray-600'>
                        {categoriesError || languagesError}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className='mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90'
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    if (!currentUser) {
        return <LoadingSpinner size='lg' text='Loading...' />
    }

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
                <div>
                    <Link
                        to='/profile'
                        className='flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-primary mb-2'
                    >
                        <IoArrowBack size={20} />
                        Back to Profile
                    </Link>
                    <h1 className='title-primary-page'>Edit Profile</h1>
                    <p className='title-secondary-page'>
                        Update your personal information and preferences
                    </p>
                </div>
            </div>

            {/* Success/Error Messages */}
            {error && (
                <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'>
                    {error}
                </div>
            )}

            {success && (
                <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6'>
                    Profile updated successfully! Redirecting to profile view...
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-8'>
                {/* Basic User Info Section */}
                <div className='bg-white shadow-lg rounded-lg p-8'>
                    <h2 className='form-label text-xl mb-6 flex items-center gap-2'>
                        🧍 Basic User Info
                    </h2>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {/* Profile Picture */}
                        <div className='lg:col-span-1 flex flex-col items-center'>
                            <div className='relative mb-4'>
                                <img
                                    src={
                                        formData.photoURL ||
                                        '/default-avatar.png'
                                    }
                                    alt='Profile'
                                    className='h-32 w-32 rounded-full object-cover border-4 border-primary'
                                    onError={(e) => {
                                        ;(e.target as HTMLImageElement).src =
                                            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDUyYzAtMTEuMDQ2IDguOTU0LTIwIDIwLTIwczIwIDguOTU0IDIwIDIwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                                    }}
                                />
                                <label
                                    htmlFor='photo-upload'
                                    className='absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full cursor-pointer hover:bg-secondary/90 transition-colors'
                                >
                                    <IoCamera size={20} />
                                </label>
                                <input
                                    id='photo-upload'
                                    type='file'
                                    accept='image/*'
                                    className='hidden'
                                    onChange={handleImageChange}
                                />
                            </div>
                            <p className='text-sm text-gray-500 text-center'>
                                Click the camera icon to change your photo
                            </p>
                        </div>

                        {/* Basic Info Fields */}
                        <div className='lg:col-span-2 space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoPerson size={16} />
                                        Full Name
                                    </label>
                                    <input
                                        type='text'
                                        className='form-input'
                                        value={formData.fullName || ''}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'fullName',
                                                e.target.value
                                            )
                                        }
                                        placeholder='Enter your full name'
                                    />
                                </div>

                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoPerson size={16} />
                                        Display Name *
                                    </label>
                                    <input
                                        type='text'
                                        className='form-input'
                                        value={formData.displayName || ''}
                                        onChange={(e) =>
                                            handleInputChange(
                                                'displayName',
                                                e.target.value
                                            )
                                        }
                                        required
                                        placeholder='Enter your display name'
                                    />
                                </div>
                            </div>

                            <div>
                                <label className='form-label flex items-center gap-2'>
                                    <IoMail size={16} />
                                    Email Address
                                </label>
                                <input
                                    type='email'
                                    className='form-input bg-gray-100'
                                    value={formData.email || ''}
                                    readOnly
                                />
                                <p className='text-sm text-gray-500 mt-1'>
                                    Email cannot be changed
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Fields Section */}
                <div className='bg-white shadow-lg rounded-lg p-8'>
                    <h2 className='form-label text-xl mb-6 flex items-center gap-2'>
                        🛠️ Personal Information
                    </h2>

                    <div className='space-y-6'>
                        {/* Bio */}
                        <div>
                            <label className='form-label'>Bio / About Me</label>
                            <textarea
                                className='form-input min-h-[120px]'
                                value={formData.bio || ''}
                                onChange={(e) =>
                                    handleInputChange('bio', e.target.value)
                                }
                                placeholder='Tell others about yourself, your interests, and expertise...'
                                rows={4}
                            />
                        </div>

                        {/* Location and Website */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div>
                                <label className='form-label flex items-center gap-2'>
                                    <IoLocation size={16} />
                                    Location
                                </label>
                                <input
                                    type='text'
                                    className='form-input'
                                    value={formData.location || ''}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'location',
                                            e.target.value
                                        )
                                    }
                                    placeholder='City, Country'
                                />
                                <p className='text-sm text-gray-500 mt-1'>
                                    Optional for networking
                                </p>
                            </div>

                            <div>
                                <label className='form-label flex items-center gap-2'>
                                    <IoGlobe size={16} />
                                    Website / Portfolio Link
                                </label>
                                <input
                                    type='url'
                                    className='form-input'
                                    value={formData.website || ''}
                                    onChange={(e) =>
                                        handleInputChange(
                                            'website',
                                            e.target.value
                                        )
                                    }
                                    placeholder='https://your-website.com'
                                />
                            </div>
                        </div>

                        {/* Preferred Categories */}
                        <div>
                            <label className='form-label'>
                                Preferred Categories
                            </label>
                            <div className='relative'>
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowCategoryDropdown(
                                            !showCategoryDropdown
                                        )
                                    }
                                    className='form-input flex items-center justify-between w-full'
                                >
                                    <span>
                                        {formData.preferredCategories?.length
                                            ? `${formData.preferredCategories.length} categories selected`
                                            : "Select categories you're interested in"}
                                    </span>
                                    <IoAdd
                                        size={20}
                                        className={`transition-transform ${
                                            showCategoryDropdown
                                                ? 'rotate-45'
                                                : ''
                                        }`}
                                    />
                                </button>

                                {showCategoryDropdown && (
                                    <div className='absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'>
                                        {categoryNames.map(
                                            (category: string) => (
                                                <button
                                                    key={category}
                                                    type='button'
                                                    onClick={() =>
                                                        toggleCategory(category)
                                                    }
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                                        formData.preferredCategories?.includes(
                                                            category
                                                        )
                                                            ? 'bg-primary/10 text-primary'
                                                            : ''
                                                    }`}
                                                >
                                                    {category}
                                                    {formData.preferredCategories?.includes(
                                                        category
                                                    ) && (
                                                        <IoCheckmark
                                                            size={16}
                                                            className='text-primary'
                                                        />
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Categories Display */}
                            {formData.preferredCategories &&
                                formData.preferredCategories.length > 0 && (
                                    <div className='flex flex-wrap gap-2 mt-3'>
                                        {formData.preferredCategories.map(
                                            (category) => (
                                                <span
                                                    key={category}
                                                    className='inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20'
                                                >
                                                    {category}
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            toggleCategory(
                                                                category
                                                            )
                                                        }
                                                        className='hover:text-red-500'
                                                    >
                                                        <IoClose size={14} />
                                                    </button>
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* Language Preferences */}
                        <div>
                            <label className='form-label flex items-center gap-2'>
                                <IoLanguage size={16} />
                                Language Preferences
                            </label>
                            <div className='relative'>
                                <button
                                    type='button'
                                    onClick={() =>
                                        setShowLanguageDropdown(
                                            !showLanguageDropdown
                                        )
                                    }
                                    className='form-input flex items-center justify-between w-full'
                                >
                                    <span>
                                        {formData.languagePreferences?.length
                                            ? `${formData.languagePreferences.length} languages selected`
                                            : 'Select your preferred languages'}
                                    </span>
                                    <IoAdd
                                        size={20}
                                        className={`transition-transform ${
                                            showLanguageDropdown
                                                ? 'rotate-45'
                                                : ''
                                        }`}
                                    />
                                </button>

                                {showLanguageDropdown && (
                                    <div className='absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto'>
                                        {languageNames.map(
                                            (language: string) => (
                                                <button
                                                    key={language}
                                                    type='button'
                                                    onClick={() =>
                                                        toggleLanguage(language)
                                                    }
                                                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                                        formData.languagePreferences?.includes(
                                                            language
                                                        )
                                                            ? 'bg-primary/10 text-primary'
                                                            : ''
                                                    }`}
                                                >
                                                    {language}
                                                    {formData.languagePreferences?.includes(
                                                        language
                                                    ) && (
                                                        <IoCheckmark
                                                            size={16}
                                                            className='text-primary'
                                                        />
                                                    )}
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Selected Languages Display */}
                            {formData.languagePreferences &&
                                formData.languagePreferences.length > 0 && (
                                    <div className='flex flex-wrap gap-2 mt-3'>
                                        {formData.languagePreferences.map(
                                            (language) => (
                                                <span
                                                    key={language}
                                                    className='inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm border border-secondary/20'
                                                >
                                                    {language}
                                                    <button
                                                        type='button'
                                                        onClick={() =>
                                                            toggleLanguage(
                                                                language
                                                            )
                                                        }
                                                        className='hover:text-red-500'
                                                    >
                                                        <IoClose size={14} />
                                                    </button>
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
                        </div>

                        {/* CV Upload */}
                        <div>
                            <label className='form-label flex items-center gap-2'>
                                <IoDocument size={16} />
                                CV / Resume
                            </label>
                            <div className='space-y-3'>
                                <input
                                    type='file'
                                    accept='.pdf,.doc,.docx'
                                    onChange={handleCvChange}
                                    className='form-input file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-white hover:file:bg-primary/90'
                                />
                                {formData.cvUrl && (
                                    <div className='flex items-center gap-2 text-sm text-gray-600'>
                                        <IoDocument size={16} />
                                        <a
                                            href={formData.cvUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-primary hover:text-primary/80 underline'
                                        >
                                            View current CV
                                        </a>
                                    </div>
                                )}
                                <p className='text-sm text-gray-500'>
                                    Upload your CV/Resume (PDF, DOC, or DOCX
                                    format)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Submit Buttons */}
                <div className='flex flex-col sm:flex-row justify-center gap-4'>
                    <Link
                        to='/profile'
                        className='button-general button-secondary flex items-center justify-center gap-2'
                    >
                        Cancel
                    </Link>
                    <button
                        type='submit'
                        className='button-general button-primary flex items-center justify-center gap-2'
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <LoadingSpinner size='sm' />
                                Saving Changes...
                            </>
                        ) : (
                            <>
                                <IoSave size={16} />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditProfilePage
