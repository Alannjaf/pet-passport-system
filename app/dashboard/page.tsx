import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  if (session.user.role === 'syndicate') {
    redirect('/syndicate/dashboard')
  }

  if (session.user.role === 'clinic') {
    redirect('/clinic/dashboard')
  }

  redirect('/login')
}

