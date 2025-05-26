import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { OnlineUsersProvider } from './context/OnlineUsersContext'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import IdeasPage from './pages/IdeasPage'
import ViewProfilePage from './pages/ProfileDetailsPage'
import EditProfilePage from './pages/EditProfilePage'
import CreateIdeaPage from './pages/CreateIdeaPage'
import IdeaDetailsPage from './pages/IdeaDetailsPage'
import EditIdeaPage from './pages/EditIdeaPage'
import NotFoundPage from './pages/NotFoundPage'
import ProtectedRoute from './components/routing/ProtectedRoute'
import SuccessPage from './pages/SuccessPage'

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
                                    path='ideas/:id/edit'
                                    element={<EditIdeaPage />}
                                />
                            </Route>
                            <Route element={<ProtectedRoute />}>
                                <Route
                                    path='create-idea'
                                    element={<CreateIdeaPage />}
                                />
                                <Route
                                    path='profile'
                                    element={<ViewProfilePage />}
                                />
                                <Route
                                    path='profile/edit'
                                    element={<EditProfilePage />}
                                />
                                <Route
                                    path='profile/:userId'
                                    element={<ViewProfilePage />}
                                />
                            </Route>
                            <Route path='/login' element={<LoginPage />} />
                            <Route
                                path='/register'
                                element={<RegisterPage />}
                            />
                            <Route
                                path='/ideas/success'
                                element={<SuccessPage />}
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
