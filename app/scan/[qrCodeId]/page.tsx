import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { qrCodes, petProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { randomUUID } from 'crypto'
import Link from 'next/link'

export default async function ScanPage({ params }: { params: Promise<{ qrCodeId: string }> }) {
  const session = await auth()
  const { qrCodeId } = await params

  // Check if QR code exists
  const qrCode = await db.select().from(qrCodes).where(eq(qrCodes.qrCodeId, qrCodeId)).limit(1)

  // If QR doesn't exist, create it (this handles QR codes created on-demand)
  if (qrCode.length === 0) {
    await db.insert(qrCodes).values({
      qrCodeId,
      status: 'generated',
      generatedBy: 'system',
    })
  }

  // Check if pet profile exists for this QR
  const profile = await db.select().from(petProfiles).where(eq(petProfiles.qrCodeId, qrCodeId)).limit(1)

  const profileExists = profile.length > 0 && profile[0].petName

  // Route based on session and profile status
  if (!session) {
    // Public user
    if (profileExists) {
      // Show read-only view
      redirect(`/view/${profile[0].id}`)
    } else {
      // Show "needs activation" message
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">QR Code Not Activated</h1>
            <p className="text-gray-600 mb-6">
              This QR code needs to be activated by a registered clinic. Please contact a clinic to create a pet profile.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )
    }
  }

  // Clinic or Syndicate user
  if (profileExists) {
    // Redirect to edit page
    if (session.user.role === 'clinic') {
      redirect(`/clinic/pets/${profile[0].id}/edit`)
    } else {
      redirect(`/syndicate/pets/${profile[0].id}/edit`)
    }
  } else {
    // Redirect to create page
    if (session.user.role === 'clinic') {
      redirect(`/clinic/pets/new?qrCodeId=${qrCodeId}`)
    } else {
      redirect(`/syndicate/pets/new?qrCodeId=${qrCodeId}`)
    }
  }
}

