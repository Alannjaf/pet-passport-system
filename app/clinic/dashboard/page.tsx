import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { petProfileVersions } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function ClinicDashboard() {
  const session = await auth()
  
  if (!session) {
    return null
  }

  // Fetch pets edited by this clinic
  const recentPets = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.editorId, parseInt(session.user.id)))
    .orderBy(desc(petProfileVersions.editedAt))
    .limit(10)

  // Get unique profile IDs for count
  const allPets = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.editorId, parseInt(session.user.id)))

  const uniqueProfiles = new Set(allPets.map((p) => p.profileId))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Welcome, {session.user.name}</h1>
        <p className="text-gray-600 mt-2">Manage your pet profiles</p>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Pets</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{uniqueProfiles.size}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Edits</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{allPets.length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Recent Activity</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {recentPets.length > 0
                  ? new Date(recentPets[0].editedAt).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Link
            href="/scan"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              Scan QR Code
            </h3>
            <p className="text-gray-600">Scan a QR code to create or edit a pet profile</p>
          </Link>

          <Link
            href="/clinic/pets"
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
              View All Pets
            </h3>
            <p className="text-gray-600">Browse all pet profiles you&apos;ve created or edited</p>
          </Link>
        </div>
      </div>

      {/* Recent Pets */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {recentPets.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No activity yet. Scan a QR code to get started!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pet Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edited At
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPets.map((pet) => {
                    const petData = pet.petData as any
                    return (
                      <tr key={pet.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {petData.petName || 'Unnamed'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">v{pet.versionNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(pet.editedAt).toLocaleString()}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

