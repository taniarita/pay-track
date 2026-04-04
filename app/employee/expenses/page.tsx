import { SignOutButton } from '@/components/sign-out-button'

export default function EmployeeExpensesPage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">My Expenses</h1>
        <SignOutButton />
      </div>
      <p className="text-gray-500">Your expense history will appear here.</p>
    </main>
  )
}
