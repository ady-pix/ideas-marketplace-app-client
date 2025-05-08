import { Link } from 'react-router-dom'
import heroImage from '../assets/hero.png'
function HomePage() {
    return (
        <section className='w-full max-w-full sm:h-[calc(100vh-35rem)] lg:h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-left bg-transparent'>
            <div className='relative z-10 max-w-6xl ml-4 mr-4 px-6 flex flex-col sm:flex-row items-center'>
                <div className='md:w-1/2 text-left sm:ml-10 lg:ml-20'>
                    <h1 className='title-primary'>
                        Turn Your Ideas into Reality & Profit
                    </h1>
                    <p className='title-secondary'>
                        Your Ideas Deserve More Than Just a Notebook!
                    </p>
                    <div className='mt-6 space-x-4 '>
                        <Link
                            to='/create-idea'
                            className='button-general button-primary'
                        >
                            Submit Your Idea
                        </Link>
                        <Link
                            to='/ideas'
                            className='button-general button-secondary'
                        >
                            Browse Ideas
                        </Link>
                    </div>
                </div>
                <div className='absolute sm:relative sm:w-1/2 flex justify-center'>
                    <img
                        src={heroImage}
                        alt='Innovation'
                        className='max-w-sm mt-60 sm:mt-20 -z-10 sm:pl-10 sm:max-w-md md:max-w-l lg:max-w-2xl object-contain'
                        loading='lazy'
                    />
                </div>
            </div>
        </section>
    )
}

export default HomePage
