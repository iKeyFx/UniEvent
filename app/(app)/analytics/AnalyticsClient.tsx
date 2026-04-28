'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEventSync } from '@/hooks/useEventSync'
import { useAuth } from '@/context/AuthContext'
import { showToast } from '@/hooks/useToast'
import { Button, PageHeader, StatCard, CAT_COLORS } from '@/components/ui'
import { nameForId, emailForName, downloadCSV } from '@/lib/utils'
import { SEED_EMAIL_LOG } from '@/data/seed'
import RegistrationBarChart from './RegistrationBarChart'
import CategoryPieChart     from './CategoryPieChart'
import TrendLineChart       from './TrendLineChart'
import PostEventReport      from './PostEventReport'
import EmailLogTable        from './EmailLogTable'
import type { Event } from '@/types'

export default function AnalyticsClient({ initialEvents }: { initialEvents: Event[] }) {
  const { user }   = useAuth()
  const router     = useRouter()
  const [events,   setEvents]   = useEventSync(initialEvents)
  const [reportId, setReportId] = useState(initialEvents[0]?.id ?? '')

  const totalRegs = events.reduce((s, e) => s + e.registrations.length, 0)
  const totalAtt  = events.reduce((s, e) => s + e.attendance.length,    0)

  const barData = events.map(ev => ({
    name:       ev.title.length > 14 ? ev.title.slice(0, 13) + '…' : ev.title,
    Registered: ev.registrations.length,
    Attended:   ev.attendance.length,
  }))

  const catTotals: Record<string, number> = { academic: 0, social: 0, career: 0, workshop: 0 }
  events.forEach(ev => { if (catTotals[ev.category] !== undefined) catTotals[ev.category] += ev.registrations.length })
  const pieData = Object.entries(catTotals)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value, color: CAT_COLORS[name] }))

  const lineData = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (13 - i))
    return {
      date:          `${d.getDate()}/${d.getMonth() + 1}`,
      Registrations: Math.round(totalRegs * (i + 1) / 14 * (0.85 + Math.sin(i) * 0.15)),
      Attendees:     Math.round(totalAtt  * (i + 1) / 14 * (0.8  + Math.cos(i) * 0.1)),
    }
  })

  function exportReport() {
    const reportEv = events.find(e => e.id === reportId)
    if (!reportEv) return
    let csv = 'Name,Email,Attendance\n'
    reportEv.registrations.forEach((uid, i) => {
      const isCur = uid === user.id
      const name  = nameForId(uid, user.id, user.name, i)
      const email = emailForName(name, isCur, user.email)
      csv += `"${name}","${email}","${reportEv.attendance.includes(uid) ? 'Attended' : 'No Show'}"\n`
    })
    downloadCSV(`${reportEv.title.replace(/\s+/g, '_')}_report.csv`, csv)
    showToast('CSV exported', 'success')
  }

  // suppress unused setEvents warning — kept for useEventSync contract
  void setEvents

  return (
    <div>
      <PageHeader
        title="Analytics & Reports"
        subtitle="Registration trends, attendance rates, and post-event summaries"
        action={<Button variant="ghost" onClick={() => router.push('/dashboard')}>Back</Button>}
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Events"        value={events.length} sub="published"  accent="accent" />
        <StatCard label="Total Registrations" value={totalRegs}     sub="all events" accent="green" />
        <StatCard label="Total Attended"      value={totalAtt}      sub="checked in" accent="amber" />
        <StatCard label="Overall Rate" value={`${totalRegs ? Math.round(totalAtt / totalRegs * 100) : 0}%`} sub="attendance" accent="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        <RegistrationBarChart data={barData} />
        <CategoryPieChart     data={pieData} />
      </div>

      <TrendLineChart data={lineData} />

      <PostEventReport
        events={events}
        reportId={reportId}
        setReportId={setReportId}
        onExport={exportReport}
        user={user}
      />

      <EmailLogTable entries={SEED_EMAIL_LOG} />
    </div>
  )
}
