'use client'

import React from 'react'
import type { Event } from '@/types'
import { CapacityBar, CAT_BADGE, CAT_GRADIENT } from '@/components/ui'
import { formatDate, formatTime, todayStr } from '@/lib/utils'
import { getEventStatus } from '@/lib/event-utils'

interface Props {
  event: Event
  currentUserId: string
  onClick: () => void
}

export default function EventCard({ event: ev, currentUserId, onClick }: Props) {
  const { registered, onWaitlist, isFull } = getEventStatus(ev, currentUserId, todayStr())
  const waitPos = onWaitlist ? ev.waitlist.indexOf(currentUserId) + 1 : null

  let statusLabel: string
  let statusCls: string
  if (registered)      { statusLabel = 'Registered';           statusCls = 'bg-[rgba(124,106,247,0.15)] text-accent2' }
  else if (onWaitlist) { statusLabel = `Waitlist #${waitPos}`; statusCls = 'bg-[rgba(245,166,35,0.1)] text-amber' }
  else if (isFull)     { statusLabel = 'Full';                 statusCls = 'bg-[rgba(240,96,96,0.1)] text-danger' }
  else                 { statusLabel = 'Open';                 statusCls = 'bg-[rgba(45,212,160,0.1)] text-emerald' }

  return (
    <div
      onClick={onClick}
      className="bg-surface border border-border rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:border-border2 hover:shadow-[0_8px_25px_rgba(0,0,0,0.3)]"
    >
      <div className={`h-1.5 bg-gradient-to-r ${CAT_GRADIENT[ev.category]}`} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded ${CAT_BADGE[ev.category]}`}>
            {ev.category}
          </span>
          <span className={`font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded ${statusCls}`}>
            {statusLabel}
          </span>
        </div>

        <h3 className="font-serif text-[1.05rem] text-ink mb-2 leading-snug">{ev.title}</h3>

        <div className="flex flex-col gap-1 mb-3">
          {[
            { icon: '📅', text: `${formatDate(ev.date)} at ${formatTime(ev.time)}` },
            { icon: '📍', text: ev.location },
            { icon: '👤', text: ev.organiser },
          ].map(({ icon, text }) => (
            <div key={icon} className="flex items-center gap-2 text-[0.8rem] text-ink3">
              <span className="opacity-60 text-xs">{icon}</span>{text}
            </div>
          ))}
        </div>

        <p className="text-[0.82rem] text-ink3 leading-relaxed mb-4 line-clamp-2">{ev.description}</p>

        <CapacityBar registered={ev.registrations.length} capacity={ev.capacity} />

        {ev.waitlist.length > 0 && (
          <p className="text-[0.72rem] text-amber mt-1.5">
            ⏳ {ev.waitlist.length} on waitlist
          </p>
        )}
      </div>
    </div>
  )
}
