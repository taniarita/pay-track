import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}))

vi.mock('bcryptjs', () => ({
  compare: vi.fn(),
}))

import { prisma } from '@/lib/prisma'
import { compare } from 'bcryptjs'
import { authorize } from '@/lib/authorize'

const mockFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>
const mockCompare = compare as ReturnType<typeof vi.fn>

const fakeUser = {
  id: 'user-1',
  email: 'employee1@example.com',
  passwordHash: '$2b$12$hashedpassword',
  role: 'EMPLOYEE' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('authorize', () => {
  it('returns user object for valid credentials', async () => {
    mockFindUnique.mockResolvedValue(fakeUser)
    mockCompare.mockResolvedValue(true)

    const result = await authorize({ email: fakeUser.email, password: 'demo1234' })

    expect(result).toEqual({
      id: fakeUser.id,
      email: fakeUser.email,
      role: fakeUser.role,
    })
  })

  it('returns null for wrong password', async () => {
    mockFindUnique.mockResolvedValue(fakeUser)
    mockCompare.mockResolvedValue(false)

    const result = await authorize({ email: fakeUser.email, password: 'wrongpassword' })

    expect(result).toBeNull()
  })

  it('returns null for unknown email', async () => {
    mockFindUnique.mockResolvedValue(null)

    const result = await authorize({ email: 'nobody@example.com', password: 'demo1234' })

    expect(result).toBeNull()
    expect(mockCompare).not.toHaveBeenCalled()
  })

  it('returns null when credentials are not strings', async () => {
    const result = await authorize({ email: undefined, password: undefined })

    expect(result).toBeNull()
    expect(mockFindUnique).not.toHaveBeenCalled()
  })
})
