import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateTransition } from '@/lib/validate-transition'

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'MANAGER') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const expense = await prisma.expense.findUnique({ where: { id } })
  if (!expense) return Response.json({ error: 'Not found' }, { status: 404 })

  const err = validateTransition(expense.status, 'APPROVED')
  if (err) return Response.json({ error: err }, { status: 400 })

  const updated = await prisma.expense.update({
    where: { id },
    data: { status: 'APPROVED' },
  })

  return Response.json(updated)
}
