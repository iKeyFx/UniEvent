'use client'

import React, { useState } from 'react'
import { useEventSync } from '@/hooks/useEventSync'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cancelEvent } from '@/actions/events'
import { showToast } from '@/hooks/useToast'
import { Button, StatCard, PageHeader, CAT_BADGE } from '@/components/ui'
import MiniBar from '@/components/MiniBar'
import { formatDate, downloadCSV, nameForId, emailForName } from '@/lib/utils'
import { capacityPct, capacityColor } from '@/lib/event-utils'
import { ROUTES } from '@/lib/constants'
import type { Event } from '@/types'

export default function DashboardClient({ initialEvents }: { initialEvents: Event[] }) {
  const { user }  = useAuth()
  const router    = useRouter()
  const [events,          setEvents]          = useEventSync(initialEvents)
  const [open,            setOpen]            = useState<string | null>(null)
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null)

  async function doCancel(eventId: string) {
    setConfirmCancelId(null)
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isCancelled: true } : e))
    try {
      await cancelEvent(eventId)
      showToast('Event cancelled', 'info')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to cancel event', 'error')
      setEvents(prev => prev.map(e => e.id === eventId ? { ...e, isCancelled: false } : e))
    }
  }

  const totalRegs = events.reduce((s, e) => s + e.registrations.length, 0)
  const totalAtt  = events.reduce((s, e) => s + e.attendance.length,    0)
  const attRate   = totalRegs ? Math.round((totalAtt / totalRegs) * 100) : 0

  function exportEvent(eventId: string) {
    const ev = events.find(e => e.id === eventId)
    if (!ev) return
    let csv = 'Name,Email,Status,Check-In Time\n'
    ev.registrations.forEach((uid, i) => {
      const isCurrent = uid === user.id
      const name  = nameForId(uid, user.id, user.name, i)
      const email = emailForName(name, isCurrent, user.email)
      const att   = ev.attendance.includes(uid)
      const time  = att ? `2026-04-10 0${9 + i % 3}:${String(i * 7 % 60).padStart(2, '0')}` : ''
      csv += `"${name}","${email}","${att ? 'Attended' : 'Registered'}","${time}"\n`
    })
    downloadCSV(`${ev.title.replace(/\s+/g, '_')}_attendance.csv`, csv)
    showToast('📥 CSV exported', 'success')
  }

  return (
    <div>
      <PageHeader
        title="Organiser Dashboard"
        subtitle="Manage your events and track attendance"
        action={
          <Button variant="primary" onClick={() => router.push(ROUTES.create)}>
            + Create Event
          </Button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Events"       value={events.length} sub="total published"           accent="accent" />
        <StatCard label="Registrations"   value={totalRegs}     sub="across all events"         accent="green" />
        <StatCard label="Attendees"       value={totalAtt}      sub="checked in total"           accent="amber" />
        <StatCard label="Avg. Attendance" value={`${attRate}%`} sub="of registrations attended" accent="blue" />
      </div>

      <h2 className="font-serif text-lg text-ink mb-4">Your Events</h2>
      <div className="flex flex-col gap-3">
        {events.map(ev => {
          const pct      = capacityPct(ev)
          const attPct   = ev.registrations.length > 0 ? Math.round((ev.attendance.length / ev.registrations.length) * 100) : 0
          const capColor = capacityColor(pct)
          const isOpen   = open === ev.id
          const trend    = Array.from({ length: 7 }, (_, i) =>
            Math.max(0, Math.floor(ev.registrations.length * (i + 1) / 7 * (0.8 + Math.sin(i) * 0.2)))
          )

          return (
            <div key={ev.id} className={`bg-surface border rounded-xl overflow-hidden ${ev.isCancelled ? 'border-danger/30 opacity-70' : 'border-border'}`}>
              <button
                onClick={() => !ev.isCancelled && setOpen(isOpen ? null : ev.id)}
                className="w-full flex items-center gap-3 p-4 text-left hover:bg-surface2 transition-colors border-none bg-transparent cursor-pointer"
              >
                <span className={`font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded flex-shrink-0 ${CAT_BADGE[ev.category]}`}>
                  {ev.category}
                </span>
                <span className="font-semibold text-[0.92rem] text-ink flex-1 truncate text-left">{ev.title}</span>
                {ev.isCancelled && (
                  <span className="font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded bg-danger/10 text-danger flex-shrink-0">
                    Cancelled
                  </span>
                )}
                <span className="text-[0.78rem] text-ink3 hidden sm:block flex-shrink-0">{formatDate(ev.date)}</span>
                <span className="font-mono text-[0.72rem] px-2.5 py-0.5 rounded-full bg-[rgba(124,106,247,0.15)] text-accent2 whitespace-nowrap flex-shrink-0">
                  {ev.registrations.length}/{ev.capacity}
                </span>
                {!ev.isCancelled && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    className={`text-ink3 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                )}
              </button>

              {!ev.isCancelled && isOpen && (
                <div className="border-t border-border bg-surface2 p-4">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    {[
                      ['Registrations', `${ev.registrations.length}`, `/ ${ev.capacity}`],
                      ['Attended',      `${ev.attendance.length}`,    `(${attPct}%)`],
                      ['Capacity',      `${pct}%`,                    ''],
                    ].map(([label, main, sub]) => (
                      <div key={label}>
                        <div className="font-mono text-[0.68rem] uppercase tracking-widest text-ink3 mb-1">{label}</div>
                        <div className="font-serif text-2xl text-ink">
                          {main}<span className="text-sm text-ink3 font-sans"> {sub}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="font-mono text-[0.68rem] uppercase tracking-widest text-ink3 mb-2">
                    Registration Trend (7 days)
                  </div>
                  <MiniBar values={trend} />

                  <div className="h-1.5 bg-surface3 rounded-full overflow-hidden mt-3 mb-4">
                    <div className={`h-full rounded-full ${capColor}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="flex gap-2.5 flex-wrap items-center">
                    <Button variant="primary"   size="sm" onClick={() => router.push(`${ROUTES.checkin}?event=${ev.id}`)}>📷 Check-In</Button>
                    <Button variant="secondary" size="sm" onClick={() => exportEvent(ev.id)}>⬇ Export CSV</Button>
                    <Button variant="secondary" size="sm" onClick={() => router.push(ROUTES.analytics)}>📈 Analytics</Button>
                    <div className="flex-1" />
                    {confirmCancelId === ev.id ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[0.78rem] text-danger">Are you sure? This cannot be undone.</span>
                        <Button variant="danger"   size="sm" onClick={() => doCancel(ev.id)}>Confirm Cancel</Button>
                        <Button variant="ghost"    size="sm" onClick={() => setConfirmCancelId(null)}>Dismiss</Button>
                      </div>
                    ) : (
                      <Button variant="danger" size="sm" onClick={() => setConfirmCancelId(ev.id)}>Cancel Event</Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
