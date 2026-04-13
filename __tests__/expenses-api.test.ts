import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    expense: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { POST, GET } from '@/app/api/expenses/route'

const mockCreate = prisma.expense.create as ReturnType<typeof vi.fn>
const mockFindMany = prisma.expense.findMany as ReturnType<typeof vi.fn>
const mockAuth = auth as ReturnType<typeof vi.fn>

const employeeSession = {
  user: { id: 'emp-1', email: 'emp@example.com', role: 'EMPLOYEE' },
}

const managerSession = {
  user: { id: 'mgr-1', email: 'mgr@example.com', role: 'MANAGER' },
}

const validBody = {
  title: 'Team lunch',
  amount: 50,
  category: 'MEALS',
  date: '2026-04-01',
}

beforeEach(() => {
  vi.clearAllMocks()
})

function makeRequest(body: unknown) {
  return new Request('http://localhost/api/expenses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/expenses', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(401)
  })

  it('returns 403 when called by a manager', async () => {
    mockAuth.mockResolvedValue(managerSession)
    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(403)
  })

  it('returns 400 for missing title', async () => {
    mockAuth.mockResolvedValue(employeeSession)
    const res = await POST(makeRequest({ ...validBody, title: '' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid amount', async () => {
    mockAuth.mockResolvedValue(employeeSession)
    const res = await POST(makeRequest({ ...validBody, amount: 0 }))
    expect(res.status).toBe(400)
  })

  it('creates expense and returns 201 for valid input', async () => {
    mockAuth.mockResolvedValue(employeeSession)
    const created = { id: 'exp-1', ...validBody, date: new Date(validBody.date), status: 'PENDING', submittedById: 'emp-1' }
    mockCreate.mockResolvedValue(created)

    const res = await POST(makeRequest(validBody))
    expect(res.status).toBe(201)

    const json = await res.json()
    expect(json.id).toBe('exp-1')
    expect(json.status).toBe('PENDING')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: 'Team lunch',
          amount: 50,
          submittedById: 'emp-1',
          status: 'PENDING',
        }),
      })
    )
  })
})

describe('GET /api/expenses', () => {
  function makeGetRequest() {
    return new Request('http://localhost/api/expenses', { method: 'GET' })
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await GET(makeGetRequest())
    expect(res.status).toBe(401)
  })

  it('returns only own expenses for employee, sorted by createdAt desc', async () => {
    mockAuth.mockResolvedValue(employeeSession)
    const expenses = [
      { id: 'exp-2', title: 'Hotel', createdAt: new Date('2026-04-02') },
      { id: 'exp-1', title: 'Lunch', createdAt: new Date('2026-04-01') },
    ]
    mockFindMany.mockResolvedValue(expenses)

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json).toHaveLength(2)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { submittedById: 'emp-1' },
        orderBy: { createdAt: 'desc' },
      })
    )
  })
})
