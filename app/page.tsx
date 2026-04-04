import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function RootPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.role === 'MANAGER') {
    redirect('/manager/expenses')
  }

  redirect('/employee/expenses')
}
