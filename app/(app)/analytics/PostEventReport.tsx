'use client'

import React from 'react'
import { Button, StatCard } from '@/components/ui'
import { nameForId, emailForName } from '@/lib/utils'
import type { Event, User } from '@/types'

interface Props {
  events:     Event[]
  reportId:   string
  setReportId: (id: string) => void
  onExport:   () => void
  user:       User
}

export default function PostEventReport({ events, reportId, setReportId, onExport, user }: Props) {
  const reportEv  = events.find(e => e.id === reportId)
  const repTotal  = reportEv?.registrations.length ?? 0
  const repAtt    = reportEv?.attendance.length    ?? 0
  const repNS     = repTotal - repAtt
  const repRate   = repTotal > 0 ? Math.round((repAtt / repTotal) * 100) : 0
  const repCapPct = reportEv ? Math.round((repTotal / reportEv.capacity) * 100) : 0

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl text-ink mb-4">Post-Event Report</h2>
      <div className="bg-surface border border-border rounded-xl p-4 flex items-center gap-4 mb-4 flex-wrap">
        <label className="font-mono text-[0.72rem] uppercase tracking-widest text-ink3 whitespace-nowrap">Select Event</label>
        <select
          value={reportId}
          onChange={e => setReportId(e.target.value)}
          className="flex-1 max-w-xs bg-surface2 border border-border rounded-lg px-3 py-2 text-ink text-sm outline-none focus:border-accent appearance-none"
        >
          {events.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
        </select>
        <Button variant="secondary" size="sm" onClick={onExport}>Export CSV</Button>
      </div>

      {reportEv && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard label="Registered" value={repTotal} sub={`of ${reportEv.capacity} (${repCapPct}%)`} accent="accent" />
            <StatCard label="Attended"   value={repAtt}   sub={`${repRate}% rate`}                        accent="green" />
            <StatCard label="No-shows"   value={repNS}    sub={`${repTotal > 0 ? Math.round(repNS / repTotal * 100) : 0}% of registered`} accent="amber" />
            <StatCard label="Waitlist"   value={reportEv.waitlist.length} sub="waiting"                   accent="blue" />
          </div>
          {repTotal > 0 && (
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <table className="w-full border-collapse text-[0.82rem]">
                <thead>
                  <tr>{['Name', 'Email', 'Status'].map(h => (
                    <th key={h} className="bg-surface3 text-ink3 font-mono text-[0.58rem] tracking-widest uppercase px-4 py-2.5 text-left">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {reportEv.registrations.map((uid, i) => {
                    const name  = nameForId(uid, user.id, user.name, i)
                    const email = emailForName(name, uid === user.id, user.email)
                    const att   = reportEv.attendance.includes(uid)
                    return (
                      <tr key={uid} className="border-t border-border hover:bg-surface2">
                        <td className="px-4 py-2.5 font-medium text-ink">{name}</td>
                        <td className="px-4 py-2.5 text-ink3">{email}</td>
                        <td className="px-4 py-2.5">
                          {att
                            ? <span className="font-mono text-[0.68rem] text-emerald">ATTENDED</span>
                            : <span className="font-mono text-[0.68rem] text-ink3">NO SHOW</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  )
}
