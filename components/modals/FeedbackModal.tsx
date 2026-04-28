'use client'

import React, { useState } from 'react'
import { Modal, Button, Textarea, Select } from '@/components/ui'
import { showToast } from '@/hooks/useToast'

interface Props {
  eventTitle: string | null
  onClose: () => void
}

export default function FeedbackModal({ eventTitle, onClose }: Props) {
  const [rating,    setRating]    = useState(0)
  const [hovered,   setHovered]   = useState(0)
  const [enjoy,     setEnjoy]     = useState('')
  const [improve,   setImprove]   = useState('')
  const [recommend, setRecommend] = useState('')

  function submit() {
    if (!rating) { showToast('Please select a star rating', 'error'); return }
    showToast('⭐ Thank you! Your feedback has been submitted.', 'success')
    onClose()
  }

  const display = hovered || rating

  return (
    <Modal
      open={!!eventTitle}
      onClose={onClose}
      title="Event Feedback"
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="ghost"   onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={submit}>Submit Feedback</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-[0.85rem] text-ink2">{eventTitle}</p>

        <div>
          <div className="font-mono text-[0.72rem] uppercase tracking-widest text-ink3 mb-2">
            Overall Rating
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHovered(n)}
                onMouseLeave={() => setHovered(0)}
                className={`text-[1.6rem] leading-none bg-transparent border-none cursor-pointer transition-all duration-150 hover:scale-110 p-0 ${display >= n ? 'opacity-100' : 'opacity-20'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <Textarea
          label="What did you enjoy most?"
          value={enjoy}
          onChange={e => setEnjoy(e.target.value)}
          placeholder="The talks were great, the networking…"
          className="min-h-[70px]"
        />

        <Textarea
          label="What could be improved?"
          value={improve}
          onChange={e => setImprove(e.target.value)}
          placeholder="More time for Q&A, better signage…"
          className="min-h-[70px]"
        />

        <Select
          label="Would you recommend this event?"
          value={recommend}
          onChange={e => setRecommend(e.target.value)}
        >
          <option value="">Select…</option>
          <option value="definitely">Definitely yes</option>
          <option value="probably">Probably yes</option>
          <option value="maybe">Maybe</option>
          <option value="no">No</option>
        </Select>
      </div>
    </Modal>
  )
}
