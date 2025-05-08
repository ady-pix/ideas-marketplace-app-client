import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OnlineUsersProvider } from './context/OnlineUsersContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import IdeasPage from './pages/IdeasPage'
import ProfilePage from './pages/ProfilePage'
import CreateIdeaPage from './pages/CreateIdeaPage'
import IdeaDetailsPage from './pages/IdeaDetailsPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/routing/ProtectedRoute'

function App() {
    return (
        <AuthProvider>
            <OnlineUsersProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Layout />}>
                            <Route index element={<HomePage />} />
                            <Route path='ideas' element={<IdeasPage />} />
                            <Route
                                path='ideas/:id'
                                element={<IdeaDetailsPage />}
                            />
                            <Route element={<ProtectedRoute />}>
                                <Route
                                    path='create-idea'
                                    element={<CreateIdeaPage />}
                                />
                                <Route
                                    path='profile'
                                    element={<ProfilePage />}
                                />
                            </Route>
                            <Route path='/login' element={<LoginPage />} />
                            <Route
                                path='/register'
                                element={<RegisterPage />}
                            />
                            <Route path='*' element={<NotFoundPage />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </OnlineUsersProvider>
        </AuthProvider>
    )
}

export default App
