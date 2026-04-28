'use client'

import React, { useEffect, type ReactNode } from 'react'
import { useToastStore } from '@/hooks/useToast'

// ─── Button ──────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'amber'

const variantCls: Record<BtnVariant, string> = {
  primary:   'bg-accent hover:bg-accent2 text-white shadow-[0_4px_15px_rgba(124,106,247,0.3)] hover:shadow-[0_4px_20px_rgba(124,106,247,0.45)] hover:-translate-y-px',
  secondary: 'bg-surface3 text-ink2 border border-border2 hover:bg-surface2 hover:text-ink',
  ghost:     'bg-transparent text-ink2 border border-border hover:bg-surface2 hover:text-ink',
  danger:    'bg-[rgba(240,96,96,0.1)] text-danger border border-[rgba(240,96,96,0.2)] hover:bg-[rgba(240,96,96,0.2)]',
  success:   'bg-[rgba(45,212,160,0.1)] text-emerald border border-[rgba(45,212,160,0.2)] hover:bg-[rgba(45,212,160,0.2)]',
  amber:     'bg-[rgba(245,166,35,0.1)] text-amber border border-[rgba(245,166,35,0.25)] hover:bg-[rgba(245,166,35,0.2)]',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: 'sm' | 'md'
  children: ReactNode
}

export function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const sizeCls = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-sans font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${sizeCls} ${variantCls[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

// ─── Input ───────────────────────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string }

export function Input({ label, error, className = '', ...rest }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[0.72rem] font-medium text-ink2 tracking-wide font-mono uppercase">{label}</label>}
      <input
        className={`w-full bg-surface2 border rounded-lg px-3 py-2.5 text-ink text-sm font-sans outline-none transition-all focus:shadow-[0_0_0_3px_rgba(124,106,247,0.15)] placeholder:text-ink3 disabled:opacity-50 disabled:cursor-not-allowed ${error ? 'border-danger focus:border-danger' : 'border-border focus:border-accent'} ${className}`}
        {...rest}
      />
      {error && <span className="text-[0.72rem] text-danger">{error}</span>}
    </div>
  )
}

// ─── Textarea ────────────────────────────────────────────────────────────────
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string }

export function Textarea({ label, className = '', ...rest }: TextareaProps) {
  return (
    <div className={label ? 'flex flex-col gap-1.5' : ''}>
      {label && <label className="text-[0.72rem] font-medium text-ink2 tracking-wide font-mono uppercase">{label}</label>}
      <textarea
        className={`w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-sm font-sans outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,106,247,0.15)] resize-y min-h-[88px] placeholder:text-ink3 ${className}`}
        {...rest}
      />
    </div>
  )
}

// ─── Select ──────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { label?: string; children: ReactNode }

