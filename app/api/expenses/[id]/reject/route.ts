import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateTransition } from '@/lib/validate-transition'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'MANAGER') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const reason = typeof body.reason === 'string' ? body.reason.trim() : ''
  if (!reason) return Response.json({ error: 'rejection reason is required' }, { status: 400 })

  const { id } = await params

  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) return Response.json({ error: 'Not found' }, { status: 404 })

  const err = validateTransition(expense.status, 'REJECTED')
  if (err) return Response.json({ error: err }, { status: 400 })

  const updated = await prisma.expense.update({
    where: { id },
    data: { status: 'REJECTED', rejectionReason: reason },
  })

  return Response.json(updated)
}
