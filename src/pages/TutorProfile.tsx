import { useParams } from 'react-router-dom'
import PageStub from '../components/PageStub'

export default function TutorProfile() {
  const { id } = useParams()
  return (
    <PageStub
      title="Tutor Profile"
      note={`Profile details + Contact button for tutor "${id}" (Phase 4 / 5).`}
    />
  )
}
