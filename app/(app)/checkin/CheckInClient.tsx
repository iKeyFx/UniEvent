'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useEventSync } from '@/hooks/useEventSync'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { checkIn } from '@/actions/events'
import { showToast } from '@/hooks/useToast'
import { Button, Select, PageHeader } from '@/components/ui'
import AttendanceTable from './AttendanceTable'
import { downloadCSV } from '@/lib/utils'
import { parseQRToken, generateAttendanceCSV } from '@/lib/event-utils'
import { QR_SCAN_DEBOUNCE_MS, RESULT_FLASH_MS } from '@/lib/constants'
import { SAMPLE_NAMES } from '@/data/seed'
import type { Event } from '@/types'

type ScanState = 'idle' | 'scanning' | 'error'
interface ScanResult { success: boolean; name: string; sub: string }

type ProfileMap = Record<string, { name: string; email: string }>

export default function CheckInClient({ initialEvents, profiles }: { initialEvents: Event[]; profiles: ProfileMap }) {
  const { user } = useAuth()
  const router       = useRouter()
  const searchParams = useSearchParams()

  const preselect = searchParams.get('event')
  const [events,      setEvents]      = useEventSync(initialEvents)
  const [selectedId,  setSelectedId]  = useState(
    (preselect && initialEvents.some(e => e.id === preselect)) ? preselect : (initialEvents[0]?.id ?? '')
  )
  const [scanState,   setScanState]   = useState<ScanState>('idle')
  const [statusText,  setStatusText]  = useState('Camera not started')
  const [result,      setResult]      = useState<ScanResult | null>(null)
  const [manualInput, setManualInput] = useState('')
  const [flash,       setFlash]       = useState(false)

  const scannerRef  = useRef<InstanceType<typeof import('html5-qrcode')['Html5Qrcode']> | null>(null)
  const lastScanRef = useRef(0)
  const resultTimer = useRef<ReturnType<typeof setTimeout>>()

  const ev = events.find(e => e.id === selectedId)

  useEffect(() => () => { void stopScanner() }, [])

  function showResult(r: ScanResult) {
    setResult(r)
    clearTimeout(resultTimer.current)
    resultTimer.current = setTimeout(() => setResult(null), 5000)
  }

  async function processToken(raw: string, fromCamera = false) {
    if (!ev) { showToast('Select an event first', 'error'); return }

    let userId: string | null = null
    let studentName = raw.trim()

    const parsed = parseQRToken(raw)
    if (parsed) {
      if (parsed.eventId !== ev.id) {
        showResult({ success: false, name: '⚠ Wrong event ticket', sub: 'This QR is for a different event.' })
        if (!fromCamera) showToast('Ticket is for a different event', 'error')
        return
      }
      userId = parsed.userId
      studentName = parsed.name
    }

    if (!userId) {
      if (raw.toLowerCase().includes(user.name.toLowerCase())) {
        userId = user.id; studentName = user.name
      } else {
        const unattended = ev.registrations.find(r => !ev.attendance.includes(r))
        if (unattended) {
          const idx = ev.registrations.indexOf(unattended)
          userId = unattended
          studentName = raw.trim() || SAMPLE_NAMES[idx % SAMPLE_NAMES.length]
        }
      }
    }

    if (!userId || !ev.registrations.includes(userId)) {
      showResult({ success: false, name: '⚠ Not registered', sub: `"${studentName}" is not registered for this event.` })
      if (!fromCamera) showToast('Student not found', 'error')
      return
    }
    if (ev.attendance.includes(userId)) {
      showResult({ success: false, name: '⚠ Already checked in', sub: `${studentName} was already marked as attended.` })
      if (!fromCamera) showToast('Already checked in', 'error')
      return
    }

    // Optimistic update
    setEvents(prev => prev.map(e => e.id === ev.id
      ? { ...e, attendance: [...e.attendance, userId!] }
      : e))

    try {
      await checkIn(ev.id, userId)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Check-in failed', 'error')
      router.refresh()
      return
    }

    if (!fromCamera) setManualInput('')
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    showResult({ success: true, name: `✓ ${studentName} — Checked In`, sub: `${ev.title} · ${timeStr}` })
    showToast(`✅ ${studentName} checked in`, 'success')
    setFlash(true); setTimeout(() => setFlash(false), RESULT_FLASH_MS)
    router.refresh()
  }

  function onQRScanned(raw: string) {
    const now = Date.now()
    if (now - lastScanRef.current < QR_SCAN_DEBOUNCE_MS) return
    lastScanRef.current = now
    void processToken(raw, true)
  }

  async function startScanner() {
    if (scanState === 'scanning') await stopScanner()
    try { await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }) }
    catch { setScanState('error'); setStatusText('Camera permission denied'); return }

    setScanState('scanning'); setStatusText('Scanning for QR codes…')
    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      scannerRef.current = new Html5Qrcode('qr-reader')
      const cameras = await Html5Qrcode.getCameras()
      const cam     = cameras.find(c => /back|rear|environment/i.test(c.label)) ?? cameras[cameras.length - 1]
      await scannerRef.current.start(
        cam?.id ?? { facingMode: 'environment' },
        { fps: 15, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        onQRScanned, () => {},
      )
    } catch (err: unknown) {
      setScanState('error'); setStatusText('Camera failed — use manual entry')
      const msg = err instanceof Error ? err.message : 'Unknown error'
      showResult({ success: false, name: '⚠ Camera error', sub: msg })
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch { /* ignore */ }
      try { scannerRef.current.clear() }     catch { /* ignore */ }
      scannerRef.current = null
    }
    setScanState('idle'); setStatusText('Camera stopped')
  }

  function resolveName(uid: string)  { return profiles[uid]?.name  ?? (uid === user.id ? user.name  : uid) }
  function resolveEmail(uid: string) { return profiles[uid]?.email ?? (uid === user.id ? user.email : '') }

  function exportCSV() {
    if (!ev) return
    const csv = generateAttendanceCSV(ev, resolveName, resolveEmail)
    downloadCSV(`${ev.title.replace(/\s+/g, '_')}_attendance.csv`, csv)
    showToast('📥 CSV exported', 'success')
  }

  const total    = ev?.registrations.length ?? 0
  const attended = ev?.attendance.length    ?? 0
  const attRate  = total > 0 ? Math.round((attended / total) * 100) : 0

  const dotCls = scanState === 'scanning'
    ? 'bg-emerald shadow-[0_0_6px_#2dd4a0] animate-pulse-dot'
    : scanState === 'error' ? 'bg-danger' : 'bg-ink3'

  return (
    <div>
      <PageHeader title="QR Check-In" subtitle="Scan student QR codes to mark attendance" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Scanner panel */}
        <div>
          <Select label="Select Event" value={selectedId} onChange={e => setSelectedId(e.target.value)} className="mb-4">
            {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
          </Select>

          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <span className="font-serif text-base text-ink">QR Scanner</span>
              <span className="text-[0.75rem] text-ink3">{scanState === 'scanning' ? 'Scanning' : 'Idle'}</span>
            </div>

            <div className="relative min-h-[280px] bg-black flex items-center justify-center">
              {scanState === 'idle' && (
                <div className="text-center p-8">
                  <div className="text-4xl mb-3 opacity-30">📷</div>
                  <p className="text-[0.83rem] text-ink3 mb-5 leading-relaxed">
                    Point the camera at a student&apos;s QR ticket to check them in instantly.
                  </p>
                  <Button variant="primary" onClick={startScanner}>Start Camera Scanner</Button>
                </div>
              )}
              {scanState === 'error' && (
                <div className="text-center p-8">
                  <div className="text-4xl mb-3">⚠️</div>
                  <p className="text-[0.83rem] text-danger mb-4">Camera failed. Use manual entry below.</p>
                  <Button variant="primary" onClick={startScanner}>Retry Camera</Button>
                </div>
              )}

              <div id="qr-reader" className={`w-full ${scanState === 'scanning' ? 'block' : 'hidden'}`} />

              {scanState === 'scanning' && (
                <div className="absolute inset-0 pointer-events-none">
                  {[
                    'top-6 left-6 border-t-[3px] border-l-[3px] rounded-tl',
                    'top-6 right-6 border-t-[3px] border-r-[3px] rounded-tr',
                    'bottom-6 left-6 border-b-[3px] border-l-[3px] rounded-bl',
                    'bottom-6 right-6 border-b-[3px] border-r-[3px] rounded-br',
                  ].map((cls, i) => (
                    <div key={i} className={`absolute w-7 h-7 border-emerald ${cls}`} />
                  ))}
                  <div className="scan-laser" />
                  {flash && <div className="absolute inset-0 bg-emerald/20 animate-flash-fade" />}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 px-5 py-3 border-t border-border">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotCls}`} />
              <span className="text-[0.78rem] text-ink3 flex-1">{statusText}</span>
              {scanState === 'scanning' && <Button variant="danger" size="sm" onClick={stopScanner}>⏹ Stop</Button>}
            </div>

            <div className="px-5 py-4 border-t border-border">
              <div className="font-mono text-[0.68rem] uppercase tracking-widest text-ink3 mb-2">Manual entry / fallback</div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualInput}
                  onChange={e => setManualInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') void processToken(manualInput) }}
                  placeholder="Paste QR token or student name…"
                  className="flex-1 bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-ink outline-none focus:border-accent transition-colors placeholder:text-ink3"
                />
                <Button variant="primary" onClick={() => void processToken(manualInput)}>Check In</Button>
              </div>
            </div>

            {result && (
              <div className={`px-5 py-3 border-t animate-slide-right ${result.success ? 'bg-emerald/10 border-emerald/20' : 'bg-danger/10 border-danger/20'}`}>
                <div className={`font-semibold text-[0.9rem] ${result.success ? 'text-emerald' : 'text-danger'}`}>{result.name}</div>
                <div className="text-[0.78rem] text-ink3 mt-0.5">{result.sub}</div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance list */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="font-serif text-lg text-ink">Attendance List</h2>
            <Button variant="secondary" size="sm" onClick={exportCSV}>⬇ Export CSV</Button>
          </div>
          <p className="text-[0.82rem] text-ink3 mb-3">
            {attended} / {total} checked in ({attRate}% attendance rate)
          </p>

          <AttendanceTable ev={ev} resolveName={resolveName} resolveEmail={resolveEmail} />
        </div>
      </div>
    </div>
  )
}
