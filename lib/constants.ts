import type { NotifPrefs } from '@/types'

export const ROUTES = {
  login:     '/login',
  browse:    '/browse',
  dashboard: '/dashboard',
  myEvents:  '/my-events',
  create:    '/create',
  checkin:   '/checkin',
  analytics: '/analytics',
  profile:   '/profile',
} as const

export const CATEGORIES = ['all', 'academic', 'social', 'career', 'workshop'] as const

export const CAPACITY_THRESHOLDS = { warn: 50, danger: 80 } as const

export const QR_TOKEN_PREFIX = 'UNIEVENT'

export const TOAST_DURATION_MS       = 4000
export const QR_SCAN_DEBOUNCE_MS     = 2000
export const RESULT_FLASH_MS         = 650
export const DEFAULT_EVENT_LEAD_DAYS = 14

export const NOTIF_ITEMS: { key: keyof NotifPrefs; label: string; sub: string }[] = [
  { key: 'confirmations',      label: 'Registration confirmation', sub: 'Email when you register for an event' },
  { key: 'reminders',          label: '24-hour reminder',          sub: "Email the day before an event you're attending" },
  { key: 'cancellations',      label: 'Cancellation alerts',       sub: 'Email if an event you registered for is cancelled' },
  { key: 'waitlistPromotions', label: 'Waitlist promotions',       sub: 'Email when a spot opens and you move up the waitlist' },
  { key: 'announcements',      label: 'New event announcements',   sub: 'Weekly digest of new events matching your categories' },
]
