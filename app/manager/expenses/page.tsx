import { SignOutButton } from '@/components/sign-out-button'

export default function ManagerExpensesPage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Expense Review Queue</h1>
        <SignOutButton />
      </div>
      <p className="text-gray-500">Pending expenses will appear here.</p>
    </main>
  )
}
