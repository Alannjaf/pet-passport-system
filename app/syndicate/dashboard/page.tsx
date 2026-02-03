import { db } from '@/lib/db'
import { users, qrCodes, petProfiles, vetApplications, vetMembers, cities } from '@/lib/db/schema'
import { eq, count, isNotNull } from 'drizzle-orm'
import Link from 'next/link'

export default async function SyndicateDashboard() {
  // Fetch statistics
  const [totalClinics] = await db.select({ count: count() }).from(users)
  const [totalQRCodes] = await db.select({ count: count() }).from(qrCodes)
  const [totalPets] = await db
    .select({ count: count() })
    .from(petProfiles)
    .where(isNotNull(petProfiles.petName))
  
  const activeClinics = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.status, 'active'))

  // Vet membership statistics
  const [pendingApplications] = await db
    .select({ count: count() })
    .from(vetApplications)
    .where(eq(vetApplications.status, 'pending'))
  
  const [totalVetMembers] = await db.select({ count: count() }).from(vetMembers)
  
  const [activeVetMembers] = await db
    .select({ count: count() })
    .from(vetMembers)
    .where(eq(vetMembers.status, 'active'))
  
  const [totalCities] = await db.select({ count: count() }).from(cities)

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Syndicate Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome, Syndicate Admin</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Clinics</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalClinics.count}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Clinics</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{activeClinics[0].count}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total QR Codes</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalQRCodes.count}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pets</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalPets.count}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Vet Membership Statistics */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vet Membership System</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Applications</p>
                <p className="text-3xl font-bold text-amber-600 mt-1">{pendingApplications.count}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Active Vet Members</p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">{activeVetMembers.count}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Vet Members</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalVetMembers.count}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Branch Cities</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{totalCities.count}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pet Passport Management</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/syndicate/clinics"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              Manage Clinics
            </h3>
            <p className="text-gray-600">Add, edit, or remove clinic accounts</p>
          </Link>

          <Link
            href="/syndicate/qr-generator"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              Generate QR Codes
            </h3>
            <p className="text-gray-600">Create bulk QR codes for pet passports</p>
          </Link>

          <Link
            href="/syndicate/pets"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              View All Pets
            </h3>
            <p className="text-gray-600">Browse and manage all pet profiles</p>
          </Link>
        </div>
      </div>

      {/* Vet Membership Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vet Membership Management</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Link
            href="/syndicate/vet-applications"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                Applications
              </h3>
            </div>
            <p className="text-gray-600 text-sm">View all membership applications</p>
          </Link>

          <Link
            href="/syndicate/vet-members"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                Vet Members
              </h3>
            </div>
            <p className="text-gray-600 text-sm">View and manage all vet members</p>
          </Link>

          <Link
            href="/syndicate/cities"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                Cities
              </h3>
            </div>
            <p className="text-gray-600 text-sm">Manage branch cities</p>
          </Link>

          <Link
            href="/syndicate/branch-users"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-emerald-600">
                Branch Users
              </h3>
            </div>
            <p className="text-gray-600 text-sm">Manage branch head accounts</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