export function Select({ label, className = '', children, ...rest }: SelectProps) {
  return (
    <div className={label ? 'flex flex-col gap-1.5' : ''}>
      {label && <label className="text-[0.72rem] font-medium text-ink2 tracking-wide font-mono uppercase">{label}</label>}
      <select
        className={`w-full bg-surface2 border border-border rounded-lg px-3 py-2.5 text-ink text-sm font-sans outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,106,247,0.15)] appearance-none ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}

// ─── Modal ───────────────────────────────────────────────────────────────────
interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  maxWidth?: string
}

export function Modal({ open, onClose, title, children, footer, maxWidth = 'max-w-lg' }: ModalProps) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (open) document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`bg-surface border border-border rounded-2xl w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border sticky top-0 bg-surface z-10">
          <h2 className="font-serif text-lg text-ink">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-surface2 text-ink3 hover:bg-surface3 hover:text-ink flex items-center justify-center text-sm transition-colors">
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pb-5 flex gap-3 justify-end flex-wrap">{footer}</div>}
      </div>
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────────────────────
type BadgeColor = 'accent' | 'green' | 'amber' | 'red' | 'blue' | 'ink'
const badgeCls: Record<BadgeColor, string> = {
  accent: 'bg-[rgba(124,106,247,0.15)] text-accent2',
  green:  'bg-[rgba(45,212,160,0.1)] text-emerald',
  amber:  'bg-[rgba(245,166,35,0.1)] text-amber',
  red:    'bg-[rgba(240,96,96,0.1)] text-danger',
  blue:   'bg-[rgba(96,165,250,0.1)] text-azure',
  ink:    'bg-surface3 text-ink3',
}

export function Badge({ color = 'ink', children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span className={`font-mono text-[0.6rem] tracking-widest uppercase px-2 py-0.5 rounded ${badgeCls[color]}`}>
      {children}
    </span>
  )
}

// ─── StatCard ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent }: {
  label: string; value: string | number; sub?: string
  accent: 'accent' | 'green' | 'amber' | 'blue'
}) {
  const topBar: Record<string, string> = { accent: 'bg-accent', green: 'bg-emerald', amber: 'bg-amber', blue: 'bg-azure' }
  return (
    <div className="bg-surface border border-border rounded-xl p-5 relative overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${topBar[accent]}`} />
      <div className="text-[0.7rem] font-mono uppercase tracking-widest text-ink3 mb-2">{label}</div>
      <div className="font-serif text-[2rem] text-ink leading-none">{value}</div>
      {sub && <div className="text-[0.75rem] text-ink3 mt-1">{sub}</div>}
    </div>
  )
}

// ─── Toggle ──────────────────────────────────────────────────────────────────
export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${checked ? 'bg-accent' : 'bg-surface3'}`}
    >
      <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-[18px]' : 'translate-x-0'}`} />
    </button>
  )
}

// ─── CapacityBar ─────────────────────────────────────────────────────────────
export function CapacityBar({ registered, capacity }: { registered: number; capacity: number }) {
  const pct = Math.min(Math.round((registered / capacity) * 100), 100)
  const color = pct < 50 ? 'bg-emerald' : pct < 80 ? 'bg-amber' : 'bg-danger'
  return (
    <div>
      <div className="flex justify-between text-[0.72rem] text-ink3 mb-1">
        <span>{registered} registered</span>
        <span>{capacity - registered > 0 ? `${capacity - registered} left` : 'Full'}</span>
      </div>
      <div className="h-1 bg-surface3 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

// ─── EmptyState ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-12 text-ink3">
      <div className="text-4xl mb-3 opacity-40">{icon}</div>
      <div className="text-sm">{text}</div>
    </div>
  )
}

// ─── PageHeader ──────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
      <div>
        <h1 className="font-serif text-3xl text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-ink3 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

// ─── ToastContainer ──────────────────────────────────────────────────────────
export function ToastContainer() {
  const toasts = useToastStore()
  const icons: Record<string, string> = { success: '✅', error: '❌', info: 'ℹ️' }
  const borders: Record<string, string> = {
    success: 'border-[rgba(45,212,160,0.3)]',
    error:   'border-[rgba(240,96,96,0.3)]',
    info:    'border-[rgba(124,106,247,0.3)]',
  }
  return (
    <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-[9000] pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`bg-surface2 border ${borders[t.type]} rounded-xl px-4 py-3 flex items-center gap-3 max-w-xs shadow-[0_8px_25px_rgba(0,0,0,0.4)] animate-slide-right pointer-events-auto`}>
          <span className="text-lg">{icons[t.type]}</span>
          <span className="text-sm text-ink2 leading-snug">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Category helpers ────────────────────────────────────────────────────────
export const CAT_COLORS: Record<string, string> = {
  academic: '#60a5fa',
  social:   '#2dd4a0',
  career:   '#f5a623',
  workshop: '#7c6af7',
}

export const CAT_GRADIENT: Record<string, string> = {
  academic: 'from-azure to-purple-500',
  social:   'from-emerald to-cyan-400',
  career:   'from-amber to-yellow-400',
  workshop: 'from-accent to-pink-500',
}

export const CAT_BADGE: Record<string, string> = {
  academic: 'bg-[rgba(96,165,250,0.1)] text-azure',
  social:   'bg-[rgba(45,212,160,0.1)] text-emerald',
  career:   'bg-[rgba(245,166,35,0.1)] text-amber',
  workshop: 'bg-[rgba(124,106,247,0.15)] text-accent2',
}
