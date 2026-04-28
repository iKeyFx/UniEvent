'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useEventSync } from '@/hooks/useEventSync'
import { registerForEvent, cancelRegistration, joinWaitlist, leaveWaitlist } from '@/actions/events'
import { showToast } from '@/hooks/useToast'
import { EmptyState } from '@/components/ui'
import EventCard from '@/components/EventCard'
import EventDetailModal from '@/components/modals/EventDetailModal'
import QRTicketModal from '@/components/modals/QRTicketModal'
import FeedbackModal from '@/components/modals/FeedbackModal'
import { todayStr } from '@/lib/utils'
import { CATEGORIES } from '@/lib/constants'
import type { Event } from '@/types'

export default function BrowseClient({ initialEvents }: { initialEvents: Event[] }) {
  const { user } = useAuth()
  const router   = useRouter()

  const [events,        setEvents]        = useEventSync(initialEvents)
  const [filter,        setFilter]        = useState('all')
  const [search,        setSearch]        = useState('')
  const [detailEventId, setDetailEventId] = useState<string | null>(null)
  const [qrEventId,     setQrEventId]     = useState<string | null>(null)
  const [feedbackTitle, setFeedbackTitle] = useState<string | null>(null)

  const td      = todayStr()
  const visible = events.filter(ev => {
    if (ev.isCancelled) return false
    if (ev.date < td) return false
    if (filter !== 'all' && ev.category !== filter) return false
    if (search) {
      const q = search.toLowerCase()
      if (!ev.title.toLowerCase().includes(q) && !ev.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  const detailEvent = detailEventId ? events.find(e => e.id === detailEventId) ?? null : null
  const qrEvent     = qrEventId     ? events.find(e => e.id === qrEventId)     ?? null : null

  async function handleRegister(id: string) {
    const ev = events.find(e => e.id === id)!
    setEvents(prev => prev.map(e => e.id === id
      ? { ...e, registrations: [...e.registrations, user.id], waitlist: e.waitlist.filter(w => w !== user.id) }
      : e))
    try {
      await registerForEvent(id)
      setDetailEventId(null)
      showToast(`✅ Registered for "${ev.title}"!`, 'success')
      setTimeout(() => showToast(`📧 Confirmation email sent to ${user.email}`, 'info'), 1000)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error')
    } finally {
      router.refresh()
    }
  }

  async function handleCancel(id: string) {
    const ev = events.find(e => e.id === id)!
    setEvents(prev => prev.map(e => e.id === id
      ? { ...e, registrations: e.registrations.filter(r => r !== user.id) }
      : e))
    try {
      await cancelRegistration(id)
      setDetailEventId(null)
      showToast(`Registration cancelled for "${ev.title}"`, 'info')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Cancellation failed', 'error')
    } finally {
      router.refresh()
    }
  }

  async function handleJoinWaitlist(id: string) {
    const ev = events.find(e => e.id === id)!
    if (ev.waitlist.includes(user.id)) { showToast('Already on the waitlist', 'info'); return }
    const pos = ev.waitlist.length + 1
    setEvents(prev => prev.map(e => e.id === id
      ? { ...e, waitlist: [...e.waitlist, user.id] }
      : e))
    try {
      await joinWaitlist(id)
      setDetailEventId(null)
      showToast(`⏳ Added to waitlist at position #${pos}`, 'info')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to join waitlist', 'error')
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
      setDetailEventId(null)
      showToast(`Removed from waitlist for "${ev.title}"`, 'info')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to leave waitlist', 'error')
    } finally {
      router.refresh()
    }
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-surface border border-border rounded-2xl p-8 mb-7 relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-5%] w-96 h-96 rounded-full bg-[radial-gradient(circle,rgba(124,106,247,0.08)_0%,transparent_65%)] pointer-events-none" />
        <div className="font-mono text-[0.65rem] tracking-[0.15em] uppercase text-accent2 mb-3">Campus Events</div>
        <h1 className="font-serif text-[1.6rem] text-ink mb-2 leading-tight">
          Discover what&apos;s<br />
          <em className="italic text-accent2">happening on campus</em>
        </h1>
        <p className="text-[0.88rem] text-ink3 max-w-lg">
          Register for events, get QR tickets, and never miss what matters to you.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5 mb-5">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search events…"
          className="flex-1 min-w-[180px] bg-surface border border-border rounded-lg px-3 py-2.5 text-sm text-ink outline-none transition-all focus:border-accent placeholder:text-ink3"
        />
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3.5 py-1.5 rounded-full border text-[0.8rem] font-medium font-sans cursor-pointer transition-all capitalize ${
              filter === c
                ? 'bg-[rgba(124,106,247,0.15)] border-accent text-accent2'
                : 'bg-transparent border-border text-ink3 hover:text-ink2'
            }`}
          >
            {c === 'all' ? 'All' : c}
          </button>
        ))}
      </div>

      {/* Event grid */}
      {visible.length === 0 ? (
        <EmptyState icon="🔍" text="No events found. Try a different filter." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              currentUserId={user.id}
              onClick={() => setDetailEventId(ev.id)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <EventDetailModal
        event={detailEvent}
        currentUser={user}
        onClose={() => setDetailEventId(null)}
        onRegister={handleRegister}
        onCancel={handleCancel}
        onJoinWaitlist={handleJoinWaitlist}
        onLeaveWaitlist={handleLeaveWaitlist}
        onShowQR={id => { setDetailEventId(null); setQrEventId(id) }}
        onFeedback={id => { const ev = events.find(e => e.id === id); setFeedbackTitle(ev?.title ?? null) }}
      />
      <QRTicketModal event={qrEvent} currentUser={user} onClose={() => setQrEventId(null)} />
      <FeedbackModal eventTitle={feedbackTitle} onClose={() => setFeedbackTitle(null)} />
    </div>
  )
}
