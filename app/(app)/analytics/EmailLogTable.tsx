'use client'

import React from 'react'
import type { EmailLogEntry } from '@/types'

export default function EmailLogTable({ entries }: { entries: EmailLogEntry[] }) {
  return (
    <div>
      <h2 className="font-serif text-xl text-ink mb-4">Email Notification Log</h2>
      <div className="flex flex-col gap-2">
        {entries.slice(0, 15).map((entry, i) => (
          <div key={i} className="bg-surface border border-border rounded-lg px-4 py-3 flex items-center gap-3">
            <span className="text-lg flex-shrink-0">{entry.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[0.84rem] font-semibold text-ink truncate">{entry.subject}</div>
              <div className="text-[0.74rem] text-ink3 mt-0.5">To: {entry.to} · {entry.time}</div>
            </div>
            <span className={`font-mono text-[0.6rem] uppercase tracking-widest px-2 py-0.5 rounded flex-shrink-0 ${
              entry.status === 'sent'    ? 'bg-emerald/10 text-emerald' :
              entry.status === 'pending' ? 'bg-amber/10 text-amber'     :
                                           'bg-danger/10 text-danger'
            }`}>{entry.status}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
