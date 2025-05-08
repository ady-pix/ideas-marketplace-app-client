// src/pages/ProfilePage.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { doc, updateDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { updateProfile as updateFirebaseProfile } from 'firebase/auth'
import { database, storage } from '../services/firebase'
import defaultAvatar from '../assets/avatar-color.svg'
import { MdOutlineFileUpload } from 'react-icons/md'

function ProfilePage(): JSX.Element {
    const { currentUser, userProfile } = useAuth()
    const [displayName, setDisplayName] = useState<string>('')
    const [photoURL, setPhotoURL] = useState<string>('')
    const [photoFile, setPhotoFile] = useState<File | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [success, setSuccess] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const navigate = useNavigate()

    // Load user data when component mounts
    useEffect(() => {
        if (!currentUser) {
            navigate('/login')
            return
        }

        setDisplayName(
            userProfile?.displayName || currentUser.displayName || ''
        )
        setPhotoURL(userProfile?.photoURL || currentUser.photoURL || '')
    }, [currentUser, userProfile, navigate])

    // Handle profile image change
    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0])
            // Show preview
            setPhotoURL(URL.createObjectURL(e.target.files[0]))
        }
    }

    // Handle profile update
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!currentUser) return

        try {
            setLoading(true)
            setError('')

            // Update profile image if changed
            let newPhotoURL =
                userProfile?.photoURL || currentUser.photoURL || ''

            if (photoFile) {
                const storageRef = ref(
                    storage,
                    `profile_images/${currentUser.uid}`
                )
                await uploadBytes(storageRef, photoFile)
                newPhotoURL = await getDownloadURL(storageRef)
            }

            // Update Firebase Authentication profile
            await updateFirebaseProfile(currentUser, {
                displayName,
                photoURL: newPhotoURL,
            })

            // Update Firestore user document
            await updateDoc(doc(database, 'users', currentUser.uid), {
                displayName,
                photoURL: newPhotoURL,
            })

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (error: any) {
            setError(error.message || 'Failed to update profile')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-w-md mx-auto mt-10'>
            <div className='bg-white p-8 rounded-lg shadow-md'>
                <h2 className='text-3xl font-bold mb-6 text-center text-primary font-primary'>
                    Your Profile
                </h2>

                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}

                {success && (
                    <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4'>
                        Profile updated successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Profile Image */}
                    <div className='mb-6 flex flex-col items-center'>
                        <div className='relative mb-4'>
                            <img
                                src={photoURL || defaultAvatar}
                                alt='Profile'
                                className='h-32 w-32 rounded-full object-cover border-4 border-primary'
                            />
                            <label
                                htmlFor='photo-upload'
                                className='absolute bottom-0 right-0 bg-secondary text-white p-2 rounded-full cursor-pointer hover:bg-secondary/90'
                            >
                                <MdOutlineFileUpload className='h-5 w-5' />
                            </label>
                            <input
                                id='photo-upload'
                                type='file'
                                accept='image/*'
                                className='hidden'
                                onChange={handleImageChange}
                            />
                        </div>
                        <p className='text-sm text-gray-500'>
                            Click the camera icon to change your photo
                        </p>
                    </div>

                    {/* Display Name */}
                    <div className='mb-6'>
                        <label className='form-label' htmlFor='displayName'>
                            Display Name
                        </label>
                        <input
                            id='displayName'
                            type='text'
                            className='form-input'
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Email (read-only) */}
                    <div className='mb-6'>
                        <label className='form-label' htmlFor='email'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            className='form-input bg-gray-100'
                            value={currentUser?.email || ''}
                            readOnly
                        />
                        <p className='text-sm text-gray-500 mt-1'>
                            Email cannot be changed
                        </p>
                    </div>

                    <button
                        type='submit'
                        className='button-general button-primary w-full'
                        disabled={loading}
                    >
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ProfilePage
