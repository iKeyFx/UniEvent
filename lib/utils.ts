import { SAMPLE_NAMES } from '@/data/seed'

export function formatDate(d: string): string {
  if (!d) return '—'
  const dt = new Date(d + 'T00:00:00')
  return dt.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export function formatTime(t: string): string {
  if (!t) return '—'
  const [hStr, m] = t.split(':')
  const h = parseInt(hStr, 10)
  return `${h > 12 ? h - 12 : h}:${m} ${h >= 12 ? 'PM' : 'AM'}`
}

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function initials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

export function nameForId(
  uid: string,
  currentUserId: string,
  currentUserName: string,
  idx: number,
): string {
  return uid === currentUserId ? currentUserName : SAMPLE_NAMES[idx % SAMPLE_NAMES.length]
}

export function emailForName(name: string, isCurrentUser: boolean, currentEmail: string): string {
  return isCurrentUser ? currentEmail : name.toLowerCase().replace(/ /g, '_') + '@uni.edu'
}

export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function defaultFutureDate(daysAhead = 14): string {
  const d = new Date()
  d.setDate(d.getDate() + daysAhead)
  return d.toISOString().slice(0, 10)
}
