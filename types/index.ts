export type Role     = 'student' | 'organiser'
export type Category = 'academic' | 'social' | 'career' | 'workshop'
export type EmailStatus = 'sent' | 'pending' | 'failed'


export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export interface Event {
  id: string
  title: string
  description: string
  date: string      // YYYY-MM-DD
  time: string      // HH:MM
  location: string
  category: Category
  capacity: number
  organiser: string
  organiserId: string
  registrations: string[]
  attendance: string[]
  waitlist: string[]
  isCancelled: boolean
}

export interface EmailLogEntry {
  icon: string
  subject: string
  to: string
  time: string
  status: EmailStatus
}

export interface NotifPrefs {
  confirmations: boolean
  reminders: boolean
  cancellations: boolean
  waitlistPromotions: boolean
  announcements: boolean
}

