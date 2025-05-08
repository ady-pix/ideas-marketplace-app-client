import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const ProtectedRoute = () => {
    const { currentUser, loading } = useAuth()

    if (loading) {
        return (
            <div className='flex justify-center items-center h-screen'>
                Loading...
            </div>
        )
    }

    return currentUser ? <Outlet /> : <Navigate to='/login' replace />
}

export default ProtectedRoute
