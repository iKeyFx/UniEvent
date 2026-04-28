import { fetchEvents } from '@/actions/events'
import BrowseClient from './BrowseClient'

export const dynamic = 'force-dynamic'

export default async function BrowsePage() {
  const events = await fetchEvents()
  return <BrowseClient initialEvents={events} />
}
