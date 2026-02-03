import { db } from '@/lib/db'
import { petProfiles, petProfileVersions, vaccinations } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function HistoryPage({ params }: { params: Promise<{ profileId: string }> }) {
  const { profileId: profileIdStr } = await params
  const profileId = parseInt(profileIdStr)

  // Get pet profile
  const profile = await db
    .select()
    .from(petProfiles)
    .where(eq(petProfiles.id, profileId))
    .limit(1)

  if (profile.length === 0) {
    notFound()
  }

  // Get all versions
  const versions = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.profileId, profileId))
    .orderBy(desc(petProfileVersions.versionNumber))

  // Get vaccinations for each version
  const versionsWithVaccinations = await Promise.all(
    versions.map(async (version) => {
      const vaxRecords = await db
        .select()
        .from(vaccinations)
        .where(eq(vaccinations.versionId, version.id))
      return { ...version, vaccinations: vaxRecords }
    })
  )

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/syndicate/pets"
          className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
        >
          ← Back to Pets
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Version History</h1>
        <p className="text-gray-600 mt-2">
          {profile[0].petName} - All versions ({versions.length})
        </p>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {versionsWithVaccinations.map((version, index) => {
          const petData = version.petData as any
          const isLatest = index === 0

          return (
            <div
              key={version.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-6 ${
                isLatest ? 'border-green-500' : 'border-gray-200'
              }`}
            >
              {/* Version Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      isLatest
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    v{version.versionNumber}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {version.editorName}
                      {isLatest && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Current
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(version.editedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-semibold capitalize">{version.editorRole}</p>
                </div>
              </div>

              {/* Pet Data */}
              <div className="border-t pt-4">
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500">Pet Name</p>
                    <p className="font-semibold">{petData.petName || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Species</p>
                    <p className="font-semibold">{petData.species || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Breed</p>
                    <p className="font-semibold">{petData.breed || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Age</p>
                    <p className="font-semibold">{petData.age || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gender</p>
                    <p className="font-semibold">{petData.gender || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Owner</p>
                    <p className="font-semibold">{petData.ownerName || 'N/A'}</p>
                  </div>
                </div>

                {/* Vaccinations */}
                {version.vaccinations.length > 0 && (
                  <div className="mt-4 bg-blue-50 rounded-lg p-4">
                    <p className="font-semibold text-sm mb-2">
                      Vaccinations ({version.vaccinations.length})
                    </p>
                    <div className="space-y-2">
                      {version.vaccinations.map((vax, vaxIndex) => (
                        <div key={vaxIndex} className="text-sm">
                          <span className="font-medium">{vax.vaccinationType}</span> -{' '}
                          {vax.vaccinationDate}
                          {vax.nextDueDate && ` (Next: ${vax.nextDueDate})`}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medical Info */}
                {(petData.allergies || petData.chronicConditions || petData.currentMedications) && (
                  <div className="mt-4 bg-yellow-50 rounded-lg p-4">
                    <p className="font-semibold text-sm mb-2">Medical Information</p>
                    <div className="text-sm space-y-1">
                      {petData.allergies && (
                        <p>
                          <span className="font-medium">Allergies:</span> {petData.allergies}
                        </p>
                      )}
                      {petData.chronicConditions && (
                        <p>
                          <span className="font-medium">Conditions:</span>{' '}
                          {petData.chronicConditions}
                        </p>
                      )}
                      {petData.currentMedications && (
                        <p>
                          <span className="font-medium">Medications:</span>{' '}
                          {petData.currentMedications}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

