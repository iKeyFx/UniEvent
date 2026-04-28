import type { Event } from '@/types'
import { CAPACITY_THRESHOLDS, QR_TOKEN_PREFIX } from './constants'

export function capacityPct(ev: Event): number {
  return ev.capacity > 0 ? Math.min(Math.round((ev.registrations.length / ev.capacity) * 100), 100) : 0
}

export function capacityColor(pct: number): string {
  if (pct < CAPACITY_THRESHOLDS.warn)   return 'bg-emerald'
  if (pct < CAPACITY_THRESHOLDS.danger) return 'bg-amber'
  return 'bg-danger'
}

export interface EventStatus {
  registered: boolean
  onWaitlist: boolean
  attended:   boolean
  isFull:     boolean
  isPast:     boolean
}

export function getEventStatus(ev: Event, userId: string, today: string): EventStatus {
  return {
    registered: ev.registrations.includes(userId),
    onWaitlist: ev.waitlist.includes(userId),
    attended:   ev.attendance.includes(userId),
    isFull:     ev.registrations.length >= ev.capacity,
    isPast:     ev.date < today,
  }
}

export function buildQRToken(eventId: string, userId: string, name: string): string {
  return `${QR_TOKEN_PREFIX}:${eventId}:${userId}:${name}`
}

export function parseQRToken(raw: string): { eventId: string; userId: string; name: string } | null {
  if (!raw.startsWith(QR_TOKEN_PREFIX + ':')) return null
  const parts = raw.split(':')
  if (parts.length < 4) return null
  return { eventId: parts[1], userId: parts[2], name: parts.slice(3).join(':') }
}

export function generateAttendanceCSV(
  ev: Event,
  resolveName:  (uid: string) => string,
  resolveEmail: (uid: string) => string,
): string {
  let csv = 'Name,Email,Status\n'
  ev.registrations.forEach(uid => {
    const att = ev.attendance.includes(uid)
    csv += `"${resolveName(uid)}","${resolveEmail(uid)}","${att ? 'Attended' : 'Registered'}"\n`
  })
  return csv
}
