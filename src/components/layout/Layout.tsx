import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import backgroundImage from '../../assets/background.png'

function Layout() {
    return (
        <div className='bg-gray-100'>
            <Navbar />
            <main
                className='w-full bg-center bg-no-repeat min-h-screen bg-scroll md:bg-fixed'
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                }}
            >
                {/* Content container with padding */}
                <div className='container mx-auto px-4 py-8'>
                    <Outlet />
                </div>
            </main>
            <Footer />
        </div>
    )
}

export default Layout
