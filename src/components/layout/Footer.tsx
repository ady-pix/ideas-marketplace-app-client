import {Link } from 'react-router-dom'

function Footer(): JSX.Element {
    return (
        <footer className='bg-gray-800 text-white py-8'>
            <div className='container mx-auto px-4'>
                <div className='flex flex-col md:flex-row justify-between'>
                    <div className='mb-4 md:mb-0'>
                        <h2 className='text-xl font-bold mb-2'>Ideady</h2>
                        <p className='text-gray-300'>
                            The marketplace for innovative ideas
                        </p>
                    </div>
                    <div>
                        <h3 className='text-lg font-bold mb-2'>Quick Links</h3>
                        <ul>
                            <li>
                                <Link
                                    to='/ideas'
                                    className='text-gray-300 hover:text-white'
                                >
                                    Browse Ideas
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to='/create-idea'
                                    className='text-gray-300 hover:text-white'
                                >
                                    Submit Your Idea
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className='mt-8 border-t border-gray-700 pt-6 text-center text-gray-300'>
                    <p>
                        &copy; {new Date().getFullYear()} Ideady. All rights
                        reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer
