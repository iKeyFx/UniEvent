'use client'

import React, { useEffect, useRef } from 'react'
import * as QRCode from 'qrcode'
import { Modal, Button } from '@/components/ui'
import type { Event, User } from '@/types'

interface Props {
  event: Event | null
  currentUser: User
  onClose: () => void
}

export default function QRTicketModal({ event: ev, currentUser, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const rendered     = useRef(false)
  const token        = ev ? `UNIEVENT:${ev.id}:${currentUser.id}:${currentUser.name}` : ''

  useEffect(() => {
    if (!ev || !containerRef.current || rendered.current) return
    rendered.current = true

    const el = containerRef.current
    el.innerHTML = ''

    QRCode.toCanvas(token, { width: 180, margin: 1, color: { dark: '#000000', light: '#ffffff' } })
      .then((canvas: HTMLCanvasElement) => { el.appendChild(canvas) })
      .catch(() => {
        el.innerHTML = `<div style="width:180px;height:180px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:10px;color:#333;text-align:center;padding:12px;font-family:monospace;border-radius:4px;word-break:break-all">${token}</div>`
      })

    return () => { rendered.current = false }
  }, [ev, currentUser])

  return (
    <Modal
      open={!!ev}
      onClose={onClose}
      title="Your QR Ticket"
      maxWidth="max-w-sm"
      footer={<Button variant="ghost" onClick={onClose}>Close</Button>}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        <div className="bg-white p-4 rounded-xl inline-block">
          <div ref={containerRef} />
        </div>
        <div className="text-center w-full">
          <div className="font-serif text-lg text-ink mb-1">{ev?.title}</div>
          <p className="text-[0.8rem] text-ink3 mb-3">
            Show this QR code at the event entrance for check-in
          </p>
          <div className="bg-surface2 border border-border rounded-lg px-3 py-2">
            <div className="text-[0.65rem] font-mono uppercase tracking-widest text-ink3 mb-1">Ticket ID</div>
            <div className="font-mono text-[0.7rem] text-ink2 break-all select-all">{token}</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
