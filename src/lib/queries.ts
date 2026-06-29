import { supabase } from './supabaseClient'
import type {
  Subject,
  TutorProfile,
  TutorProfileInput,
  TutorListItem,
  TutorInboxRequest,
  StudentSentRequest,
  RequestStatus,
} from './types'

// Shape PostgREST returns for the embedded join below.
interface TutorRow {
  id: string
  bio: string | null
  city: string
  hourly_rate: number
  online_available: boolean
  created_at: string
  profiles: { full_name: string } | null
  tutor_subjects: { subjects: Subject | null }[]
}

const TUTOR_SELECT =
  'id, bio, city, hourly_rate, online_available, created_at, profiles!tutor_profiles_user_id_fkey(full_name), tutor_subjects(subjects(id, name))'

function toTutorListItem(row: TutorRow): TutorListItem {
  return {
    id: row.id,
    full_name: row.profiles?.full_name ?? '',
    bio: row.bio,
    city: row.city,
    hourly_rate: row.hourly_rate,
    online_available: row.online_available,
    created_at: row.created_at,
    subjects: row.tutor_subjects
      .map((ts) => ts.subjects)
      .filter((s): s is Subject => s !== null)
      .sort((a, b) => a.name.localeCompare(b.name)),
  }
}

// All tutors with their name + subjects. Filtering is done client-side
// (the dataset is small), so this just returns everything once.
export async function getTutors(): Promise<TutorListItem[]> {
  const { data, error } = await supabase.from('tutor_profiles').select(TUTOR_SELECT)
  if (error) throw error
  return ((data ?? []) as unknown as TutorRow[]).map(toTutorListItem)
}

// A single tutor by tutor_profiles.id (for the profile page). Null if missing.
export async function getTutor(id: string): Promise<TutorListItem | null> {
  const { data, error } = await supabase
    .from('tutor_profiles')
    .select(TUTOR_SELECT)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  if (!data) return null
  return toTutorListItem(data as unknown as TutorRow)
}

// Submit a lesson request. RLS requires student_id === the caller's auth id.
export async function sendLessonRequest(params: {
  tutorId: string
  studentId: string
  studentName: string
  studentEmail: string
  message: string
  subjectId: number | null
}): Promise<void> {
  const { error } = await supabase.from('lesson_requests').insert({
    tutor_id: params.tutorId,
    student_id: params.studentId,
    student_name: params.studentName,
    student_email: params.studentEmail,
    message: params.message,
    subject_id: params.subjectId,
  })
  if (error) throw error
}

// The tutor_profile ids the user has favorited.
export async function getFavoriteTutorIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('tutor_id')
    .eq('student_id', userId)
  if (error) throw error
  return (data ?? []).map((f) => f.tutor_id as string)
}

// The user's favorited tutors as full directory items.
export async function getFavoriteTutors(userId: string): Promise<TutorListItem[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(`tutor_profiles!inner(${TUTOR_SELECT})`)
    .eq('student_id', userId)
  if (error) throw error
  return ((data ?? []) as unknown as { tutor_profiles: TutorRow }[]).map((r) =>
    toTutorListItem(r.tutor_profiles),
  )
}

// Add or remove a favorite.
export async function setFavorite(
  userId: string,
  tutorId: string,
  favorite: boolean,
): Promise<void> {
  if (favorite) {
    const { error } = await supabase
      .from('favorites')
      .insert({ student_id: userId, tutor_id: tutorId })
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('student_id', userId)
      .eq('tutor_id', tutorId)
    if (error) throw error
  }
}

