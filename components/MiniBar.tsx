'use client'

import React from 'react'

export default function MiniBar({ values }: { values: number[] }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex items-end gap-1 h-10">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 bg-accent rounded-sm opacity-70 hover:opacity-100 transition-opacity min-h-[3px]"
          style={{ height: `${Math.max(3, Math.round((v / max) * 40))}px` }}
        />
      ))}
    </div>
  )
}
