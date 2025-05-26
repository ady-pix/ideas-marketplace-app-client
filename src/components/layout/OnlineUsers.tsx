// src/components/layout/OnlineUsers.tsx
import { useState, useEffect, useRef, type JSX } from 'react'
import { Link } from 'react-router-dom'
import { useOnlineUsers } from '../../context/OnlineUsersContext'
import defaultAvatar from '../../assets/avatar-grey.svg'

function OnlineUsers(): JSX.Element {
    const { onlineUsers } = useOnlineUsers()
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen)
    }

    // Create refs for the menu and profile dropdown
    const dropDownRef = useRef<HTMLDivElement>(null)
    const dropdownButtonRef = useRef<HTMLButtonElement>(null)

    // Add click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent | TouchEvent) {
            // Close dropdown if clicked outside
            if (
                isDropdownOpen &&
                dropDownRef.current &&
                !dropDownRef.current.contains(event.target as Node) &&
                dropdownButtonRef.current &&
                !dropdownButtonRef.current.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false)
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
    }, [isDropdownOpen])

    return (
        <div className='relative'>
            <button
                ref={dropdownButtonRef}
                onClick={toggleDropdown}
                aria-label='Show online users'
                className='flex items-center text-white hover:bg-primary/80 px-3 py-2 rounded cursor-pointer'
            >
                <span>Online</span>
                <span className='pl-1 mr-1 text-accent font-medium'>
                    {`(${onlineUsers.length})`}
                </span>
            </button>

            {isDropdownOpen && (
                <div
                    ref={dropDownRef}
                    data-testid='online-users-dropdown'
                    className='absolute -right-20 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50 max-w-[calc(100vw-2rem)]'
                >
                    <div className='py-2 px-3 bg-gray-100 border-b'>
                        <h3 className='text-sm font-semibold text-gray-700'>
                            Active Users
                        </h3>
                    </div>

                    <div className='max-h-60 overflow-y-auto'>
                        {onlineUsers.length > 0 ? (
                            onlineUsers.map((user) => (
                                <Link
                                    key={user.id}
                                    to={`/profile/${user.id}`}
                                    data-testid='online-user'
                                    className='px-3 py-2 hover:bg-gray-100 flex items-center transition-colors cursor-pointer'
                                    onClick={() => setIsDropdownOpen(false)}
                                >
                                    <img
                                        src={user.photoURL || defaultAvatar}
                                        alt={user.displayName}
                                        className='h-8 w-8 rounded-full mr-2'
                                    />
                                    <div>
                                        <span className='text-sm font-medium text-gray-800 truncate hover:text-primary'>
                                            {user.displayName}
                                        </span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className='text-sm text-gray-500 py-2 px-3'>
                                No users currently online
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default OnlineUsers