// Whether the given student already sent a request to the given tutor.
export async function hasContactedTutor(studentId: string, tutorId: string): Promise<boolean> {
  const { count, error } = await supabase
    .from('lesson_requests')
    .select('id', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('tutor_id', tutorId)
  if (error) throw error
  return (count ?? 0) > 0
}

// Tutor sets the status of a request sent to them, with an optional note.
export async function updateRequestStatus(
  requestId: string,
  status: 'accepted' | 'declined',
  note?: string,
): Promise<void> {
  const { error } = await supabase
    .from('lesson_requests')
    .update({ status, tutor_note: note?.trim() ? note.trim() : null })
    .eq('id', requestId)
  if (error) throw error
}

// Requests received by the tutor who owns `userId`. RLS also enforces this.
export async function getRequestsForTutor(userId: string): Promise<TutorInboxRequest[]> {
  const { data, error } = await supabase
    .from('lesson_requests')
    .select(
      'id, student_name, student_email, message, status, tutor_note, created_at, subjects(name), tutor_profiles!inner(user_id)',
    )
    .eq('tutor_profiles.user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as TutorRequestRow[]).map((r) => ({
    id: r.id,
    student_name: r.student_name,
    student_email: r.student_email,
    message: r.message,
    status: r.status,
    subject_name: r.subjects?.name ?? null,
    tutor_note: r.tutor_note,
    created_at: r.created_at,
  }))
}

// Requests sent by a student, with the target tutor's name + city.
export async function getRequestsByStudent(studentId: string): Promise<StudentSentRequest[]> {
  const { data, error } = await supabase
    .from('lesson_requests')
    .select(
      'id, message, status, tutor_note, created_at, subjects(name), tutor_profiles!inner(id, city, profiles!tutor_profiles_user_id_fkey(full_name))',
    )
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return ((data ?? []) as unknown as StudentRequestRow[]).map((r) => ({
    id: r.id,
    message: r.message,
    status: r.status,
    subject_name: r.subjects?.name ?? null,
    tutor_note: r.tutor_note,
    created_at: r.created_at,
    tutor: {
      id: r.tutor_profiles.id,
      full_name: r.tutor_profiles.profiles?.full_name ?? '',
      city: r.tutor_profiles.city,
    },
  }))
}

interface TutorRequestRow {
  id: string
  student_name: string
  student_email: string
  message: string
  status: RequestStatus
  tutor_note: string | null
  created_at: string
  subjects: { name: string } | null
}

interface StudentRequestRow {
  id: string
  message: string
  status: RequestStatus
  tutor_note: string | null
  created_at: string
  subjects: { name: string } | null
  tutor_profiles: { id: string; city: string; profiles: { full_name: string } | null }
}

// All subjects, alphabetical.
export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase.from('subjects').select('*').order('name')
  if (error) throw error
  return data ?? []
}

// The signed-in tutor's profile (or null if not created yet) + their subject ids.
export async function getMyTutorProfile(
  userId: string,
): Promise<{ profile: TutorProfile | null; subjectIds: number[] }> {
  const { data: profile, error } = await supabase
    .from('tutor_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  if (!profile) return { profile: null, subjectIds: [] }

  const { data: links, error: linkError } = await supabase
    .from('tutor_subjects')
    .select('subject_id')
    .eq('tutor_id', profile.id)
  if (linkError) throw linkError

  return {
    profile: profile as TutorProfile,
    subjectIds: (links ?? []).map((l) => l.subject_id as number),
  }
}

// Create or update the tutor profile for a user, then replace its subject links.
// Returns the tutor_profile id.
export async function saveTutorProfile(
  userId: string,
  input: TutorProfileInput,
): Promise<string> {
  const { data: saved, error } = await supabase
    .from('tutor_profiles')
    .upsert(
      {
        user_id: userId,
        bio: input.bio,
        city: input.city,
        hourly_rate: input.hourly_rate,
        online_available: input.online_available,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' },
    )
    .select('id')
    .single()
  if (error) throw error

  const tutorId = saved.id as string

  // Replace subject links: clear existing, then insert the chosen set.
  const { error: delError } = await supabase
    .from('tutor_subjects')
    .delete()
    .eq('tutor_id', tutorId)
  if (delError) throw delError

  if (input.subject_ids.length > 0) {
    const rows = input.subject_ids.map((subject_id) => ({ tutor_id: tutorId, subject_id }))
    const { error: insError } = await supabase.from('tutor_subjects').insert(rows)
    if (insError) throw insError
  }

  return tutorId
}
