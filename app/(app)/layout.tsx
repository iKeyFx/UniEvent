import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AuthProvider } from '@/context/AuthContext'
import Navbar from '@/components/Navbar'
import type { Role } from '@/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('id', authUser.id).single()
  if (!profile) redirect('/login')

  const user = {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    role: profile.role as Role,
  }

  return (
    <AuthProvider user={user}>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 py-8 pb-24 md:pb-10">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
