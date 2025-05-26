interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    color?: 'primary' | 'secondary' | 'white' | 'gray'
    text?: string
    className?: string
}

export default function LoadingSpinner({
    size = 'md',
    color = 'primary',
    text,
    className = '',
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
        xl: 'w-12 h-12',
    }

    const colorClasses = {
        primary: 'text-primary',
        secondary: 'text-secondary',
        white: 'text-white',
        gray: 'text-gray-500',
    }

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
    }

    return (
        <div
            className={`flex flex-col items-center justify-center gap-3 ${className}`}
        >
            {/* Modern spinning dots */}
            <div className='relative'>
                <div className={`${sizeClasses[size]} ${colorClasses[color]}`}>
                    <svg
                        className='animate-spin'
                        xmlns='http://www.w3.org/2000/svg'
                        fill='none'
                        viewBox='0 0 24 24'
                    >
                        <circle
                            className='opacity-25'
                            cx='12'
                            cy='12'
                            r='10'
                            stroke='currentColor'
                            strokeWidth='4'
                        ></circle>
                        <path
                            className='opacity-75'
                            fill='currentColor'
                            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                        ></path>
                    </svg>
                </div>
            </div>

            {text && (
                <p
                    className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium animate-pulse`}
                >
                    {text}
                </p>
            )}
        </div>
    )
}

// Alternative modern loading component with dots
export function LoadingDots({
    size = 'md',
    color = 'primary',
    className = '',
}: Omit<LoadingSpinnerProps, 'text'>) {
    const dotSizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-2 h-2',
        lg: 'w-3 h-3',
        xl: 'w-4 h-4',
    }

    const colorClasses = {
        primary: 'bg-primary',
        secondary: 'bg-secondary',
        white: 'bg-white',
        gray: 'bg-gray-500',
    }

    return (
        <div
            className={`flex items-center justify-center space-x-1 ${className}`}
        >
            <div
                className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
            ></div>
            <div
                className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: '0.1s' }}
            ></div>
            <div
                className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-bounce`}
                style={{ animationDelay: '0.2s' }}
            ></div>
        </div>
    )
}

// Skeleton loading component for cards/content
export function LoadingSkeleton({ className = '' }: { className?: string }) {
    return (
        <div className={`animate-pulse ${className}`}>
            <div className='bg-gray-200 rounded-lg p-6 space-y-4'>
                <div className='flex justify-between items-start'>
                    <div className='h-6 bg-gray-300 rounded w-3/4'></div>
                    <div className='h-5 bg-gray-300 rounded w-16'></div>
                </div>
                <div className='h-4 bg-gray-300 rounded w-1/2'></div>
                <div className='space-y-2'>
                    <div className='h-3 bg-gray-300 rounded'></div>
                    <div className='h-3 bg-gray-300 rounded w-5/6'></div>
                    <div className='h-3 bg-gray-300 rounded w-4/6'></div>
                </div>
                <div className='flex justify-between items-center'>
                    <div className='h-6 bg-gray-300 rounded w-20'></div>
                    <div className='h-5 bg-gray-300 rounded w-16'></div>
                </div>
                <div className='flex items-center space-x-2'>
                    <div className='h-8 w-8 bg-gray-300 rounded-full'></div>
                    <div className='space-y-1'>
                        <div className='h-3 bg-gray-300 rounded w-24'></div>
                        <div className='h-2 bg-gray-300 rounded w-16'></div>
                    </div>
                </div>
                <div className='h-10 bg-gray-300 rounded'></div>
            </div>
        </div>
    )
}
