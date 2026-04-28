'use client'

import { useEffect, useRef, useState } from 'react'

export type ToastType = 'success' | 'error' | 'info'
export interface ToastItem { id: number; msg: string; type: ToastType }

// Singleton so showToast() works outside React trees
let _add: ((msg: string, type: ToastType) => void) | null = null

export function showToast(msg: string, type: ToastType = 'info') {
  _add?.(msg, type)
}

export function useToastStore() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)

  useEffect(() => {
    _add = (msg, type) => {
      const id = ++counter.current
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
    }
    return () => { _add = null }
  }, [])

  return toasts
}
