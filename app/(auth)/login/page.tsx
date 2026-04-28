'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login, register } from '@/actions/auth'
import { showToast } from '@/hooks/useToast'
import { Button, Input, Select } from '@/components/ui'
import type { Role } from '@/types'

type AuthTab = 'login' | 'register'

type LoginErrors    = { email?: string; password?: string }
type RegisterErrors = { first?: string; last?: string; email?: string; password?: string }

export default function LoginPage() {
  const router = useRouter()

  const [tab,  setTab]  = useState<AuthTab>('login')
  const [busy, setBusy] = useState(false)

  // Login fields
  const [loginEmail,    setLoginEmail]    = useState('organiser@uni.edu')
  const [loginPassword, setLoginPassword] = useState('password123')
  const [loginErrors,   setLoginErrors]   = useState<LoginErrors>({})

  // Register fields
  const [regFirst,    setRegFirst]    = useState('')
  const [regLast,     setRegLast]     = useState('')
  const [regEmail,    setRegEmail]    = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole,     setRegRole]     = useState<Role>('student')
  const [regErrors,   setRegErrors]   = useState<RegisterErrors>({})

  function validateLogin(): boolean {
    const errs: LoginErrors = {}
    if (!loginEmail.trim())  errs.email    = 'Email is required'
    if (!loginPassword)      errs.password = 'Password is required'
    setLoginErrors(errs)
    return Object.keys(errs).length === 0
  }

  function validateRegister(): boolean {
    const errs: RegisterErrors = {}
    if (!regFirst.trim())   errs.first    = 'First name is required'
    if (!regLast.trim())    errs.last     = 'Last name is required'
    if (!regEmail.trim())   errs.email    = 'Email is required'
    if (!regPassword)       errs.password = 'Password is required'
    else if (regPassword.length < 6) errs.password = 'Password must be at least 6 characters'
    setRegErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function doLogin() {
    if (!validateLogin()) return
    setBusy(true)
    try {
      const role = await login(loginEmail.trim(), loginPassword)
      router.push(role === 'student' ? '/browse' : '/dashboard')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Login failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  async function doRegister() {
    if (!validateRegister()) return
    setBusy(true)
    try {
      const role = await register(
        `${regFirst.trim()} ${regLast.trim()}`,
        regEmail.trim(),
        regPassword,
        regRole,
      )
      router.push(role === 'student' ? '/browse' : '/dashboard')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Registration failed', 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative">
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(124,106,247,0.12)_0%,transparent_65%)] pointer-events-none" />

      <div className="bg-surface border border-border rounded-2xl p-10 w-full max-w-[420px] relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent" />

        {/* Logo */}
        <div className="flex items-center gap-3 mb-7">
          <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center font-mono font-bold text-xs text-white">UE</div>
          <span className="font-serif text-xl text-ink">UniEvents</span>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-surface2 rounded-lg p-0.5 gap-0.5 mb-7">
          {(['login', 'register'] as AuthTab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-md text-sm font-medium font-sans transition-all ${
                tab === t ? 'bg-surface3 text-ink shadow' : 'text-ink3 hover:text-ink2'
              }`}
            >
              {t === 'login' ? 'Sign In' : 'Register'}
            </button>
          ))}
        </div>

        {tab === 'login' ? (
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={loginEmail}
              onChange={e => { setLoginEmail(e.target.value); setLoginErrors(p => ({ ...p, email: undefined })) }}
              placeholder="you@university.edu"
              error={loginErrors.email}
              onKeyDown={e => { if (e.key === 'Enter') doLogin() }}
            />
            <Input
              label="Password"
              type="password"
              value={loginPassword}
              onChange={e => { setLoginPassword(e.target.value); setLoginErrors(p => ({ ...p, password: undefined })) }}
              placeholder="••••••••"
              error={loginErrors.password}
              onKeyDown={e => { if (e.key === 'Enter') doLogin() }}
            />
            <Button variant="primary" className="w-full" onClick={doLogin} disabled={busy}>
              {busy ? 'Signing in…' : 'Sign In →'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <Select label="Role" value={regRole} onChange={e => setRegRole(e.target.value as Role)}>
              <option value="student">Student</option>
              <option value="organiser">Event Organiser</option>
            </Select>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                value={regFirst}
                onChange={e => { setRegFirst(e.target.value); setRegErrors(p => ({ ...p, first: undefined })) }}
                placeholder="Alex"
                error={regErrors.first}
              />
              <Input
                label="Last Name"
                value={regLast}
                onChange={e => { setRegLast(e.target.value); setRegErrors(p => ({ ...p, last: undefined })) }}
                placeholder="Okafor"
                error={regErrors.last}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={regEmail}
              onChange={e => { setRegEmail(e.target.value); setRegErrors(p => ({ ...p, email: undefined })) }}
              placeholder="you@university.edu"
              error={regErrors.email}
            />
            <Input
              label="Password"
              type="password"
              value={regPassword}
              onChange={e => { setRegPassword(e.target.value); setRegErrors(p => ({ ...p, password: undefined })) }}
              placeholder="••••••••"
              error={regErrors.password}
            />
            <Button variant="primary" className="w-full" onClick={doRegister} disabled={busy}>
              {busy ? 'Creating account…' : 'Create Account →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
