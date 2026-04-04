import { compare } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export async function authorize(credentials: {
  email?: unknown
  password?: unknown
}): Promise<{ id: string; email: string; role: Role } | null> {
  const email = credentials?.email
  const password = credentials?.password

  if (typeof email !== 'string' || typeof password !== 'string') {
    return null
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null

  const valid = await compare(password, user.passwordHash)
  if (!valid) return null

  return { id: user.id, email: user.email, role: user.role }
}
