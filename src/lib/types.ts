export type Role = 'tutor' | 'student'

export interface Profile {
  id: string
  role: Role
  full_name: string
  created_at: string
}

export interface Subject {
  id: number
  name: string
}

export interface TutorProfile {
  id: string
  user_id: string
  bio: string | null
  city: string
  hourly_rate: number
  online_available: boolean
  created_at: string
  updated_at: string
}

// Form payload for creating/updating a tutor profile.
export interface TutorProfileInput {
  bio: string
  city: string
  hourly_rate: number
  online_available: boolean
  subject_ids: number[]
}

// Flattened tutor record for the directory and profile page.
export interface TutorListItem {
  id: string
  full_name: string
  bio: string | null
  city: string
  hourly_rate: number
  online_available: boolean
  subjects: Subject[]
}
