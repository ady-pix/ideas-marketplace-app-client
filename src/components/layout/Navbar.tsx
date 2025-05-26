// src/components/layout/Navbar.tsx
import { useState, useEffect, useRef, useCallback, type JSX } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { IoMdClose } from 'react-icons/io'
import { IoMenu } from 'react-icons/io5'

import logoImage from '../../assets/ideady-logo.svg'
import defaultAvatar from '../../assets/avatar-grey.svg'

import { useAuth } from '../../context/AuthContext'
import OnlineUsers from './OnlineUsers'

interface NavLink {
    path: string
    text: string
    isPrimary?: boolean
    hideWhenAuth?: boolean
}

const NAV_LINKS: NavLink[] = [
    { path: '/', text: 'Home' },
    { path: '/ideas', text: 'Ideas' },
    { path: '/create-idea', text: 'Create Idea', isPrimary: true },
    { path: '/login', text: 'Login', hideWhenAuth: true },
    { path: '/register', text: 'Register', hideWhenAuth: true },
]

function Navbar(): JSX.Element {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)

    const menuRef = useRef<HTMLDivElement>(null)
    const profileRef = useRef<HTMLDivElement>(null)
    const desktopDropdownRef = useRef<HTMLDivElement>(null)
    const profileBtnRef = useRef<HTMLButtonElement>(null)

    const location = useLocation()
    const navigate = useNavigate()
    const { currentUser, logout, userProfile } = useAuth()

    const profilePhoto =
        currentUser?.photoURL || userProfile?.photoURL || defaultAvatar

    const filteredLinks = NAV_LINKS.filter((link) =>
        currentUser ? !link.hideWhenAuth : true
    )

    const isActive = (path: string) => location.pathname === path

    const handleLogout = async () => {
        try {
            console.log('Starting logout process...')
            await logout()
            console.log('Logout completed successfully')
            setIsProfileOpen(false)
            setIsMenuOpen(false)
            // Navigate to home screen after successful logout
            navigate('/')
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            const target = event.target as Node

            const clickedOutsideDesktop =
                desktopDropdownRef.current &&
                !desktopDropdownRef.current.contains(target) &&
                profileBtnRef.current &&
                !profileBtnRef.current.contains(target)

            const clickedOutsideMobile =
                profileRef.current &&
                !profileRef.current.contains(target) &&
                profileBtnRef.current &&
                !profileBtnRef.current.contains(target)

            if (
                isProfileOpen &&
                clickedOutsideDesktop &&
                clickedOutsideMobile
            ) {
                setIsProfileOpen(false)
            }
        },
        [isProfileOpen]
    )

    useEffect(() => {
        document.addEventListener('pointerdown', handleClickOutside)
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside)
        }
    }, [handleClickOutside])

    const renderLinks = (isMobile = false) =>
        filteredLinks.map((link) => (
            <Link
                key={link.path}
                to={link.path}
                onClick={() => {
                    if (isMobile) setIsMenuOpen(false)
                    else setIsProfileOpen(false)
                }}
                className={`${
                    isMobile
                        ? 'px-6 py-3 text-lg w-64 text-center'
                        : 'px-3 py-2'
                } rounded transition-colors duration-200 ${
                    link.isPrimary
                        ? 'bg-secondary hover:bg-secondary/90'
                        : 'hover:bg-primary/80'
                } ${
                    isActive(link.path) && !link.isPrimary
                        ? isMobile
                            ? 'border-l-4 border-accent pl-5'
                            : 'border-b-2 border-accent'
                        : ''
                }`}
                data-testid={
                    isMobile
                        ? `mobile-nav-link-${link.text.toLowerCase()}`
                        : undefined
                }
            >
                {link.text}
            </Link>
        ))

    function DesktopProfileDropdown() {
        return (
            <div
                ref={desktopDropdownRef}
                className='absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50'
                data-testid='desktop-profile-dropdown'
            >
                <Link
                    to='/profile'
                    className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
                    onClick={() => setIsProfileOpen(false)}
                >
                    Profile
                </Link>
                <button
                    onClick={() => {
                        console.log('LOGOUT CLICKED')
                        handleLogout()
                    }}
                    className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer'
                >
                    Logout
                </button>
            </div>
        )
    }

    const MobileProfileDropdown = () => (
        <div
            ref={profileRef}
            className='md:hidden fixed inset-0 z-40 bg-primary/95 pt-16'
            data-testid='mobile-profile-dropdown'
        >
            <div className='flex flex-col items-center py-8 space-y-4'>
                <div className='flex flex-col items-center mb-4'>
                    <img
                        src={profilePhoto}
                        alt='Profile'
                        className='h-24 w-24 rounded-full object-cover border-4 border-white mb-2'
                        referrerPolicy='no-referrer'
                    />
                    <h2 className='text-xl font-bold'>
                        {userProfile?.displayName || currentUser?.displayName}
                    </h2>
                    <p className='text-gray-300'>
                        {userProfile?.email || currentUser?.email}
                    </p>
                </div>
                <Link
                    to='/profile'
                    className='px-6 py-3 rounded text-lg w-64 text-center bg-secondary hover:bg-secondary/90'
                    onClick={() => setIsProfileOpen(false)}
                >
                    View Profile
                </Link>
                <button
                    onClick={handleLogout}
                    className='px-6 py-3 rounded text-lg hover:bg-primary/80 text-accent'
                >
                    Logout
                </button>
                <button
                    onClick={() => setIsProfileOpen(false)}
                    className='px-6 py-3 rounded text-lg hover:bg-primary/80'
                >
                    Close
                </button>
            </div>
        </div>
    )

    return (
        <nav className='bg-primary text-white shadow-md'>
            <div className='container mx-auto px-4'>
                <div className='flex justify-between items-center h-16'>
                    <Link to='/'>
                        <img
                            src={logoImage}
                            alt='Logo'
                            className='h-12 w-auto mr-2 bg-white rounded-sm'
                        />
                    </Link>

                    {/* Desktop */}
                    <div className='hidden md:flex items-center space-x-4'>
                        {renderLinks()}
                        {currentUser && <OnlineUsers />}
                        {currentUser && (
                            <div className='relative'>
                                <button
                                    ref={profileBtnRef}
                                    onClick={() => {
                                        setIsProfileOpen(!isProfileOpen)
                                        setIsMenuOpen(false)
                                    }}
                                    className='flex items-center cursor-pointer'
                                    aria-label='Toggle desktop profile dropdown'
                                >
                                    <img
                                        src={profilePhoto}
                                        alt='Profile'
                                        className='h-8 w-8 rounded-full object-cover border-2 border-white'
                                        referrerPolicy='no-referrer'
                                    />
                                    <span className='ml-2'>
                                        {userProfile?.displayName ||
                                            currentUser?.displayName}
                                    </span>
                                </button>
                                {isProfileOpen && <DesktopProfileDropdown />}
                            </div>
                        )}
                    </div>

                    {/* Mobile */}
                    <div className='md:hidden flex items-center'>
                        {currentUser && (
                            <button
                                ref={profileBtnRef}
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen)
                                    setIsMenuOpen(false)
                                }}
                                aria-label='Open mobile profile menu'
                            >
                                <img
                                    src={profilePhoto}
                                    alt='Profile'
                                    className='h-7 w-7 rounded-full object-cover border-2 border-white'
                                    referrerPolicy='no-referrer'
                                />
                            </button>
                        )}
                        <button
                            onClick={() => {
                                setIsMenuOpen(!isMenuOpen)
                                setIsProfileOpen(false)
                            }}
                            className='ml-2 z-50 relative'
                            aria-label='Mobile Toggle menu'
                        >
                            {isMenuOpen || isProfileOpen ? (
                                <IoMdClose />
                            ) : (
                                <IoMenu />
                            )}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div
                        ref={menuRef}
                        className='md:hidden fixed inset-0 z-40 bg-primary/95 pt-16'
                        data-testid='mobile-menu'
                    >
                        <div className='flex flex-col items-center py-8 space-y-4'>
                            {renderLinks(true)}
                            {currentUser && <OnlineUsers />}
                            {currentUser && (
                                <button
                                    onClick={handleLogout}
                                    className='px-6 py-3 text-lg text-accent hover:bg-primary/80'
                                    data-testid='mobile-logout-button'
                                >
                                    Logout
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {isProfileOpen && <MobileProfileDropdown />}
            </div>
        </nav>
    )
}

export default Navbar
