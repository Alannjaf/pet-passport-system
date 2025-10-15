import { db } from '@/lib/db'
import { users, petProfiles } from '@/lib/db/schema'
import { desc, eq, sql } from 'drizzle-orm'
import AddClinicButton from '@/components/syndicate/AddClinicButton'
import ClinicsTable from '@/components/syndicate/ClinicsTable'

export default async function ClinicsPage() {
  // Fetch all clinics
  const clinics = await db.select().from(users).orderBy(desc(users.createdAt))
  
  // Fetch all pet profiles
  const allPets = await db.select().from(petProfiles)
  
  // Add pet count to each clinic
  const clinicsWithPetCount = clinics.map(clinic => {
    const petCount = allPets.filter(pet => pet.lastEditedBy === clinic.id.toString()).length
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

