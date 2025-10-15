import { db } from '@/lib/db'
import { users, petProfiles, petProfileVersions } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import AddClinicButton from '@/components/syndicate/AddClinicButton'
import ClinicsTable from '@/components/syndicate/ClinicsTable'

export default async function ClinicsPage() {
  // Fetch all clinics
  const clinics = await db.select().from(users).orderBy(desc(users.createdAt))
  
  // Fetch all pet profiles
  const allPets = await db.select().from(petProfiles)
  
  // Fetch all pet profile versions to determine clinic associations
  const allVersions = await db.select().from(petProfileVersions)
  
  // Add pet count to each clinic
  const clinicsWithPetCount = clinics.map(clinic => {
    // Find pets that this clinic has worked on (either created or edited)
    const clinicPets = allPets.filter(pet => {
      // Check if clinic last edited this pet
      if (pet.lastEditedBy === clinic.id.toString()) {
        return true
      }
      
      // Check if clinic created or edited this pet (in version history)
      const hasWorkedOnPet = allVersions.some(version => 
        version.profileId === pet.id && 
        version.editorId === clinic.id &&
        version.editorRole === 'clinic'
      )
      
      return hasWorkedOnPet
    })
    
    const petCount = clinicPets.length
    return {
      ...clinic,
      petCount
    }
  })

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Clinics</h1>
          <p className="text-gray-600 mt-2">Add, edit, or manage clinic accounts</p>
        </div>
        <AddClinicButton />
      </div>

      <ClinicsTable clinics={clinicsWithPetCount} allPets={allPets} />
    </div>
  )
}

