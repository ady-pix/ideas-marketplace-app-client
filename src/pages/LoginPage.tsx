// src/pages/LoginPage.tsx
import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FcGoogle } from 'react-icons/fc'

function LoginPage(): JSX.Element {
    const [email, setEmail] = useState<string>('')
    const [password, setPassword] = useState<string>('')
    const [error, setError] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const navigate = useNavigate()
    const { login, loginWithGoogle } = useAuth()

    async function handleSubmit(e: FormEvent) {
        e.preventDefault()

        try {
            setError('')
            setLoading(true)
            await login(email, password)
            navigate('/')
        } catch (error: any) {
            setError(error.message || 'Failed to log in')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    async function handleGoogleLogin() {
        try {
            setError('')
            setLoading(true)
            await loginWithGoogle()
            navigate('/')
        } catch (error: any) {
            setError(error.message || 'Failed to log in with Google')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='max-w-md mx-auto mt-10'>
            <div className='bg-white p-8 rounded-lg shadow-md'>
                <h2 className='text-3xl font-bold mb-6 text-center text-primary font-primary'>
                    Login to Ideady
                </h2>

                {error && (
                    <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
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

                    <div className='mb-6'>
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

                    <button
                        type='submit'
                        className='button-general button-primary w-full mb-4'
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    <div className='relative my-4'>
                        <div className='absolute inset-0 flex items-center'>
                            <div className='w-full border-t border-gray-300'></div>
                        </div>
                        <div className='relative flex justify-center text-sm'>
                            <span className='px-2 bg-white text-gray-500'>
                                Or continue with
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        className='flex items-center justify-center w-full border border-gray-300 text-gray-700 rounded-md px-4 py-2 mt-2 hover:bg-gray-50 transition duration-150'
                        disabled={loading}
                    >
                        {/* If using react-icons */}
                        <FcGoogle className='text-xl mr-2' />
                        Sign in with Google
                    </button>
                    <div className='text-center mt-4'>
                        <p className='text-gray-600'>
                            Don't have an account?{' '}
                            <Link
                                to='/register'
                                className='text-secondary hover:underline'
                            >
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginPage
