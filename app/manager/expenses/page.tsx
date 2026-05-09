import { prisma } from '@/lib/prisma'
import { SignOutButton } from '@/components/sign-out-button'
import { ExpenseActions } from '@/components/expense-actions'

const CATEGORY_LABEL: Record<string, string> = {
  MEALS: 'Meals',
  TRANSPORT: 'Transport',
  ACCOMMODATION: 'Accommodation',
  OTHER: 'Other',
}

export default async function ManagerExpensesPage() {
  const expenses = await prisma.expense.findMany({
    where: { status: 'PENDING' },
    include: { submittedBy: { select: { id: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Expense Review Queue</h1>
        <SignOutButton />
      </div>

      {expenses.length === 0 ? (
        <p className="text-gray-500">No pending expenses to review.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 pr-4 font-medium">Employee</th>
                <th className="pb-2 pr-4 font-medium">Title</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 pr-4 font-medium">Category</th>
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 text-gray-600">{expense.submittedBy.email}</td>
                  <td className="py-3 pr-4">{expense.title}</td>
                  <td className="py-3 pr-4">R$ {expense.amount.toFixed(2)}</td>
                  <td className="py-3 pr-4">{CATEGORY_LABEL[expense.category] ?? expense.category}</td>
                  <td className="py-3 pr-4">{new Date(expense.date).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3">
                    <ExpenseActions expenseId={expense.id} />
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
