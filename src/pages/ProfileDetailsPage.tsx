import { useState, useEffect, useCallback } from 'react'
import { useNavigate, Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
// Firebase imports removed - using AuthContext for profile data
import { UserProfile } from '../types/user'
import { Idea } from '../types/idea'
import LoadingSpinner from '../components/LoadingSpinner'
import {
    LoadingErrorDisplay,
    NotFoundErrorDisplay,
} from '../components/common/ErrorDisplay'
import {
    IoPerson,
    IoMail,
    IoLocation,
    IoGlobe,
    IoDocument,
    IoStatsChart,
    IoEye,
    IoCreate,
    IoCard,
    IoPencil,
    IoArrowBack,
} from 'react-icons/io5'

function ProfileDetailsPage() {
    const { userId } = useParams<{ userId?: string }>()
    const { currentUser, userProfile: currentUserProfile } = useAuth()
    const navigate = useNavigate()

    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Activity stats
    const [stats, setStats] = useState({
        ideasSubmitted: 0,
        offersReceived: 0,
        offersMade: 0,
        ideasPurchased: 0,
    })
    const [statsLoading, setStatsLoading] = useState(true)

    // Determine if viewing own profile or another user's profile
    const isOwnProfile = !userId || userId === currentUser?.uid
    const targetUserId = userId || currentUser?.uid

    const fetchUserProfile = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            if (!targetUserId) {
                setError('No user ID provided')
                return
            }

            // Fetch user data from API for both own profile and other users
            try {
                const response = await fetch(
                    `${
                        import.meta.env.VITE_API_URL
                    }/api/ideas/user/${targetUserId}`
                )

                if (response.ok) {
                    const userData = await response.json()

                    // For own profile, include private fields from AuthContext or currentUser
                    if (isOwnProfile) {
                        setProfile({
                            displayName:
                                userData.displayName ||
                                currentUserProfile?.displayName ||
                                currentUser?.displayName ||
                                'Anonymous',
                            fullName: currentUserProfile?.fullName || '',
                            email:
                                currentUserProfile?.email ||
                                currentUser?.email ||
                                '',
                            photoURL:
                                userData.photoURL ||
                                currentUserProfile?.photoURL ||
                                currentUser?.photoURL ||
                                null,
                            createdAt: currentUserProfile?.createdAt || null,
                            isOnline: userData.isOnline || false,
                            bio: userData.bio || '',
                            location: userData.location || '',
                            website: userData.website || '',
                            preferredCategories:
                                userData.preferredCategories || [],
                            languagePreferences:
                                userData.languagePreferences || [],
                            cvUrl: currentUserProfile?.cvUrl || '',
                        })
                    } else {
                        // For other users, use only public data
                        setProfile({
                            displayName: userData.displayName || 'Anonymous',
                            fullName: '', // Not included in public API
                            email: '', // Don't show other users' emails
                            photoURL: userData.photoURL || null,
                            createdAt: null, // Not included in public API
                            isOnline: userData.isOnline || false,
                            bio: userData.bio || '',
                            location: userData.location || '',
                            website: userData.website || '',
                            preferredCategories:
                                userData.preferredCategories || [],
                            languagePreferences:
                                userData.languagePreferences || [],
                            cvUrl: '', // Not included in public API for privacy
                        })
                    }
                } else {
                    throw new Error('User not found')
                }
            } catch (err) {
                console.error('Error fetching user profile:', err)
                setError('Failed to load user profile')
            }
        } catch (err) {
            console.error('Error fetching user profile:', err)
            setError('Failed to load profile')
        } finally {
            setLoading(false)
        }
    }, [isOwnProfile, currentUserProfile, currentUser, targetUserId])

    const fetchActivityStats = useCallback(
        async (uid: string) => {
            try {
                setStatsLoading(true)

                // Count ideas submitted using the API endpoint
                const isCurrentUser = uid === currentUser?.uid

                if (isCurrentUser && currentUser) {
                    // For current user, use the mine=true filter with auth
                    const token = await currentUser.getIdToken()
                    const response = await fetch(
                        `${
                            import.meta.env.VITE_API_URL
                        }/api/ideas?mine=true&limit=1`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    )

                    if (response.ok) {
                        const data = await response.json()
                        setStats({
                            ideasSubmitted: data.pagination.totalCount,
                            offersReceived: 0,
                            offersMade: 0,
                            ideasPurchased: 0,
                        })
                    } else {
                        throw new Error('Failed to fetch user ideas')
                    }
                } else {
                    // For other users, fetch all public ideas and count those created by this user
                    // We'll fetch a large number to get an accurate count
                    const response = await fetch(
                        `${import.meta.env.VITE_API_URL}/api/ideas?limit=1000`,
                        {
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        }
                    )

                    if (response.ok) {
                        const data = await response.json()
                        // Count ideas created by this specific user
                        const userIdeasCount = data.ideas.filter(
                            (idea: Idea) => idea.creator === uid
                        ).length

                        setStats({
                            ideasSubmitted: userIdeasCount,
                            offersReceived: 0,
                            offersMade: 0,
                            ideasPurchased: 0,
                        })
                    } else {
                        throw new Error('Failed to fetch ideas')
                    }
                }
            } catch (error) {
                console.error('Error fetching stats:', error)
                // Set default stats on error
                setStats({
                    ideasSubmitted: 0,
                    offersReceived: 0,
                    offersMade: 0,
                    ideasPurchased: 0,
                })
            } finally {
                setStatsLoading(false)
            }
        },
        [currentUser]
    )

    useEffect(() => {
        if (!currentUser && isOwnProfile) {
            navigate('/login')
            return
        }

        // Always fetch profile data, regardless of own profile or not
        if (targetUserId) {
            fetchUserProfile()
        }

        if (targetUserId) {
            fetchActivityStats(targetUserId)
        }
    }, [
        currentUser,
        userId,
        targetUserId,
        isOwnProfile,
        navigate,
        fetchUserProfile,
        fetchActivityStats,
    ])

    if (loading) {
        return (
            <div className='max-w-4xl mx-auto px-4 py-8'>
                <LoadingSpinner size='lg' text='Loading profile...' />
            </div>
        )
    }

    if (error) {
        return (
            <LoadingErrorDisplay
                onRetry={() => fetchUserProfile()}
                backUrl='/'
                itemName='profile'
                size='lg'
            />
        )
    }

    if (!profile) {
        return <NotFoundErrorDisplay itemName='profile' backUrl='/' size='lg' />
    }

    return (
        <div className='max-w-4xl mx-auto px-4 py-8'>
            {/* Header */}
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4'>
                <div>
                    {!isOwnProfile && (
                        <Link
                            to='/'
                            className='flex items-center gap-2 text-gray-600 hover:text-primary transition-colors font-primary mb-2'
                        >
                            <IoArrowBack size={20} />
                            Back to Home
                        </Link>
                    )}
                    <h1 className='title-primary-page'>
                        {isOwnProfile
                            ? 'Your Profile'
                            : `${profile.displayName}'s Profile`}
                    </h1>
                    <p className='title-secondary-page'>
                        {isOwnProfile
                            ? 'View your personal information and activity'
                            : 'View user profile and activity'}
                    </p>
                </div>

                {isOwnProfile && (
                    <Link
                        to='/profile/edit'
                        className='px-4 py-2 font-primary button-primary transition-colors flex items-center gap-2'
                    >
                        <IoPencil size={16} />
                        Edit Profile
                    </Link>
                )}
            </div>

            <div className='space-y-8'>
                {/* Basic User Info Section */}
                <div className='bg-white shadow-lg rounded-lg p-8'>
                    <h2 className='form-label text-xl mb-6 flex items-center gap-2'>
                        Basic Information
                    </h2>

                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {/* Profile Picture */}
                        <div className='lg:col-span-1 flex flex-col items-center'>
                            <img
                                src={profile.photoURL || '/default-avatar.png'}
                                alt='Profile'
                                className='h-32 w-32 rounded-full object-cover border-4 border-primary'
                                onError={(e) => {
                                    ;(e.target as HTMLImageElement).src =
                                        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMzIiIGN5PSIyNCIgcj0iMTAiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTEyIDUyYzAtMTEuMDQ2IDguOTU0LTIwIDIwLTIwczIwIDguOTU0IDIwIDIwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                                }}
                            />
                            {profile.isOnline && (
                                <div className='flex items-center gap-2 mt-3 text-green-600'>
                                    <div className='w-3 h-3 bg-green-500 rounded-full'></div>
                                    <span className='text-sm font-medium'>
                                        Online
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Basic Info Fields */}
                        <div className='lg:col-span-2 space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                {profile.fullName && (
                                    <div>
                                        <label className='form-label flex items-center gap-2'>
                                            <IoPerson size={16} />
                                            Full Name
                                        </label>
                                        <div className='form-input bg-gray-50 border-gray-300'>
                                            {profile.fullName}
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoPerson size={16} />
                                        Display Name
                                    </label>
                                    <div className='form-input bg-gray-50 border-gray-300'>
                                        {profile.displayName}
                                    </div>
                                </div>
                            </div>

                            {/* Only show email for own profile or if it's public */}
                            {isOwnProfile && (
                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoMail size={16} />
                                        Email Address
                                    </label>
                                    <div className='form-input bg-gray-50 border-gray-300'>
                                        {profile.email}
                                    </div>
                                </div>
                            )}

                            {profile.location && (
                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoLocation size={16} />
                                        Location
                                    </label>
                                    <div className='form-input bg-gray-50 border-gray-300'>
                                        {profile.location}
                                    </div>
                                </div>
                            )}

                            {profile.website && (
                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoGlobe size={16} />
                                        Website
                                    </label>
                                    <div className='form-input bg-gray-50 border-gray-300'>
                                        <a
                                            href={profile.website}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-primary hover:text-primary/80 underline'
                                        >
                                            {profile.website}
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio Section */}
                {profile.bio && (
                    <div className='bg-white shadow-lg rounded-lg p-8'>
                        <h2 className='form-label text-xl mb-6'>About</h2>
                        <div className='form-input min-h-[120px] p-4 bg-gray-50 border-gray-300'>
                            <p className='text-gray-700 leading-relaxed whitespace-pre-wrap'>
                                {profile.bio}
                            </p>
                        </div>
                    </div>
                )}

                {/* Activity Overview Section */}
                <div className='bg-white shadow-lg rounded-lg p-8'>
                    <h2 className='form-label text-xl mb-6 flex items-center gap-2'>
                        Activity Overview
                    </h2>

                    {statsLoading ? (
                        <div className='flex justify-center py-8'>
                            <LoadingSpinner
                                size='md'
                                text='Loading activity stats...'
                            />
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                            <div className='bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center'>
                                <IoCreate
                                    size={32}
                                    className='mx-auto text-blue-600 mb-2'
                                />
                                <div className='text-2xl font-bold text-blue-800 font-primary'>
                                    {stats.ideasSubmitted}
                                </div>
                                <div className='text-sm text-blue-600 font-medium'>
                                    Ideas Submitted
                                </div>
                                {stats.ideasSubmitted > 0 && (
                                    <Link
                                        to={
                                            isOwnProfile
                                                ? '/ideas?filter=my-ideas'
                                                : `/ideas?creator=${targetUserId}`
                                        }
                                        className='text-xs text-blue-500 hover:text-blue-700 mt-1 block'
                                    >
                                        {isOwnProfile
                                            ? 'View your ideas →'
                                            : `View ${profile.displayName}'s ideas →`}
                                    </Link>
                                )}
                            </div>

                            <div className='bg-green-50 border-2 border-green-200 rounded-lg p-6 text-center'>
                                <IoEye
                                    size={32}
                                    className='mx-auto text-green-600 mb-2'
                                />
                                <div className='text-2xl font-bold text-green-800 font-primary'>
                                    {stats.offersReceived}
                                </div>
                                <div className='text-sm text-green-600 font-medium'>
                                    Offers Received
                                </div>
                                <div className='text-xs text-gray-500 mt-1'>
                                    Coming soon
                                </div>
                            </div>

                            <div className='bg-purple-50 border-2 border-purple-200 rounded-lg p-6 text-center'>
                                <IoStatsChart
                                    size={32}
                                    className='mx-auto text-purple-600 mb-2'
                                />
                                <div className='text-2xl font-bold text-purple-800 font-primary'>
                                    {stats.offersMade}
                                </div>
                                <div className='text-sm text-purple-600 font-medium'>
                                    Offers Made
                                </div>
                                <div className='text-xs text-gray-500 mt-1'>
                                    Coming soon
                                </div>
                            </div>

                            <div className='bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center'>
                                <IoCard
                                    size={32}
                                    className='mx-auto text-orange-600 mb-2'
                                />
                                <div className='text-2xl font-bold text-orange-800 font-primary'>
                                    {stats.ideasPurchased}
                                </div>
                                <div className='text-sm text-orange-600 font-medium'>
                                    Ideas Purchased
                                </div>
                                <div className='text-xs text-gray-500 mt-1'>
                                    Coming soon
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preferences Section */}
                {((profile.preferredCategories &&
                    profile.preferredCategories.length > 0) ||
                    (profile.languagePreferences &&
                        profile.languagePreferences.length > 0) ||
                    profile.cvUrl) && (
                    <div className='bg-white shadow-lg rounded-lg p-8'>
                        <h2 className='form-label text-xl mb-6'>
                            Preferences & Skills
                        </h2>

                        <div className='space-y-6'>
                            {/* Preferred Categories */}
                            {profile.preferredCategories &&
                                profile.preferredCategories.length > 0 && (
                                    <div>
                                        <label className='form-label'>
                                            Preferred Categories
                                        </label>
                                        <div className='flex flex-wrap gap-2 mt-3'>
                                            {profile.preferredCategories.map(
                                                (category) => (
                                                    <span
                                                        key={category}
                                                        className='px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20'
                                                    >
                                                        {category}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* Language Preferences */}
                            {profile.languagePreferences &&
                                profile.languagePreferences.length > 0 && (
                                    <div>
                                        <label className='form-label flex items-center gap-2'>
                                            Language Preferences
                                        </label>
                                        <div className='flex flex-wrap gap-2 mt-3'>
                                            {profile.languagePreferences.map(
                                                (language) => (
                                                    <span
                                                        key={language}
                                                        className='px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm border border-secondary/20'
                                                    >
                                                        {language}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {/* CV */}
                            {profile.cvUrl && (
                                <div>
                                    <label className='form-label flex items-center gap-2'>
                                        <IoDocument size={16} />
                                        CV / Resume
                                    </label>
                                    <div className='form-input bg-gray-50 border-gray-300'>
                                        <a
                                            href={profile.cvUrl}
                                            target='_blank'
                                            rel='noopener noreferrer'
                                            className='text-primary hover:text-primary/80 underline flex items-center gap-2'
                                        >
                                            <IoDocument size={16} />
                                            View CV/Resume
                                        </a>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProfileDetailsPage
