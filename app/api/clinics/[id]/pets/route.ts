import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { db } from '@/lib/db'
import { petProfiles, petProfileVersions } from '@/lib/db/schema'

// GET - Get all pets for a clinic
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'syndicate') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const clinicId = parseInt(id)
    
    // Fetch all pet profiles
    const allPets = await db.select().from(petProfiles)
    
    // Fetch all versions for this clinic
    const allVersions = await db.select().from(petProfileVersions)
    
    // Find pets that this clinic has worked on
    const clinicPets = allPets.filter(pet => {
      // Check if clinic last edited this pet
      if (pet.lastEditedBy === clinicId.toString()) {
        return true
      }
      
      // Check if clinic created or edited this pet (in version history)
      const hasWorkedOnPet = allVersions.some(version => 
        version.profileId === pet.id && 
        version.editorId === clinicId &&
        version.editorRole === 'clinic'
      )
      
      return hasWorkedOnPet
    })

    return NextResponse.json({ success: true, pets: clinicPets })
  } catch (error) {
    console.error('Error fetching clinic pets:', error)
    return NextResponse.json({ error: 'Failed to fetch pets' }, { status: 500 })
  }
}

