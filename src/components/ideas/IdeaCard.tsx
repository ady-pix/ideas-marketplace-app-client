import { useState } from 'react'
import { Link } from 'react-router-dom'

function IdeaCard({ idea, onLike }) {
    const [showDetails, setShowDetails] = useState(false)

    return (
        <div className='card hover:shadow-lg transition-shadow'>
            <div className='flex justify-between items-start'>
                <h3 className='text-xl font-bold mb-2'>{idea.title}</h3>
                <div className='flex items-center'>
                    <span className='text-yellow-500 mr-1'>★</span>
                    <span>{idea.rating.toFixed(1)}</span>
                </div>
            </div>

            <p className='text-gray-600 mb-4'>
                {showDetails
                    ? idea.description
                    : `${idea.description.substring(0, 100)}...`}
            </p>

            {!showDetails && (
                <button
                    onClick={() => setShowDetails(true)}
                    className='text-primary hover:underline mb-4'
                >
                    Read More
                </button>
            )}

            <div className='flex justify-between items-center'>
                <div className='flex items-center text-sm text-gray-500'>
                    <span>By {idea.author}</span>
                    <span className='mx-2'>•</span>
                    <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                </div>

                <div className='flex space-x-2'>
                    <button
                        onClick={() => onLike(idea.id)}
                        className='text-gray-500 hover:text-primary'
                    >
                        <span role='img' aria-label='like'>
                            👍
                        </span>{' '}
                        {idea.likes}
                    </button>
                    <Link
                        to={`/ideas/${idea.id}`}
                        className='text-primary hover:underline'
                    >
                        View Details
                    </Link>
                </div>
            </div>

            {idea.status === 'for-sale' && (
                <div className='mt-4 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm inline-block'>
                    For Sale
                </div>
            )}

            {idea.status === 'auction' && (
                <div className='mt-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm inline-block'>
                    On Auction
                </div>
            )}
        </div>
    )
}

export default IdeaCard
