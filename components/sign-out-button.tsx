'use client'

import { signOut } from 'next-auth/react'

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ redirectTo: '/login' })}
      className="rounded-md border border-gray-300 px-3 py-1.5 text-sm hover:bg-gray-100"
    >
      Sign out
    </button>
  )
}
