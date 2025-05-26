// src/pages/RegisterPage.tsx
import { useState, FormEvent, ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { type UserProfile } from '../types/user'
import { useCategories } from '../hooks/useCategories'
import { useLanguages } from '../hooks/useLanguages'
import LoadingSpinner from '../components/LoadingSpinner'
import { IoCheckmark, IoAdd, IoClose, IoCamera } from 'react-icons/io5'

function RegisterPage() {
    // Basic registration fields
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [displayName, setDisplayName] = useState<string>('')

    // Profile fields
    const [fullName, setFullName] = useState<string>('')
    const [bio, setBio] = useState<string>('')
    const [location, setLocation] = useState<string>('')
    const [website, setWebsite] = useState<string>('')
    const [preferredCategories, setPreferredCategories] = useState<string[]>([])
    const [languagePreferences, setLanguagePreferences] = useState<string[]>([])
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string>('')

    // UI state
    const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
    const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [currentStep, setCurrentStep] = useState<number>(1)

    const navigate = useNavigate()
    const { signup } = useAuth()

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

    // Show loading spinner while fetching categories and languages
    if (categoriesLoading || languagesLoading) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <LoadingSpinner size='lg' text='Loading registration form...' />
            </div>
        )
    }

    // Show error if failed to load categories or languages
    if (categoriesError || languagesError) {
        return (
            <div className='min-h-screen flex items-center justify-center bg-gray-50'>
                <div className='text-center'>
                    <h2 className='text-xl font-semibold text-red-600 mb-2'>
                        Failed to load registration form
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

    // Handle profile image change
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0])
            // Show preview
            const previewUrl = URL.createObjectURL(e.target.files[0])
            setPhotoPreview(previewUrl)
        }
    }

    // Handle category selection
    const toggleCategory = (category: string) => {
        const updated = preferredCategories.includes(category)
            ? preferredCategories.filter((c) => c !== category)
            : [...preferredCategories, category]
        setPreferredCategories(updated)
    }

    // Handle language selection
    const toggleLanguage = (language: string) => {
        const updated = languagePreferences.includes(language)
            ? languagePreferences.filter((l) => l !== language)
            : [...languagePreferences, language]
        setLanguagePreferences(updated)
    }

    // Navigate between steps
    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1)
    }

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1)
    }

    // Validate current step
    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(email && password && confirmPassword && displayName)
            case 2:
                return true // Optional fields
            case 3:
                return true // Optional fields
            default:
                return false
        }
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        try {
            setError('')
            setLoading(true)

            // Create profile data object
            const profileData: Partial<UserProfile> = {
                displayName,
                fullName: fullName || undefined,
                bio: bio || undefined,
                location: location || undefined,
                website: website || undefined,
                preferredCategories:
                    preferredCategories.length > 0
                        ? preferredCategories
                        : undefined,
                languagePreferences:
                    languagePreferences.length > 0
                        ? languagePreferences
                        : undefined,
            }

            await signup(email, password, displayName, profileData, photoFile)
            navigate('/')
        } catch (error: unknown) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Failed to create an account'
            setError(errorMessage)
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-w-4xl mx-auto mt-10 px-4'>
            <div className='bg-white p-8 rounded-lg shadow-md'>
                <h2 className='text-3xl font-bold mb-6 text-center text-primary font-primary'>
                    Join Ideady
                </h2>

                {/* Progress Indicator */}
                <div className='flex items-center justify-center mb-8'>
                    <div className='flex items-center space-x-4'>
                        {[1, 2, 3].map((step) => (
                            <div key={step} className='flex items-center'>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        currentStep >= step
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {step}
                                </div>
                                {step < 3 && (
                                    <div
                                        className={`w-16 h-1 mx-2 ${
                                            currentStep > step
                                                ? 'bg-primary'
                                                : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className='text-center mb-6'>
                    <p className='text-gray-600'>
                        {currentStep === 1 && 'Step 1: Account Information'}
                        {currentStep === 2 && 'Step 2: Personal Information'}
                        {currentStep === 3 && 'Step 3: Preferences'}
                    </p>
                </div>

                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Account Information */}
                    {currentStep === 1 && (
                        <div className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label
                                        className='form-label flex items-center gap-2'
                                        htmlFor='displayName'
                                    >
                                        Display Name *
                                    </label>
                                    <input
                                        id='displayName'
                                        type='text'
                                        className='form-input'
                                        value={displayName}
                                        onChange={(e) =>
                                            setDisplayName(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                        placeholder='How others will see you'
                                    />
                                </div>

                                <div>
                                    <label
                                        className='form-label flex items-center gap-2'
                                        htmlFor='fullName'
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id='fullName'
                                        type='text'
                                        className='form-input'
                                        value={fullName}
                                        onChange={(e) =>
                                            setFullName(e.target.value)
                                        }
                                        disabled={loading}
                                        placeholder='Your full name (optional)'
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    className='form-label flex items-center gap-2'
                                    htmlFor='email'
                                >
                                    Email Address *
                                </label>
                                <input
                                    id='email'
                                    type='email'
                                    className='form-input'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    placeholder='your.email@example.com'
                                />
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label
                                        className='form-label'
                                        htmlFor='password'
                                    >
                                        Password *
                                    </label>
                                    <input
                                        id='password'
                                        type='password'
                                        className='form-input'
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                        placeholder='Choose a strong password'
                                    />
                                </div>

                                <div>
                                    <label
                                        className='form-label'
                                        htmlFor='confirm-password'
                                    >
                                        Confirm Password *
                                    </label>
                                    <input
                                        id='confirm-password'
                                        type='password'
                                        className='form-input'
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                        placeholder='Confirm your password'
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Information */}
                    {currentStep === 2 && (
                        <div className='space-y-6'>
                            {/* Profile Picture */}
                            <div className='flex flex-col items-center'>
                                <div className='relative mb-4'>
                                    <img
                                        src={
                                            photoPreview ||
                                            '/default-avatar.png'
                                        }
                                        alt='Profile Preview'
                                        className='h-32 w-32 rounded-full object-cover border-4 border-primary'
                                        onError={(e) => {
                                            ;(
                                                e.target as HTMLImageElement
                                            ).src =
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
                                    Click the camera icon to add a profile photo
                                    (optional)
                                </p>
                            </div>

                            {/* Bio */}
                            <div>
                                <label className='form-label'>About Me</label>
                                <textarea
                                    className='form-input min-h-[120px]'
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder='Tell others about yourself, your interests, and expertise...'
                                    rows={4}
                                />
                            </div>

                            {/* Location and Website */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        Location
                                    </label>
                                    <input
                                        type='text'
                                        className='form-input'
                                        value={location}
                                        onChange={(e) =>
                                            setLocation(e.target.value)
                                        }
                                        placeholder='City, Country'
                                    />
                                </div>

                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        Website / Portfolio
                                    </label>
                                    <input
                                        type='url'
                                        className='form-input'
                                        value={website}
                                        onChange={(e) =>
                                            setWebsite(e.target.value)
                                        }
                                        placeholder='https://your-website.com'
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Preferences */}
                    {currentStep === 3 && (
                        <div className='space-y-6'>
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
                                            {preferredCategories.length
                                                ? `${preferredCategories.length} categories selected`
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
                                                            toggleCategory(
                                                                category
                                                            )
                                                        }
                                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                                            preferredCategories.includes(
                                                                category
                                                            )
                                                                ? 'bg-primary/10 text-primary'
                                                                : ''
                                                        }`}
                                                    >
                                                        {category}
                                                        {preferredCategories.includes(
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
                                {preferredCategories.length > 0 && (
                                    <div className='flex flex-wrap gap-2 mt-3'>
                                        {preferredCategories.map((category) => (
                                            <span
                                                key={category}
                                                className='inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20'
                                            >
                                                {category}
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        toggleCategory(category)
                                                    }
                                                    className='hover:text-red-500'
                                                >
                                                    <IoClose size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Language Preferences */}
                            <div>
                                <label className='form-label flex items-center gap-2'>
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
                                            {languagePreferences.length
                                                ? `${languagePreferences.length} languages selected`
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
                                                            toggleLanguage(
                                                                language
                                                            )
                                                        }
                                                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center justify-between ${
                                                            languagePreferences.includes(
                                                                language
                                                            )
                                                                ? 'bg-primary/10 text-primary'
                                                                : ''
                                                        }`}
                                                    >
                                                        {language}
                                                        {languagePreferences.includes(
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
                                {languagePreferences.length > 0 && (
                                    <div className='flex flex-wrap gap-2 mt-3'>
                                        {languagePreferences.map((language) => (
                                            <span
                                                key={language}
                                                className='inline-flex items-center gap-1 px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm border border-secondary/20'
                                            >
                                                {language}
                                                <button
                                                    type='button'
                                                    onClick={() =>
                                                        toggleLanguage(language)
                                                    }
                                                    className='hover:text-red-500'
                                                >
                                                    <IoClose size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className='flex justify-between items-center mt-8'>
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type='button'
                                    onClick={prevStep}
                                    className='px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors'
                                    disabled={loading}
                                >
                                    Previous
                                </button>
                            )}
                        </div>

                        <div>
                            {currentStep < 3 ? (
                                <button
                                    type='button'
                                    onClick={nextStep}
                                    className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
                                    disabled={
                                        !validateStep(currentStep) || loading
                                    }
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type='submit'
                                    className='px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors'
                                    disabled={loading}
                                >
                                    {loading
                                        ? 'Creating Account...'
                                        : 'Create Account'}
                                </button>
                            )}
                        </div>
                    </div>

                    <div className='text-center mt-6'>
                        <p className='text-gray-600'>
                            Already have an account?{' '}
                            <Link
                                to='/login'
                                className='text-secondary hover:underline'
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
