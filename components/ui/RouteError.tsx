'use client'

import React from 'react'

export default function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="text-4xl">⚠️</div>
      <p className="text-ink2 text-sm">{error.message || 'Something went wrong'}</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-accent text-white rounded-lg text-sm font-medium hover:bg-accent2 transition-colors"
      >
        Try again
      </button>
    </div>
  )
}
