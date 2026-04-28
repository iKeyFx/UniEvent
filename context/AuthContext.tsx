'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/types'

interface AuthContextValue { user: User }
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ user, children }: { user: User; children: ReactNode }) {
  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
