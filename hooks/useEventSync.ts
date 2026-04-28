import { useState, useEffect } from 'react'
import type { Event } from '@/types'

export function useEventSync(initial: Event[]) {
  const [events, setEvents] = useState(initial)
  useEffect(() => { setEvents(initial) }, [initial])
  return [events, setEvents] as const
}
