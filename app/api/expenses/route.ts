import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { validateExpense } from '@/lib/validate-expense'

export async function POST(request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })
  if (session.user.role !== 'EMPLOYEE') return Response.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const errors = validateExpense(body)
  if (errors.length > 0) return Response.json({ errors }, { status: 400 })

  const expense = await prisma.expense.create({
    data: {
      title: body.title,
      amount: body.amount,
      category: body.category,
      date: new Date(body.date),
      description: body.description ?? null,
      status: 'PENDING',
      submittedById: session.user.id,
    },
  })

  return Response.json(expense, { status: 201 })
}

export async function GET(_request: Request) {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const expenses = await prisma.expense.findMany({
    where: { submittedById: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(expenses)
}
