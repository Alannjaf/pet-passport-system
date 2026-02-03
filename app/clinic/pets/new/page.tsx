import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import PetProfileForm from '@/components/forms/PetProfileForm'

export default async function NewPetPage({
  searchParams,
}: {
  searchParams: Promise<{ qrCodeId?: string }>
}) {
  const session = await auth()

  if (!session || session.user.role !== 'clinic') {
    redirect('/login')
  }

  const { qrCodeId } = await searchParams

  if (!qrCodeId) {
    redirect('/clinic/dashboard')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Pet Profile</h1>
        <p className="text-gray-600 mt-2">Fill in the pet&apos;s information</p>
      </div>

      <PetProfileForm qrCodeId={qrCodeId} session={session} />
    </div>
  )
}

