'use client'

import { useState } from 'react'
import { User, PetProfile } from '@/lib/db/schema'
import ClinicActions from './ClinicActions'
import { useRouter } from 'next/navigation'

interface ClinicsTableProps {
  clinics: (User & { petCount: number })[]
  allPets: PetProfile[]
}

export default function ClinicsTable({ clinics, allPets }: ClinicsTableProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [showPetsModal, setShowPetsModal] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState<User | null>(null)
  const [clinicPets, setClinicPets] = useState<PetProfile[]>([])

  // Filter clinics based on search term
  const filteredClinics = clinics.filter(clinic => {
    const searchLower = searchTerm.toLowerCase()
    return (
      clinic.clinicName.toLowerCase().includes(searchLower) ||
      clinic.contactInfo?.toLowerCase().includes(searchLower) ||
      clinic.accountNumber.toLowerCase().includes(searchLower)
    )
  })

  const handleViewPets = async (clinic: User) => {
    // Fetch pets that this clinic has worked on
    const response = await fetch(`/api/clinics/${clinic.id}/pets`)
    const data = await response.json()
    
    if (data.success) {
      setSelectedClinic(clinic)
      setClinicPets(data.pets)
      setShowPetsModal(true)
    }
  }

  const handleEditPet = (petId: number) => {
    setShowPetsModal(false)
    router.push(`/syndicate/pets/${petId}/edit`)
  }

  return (
    <>
      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by clinic name, contact info, or account number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Clinics Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Clinic Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClinics.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'No clinics found matching your search.' : 'No clinics found. Add your first clinic to get started.'}
                  </td>
                </tr>
              ) : (
                filteredClinics.map((clinic) => (
                  <tr key={clinic.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{clinic.clinicName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">{clinic.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{clinic.contactInfo || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {clinic.petCount > 0 ? (
                        <button
                          onClick={() => handleViewPets(clinic)}
                          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold hover:bg-blue-200 transition"
                        >
                          {clinic.petCount} {clinic.petCount === 1 ? 'pet' : 'pets'}
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">0 pets</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          clinic.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {clinic.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(clinic.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <ClinicActions clinic={clinic} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pets Modal */}
      {showPetsModal && selectedClinic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                Pets - {selectedClinic.clinicName}
              </h2>
              <p className="text-gray-600 mt-1">
                {clinicPets.length} {clinicPets.length === 1 ? 'pet' : 'pets'} registered
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {clinicPets.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No pets found for this clinic.</p>
              ) : (
                <div className="grid gap-4">
                  {clinicPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex gap-4 flex-1">
                          {pet.photoBase64 && (
                            <img
                              src={pet.photoBase64}
                              alt={pet.petName || 'Pet'}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {pet.petName || 'Unnamed Pet'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {pet.species} {pet.breed && `• ${pet.breed}`}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Owner: {pet.ownerName || 'N/A'}
                            </p>
                            {pet.ownerPhone && (
                              <p className="text-sm text-gray-500">
                                Phone: {pet.ownerPhone}
                              </p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleEditPet(pet.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200">
              <button
                onClick={() => setShowPetsModal(false)}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

