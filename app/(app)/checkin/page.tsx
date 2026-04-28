import { Suspense } from 'react'
import { fetchMyEvents, fetchRegistrantProfiles } from '@/actions/events'
import CheckInClient from './CheckInClient'

export default async function CheckInPage() {
  const events   = await fetchMyEvents()
  const profiles = await fetchRegistrantProfiles(events.map(e => e.id))
  return (
    <Suspense>
      <CheckInClient initialEvents={events} profiles={profiles} />
    </Suspense>
  )
}
