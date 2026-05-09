import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    expense: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}))

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { GET } from '@/app/api/expenses/route'
import { PATCH as approvePATCH } from '@/app/api/expenses/[id]/approve/route'
import { PATCH as rejectPATCH } from '@/app/api/expenses/[id]/reject/route'

const mockFindMany = prisma.expense.findMany as ReturnType<typeof vi.fn>
const mockFindUnique = prisma.expense.findUnique as ReturnType<typeof vi.fn>
const mockUpdate = prisma.expense.update as ReturnType<typeof vi.fn>
const mockAuth = auth as ReturnType<typeof vi.fn>

const managerSession = { user: { id: 'mgr-1', email: 'mgr@example.com', role: 'MANAGER' } }
const employeeSession = { user: { id: 'emp-1', email: 'emp@example.com', role: 'EMPLOYEE' } }

const pendingExpense = {
  id: 'exp-1',
  title: 'Hotel',
  amount: 200,
  category: 'ACCOMMODATION',
  date: new Date('2026-04-01'),
  status: 'PENDING',
  submittedById: 'emp-1',
  submittedBy: { id: 'emp-1', email: 'emp@example.com' },
}

beforeEach(() => {
  vi.clearAllMocks()
})

function makeGetRequest() {
  return new Request('http://localhost/api/expenses', { method: 'GET' })
}

function makePatchRequest(body: unknown, id = 'exp-1') {
  return new Request(`http://localhost/api/expenses/${id}/approve`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

const params = Promise.resolve({ id: 'exp-1' })

describe('GET /api/expenses as manager', () => {
  it('returns all PENDING expenses with submitter info', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindMany.mockResolvedValue([pendingExpense])

    const res = await GET(makeGetRequest())
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json).toHaveLength(1)
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: 'PENDING' },
        include: { submittedBy: expect.objectContaining({ select: expect.any(Object) }) },
        orderBy: { createdAt: 'desc' },
      })
    )
  })
})

describe('PATCH /api/expenses/[id]/approve', () => {
  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await approvePATCH(makePatchRequest({}), { params })
    expect(res.status).toBe(401)
  })

  it('returns 403 when called by an employee', async () => {
    mockAuth.mockResolvedValue(employeeSession)
    const res = await approvePATCH(makePatchRequest({}), { params })
    expect(res.status).toBe(403)
  })

  it('returns 404 when expense does not exist', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue(null)
    const res = await approvePATCH(makePatchRequest({}), { params })
    expect(res.status).toBe(404)
  })

  it('returns 400 when expense is already decided', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue({ ...pendingExpense, status: 'APPROVED' })
    const res = await approvePATCH(makePatchRequest({}), { params })
    expect(res.status).toBe(400)
  })

  it('transitions expense to APPROVED and returns it', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue(pendingExpense)
    const approved = { ...pendingExpense, status: 'APPROVED' }
    mockUpdate.mockResolvedValue(approved)

    const res = await approvePATCH(makePatchRequest({}), { params })
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('APPROVED')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'exp-1' },
        data: { status: 'APPROVED' },
      })
    )
  })
})

describe('PATCH /api/expenses/[id]/reject', () => {
  function makeRejectRequest(body: unknown) {
    return new Request(`http://localhost/api/expenses/exp-1/reject`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  }

  it('returns 401 when not authenticated', async () => {
    mockAuth.mockResolvedValue(null)
    const res = await rejectPATCH(makeRejectRequest({ reason: 'bad' }), { params })
    expect(res.status).toBe(401)
  })

  it('returns 403 when called by an employee', async () => {
    mockAuth.mockResolvedValue(employeeSession)
    const res = await rejectPATCH(makeRejectRequest({ reason: 'bad' }), { params })
    expect(res.status).toBe(403)
  })

  it('returns 400 when rejection reason is missing', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue(pendingExpense)
    const res = await rejectPATCH(makeRejectRequest({}), { params })
    expect(res.status).toBe(400)
  })

  it('returns 400 when rejection reason is empty', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue(pendingExpense)
    const res = await rejectPATCH(makeRejectRequest({ reason: '  ' }), { params })
    expect(res.status).toBe(400)
  })

  it('returns 404 when expense does not exist', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue(null)
    const res = await rejectPATCH(makeRejectRequest({ reason: 'Not valid' }), { params })
    expect(res.status).toBe(404)
  })

  it('returns 400 when expense is already decided', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue({ ...pendingExpense, status: 'REJECTED' })
    const res = await rejectPATCH(makeRejectRequest({ reason: 'Not valid' }), { params })
    expect(res.status).toBe(400)
  })

  it('transitions expense to REJECTED with reason and returns it', async () => {
    mockAuth.mockResolvedValue(managerSession)
    mockFindUnique.mockResolvedValue(pendingExpense)
    const rejected = { ...pendingExpense, status: 'REJECTED', rejectionReason: 'Not valid' }
    mockUpdate.mockResolvedValue(rejected)

    const res = await rejectPATCH(makeRejectRequest({ reason: 'Not valid' }), { params })
    expect(res.status).toBe(200)

    const json = await res.json()
    expect(json.status).toBe('REJECTED')
    expect(json.rejectionReason).toBe('Not valid')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'exp-1' },
        data: { status: 'REJECTED', rejectionReason: 'Not valid' },
      })
    )
  })
})
