'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { createEvent } from '@/actions/events'
import { showToast } from '@/hooks/useToast'
import { Button, Input, Textarea, Select, PageHeader } from '@/components/ui'
import { defaultFutureDate } from '@/lib/utils'
import type { Category } from '@/types'

export default function CreateClient() {
  const { user } = useAuth()
  const router   = useRouter()

  const [title,    setTitle]    = useState('')
  const [desc,     setDesc]     = useState('')
  const [date,     setDate]     = useState(defaultFutureDate(14))
  const [time,     setTime]     = useState('10:00')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('')
  const [category, setCategory] = useState<Category>('academic')
  const [busy,     setBusy]     = useState(false)

  // suppress unused-var warning — user available if needed for display
  void user

  async function handleSubmit() {
    if (!title.trim() || !desc.trim() || !date || !time || !location.trim() || !capacity) {
      showToast('Please fill in all required fields', 'error')
      return
    }
    const cap = parseInt(capacity, 10)
    if (isNaN(cap) || cap < 1) { showToast('Capacity must be a positive number', 'error'); return }

    setBusy(true)
    try {
      await createEvent({
        title: title.trim(), description: desc.trim(),
        date, time, location: location.trim(), capacity: cap, category,
      })
      showToast(`✅ "${title.trim()}" published!`, 'success')
      setTimeout(() => showToast('📧 Announcement email sent to all students', 'info'), 900)
      router.push('/dashboard')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to create event', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Create New Event"
        subtitle="Fill in the details to publish your event"
        action={<Button variant="ghost" onClick={() => router.push('/dashboard')}>← Back</Button>}
      />

      <div className="bg-surface border border-border rounded-xl p-7 max-w-2xl">
        <div className="flex flex-col gap-5">
          <Input label="Event Title *" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Career Fair 2026" />

          <Textarea label="Description *" value={desc} onChange={e => setDesc(e.target.value)}
            placeholder="Describe the event, agenda, and what attendees should expect…" />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Date *" type="date" value={date} onChange={e => setDate(e.target.value)} />
            <Input label="Time *" type="time" value={time} onChange={e => setTime(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Location *" value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Main Hall, Block A" />
            <Input label="Capacity *" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="50" min="1" max="500" />
          </div>

          <Select label="Category *" value={category} onChange={e => setCategory(e.target.value as Category)}>
            <option value="academic">Academic</option>
            <option value="social">Social</option>
            <option value="career">Career</option>
            <option value="workshop">Workshop</option>
          </Select>

          <div className="h-px bg-border" />
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleSubmit} disabled={busy}>
              {busy ? 'Publishing…' : 'Publish Event'}
            </Button>
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>Cancel</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
