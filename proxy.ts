import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

const EMPLOYEE_HOME = '/employee/expenses'
const MANAGER_HOME = '/manager/expenses'

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes — always allowed
  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  const session = await auth()

  // Unauthenticated — redirect to login
  if (!session?.user) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  const { role } = session.user

  // Role-based guards
  if (pathname.startsWith('/employee') && role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL(MANAGER_HOME, request.url))
  }

  if (pathname.startsWith('/manager') && role !== 'MANAGER') {
    return NextResponse.redirect(new URL(EMPLOYEE_HOME, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
