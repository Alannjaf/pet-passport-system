import { db } from '@/lib/db'
import { petProfiles } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function SyndicatePetsPage() {
  const profiles = await db.select().from(petProfiles).orderBy(desc(petProfiles.updatedAt))

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Pet Profiles</h1>
        <p className="text-gray-600 mt-2">View and manage all pet profiles in the system</p>
      </div>

      {/* Pets Grid */}
      {profiles.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-xl text-gray-600">No pets yet</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((pet) => (
            <div key={pet.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {pet.photoBase64 ? (
                <div className="h-48 bg-gray-200">
                  <img
                    src={pet.photoBase64}
                    alt={pet.petName || 'Pet'}
                    className="w-full h-full object-cover"
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
                <h3 className="text-lg font-semibold text-gray-900">
                  {pet.petName || 'Unnamed'}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {pet.species} {pet.breed && `• ${pet.breed}`}
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  <p>Owner: {pet.ownerName || 'No owner'}</p>
                  {pet.lastEditedByName && (
                    <p>Last edited by: {pet.lastEditedByName}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/syndicate/pets/${pet.id}/edit`}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-center text-sm hover:bg-blue-700 transition"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/syndicate/history/${pet.id}`}
                    className="flex-1 px-3 py-2 bg-purple-600 text-white rounded text-center text-sm hover:bg-purple-700 transition"
                  >
                    History
                  </Link>
                  <Link
                    href={`/view/${pet.id}`}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-center text-sm hover:bg-green-700 transition"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

