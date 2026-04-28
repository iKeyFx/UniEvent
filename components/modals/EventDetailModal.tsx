'use client'

import React from 'react'
import type { Event, User } from '@/types'
import { Modal, Button, CapacityBar, CAT_GRADIENT, CAT_BADGE } from '@/components/ui'
import { formatDate, formatTime, todayStr } from '@/lib/utils'
import { getEventStatus, capacityPct, capacityColor } from '@/lib/event-utils'

interface Props {
  event: Event | null
  currentUser: User
  onClose: () => void
  onRegister: (id: string) => void
  onCancel: (id: string) => void
  onJoinWaitlist: (id: string) => void
  onLeaveWaitlist: (id: string) => void
  onShowQR: (id: string) => void
  onFeedback: (id: string) => void
}

export default function EventDetailModal({
  event: ev, currentUser, onClose,
  onRegister, onCancel, onJoinWaitlist, onLeaveWaitlist, onShowQR, onFeedback,
}: Props) {
  if (!ev) return null

  const evId                                          = ev.id
  const uid                                           = currentUser.id
  const { registered, onWaitlist, isFull: full, attended, isPast } = getEventStatus(ev, uid, todayStr())
  const waitPos  = onWaitlist ? ev.waitlist.indexOf(uid) + 1 : null
  const pct      = capacityPct(ev)
  const capColor = capacityColor(pct)

  function Footer() {
    if (currentUser.role !== 'student') {
      return <Button variant="ghost" onClick={onClose}>Close</Button>
    }
    if (registered && !isPast) return (
      <>
        <Button variant="ghost"   onClick={onClose}>Close</Button>
        <Button variant="success" onClick={() => onShowQR(evId)}>🎟 View QR Ticket</Button>
        <Button variant="danger"  onClick={() => onCancel(evId)}>Cancel Registration</Button>
      </>
    )
    if (registered && isPast && attended) return (
      <>
        <Button variant="ghost"   onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={() => { onClose(); onFeedback(evId) }}>📝 Leave Feedback</Button>
      </>
    )
    if (registered && isPast) return (
      <>
        <Button variant="ghost"     onClick={onClose}>Close</Button>
        <Button variant="secondary" disabled>Event ended</Button>
      </>
    )
    if (onWaitlist) return (
      <>
        <Button variant="ghost"  onClick={onClose}>Close</Button>
        <Button variant="danger" onClick={() => onLeaveWaitlist(evId)}>Leave Waitlist</Button>
      </>
    )
    if (!full) return (
      <>
        <Button variant="ghost"   onClick={onClose}>Close</Button>
        <Button variant="primary" onClick={() => onRegister(evId)}>Register Now →</Button>
      </>
    )
    return (
      <>
        <Button variant="ghost" onClick={onClose}>Close</Button>
        <Button variant="amber" onClick={() => onJoinWaitlist(evId)}>⏳ Join Waitlist</Button>
      </>
    )
  }

  return (
    <Modal open={!!ev} onClose={onClose} title={ev.title} footer={<Footer />}>
      <div className={`h-1.5 rounded bg-gradient-to-r ${CAT_GRADIENT[ev.category]} mb-4`} />

      <p className="text-[0.88rem] text-ink3 leading-relaxed mb-4">{ev.description}</p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        {[
          ['Date',      formatDate(ev.date)],
          ['Time',      formatTime(ev.time)],
          ['Location',  ev.location],
          ['Organiser', ev.organiser],
          ['Category',  ev.category],
          ['Capacity',  `${ev.capacity} seats`],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="font-mono text-[0.68rem] uppercase tracking-widest text-ink3 mb-0.5">{label}</div>
            <div className="text-[0.88rem] font-medium text-ink capitalize">{value}</div>
          </div>
        ))}
      </div>

      <div className="bg-surface2 border border-border rounded-lg p-3 mb-3">
        <div className="flex justify-between text-[0.78rem] text-ink3 mb-2">
          <span>{ev.registrations.length} / {ev.capacity} registered</span>
          <span>{full ? 'Full' : `${ev.capacity - ev.registrations.length} remaining`}</span>
        </div>
        <div className="h-1.5 bg-surface3 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${capColor}`} style={{ width: `${pct}%` }} />
        </div>
        {ev.waitlist.length > 0 && (
          <p className="text-[0.75rem] text-amber mt-1.5">
            ⏳ {ev.waitlist.length} student{ev.waitlist.length > 1 ? 's' : ''} on waitlist
          </p>
        )}
      </div>

      {onWaitlist && (
        <div className="bg-[rgba(245,166,35,0.1)] border border-[rgba(245,166,35,0.25)] rounded-lg p-3 text-[0.84rem] text-amber mb-3">
          ⏳ You are <strong>#{waitPos}</strong> on the waitlist. You&apos;ll be notified automatically if a spot opens.
        </div>
      )}

      {attended && (
        <div className="bg-[rgba(45,212,160,0.1)] border border-[rgba(45,212,160,0.2)] rounded-lg p-3 text-[0.84rem] text-emerald">
          ✓ You attended this event.
        </div>
      )}
    </Modal>
  )
}
