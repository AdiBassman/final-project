export type Role = 'tutor' | 'student'

export interface Profile {
  id: string
  role: Role
  full_name: string
  created_at: string
}
