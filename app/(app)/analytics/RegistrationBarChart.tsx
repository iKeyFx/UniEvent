'use client'

import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BarData { name: string; Registered: number; Attended: number }

const ttStyle = { background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: '8px', color: '#f0eefc', fontSize: '12px' }
const axStyle = { fill: '#5c5a72', fontSize: 10 }

export default function RegistrationBarChart({ data }: { data: BarData[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="font-mono text-[0.7rem] uppercase tracking-widest text-ink3 mb-4">Registrations vs Attendance</div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="name" tick={axStyle} />
          <YAxis tick={axStyle} />
          <Tooltip contentStyle={ttStyle} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <Bar dataKey="Registered" fill="#7c6af7" opacity={0.4} radius={[3, 3, 0, 0]} />
          <Bar dataKey="Attended"   fill="#7c6af7" opacity={0.9} radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
