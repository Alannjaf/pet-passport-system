import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { petProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import PetProfileForm from '@/components/forms/PetProfileForm'

export default async function EditPetPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()

  if (!session || session.user.role !== 'syndicate') {
    redirect('/login')
  }

  const { id } = await params
  const profile = await db
    .select()
    .from(petProfiles)
    .where(eq(petProfiles.id, parseInt(id)))
    .limit(1)

  if (profile.length === 0) {
    redirect('/syndicate/dashboard')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Pet Profile</h1>
        <p className="text-gray-600 mt-2">Update the pet&apos;s information</p>
      </div>

      <PetProfileForm
        qrCodeId={profile[0].qrCodeId}
        existingProfile={profile[0]}
        session={session}
      />
    </div>
  )
}

