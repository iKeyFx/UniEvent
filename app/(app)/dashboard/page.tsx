import { fetchMyEvents } from '@/actions/events'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const events = await fetchMyEvents()
  return <DashboardClient initialEvents={events} />
}
