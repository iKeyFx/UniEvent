import React from 'react'

export default function PageSkeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4 pt-2">
      <div className="h-8 w-48 bg-surface3 rounded-lg" />
      <div className="h-4 w-72 bg-surface3 rounded" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-surface3 rounded-xl" />
        ))}
      </div>
      <div className="flex flex-col gap-3 mt-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-surface3 rounded-xl" />
        ))}
      </div>
    </div>
  )
}
