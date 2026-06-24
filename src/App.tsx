import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './auth/ProtectedRoute'
import RoleRoute from './auth/RoleRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TutorDirectory from './pages/TutorDirectory'
import TutorProfile from './pages/TutorProfile'
import Dashboard from './pages/Dashboard'
import EditTutorProfile from './pages/EditTutorProfile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/tutors" element={<TutorDirectory />} />
        <Route path="/tutors/:id" element={<TutorProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Authenticated */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Tutor-only */}
          <Route element={<RoleRoute role="tutor" />}>
            <Route path="/profile/edit" element={<EditTutorProfile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
