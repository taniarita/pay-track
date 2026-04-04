import { SignOutButton } from '@/components/sign-out-button'

export default function SubmitExpensePage() {
  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Submit Expense</h1>
        <SignOutButton />
      </div>
      <p className="text-gray-500">Expense submission form will appear here.</p>
    </main>
  )
}
