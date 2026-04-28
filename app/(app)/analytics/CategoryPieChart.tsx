'use client'

import React from 'react'
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface PieData { name: string; value: number; color: string }

const ttStyle = { background: '#1e1e28', border: '1px solid #2a2a38', borderRadius: '8px', color: '#f0eefc', fontSize: '12px' }

export default function CategoryPieChart({ data }: { data: PieData[] }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="font-mono text-[0.7rem] uppercase tracking-widest text-ink3 mb-4">Registrations by Category</div>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
            {data.map((d, i) => <Cell key={i} fill={d.color} />)}
          </Pie>
          <Tooltip contentStyle={ttStyle} />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#5c5a72' }} iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
