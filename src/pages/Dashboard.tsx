import { useAuth } from '../auth/useAuth'
import TutorDashboard from './TutorDashboard'
import StudentDashboard from './StudentDashboard'
import Spinner from '../components/Spinner'

// Role-aware: tutors see requests received; students see requests sent.
export default function Dashboard() {
  const { profile, loading } = useAuth()

  if (loading) return <Spinner />
  return profile?.role === 'tutor' ? <TutorDashboard /> : <StudentDashboard />
}
