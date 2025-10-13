import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LogoutButton from '@/components/LogoutButton'
import LanguageSwitcher from '@/components/LanguageSwitcher'

export default async function ClinicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session || session.user.role !== 'clinic') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/clinic/dashboard" className="text-xl font-bold text-blue-600">
                Pet Passport - {session.user.name}
              </Link>
              <div className="hidden md:flex gap-4">
                <Link
                  href="/clinic/dashboard"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  Dashboard
                </Link>
                <Link
                  href="/clinic/pets"
                  className="px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                >
                  My Pets
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher />
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  )
}

