'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { User, Role } from '@/types'

export async function fetchCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  if (!profile) return null
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as Role,
  }
}

export async function updateProfile(name: string, email: string): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  const { error } = await supabase
    .from('profiles').update({ name, email }).eq('id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/', 'layout')
}
