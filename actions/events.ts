'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { CATEGORIES } from '@/lib/constants'
import type { Event, Category } from '@/types'

// DB-layer types — intentionally kept here to mirror the Supabase row shape
type DbReg = { user_id: string; status: string; checked_in: boolean }
type DbEvent = {
  id: string; title: string; description: string; date: string; time: string
  location: string; category: string; capacity: number
  organiser_name: string; organiser_id: string; registrations: DbReg[]
  is_cancelled: boolean
}

function mapEvent(ev: DbEvent): Event {
  return {
    id: ev.id,
    title: ev.title,
    description: ev.description,
    date: ev.date,
    time: ev.time,
    location: ev.location,
    category: (CATEGORIES.slice(1) as string[]).includes(ev.category) ? ev.category as Event['category'] : 'academic',
    capacity: ev.capacity,
    organiser: ev.organiser_name,
    organiserId: ev.organiser_id,
    registrations: (ev.registrations ?? []).filter(r => r.status === 'registered').map(r => r.user_id),
    attendance:    (ev.registrations ?? []).filter(r => r.checked_in).map(r => r.user_id),
    waitlist:      (ev.registrations ?? []).filter(r => r.status === 'waitlisted').map(r => r.user_id),
    isCancelled:   ev.is_cancelled ?? false,
  }
}

const EVENT_SELECT = 'id, title, description, date, time, location, category, capacity, organiser_name, organiser_id, is_cancelled, registrations(user_id, status, checked_in)'

export async function fetchEvents(): Promise<Event[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .order('date', { ascending: true })
  if (error) throw error
  return (data as DbEvent[]).map(mapEvent)
}

export async function fetchMyEvents(): Promise<Event[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('organiser_id', user.id)
    .order('date', { ascending: true })
  if (error) throw error
  return (data as DbEvent[]).map(mapEvent)
}


export async function registerForEvent(eventId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('registrations').upsert(
    { event_id: eventId, user_id: user.id, status: 'registered', checked_in: false },
    { onConflict: 'event_id,user_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function cancelRegistration(eventId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: ev } = await supabase
    .from('events')
    .select('*, registrations(user_id, status)')
    .eq('id', eventId).single()
  const { error } = await supabase.from('registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  const waitlisted = ((ev?.registrations ?? []) as DbReg[]).filter(r => r.status === 'waitlisted')
  if (waitlisted.length > 0) {
    await supabase.from('registrations')
      .update({ status: 'registered' })
      .eq('event_id', eventId).eq('user_id', waitlisted[0].user_id)
  }
  revalidatePath('/', 'layout')
}

export async function joinWaitlist(eventId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('registrations').upsert(
    { event_id: eventId, user_id: user.id, status: 'waitlisted', checked_in: false },
    { onConflict: 'event_id,user_id' }
  )
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function leaveWaitlist(eventId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase.from('registrations')
    .update({ status: 'cancelled' })
    .eq('event_id', eventId).eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export async function fetchRegistrantProfiles(
  eventIds: string[]
): Promise<Record<string, { name: string; email: string }>> {
  if (eventIds.length === 0) return {}
  const supabase = createClient()
  const { data } = await supabase
    .from('registrations')
    .select('user_id, profiles(name, email)')
    .in('event_id', eventIds)
  const map: Record<string, { name: string; email: string }> = {}
  for (const row of (data ?? []) as unknown as { user_id: string; profiles: { name: string; email: string } | null }[]) {
    if (row.profiles && !map[row.user_id]) {
      map[row.user_id] = { name: row.profiles.name, email: row.profiles.email }
    }
  }
  return map
}

export async function cancelEvent(eventId: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: ev } = await supabase.from('events').select('organiser_id').eq('id', eventId).single()
  if (!ev || ev.organiser_id !== user.id) throw new Error('Not authorized')
  const { error, count } = await supabase
    .from('events')
    .update({ is_cancelled: true }, { count: 'exact' })
    .eq('id', eventId)
  if (error) throw new Error(error.message)
  if (!count) throw new Error('Update blocked by database policy — add an UPDATE RLS policy for the events table in Supabase')
  revalidatePath('/', 'layout')
}

export async function checkIn(eventId: string, userId: string): Promise<void> {
  const supabase = createClient()
  const { error } = await supabase.from('registrations')
    .update({ checked_in: true, checked_in_at: new Date().toISOString() })
    .eq('event_id', eventId).eq('user_id', userId)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}

export interface CreateEventData {
  title: string; description: string; date: string; time: string
  location: string; capacity: number; category: Category
}

export async function createEvent(data: CreateEventData): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { data: profile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()
  const { error } = await supabase.from('events').insert({
    ...data,
    organiser_name: profile?.name ?? '',
    organiser_id: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
