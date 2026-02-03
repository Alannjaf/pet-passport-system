import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { petProfiles, petProfileVersions } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import Link from 'next/link'

export default async function ClinicPetsPage() {
  const session = await auth()
  
  if (!session) {
    return null
  }

  // Get all versions edited by this clinic
  const versions = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.editorId, parseInt(session.user.id)))

  // Get unique profile IDs
  const profileIds = [...new Set(versions.map(v => v.profileId))]

  // Fetch all profiles
  let profiles: any[] = []
  if (profileIds.length > 0) {
    profiles = await db
      .select()
      .from(petProfiles)
      .where(inArray(petProfiles.id, profileIds))
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Pets</h1>
          <p className="text-gray-600 mt-2">All pet profiles you&apos;ve created or edited</p>
        </div>
        <Link
          href="/scan"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
        >
          Scan QR Code
        </Link>
      </div>

      {/* Pets Grid */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          </div>
          <p className="text-xl text-gray-600 mb-4">No pets yet</p>
          <p className="text-gray-500 mb-6">Scan a QR code to create your first pet profile</p>
          <Link
            href="/scan"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Scan QR Code
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((pet) => (
            <Link
              key={pet.id}
              href={`/clinic/pets/${pet.id}/edit`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition group"
            >
              {pet.photoBase64 ? (
                <div className="h-48 bg-gray-200">
                  <img
                    src={pet.photoBase64}
                    alt={pet.petName || 'Pet'}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                  <svg className="w-16 h-16 text-white opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition">
                  {pet.petName || 'Unnamed'}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                  {pet.species} {pet.breed && `• ${pet.breed}`}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{pet.ownerName || 'No owner'}</span>
                  {pet.lastEditedAt && (
                    <span>{new Date(pet.lastEditedAt).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

