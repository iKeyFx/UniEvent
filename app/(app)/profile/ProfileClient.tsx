'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { updateProfile } from '@/actions/profile'
import { showToast } from '@/hooks/useToast'
import { Button, Input, Toggle, PageHeader } from '@/components/ui'
import { initials } from '@/lib/utils'
import { NOTIF_ITEMS } from '@/lib/constants'
import type { NotifPrefs } from '@/types'

const DEFAULT_PREFS: NotifPrefs = {
  confirmations: true, reminders: true, cancellations: true,
  waitlistPromotions: true, announcements: false,
}

export default function ProfileClient() {
  const { user } = useAuth()
  const router = useRouter()

  const [name,  setName]  = useState(user.name)
  const [busy,  setBusy]  = useState(false)
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS)

  async function saveProfile() {
    if (!name.trim()) {
      showToast('Name cannot be empty', 'error')
      return
    }
    setBusy(true)
    try {
      await updateProfile(name.trim(), user.email)
      showToast('✅ Profile updated successfully', 'success')
      router.refresh()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update profile', 'error')
    } finally {
      setBusy(false)
    }
  }

  const userInitials = initials(user.name)

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Account settings and notification preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Account */}
        <div className="bg-surface border border-border rounded-xl p-7">
          <div className="w-[72px] h-[72px] rounded-full bg-accent flex items-center justify-center font-serif text-2xl font-bold text-white mb-5">
            {userInitials}
          </div>
          <div className="font-serif text-[1.4rem] text-ink">{user.name}</div>
          <div className="text-[0.85rem] text-ink3 mb-6">{user.email}</div>

          <div className="h-px bg-border mb-5" />

          <div className="flex flex-col gap-4">
            <Input label="Display Name" value={name} disabled onChange={e => setName(e.target.value)} />
            <Input label="Email" type="email" value={user.email} disabled onChange={() => {}} />
            <div className="pt-1">
              <Button variant="primary" onClick={saveProfile} disabled={busy}>
                {busy ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>

        {/* Notification prefs */}
        <div className="bg-surface border border-border rounded-xl p-7">
          <h2 className="font-serif text-lg text-ink mb-1">Notification Preferences</h2>
          <p className="text-[0.8rem] text-ink3 mb-5">Control which emails UniEvents sends you</p>

          <div className="flex flex-col">
            {NOTIF_ITEMS.map(({ key, label, sub }) => (
              <div key={key} className="flex items-center justify-between py-4 border-b border-border last:border-0 gap-4">
                <div>
                  <div className="text-[0.85rem] font-medium text-ink">{label}</div>
                  <div className="text-[0.75rem] text-ink3 mt-0.5">{sub}</div>
                </div>
                <Toggle
                  checked={prefs[key]}
                  onChange={val => setPrefs((p: NotifPrefs) => ({ ...p, [key]: val }))}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
