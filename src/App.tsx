import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
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
        <Route path="/" element={<Home />} />
        <Route path="/tutors" element={<TutorDirectory />} />
        <Route path="/tutors/:id" element={<TutorProfile />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile/edit" element={<EditTutorProfile />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
