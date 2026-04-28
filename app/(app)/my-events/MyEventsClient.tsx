'use client'

import React, { useState } from 'react'
import { useEventSync } from '@/hooks/useEventSync'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { cancelRegistration, leaveWaitlist } from '@/actions/events'
import { showToast } from '@/hooks/useToast'
import { Button, EmptyState } from '@/components/ui'
import QRTicketModal from '@/components/modals/QRTicketModal'
import FeedbackModal from '@/components/modals/FeedbackModal'
import { formatDate, formatTime, todayStr } from '@/lib/utils'
import { getEventStatus } from '@/lib/event-utils'
import type { Event } from '@/types'

type Tab = 'upcoming' | 'past'

const DOT_COLOR: Record<string, string> = {
  academic: 'bg-azure', social: 'bg-emerald', career: 'bg-amber', workshop: 'bg-accent',
}

export default function MyEventsClient({ initialEvents }: { initialEvents: Event[] }) {
  const { user } = useAuth()
  const router   = useRouter()

  const [events,        setEvents]        = useEventSync(initialEvents)
  const [tab,           setTab]           = useState<Tab>('upcoming')
  const [qrEventId,     setQrEventId]     = useState<string | null>(null)
  const [feedbackTitle, setFeedbackTitle] = useState<string | null>(null)

  const td         = todayStr()
  const myEvents   = events.filter(ev => ev.registrations.includes(user.id))
  const waitlisted = events.filter(ev => ev.waitlist.includes(user.id))
  const upcoming   = myEvents.filter(ev => ev.date >= td)
  const past       = myEvents.filter(ev => ev.date <  td)
  const qrEvent    = qrEventId ? events.find(e => e.id === qrEventId) ?? null : null

  async function cancel(id: string) {
    const ev = events.find(e => e.id === id)!
    setEvents(prev => prev.map(e => e.id === id
      ? { ...e, registrations: e.registrations.filter(r => r !== user.id) }
      : e))
    try {
      await cancelRegistration(id)
      showToast(`Registration cancelled for "${ev.title}"`, 'info')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cancellation failed', 'error')
    } finally {
      router.refresh()
    }
  }

  async function handleLeaveWaitlist(id: string) {
    const ev = events.find(e => e.id === id)!
    setEvents(prev => prev.map(e => e.id === id
      ? { ...e, waitlist: e.waitlist.filter(w => w !== user.id) }
      : e))
    try {
      await leaveWaitlist(id)
      showToast(`Removed from waitlist for "${ev.title}"`, 'info')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to leave waitlist', 'error')
    } finally {
      router.refresh()
    }
  }

  function EventRow({ ev, isPast }: { ev: Event; isPast: boolean }) {
    const { attended } = getEventStatus(ev, user.id, td)
    return (
      <div className={`bg-surface border rounded-xl p-4 flex items-center gap-3 transition-colors hover:border-border2 flex-wrap ${ev.isCancelled ? 'border-danger/30 opacity-70' : 'border-border'}`}>
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${DOT_COLOR[ev.category] ?? 'bg-ink3'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-[0.9rem] text-ink truncate">{ev.title}</span>
            {ev.isCancelled && (
              <span className="font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded bg-danger/10 text-danger flex-shrink-0">
                Cancelled
              </span>
            )}
          </div>
          <div className="text-[0.78rem] text-ink3 mt-0.5">
            {formatDate(ev.date)} · {formatTime(ev.time)} · {ev.location}
          </div>
        </div>
        {attended && <span className="text-[0.75rem] text-emerald font-mono">✓ Attended</span>}
        {isPast && attended && !ev.isCancelled && (
          <Button variant="ghost" size="sm" onClick={() => setFeedbackTitle(ev.title)}>📝 Feedback</Button>
        )}
        {!isPast && !ev.isCancelled && (
          <Button variant="ghost" size="sm" onClick={() => setQrEventId(ev.id)}>🎟 QR</Button>
        )}
        {!ev.isCancelled && !attended && (
          <Button variant="danger" size="sm" onClick={() => cancel(ev.id)}>Cancel</Button>
        )}
      </div>
    )
  }

  function WaitlistRow({ ev }: { ev: Event }) {
    const pos = ev.waitlist.indexOf(user.id) + 1
    return (
      <div className="bg-surface border border-[rgba(245,166,35,0.3)] rounded-xl p-4 flex items-center gap-3 flex-wrap">
        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-amber" />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-[0.9rem] text-ink truncate">{ev.title}</div>
          <div className="text-[0.78rem] text-ink3 mt-0.5">{formatDate(ev.date)} · {ev.location}</div>
        </div>
        <span className="font-mono text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded bg-[rgba(245,166,35,0.1)] text-amber">
          Waitlist #{pos}
        </span>
        <Button variant="danger" size="sm" onClick={() => handleLeaveWaitlist(ev.id)}>Leave</Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-7 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl text-ink">My Registrations</h1>
          <p className="text-sm text-ink3 mt-1">Your upcoming and past events</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-5">
        {(['upcoming', 'past'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2.5 border-none bg-transparent text-[0.85rem] font-medium font-sans cursor-pointer transition-all border-b-2 -mb-px capitalize ${
              tab === t ? 'text-accent2 border-accent' : 'text-ink3 border-transparent hover:text-ink2'
            }`}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past'}
            {t === 'upcoming' && (upcoming.length + waitlisted.length) > 0 && (
              <span className="ml-2 font-mono text-[0.6rem] bg-surface3 text-ink3 px-1.5 py-0.5 rounded-full">
                {upcoming.length + waitlisted.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === 'upcoming' && (
        <div className="flex flex-col gap-3">
          {upcoming.length === 0 && waitlisted.length === 0
            ? <EmptyState icon="📭" text="No upcoming registrations. Browse events to register!" />
            : null
          }
          {upcoming.map(ev => <EventRow key={ev.id} ev={ev} isPast={false} />)}
          {waitlisted.map(ev => <WaitlistRow key={ev.id} ev={ev} />)}
        </div>
      )}

      {tab === 'past' && (
        <div className="flex flex-col gap-3">
          {past.length === 0
            ? <EmptyState icon="📭" text="No past events yet." />
            : past.map(ev => <EventRow key={ev.id} ev={ev} isPast />)
          }
        </div>
      )}

      <QRTicketModal event={qrEvent} currentUser={user} onClose={() => setQrEventId(null)} />
      <FeedbackModal eventTitle={feedbackTitle} onClose={() => setFeedbackTitle(null)} />
    </div>
  )
}
