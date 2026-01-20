import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

export default async function SyndicateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "syndicate") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link
                href="/syndicate/dashboard"
                className="flex items-center gap-2 text-xl font-bold text-emerald-700"
              >
                <Image src="/Logo.svg" alt="Logo" width={40} height={40} />
                <span className="hidden sm:inline">Syndicate</span>
              </Link>
              <div className="hidden md:flex gap-1">
                <Link
                  href="/syndicate/dashboard"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Dashboard
                </Link>
                <Link
                  href="/syndicate/clinics"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Clinics
                </Link>
                <Link
                  href="/syndicate/members"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Org Chart
                </Link>
                <Link
                  href="/syndicate/qr-generator"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  QR Generator
                </Link>
                <span className="border-l border-gray-300 mx-1"></span>
                <Link
                  href="/syndicate/cities"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Cities
                </Link>
                <Link
                  href="/syndicate/branch-users"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Branch Users
                </Link>
                <Link
                  href="/syndicate/vet-applications"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Vet Applications
                </Link>
                <Link
                  href="/syndicate/vet-members"
                  className="px-3 py-2 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded transition text-sm"
                >
                  Vet Members
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
