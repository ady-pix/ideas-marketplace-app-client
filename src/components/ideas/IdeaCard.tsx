import { Link } from 'react-router-dom'
import { Idea } from '../../types/idea'

interface IdeaCardProps {
    idea: Idea
    className?: string
}

export default function IdeaCard({ idea, className = '' }: IdeaCardProps) {
    return (
        <div
            className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col h-full ${className}`}
        >
            {/* Header Section */}
            <div className='p-6 flex-1 flex flex-col'>
                <div className='flex justify-between items-start mb-3'>
                    <h3 className='text-xl font-semibold text-primary line-clamp-2 flex-1 mr-2'>
                        {idea.title}
                    </h3>
                    <span
                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ${
                            idea.type === 'Product'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                        }`}
                    >
                        {idea.type}
                    </span>
                </div>

                <p className='text-gray-600 text-sm mb-3 font-medium'>
                    {idea.category}
                </p>

                {/* Description with fixed height */}
                <div className='flex-1 mb-4'>
                    <p className='text-gray-700 text-sm line-clamp-3 leading-relaxed'>
                        {idea.problemDescription}
                    </p>
                </div>

                {/* Price and NDA Section */}
                <div className='flex justify-between items-center mb-4 min-h-[2rem]'>
                    <span className='text-lg font-bold text-green-600'>
                        ${idea.desiredPrice.toLocaleString()}
                    </span>
                    <div className='flex-shrink-0'>
                        {idea.requireNDA && (
                            <span className='text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded'>
                                NDA Required
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer Section - Fixed at bottom */}
            <div className='px-6 pb-6'>
                {/* Creator Info */}
                <Link
                    to={`/profile/${idea.creator}`}
                    className='flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer'
                >
                    <img
                        src={idea.creatorInfo.photoURL || '/default-avatar.png'}
                        alt={idea.creatorInfo.displayName}
                        className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                        onError={(e) => {
                            ;(e.target as HTMLImageElement).src =
                                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNFNUU3RUIiLz4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxMiIgcj0iNSIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNiAyNmMwLTUuNTIzIDQuNDc3LTEwIDEwLTEwczEwIDQuNDc3IDEwIDEwIiBmaWxsPSIjOUNBM0FGIi8+Cjwvc3ZnPgo='
                        }}
                    />
                    <div className='flex flex-col min-w-0 flex-1'>
                        <span className='text-sm font-medium text-gray-700 truncate hover:text-primary'>
                            Created by {idea.creatorInfo.displayName}
                        </span>
                        <span className='text-xs text-gray-500'>
                            {new Date(idea.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </Link>

                {/* Action Button */}
                <Link
                    to={`/ideas/${idea._id}`}
                    className='block w-full text-center bg-gray-100 hover:bg-gray-200 py-3 rounded-lg transition-colors font-medium text-gray-700 hover:text-gray-900'
                >
                    View Details
                </Link>
            </div>
        </div>
    )
}
