import { supabase } from './supabaseClient'
import type { Subject, TutorProfile, TutorProfileInput, TutorListItem } from './types'

// Shape PostgREST returns for the embedded join below.
interface TutorRow {
  id: string
  bio: string | null
  city: string
  hourly_rate: number
  online_available: boolean
  profiles: { full_name: string } | null
  tutor_subjects: { subjects: Subject | null }[]
}

const TUTOR_SELECT =
  'id, bio, city, hourly_rate, online_available, profiles!inner(full_name), tutor_subjects(subjects(id, name))'

function toTutorListItem(row: TutorRow): TutorListItem {
  return {
    id: row.id,
    full_name: row.profiles?.full_name ?? '',
    bio: row.bio,
    city: row.city,
    hourly_rate: row.hourly_rate,
    online_available: row.online_available,
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
