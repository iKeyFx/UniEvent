import type { EmailLogEntry } from '@/types'

export const SAMPLE_NAMES = [
  'Chinonso Eze', 'Amara Obi', 'Damilola Adeyemi', 'Fatima Usman', 'Emeka Nwosu',
  'Blessing Ojo', 'Tobi Adewale', 'Ngozi Okafor', 'Seun Bakare', 'Kemi Adesanya',
  'Tunde Adebayo', 'Adeola Bello', 'Chisom Okeke', 'Zainab Musa', 'Samuel Oduya',
]

export const SEED_EMAIL_LOG: EmailLogEntry[] = [
  { icon: '📧', subject: 'Registration Confirmed: Tech Career Fair 2026',          to: 'chinonso.eze@uni.edu',     status: 'sent',    time: '09:12' },
  { icon: '⏰', subject: 'Reminder: Python for Data Science Workshop is tomorrow',  to: 'amara.obi@uni.edu',        status: 'sent',    time: '09:00' },
  { icon: '📧', subject: 'Registration Confirmed: Research Methods Seminar',        to: 'damilola.adeyemi@uni.edu', status: 'sent',    time: '08:45' },
  { icon: '⏳', subject: "You're on the waitlist: Entrepreneurship Bootcamp",       to: 'fatima.usman@uni.edu',     status: 'sent',    time: '08:30' },
  { icon: '⏰', subject: 'Reminder: End of Term Social Night is tomorrow',          to: 'emeka.nwosu@uni.edu',      status: 'pending', time: '—'     },
  { icon: '📧', subject: 'Registration Confirmed: Diversity & Inclusion Forum',     to: 'blessing.ojo@uni.edu',     status: 'sent',    time: '08:15' },
  { icon: '🎉', subject: 'Spot available: Entrepreneurship Bootcamp',              to: 'seun.bakare@uni.edu',       status: 'failed',  time: '08:00' },
]
