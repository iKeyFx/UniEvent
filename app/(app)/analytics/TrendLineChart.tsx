'use client'

import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface LineData { date: string; Registrations: number; Attendees: number }

const ttStyle = { background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: '8px', color: '#f0eefc', fontSize: '12px' }
const axStyle = { fill: '#5c5a72', fontSize: 10 }

export default function TrendLineChart({ data }: { data: LineData[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 mb-8">
      <div className="font-mono text-[0.7rem] uppercase tracking-widest text-ink3 mb-4">Registration Trend — Last 14 Days</div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={axStyle} interval={2} />
          <YAxis tick={axStyle} />
          <Tooltip contentStyle={ttStyle} />
          <Line type="monotone" dataKey="Registrations" stroke="#7c6af7" strokeWidth={2} dot={{ r: 3, fill: '#7c6af7' }} />
          <Line type="monotone" dataKey="Attendees"     stroke="#2dd4a0" strokeWidth={2} dot={{ r: 3, fill: '#2dd4a0' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
