import { fetchMyEvents } from '@/actions/events'
import AnalyticsClient from './AnalyticsClient'

export default async function AnalyticsPage() {
  const events = await fetchMyEvents()
  return <AnalyticsClient initialEvents={events} />
}
