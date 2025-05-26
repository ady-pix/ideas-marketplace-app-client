import { Link } from 'react-router-dom'

export default function SuccessPage() {
    return (
        <div className='max-w-2xl mx-auto px-4 py-16 text-center'>
            <div className='bg-white shadow-lg rounded-lg p-8'>
                <div className='text-secondary text-6xl mb-4'>✓</div>
                <h1 className='title-primary-page'>
                    Idea Submitted Successfully!
                </h1>
                <p className='title-secondary-page pb-8'>
                    Thank you for sharing your idea. We'll review it and get
                    back to you soon.
                </p>
                <Link to='/' className='button-general button-primary'>
                    Back to Home
                </Link>
            </div>
        </div>
    )
}
