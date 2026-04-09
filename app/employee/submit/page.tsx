'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@/components/sign-out-button'
import { validateExpense } from '@/lib/validate-expense'

const CATEGORIES = [
  { value: 'MEALS', label: 'Meals' },
  { value: 'TRANSPORT', label: 'Transport' },
  { value: 'ACCOMMODATION', label: 'Accommodation' },
  { value: 'OTHER', label: 'Other' },
]

export default function SubmitExpensePage() {
  const router = useRouter()
  const [errors, setErrors] = useState<string[]>([])
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrors([])
    setSuccess(false)
    setPending(true)

    const form = new FormData(e.currentTarget)
    const body = {
      title: form.get('title') as string,
      amount: Number(form.get('amount')),
      category: form.get('category') as string,
      date: form.get('date') as string,
      description: form.get('description') as string || undefined,
    }

    const clientErrors = validateExpense(body)
    if (clientErrors.length > 0) {
      setErrors(clientErrors)
      setPending(false)
      return
    }

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    setPending(false)

    if (!res.ok) {
      const data = await res.json()
      setErrors(data.errors ?? ['Something went wrong. Please try again.'])
      return
    }

    setSuccess(true);
    (e.target as HTMLFormElement).reset()
    setTimeout(() => router.push('/employee/expenses'), 1500)
  }

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Submit Expense</h1>
        <SignOutButton />
      </div>

      <div className="max-w-md">
        {success && (
          <p className="mb-4 rounded-md bg-green-50 px-4 py-3 text-sm text-green-700">
            Expense submitted successfully. Redirecting…
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="title" className="block text-sm font-medium">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="amount" className="block text-sm font-medium">
              Amount (R$) <span className="text-red-500">*</span>
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="category" className="block text-sm font-medium">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="date" className="block text-sm font-medium">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              id="date"
              name="date"
              type="date"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {errors.length > 0 && (
            <ul role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 space-y-1">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {pending ? 'Submitting…' : 'Submit expense'}
          </button>
        </form>
      </div>
    </main>
  )
}
