// src/pages/RegisterPage.tsx
import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function RegisterPage(): JSX.Element {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [displayName, setDisplayName] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const { signup } = useAuth()

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        if (password !== confirmPassword) {
            return setError('Passwords do not match')
        }

        try {
            setError('')
            setLoading(true)
            await signup(email, password, displayName)
            navigate('/')
        } catch (error: any) {
            setError(error.message || 'Failed to create an account')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-w-md mx-auto mt-10'>
            <div className='bg-white p-8 rounded-lg shadow-md'>
                <h2 className='text-3xl font-bold mb-6 text-center text-primary font-primary'>
                    Join Ideady
                </h2>

                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className='mb-4'>
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
                            disabled={loading}
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='form-label' htmlFor='email'>
                            Email
                        </label>
                        <input
                            id='email'
                            type='email'
                            className='form-input'
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className='mb-4'>
                        <label className='form-label' htmlFor='password'>
                            Password
                        </label>
                        <input
                            id='password'
                            type='password'
                            className='form-input'
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className='mb-6'>
                        <label
                            className='form-label'
                            htmlFor='confirm-password'
                        >
                            Confirm Password
                        </label>
                        <input
                            id='confirm-password'
                            type='password'
                            className='form-input'
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                    </div>

                    <button
                        type='submit'
                        className='button-general button-primary w-full mb-4'
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>

                    <div className='text-center mt-4'>
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
