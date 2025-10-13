import { db } from '@/lib/db'
import { users, qrCodes, petProfiles } from '@/lib/db/schema'
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

      {/* Quick Actions */}
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
  )
}

