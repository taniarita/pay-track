import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '@/auth'
import { proxy } from '@/proxy'

const mockAuth = auth as ReturnType<typeof vi.fn>

function makeRequest(path: string): NextRequest {
  return new NextRequest(`http://localhost:3000${path}`)
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('proxy — unauthenticated access', () => {
  it('redirects to /login when visiting a protected employee route', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await proxy(makeRequest('/employee/expenses'))

    expect(res?.status).toBe(307)
    expect(res?.headers.get('location')).toContain('/login')
  })

  it('redirects to /login when visiting a protected manager route', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await proxy(makeRequest('/manager/expenses'))

    expect(res?.status).toBe(307)
    expect(res?.headers.get('location')).toContain('/login')
  })

  it('allows unauthenticated access to /login', async () => {
    mockAuth.mockResolvedValue(null)

    const res = await proxy(makeRequest('/login'))

    expect(res?.status).not.toBe(307)
  })
})

describe('proxy — role-based access', () => {
  it('allows an EMPLOYEE to access /employee/expenses', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'EMPLOYEE' } })

    const res = await proxy(makeRequest('/employee/expenses'))

    expect(res?.status).not.toBe(307)
  })

  it('redirects an EMPLOYEE away from /manager/expenses', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'EMPLOYEE' } })

    const res = await proxy(makeRequest('/manager/expenses'))

    expect(res?.status).toBe(307)
    expect(res?.headers.get('location')).toContain('/employee/expenses')
  })

  it('allows a MANAGER to access /manager/expenses', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'MANAGER' } })

    const res = await proxy(makeRequest('/manager/expenses'))

    expect(res?.status).not.toBe(307)
  })

  it('redirects a MANAGER away from /employee/submit', async () => {
    mockAuth.mockResolvedValue({ user: { role: 'MANAGER' } })

    const res = await proxy(makeRequest('/employee/submit'))

    expect(res?.status).toBe(307)
    expect(res?.headers.get('location')).toContain('/manager/expenses')
  })
})
