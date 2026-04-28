'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Role } from '@/types'

export async function login(email: string, password: string): Promise<Role> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', data.user.id).single()
  if (!profile) throw new Error('Profile not found')
  return profile.role as Role
}

export async function register(
  name: string, email: string, password: string, role: Role
): Promise<Role> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email, password,
    options: { data: { name, role } },
  })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Sign up failed')
  return role
}

export async function logout(): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
}
