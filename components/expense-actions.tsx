'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ExpenseActions({ expenseId }: { expenseId: string }) {
  const router = useRouter()
  const [rejecting, setRejecting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function approve() {
    setLoading(true)
    await fetch(`/api/expenses/${expenseId}/approve`, { method: 'PATCH' })
    router.refresh()
  }

  async function reject() {
    if (!rejecting) {
      setRejecting(true)
      return
    }
    if (!reason.trim()) {
      setError('Rejection reason is required')
      return
    }
    setLoading(true)
    await fetch(`/api/expenses/${expenseId}/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: reason.trim() }),
    })
    router.refresh()
  }

  return (
    <div className="flex flex-col gap-2">
      {rejecting && (
        <div className="flex flex-col gap-1">
          <input
            type="text"
            aria-label="Rejection reason"
            placeholder="Rejection reason"
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError('') }}
            className="rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      )}
      <div className="flex gap-2">
        {!rejecting && (
          <button
            onClick={approve}
            disabled={loading}
            className="rounded bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            Approve
          </button>
        )}
        <button
          onClick={reject}
          disabled={loading}
          className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
        >
          {rejecting ? 'Confirm reject' : 'Reject'}
        </button>
        {rejecting && (
          <button
            onClick={() => { setRejecting(false); setReason(''); setError('') }}
            className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
