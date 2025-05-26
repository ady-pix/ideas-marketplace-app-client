import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IoWarning, IoRefresh } from 'react-icons/io5'

interface ErrorAction {
    label: string
    onClick?: () => void
    href?: string
    variant?: 'primary' | 'secondary' | 'danger'
}

interface ErrorDisplayProps {
    title?: string
    message: string
    icon?: ReactNode
    actions?: ErrorAction[]
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

export default function ErrorDisplay({
    title = 'Something went wrong',
    message,
    icon,
    actions = [],
    className = '',
    size = 'md',
}: ErrorDisplayProps) {
    const containerSizes = {
        sm: 'max-w-md mx-auto px-4 py-6',
        md: 'max-w-2xl mx-auto px-4 py-8',
        lg: 'max-w-4xl mx-auto px-4 py-8',
    }

    const iconSizes = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16',
    }

    const titleSizes = {
        sm: 'text-base',
        md: 'text-lg',
        lg: 'text-xl',
    }

    const getButtonClasses = (variant: string = 'primary') => {
        const baseClasses = 'px-4 py-2 rounded-md transition-colors font-medium'

        switch (variant) {
            case 'primary':
                return `${baseClasses} bg-primary text-white hover:bg-primary/90`
            case 'secondary':
                return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700`
            case 'danger':
                return `${baseClasses} bg-red-600 text-white hover:bg-red-700`
            default:
                return `${baseClasses} bg-primary text-white hover:bg-primary/90`
        }
    }

    const defaultIcon = (
        <IoWarning className={`${iconSizes[size]} text-red-500`} />
    )

    // Default actions if none provided
    const defaultActions: ErrorAction[] =
        actions.length > 0
            ? actions
            : [
                  {
                      label: 'Go Home',
                      href: '/',
                      variant: 'primary',
                  },
              ]

    return (
        <div className={`${containerSizes[size]} ${className}`}>
            <div className='bg-red-50 border border-red-200 rounded-lg p-6 text-center'>
                <div className='text-red-600 mb-4'>
                    <div className='flex justify-center mb-4'>
                        {icon || defaultIcon}
                    </div>
                    <h3
                        className={`${titleSizes[size]} font-semibold mb-2 text-red-700`}
                    >
                        {title}
                    </h3>
                    <p className='text-sm text-red-600 mb-4 leading-relaxed'>
                        {message}
                    </p>
                </div>

                {defaultActions.length > 0 && (
                    <div className='flex flex-col sm:flex-row justify-center gap-3'>
                        {defaultActions.map((action, index) =>
                            action.href ? (
                                <Link
                                    key={index}
                                    to={action.href}
                                    className={getButtonClasses(action.variant)}
                                >
                                    {action.label}
                                </Link>
                            ) : (
                                <button
                                    key={index}
                                    onClick={action.onClick}
                                    className={getButtonClasses(action.variant)}
                                >
                                    {action.label}
                                </button>
                            )
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

// Predefined error components for common scenarios
export function NetworkErrorDisplay({
    onRetry,
    backUrl = '/ideas',
    size = 'md',
}: {
    onRetry?: () => void
    backUrl?: string
    size?: 'sm' | 'md' | 'lg'
}) {
    const actions: ErrorAction[] = []

    if (onRetry) {
        actions.push({
            label: 'Try Again',
            onClick: onRetry,
            variant: 'danger',
        })
    }

    actions.push({
        label: 'Go Back',
        href: backUrl,
        variant: 'secondary',
    })

    return (
        <ErrorDisplay
            title='Network Error'
            message='Unable to load the requested data. Please check your connection and try again.'
            icon={<IoRefresh className={`w-12 h-12 text-red-500`} />}
            actions={actions}
            size={size}
        />
    )
}

export function NotFoundErrorDisplay({
    itemName = 'page',
    backUrl = '/',
    size = 'md',
}: {
    itemName?: string
    backUrl?: string
    size?: 'sm' | 'md' | 'lg'
}) {
    return (
        <ErrorDisplay
            title={`${
                itemName.charAt(0).toUpperCase() + itemName.slice(1)
            } Not Found`}
            message={`The ${itemName} you're looking for doesn't exist or may have been removed.`}
            actions={[
                {
                    label: 'Go Back',
                    href: backUrl,
                    variant: 'primary',
                },
                {
                    label: 'Home',
                    href: '/',
                    variant: 'secondary',
                },
            ]}
            size={size}
        />
    )
}

export function UnauthorizedErrorDisplay({
    backUrl = '/ideas',
    size = 'md',
}: {
    backUrl?: string
    size?: 'sm' | 'md' | 'lg'
}) {
    return (
        <ErrorDisplay
            title='Access Denied'
            message="You don't have permission to access this resource. Please sign in or contact support if you believe this is an error."
            actions={[
                {
                    label: 'Sign In',
                    href: '/login',
                    variant: 'primary',
                },
                {
                    label: 'Go Back',
                    href: backUrl,
                    variant: 'secondary',
                },
            ]}
            size={size}
        />
    )
}

export function LoadingErrorDisplay({
    onRetry,
    backUrl = '/ideas',
    itemName = 'content',
    size = 'md',
}: {
    onRetry?: () => void
    backUrl?: string
    itemName?: string
    size?: 'sm' | 'md' | 'lg'
}) {
    const actions: ErrorAction[] = []

    if (onRetry) {
        actions.push({
            label: 'Try Again',
            onClick: onRetry,
            variant: 'danger',
        })
    }

    actions.push({
        label: 'Go Back',
        href: backUrl,
        variant: 'secondary',
    })

    return (
        <ErrorDisplay
            title={`Error Loading ${
                itemName.charAt(0).toUpperCase() + itemName.slice(1)
            }`}
            message={`Failed to load ${itemName}. This might be a temporary issue.`}
            actions={actions}
            size={size}
        />
    )
}
