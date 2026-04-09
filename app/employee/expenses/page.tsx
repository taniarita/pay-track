import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { SignOutButton } from '@/components/sign-out-button'
import Link from 'next/link'

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
}

const CATEGORY_LABEL: Record<string, string> = {
  MEALS: 'Meals',
  TRANSPORT: 'Transport',
  ACCOMMODATION: 'Accommodation',
  OTHER: 'Other',
}

export default async function EmployeeExpensesPage() {
  const session = await auth()
  const expenses = await prisma.expense.findMany({
    where: { submittedById: session!.user.id },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Expenses</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/employee/submit"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Submit expense
          </Link>
          <SignOutButton />
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-500">No expenses yet. Submit your first one!</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b last:border-0">
                  <td className="py-3 pr-4">{expense.title}</td>
                  <td className="py-3 pr-4">
                    R$ {expense.amount.toFixed(2)}
                  </td>
                  <td className="py-3 pr-4">{CATEGORY_LABEL[expense.category] ?? expense.category}</td>
                  <td className="py-3 pr-4">
                    {new Date(expense.date).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[expense.status] ?? ''}`}
                    >
                      {expense.status.toLowerCase()}
                    </span>
                    {expense.rejectionReason && (
                      <p className="mt-1 text-xs text-gray-500">{expense.rejectionReason}</p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
