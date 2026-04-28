'use client'

import React from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { logout } from '@/actions/auth'
import { initials } from '@/lib/utils'
import { STUDENT_LINKS, ORG_LINKS, type NavItem } from '@/lib/navigation'
import { ROUTES } from '@/lib/constants'

export default function Navbar() {
  const { user }  = useAuth()
  const router    = useRouter()
  const pathname  = usePathname()
  const links     = user.role === 'student' ? STUDENT_LINKS : ORG_LINKS

  function nav(item: NavItem) {
    router.push(item.href)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  const userInitials = initials(user.name)
  const roleBadgeCls = user.role === 'student'
    ? 'bg-[rgba(96,165,250,0.1)] text-azure'
    : 'bg-[rgba(124,106,247,0.15)] text-accent2'

  function isActive(item: NavItem) {
    return pathname.startsWith(item.href)
  }

  return (
    <>
      {/* ── Desktop top nav ── */}
      <nav className="bg-surface border-b border-border px-6 flex items-center gap-3 h-[60px] sticky top-0 z-[100]">
        {/* Logo */}
        <button
          onClick={() => router.push(user.role === 'student' ? ROUTES.browse : ROUTES.dashboard)}
          className="flex items-center gap-2.5 mr-2 bg-transparent border-none cursor-pointer"
        >
          <div className="w-[30px] h-[30px] bg-accent rounded-md flex items-center justify-center font-mono font-bold text-[0.65rem] text-white">
            UE
          </div>
          <span className="font-serif text-[1.1rem] text-ink">UniEvents</span>
        </button>

        {/* Nav links — hidden on mobile/tablet */}
        <div className="hidden lg:flex gap-1">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => nav(l)}
              className={`px-3 py-2 rounded-lg border-none text-[0.85rem] font-medium font-sans cursor-pointer transition-all flex items-center gap-1.5 ${
                isActive(l)
                  ? 'bg-[rgba(124,106,247,0.15)] text-accent2'
                  : 'bg-transparent text-ink3 hover:bg-surface2 hover:text-ink2'
              }`}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* User chip */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
            {userInitials}
          </div>
          <div className="leading-tight">
            <div className="text-[0.82rem] font-semibold text-ink">{user.name}</div>
            <span className={`font-mono text-[0.6rem] tracking-widest uppercase px-1.5 py-0.5 rounded ${roleBadgeCls}`}>
              {user.role}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-3 py-1.5 rounded-lg border border-border bg-transparent text-ink3 text-[0.82rem] font-medium font-sans hover:bg-surface2 hover:text-ink cursor-pointer transition-all"
        >
          Sign out
        </button>
      </nav>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-[200] flex justify-around px-2 py-2">
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => nav(l)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg border-none text-[0.6rem] font-medium font-sans cursor-pointer transition-all ${
              isActive(l) ? 'text-accent2' : 'text-ink3'
            }`}
          >
            <span className="text-xl leading-none">{l.icon}</span>
            <span>{l.label.split(' ')[0]}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
