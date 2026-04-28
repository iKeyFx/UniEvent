import { fetchEvents } from '@/actions/events'
import MyEventsClient from './MyEventsClient'

export const dynamic = 'force-dynamic'

export default async function MyEventsPage() {
  const events = await fetchEvents()
  return <MyEventsClient initialEvents={events} />
}
