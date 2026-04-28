'use client'

import React from 'react'
import type { Event } from '@/types'

interface Props {
  ev:           Event | undefined
  resolveName:  (uid: string) => string
  resolveEmail: (uid: string) => string
}

export default function AttendanceTable({ ev, resolveName, resolveEmail }: Props) {
  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <table className="w-full border-collapse text-[0.82rem]">
        <thead>
          <tr>
            {['Name', 'Email', 'Status', 'Time'].map(h => (
              <th key={h} className="bg-surface3 text-ink3 font-mono text-[0.58rem] tracking-widest uppercase px-3.5 py-2.5 text-left">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!ev || ev.registrations.length === 0 ? (
            <tr><td colSpan={4} className="text-center text-ink3 py-6">No registrations yet</td></tr>
          ) : ev.registrations.map(uid => {
            const att = ev.attendance.includes(uid)
            return (
              <tr key={uid} className="border-t border-border hover:bg-surface2">
                <td className="px-3.5 py-2.5 font-medium text-ink">{resolveName(uid)}</td>
                <td className="px-3.5 py-2.5 text-ink3">{resolveEmail(uid)}</td>
                <td className="px-3.5 py-2.5">
                  {att
                    ? <span className="font-mono text-[0.68rem] text-emerald">✓ CHECKED IN</span>
                    : <span className="font-mono text-[0.68rem] text-ink3">— REGISTERED</span>}
                </td>
                <td className="px-3.5 py-2.5 text-ink3 text-[0.75rem]" />
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
