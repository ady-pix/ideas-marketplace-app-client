// src/components/layout/Navbar.tsx
import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import logoImage from '../../assets/ideady-logo.svg'
import { useAuth } from '../../context/AuthContext'
import OnlineUsers from './OnlineUsers'
import defaultAvatar from '../../assets/avatar-color.svg'
import { IoMdClose } from 'react-icons/io'
import { IoMenu } from 'react-icons/io5'

// Define interface for nav links
interface NavLink {
    path: string
    text: string
    isPrimary?: boolean
    requiresAuth?: boolean
    hideWhenAuth?: boolean
}

function Navbar(): JSX.Element {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
    const [profileDropdownOpen, setProfileDropdownOpen] =
        useState<boolean>(false)
    const location = useLocation()
    const { currentUser, logout, userProfile } = useAuth()

    // Create refs for the menu and profile dropdown
    const menuRef = useRef<HTMLDivElement>(null)
    const profileDropdownRef = useRef<HTMLDivElement>(null)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const profileButtonRef = useRef<HTMLButtonElement>(null)

    // Function to check if the link is active
    const isActive = (path: string): boolean => {
        return location.pathname === path
    }

    // Toggle menu function
    const toggleMenu = (): void => {
        setIsMenuOpen(!isMenuOpen)
        if (profileDropdownOpen) setProfileDropdownOpen(false)
    }

    // Toggle profile dropdown
    const toggleProfileDropdown = (): void => {
        setProfileDropdownOpen(!profileDropdownOpen)
        // Close mobile menu if open
        if (isMenuOpen) setIsMenuOpen(false)
    }

    async function handleLogout() {
        console.log('Logout clicked')
        try {
            await logout()
            setProfileDropdownOpen(false)
        } catch (error) {
            console.error('Failed to logout', error)
        }
    }

    // Add click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const isClickInsideButton = (event.target as Element).closest(
                'button'
            )

            // Close profile dropdown if clicked outside and not on a button
            if (
                profileDropdownOpen &&
                profileDropdownRef.current &&
                !profileDropdownRef.current.contains(event.target as Node) &&
                profileButtonRef.current &&
                !profileButtonRef.current.contains(event.target as Node) &&
                !isClickInsideButton
            ) {
                setProfileDropdownOpen(false)
            }
        }

        // Add event listeners
        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('touchstart', handleClickOutside)

        // Clean up
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('touchstart', handleClickOutside)
        }
    }, [isMenuOpen, profileDropdownOpen])

    // Navigation links data to avoid repetition
    const navLinks: NavLink[] = [
        { path: '/', text: 'Home' },
        { path: '/ideas', text: 'Ideas' },
        {
            path: '/create-idea',
            text: 'Create Idea',
            isPrimary: true,
        },
        { path: '/login', text: 'Login', hideWhenAuth: true },
        { path: '/register', text: 'Register', hideWhenAuth: true },
    ]

    // Filter nav links based on auth status
    const getFilteredNavLinks = () => {
        return navLinks.filter((link) => {
            if (currentUser) {
                return !link.hideWhenAuth
            } else return true
        })
    }

    const profilePhoto =
        currentUser?.photoURL || userProfile?.photoURL || defaultAvatar

    return (
        <nav className='bg-primary text-white shadow-md'>
            <div className='container mx-auto px-4'>
                <div className='flex justify-between items-center h-16'>
                    {/* Logo */}
                    <div className='flex items-center'>
                        <Link to='/' className='flex items-center'>
                            <img
                                src={logoImage}
                                alt='Ideady Logo'
                                className='h-12 w-auto mr-2 bg-white rounded-sm'
                            />
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {getFilteredNavLinks().map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded transition-colors duration-200 ${
                                    link.isPrimary
                                        ? 'bg-secondary hover:bg-secondary/90'
                                        : 'hover:bg-primary/80'
                                } ${
                                    isActive(link.path) && !link.isPrimary
                                        ? 'border-b-2 border-accent'
                                        : ''
                                }`}
                            >
                                {link.text}
                            </Link>
                        ))}
                        {currentUser && <OnlineUsers />}
                        {/* User Avatar (when logged in) */}
                        {currentUser && (
                            <div className='relative'>
                                <button
                                    ref={profileButtonRef}
                                    onClick={toggleProfileDropdown}
                                    className='flex items-center focus:outline-none cursor-pointer'
                                    aria-label='Open desktop profile menu'
                                >
                                    <img
                                        src={profilePhoto}
                                        alt='Profile'
                                        className='h-8 w-8 rounded-full object-cover border-2 border-white'
                                        referrerPolicy='no-referrer'
                                    />
                                    <span className='ml-2'>
                                        {userProfile?.displayName ||
                                            currentUser.displayName}
                                    </span>
                                </button>

                                {/* Profile Dropdown */}
                                {profileDropdownOpen && (
                                    <div
                                        ref={profileDropdownRef}
                                        data-testid="desktop-profile-dropdown"
                                        className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50'
                                    >
                                        <Link
                                            to='/profile'
                                            className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                                            onClick={() =>
                                                setProfileDropdownOpen(false)
                                            }
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                                        >
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Mobile menu button */}
                    <div className='md:hidden flex items-center'>
                        {currentUser && (
                            <button
                                ref={profileButtonRef}
                                onClick={toggleProfileDropdown}
                                className='relative flex items-center mr-4 focus:outline-none'
                                aria-label='Open mobile profile menu'
                            >
                                <img
                                    src={profilePhoto}
                                    alt='Profile'
                                    className='h-7 w-7 rounded-full object-cover border-2 border-white cursor-pointer'
                                    referrerPolicy='no-referrer'
                                />
                            </button>
                        )}
                        <button
                            ref={menuButtonRef}
                            onClick={toggleMenu}
                            className='text-white focus:outline-none z-50 relative'
                            aria-label='Open mobile menu'
                        >
                            {isMenuOpen || profileDropdownOpen ? (
                                <IoMdClose className='h-6 w-6' />
                            ) : (
                                <IoMenu className='h-6 w-6' />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div
                        ref={menuRef}
                        className='md:hidden fixed inset-0 z-40 bg-primary/95 pt-16'
                        data-testid="mobile-menu"
                    >
                        <div className='flex flex-col items-center py-8 space-y-4'>
                            {getFilteredNavLinks().map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`px-6 py-3 rounded transition-colors duration-200 text-lg ${
                                        link.isPrimary
                                            ? 'bg-secondary hover:bg-secondary/90 w-64 text-center'
                                            : 'hover:bg-primary/80'
                                    } ${
                                        isActive(link.path) && !link.isPrimary
                                            ? 'border-l-4 border-accent pl-5'
                                            : ''
                                    }`}
                                    onClick={() => setIsMenuOpen(false)}
                                    data-testid={`mobile-nav-link-${link.text.toLowerCase()}`}
                                >
                                    {link.text}
                                </Link>
                            ))}
                            {currentUser && <OnlineUsers />}
                            {/* Logout button */}
                            {currentUser && (
                                <button
                                    onClick={handleLogout}
                                    className='px-6 py-3 rounded transition-colors duration-200 text-lg hover:bg-primary/80 text-accent cursor-pointer'
                                    data-testid="mobile-logout-button"
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}
                {/* Mobile Profile Dropdown */}
                {profileDropdownOpen && (
                    <div
                        ref={profileDropdownRef}
                        data-testid='mobile-profile-dropdown'
                        className='md:hidden fixed inset-0 z-40 bg-primary/95 pt-16'
                    >
                        <div className='flex flex-col items-center py-8 space-y-4'>
                            {/* User info */}
                            <div className='flex flex-col items-center mb-4'>
                                <img
                                    src={profilePhoto}
                                    alt='Profile'
                                    className='h-24 w-24 rounded-full object-cover border-4 border-white mb-2'
                                    referrerPolicy='no-referrer'
                                />
                                <h2 className='text-xl font-bold'>
                                    {userProfile?.displayName ||
                                        currentUser?.displayName}
                                </h2>
                                <p className='text-gray-300'>
                                    {userProfile?.email || currentUser?.email}
                                </p>
                            </div>

                            <Link
                                to='/profile'
                                className='px-6 py-3 rounded transition-colors duration-200 text-lg w-64 text-center bg-secondary hover:bg-secondary/90'
                                onClick={() => setProfileDropdownOpen(false)}
                            >
                                View Profile
                            </Link>

                            <button
                                onClick={handleLogout}
                                className='px-6 py-3 rounded transition-colors duration-200 text-lg hover:bg-primary/80 text-accent'
                            >
                                Logout
                            </button>

                            <button
                                onClick={() => setProfileDropdownOpen(false)}
                                className='px-6 py-3 rounded transition-colors duration-200 text-lg hover:bg-primary/80'
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
