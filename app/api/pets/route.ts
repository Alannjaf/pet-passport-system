import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { petProfiles, petProfileVersions, vaccinations, qrCodes } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      qrCodeId,
      petName,
      species,
      breed,
      dateOfBirth,
      age,
      gender,
      color,
      microchipNumber,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      secondaryContact,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      additionalNotes,
      vaccinations: vaxData,
    } = body

    // Create pet profile
    const newProfile = await db.insert(petProfiles).values({
      qrCodeId,
      petName,
      species,
      breed,
      dateOfBirth,
      age,
      gender,
      color,
      microchipNumber,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      secondaryContact,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      additionalNotes,
      lastEditedBy: session.user.id,
      lastEditedByName: session.user.name,
      lastEditedAt: new Date(),
    }).returning()

    const profileId = newProfile[0].id

    // Create first version
    const petData = {
      petName,
      species,
      breed,
      dateOfBirth,
      age,
      gender,
      color,
      microchipNumber,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      secondaryContact,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      additionalNotes,
    }

    const newVersion = await db.insert(petProfileVersions).values({
      profileId,
      versionNumber: 1,
      editorId: session.user.role === 'clinic' ? parseInt(session.user.id) : null,
      editorName: session.user.name || 'Unknown',
      editorRole: session.user.role,
      petData,
      changeDescription: 'Initial creation',
    }).returning()

    // Insert vaccinations
    if (vaxData && vaxData.length > 0) {
      const vaxRecords = vaxData.map((vax: any) => ({
        versionId: newVersion[0].id,
        vaccinationType: vax.vaccinationType,
        vaccinationDate: vax.vaccinationDate,
        nextDueDate: vax.nextDueDate || null,
        batchNumber: vax.batchNumber || null,
        notes: vax.notes || null,
      }))
      await db.insert(vaccinations).values(vaxRecords)
    }

    // Update QR code status
    await db.update(qrCodes).set({ status: 'filled' }).where(eq(qrCodes.qrCodeId, qrCodeId))

    return NextResponse.json({ success: true, profileId })
  } catch (error) {
    console.error('Error creating pet profile:', error)
    return NextResponse.json({ error: 'Failed to create pet profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      profileId,
      petName,
      species,
      breed,
      dateOfBirth,
      age,
      gender,
      color,
      microchipNumber,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      secondaryContact,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      additionalNotes,
      vaccinations: vaxData,
    } = body

    // Update pet profile
    await db.update(petProfiles).set({
      petName,
      species,
      breed,
      dateOfBirth,
      age,
      gender,
      color,
      microchipNumber,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      secondaryContact,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      additionalNotes,
      lastEditedBy: session.user.id,
      lastEditedByName: session.user.name,
      lastEditedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(petProfiles.id, profileId))

    // Get latest version number
    const latestVersion = await db
      .select()
      .from(petProfileVersions)
      .where(eq(petProfileVersions.profileId, profileId))
      .orderBy(desc(petProfileVersions.versionNumber))
      .limit(1)

    const newVersionNumber = latestVersion.length > 0 ? latestVersion[0].versionNumber + 1 : 1

    // Create new version
    const petData = {
      petName,
      species,
      breed,
      dateOfBirth,
      age,
      gender,
      color,
      microchipNumber,
      ownerName,
      ownerPhone,
      ownerEmail,
      ownerAddress,
      secondaryContact,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      additionalNotes,
    }

    const newVersion = await db.insert(petProfileVersions).values({
      profileId,
      versionNumber: newVersionNumber,
      editorId: session.user.role === 'clinic' ? parseInt(session.user.id) : null,
      editorName: session.user.name || 'Unknown',
      editorRole: session.user.role,
      petData,
      changeDescription: `Updated by ${session.user.name}`,
    }).returning()

    // Insert vaccinations
    if (vaxData && vaxData.length > 0) {
      const vaxRecords = vaxData.map((vax: any) => ({
        versionId: newVersion[0].id,
        vaccinationType: vax.vaccinationType,
        vaccinationDate: vax.vaccinationDate,
        nextDueDate: vax.nextDueDate || null,
        batchNumber: vax.batchNumber || null,
        notes: vax.notes || null,
      }))
      await db.insert(vaccinations).values(vaxRecords)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating pet profile:', error)
    return NextResponse.json({ error: 'Failed to update pet profile' }, { status: 500 })
  }
}

