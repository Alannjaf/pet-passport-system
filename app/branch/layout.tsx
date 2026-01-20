import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/LogoutButton";

export default async function BranchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "branch_head") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-8">
              <Link href="/branch/dashboard" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <span className="font-semibold text-gray-900">Branch Portal</span>
              </Link>

              <nav className="hidden md:flex items-center gap-6">
                <Link
                  href="/branch/dashboard"
                  className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  href="/branch/applications"
                  className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium"
                >
                  Applications
                </Link>
                <Link
                  href="/branch/members"
                  className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium"
                >
                  Members
                </Link>
                <Link
                  href="/branch/renewals"
                  className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium"
                >
                  Renewals
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{session.user.name}</span>
              </span>
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
