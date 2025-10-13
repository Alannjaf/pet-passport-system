'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PetProfile } from '@/lib/db/schema'

interface Vaccination {
  vaccinationType: string
  vaccinationDate: string
  nextDueDate?: string
  batchNumber?: string
  notes?: string
}

interface PetProfileFormProps {
  qrCodeId: string
  existingProfile?: PetProfile
  session: any
}

export default function PetProfileForm({ qrCodeId, existingProfile, session }: PetProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  // Form state
  const [petName, setPetName] = useState(existingProfile?.petName || '')
  const [species, setSpecies] = useState(existingProfile?.species || '')
  const [breed, setBreed] = useState(existingProfile?.breed || '')
  const [dateOfBirth, setDateOfBirth] = useState(existingProfile?.dateOfBirth || '')
  const [age, setAge] = useState(existingProfile?.age || '')
  const [gender, setGender] = useState(existingProfile?.gender || '')
  const [color, setColor] = useState(existingProfile?.color || '')
  const [microchipNumber, setMicrochipNumber] = useState(existingProfile?.microchipNumber || '')
  
  const [ownerName, setOwnerName] = useState(existingProfile?.ownerName || '')
  const [ownerPhone, setOwnerPhone] = useState(existingProfile?.ownerPhone || '')
  const [ownerEmail, setOwnerEmail] = useState(existingProfile?.ownerEmail || '')
  const [ownerAddress, setOwnerAddress] = useState(existingProfile?.ownerAddress || '')
  const [secondaryContact, setSecondaryContact] = useState(existingProfile?.secondaryContact || '')
  
  const [photoBase64, setPhotoBase64] = useState(existingProfile?.photoBase64 || '')
  const [allergies, setAllergies] = useState(existingProfile?.allergies || '')
  const [chronicConditions, setChronicConditions] = useState(existingProfile?.chronicConditions || '')
  const [currentMedications, setCurrentMedications] = useState(existingProfile?.currentMedications || '')
  const [additionalNotes, setAdditionalNotes] = useState(existingProfile?.additionalNotes || '')
  
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([
    { vaccinationType: '', vaccinationDate: '' }
  ])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image size must be less than 2MB')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const addVaccination = () => {
    setVaccinations([...vaccinations, { vaccinationType: '', vaccinationDate: '' }])
  }

  const removeVaccination = (index: number) => {
    setVaccinations(vaccinations.filter((_, i) => i !== index))
  }

  const updateVaccination = (index: number, field: keyof Vaccination, value: string) => {
    const updated = [...vaccinations]
    updated[index] = { ...updated[index], [field]: value }
    setVaccinations(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/pets', {
        method: existingProfile ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCodeId,
          profileId: existingProfile?.id,
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
          vaccinations: vaccinations.filter(v => v.vaccinationType && v.vaccinationDate),
        }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Pet profile saved successfully!')
        router.push(session.user.role === 'clinic' ? '/clinic/dashboard' : '/syndicate/dashboard')
      } else {
        alert('Failed to save pet profile')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      {/* Basic Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pet Name *</label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Species *</label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
            <input
              type="text"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 2 years"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Microchip Number</label>
            <input
              type="text"
              value={microchipNumber}
              onChange={(e) => setMicrochipNumber(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Owner Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Owner Information</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
            <input
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Contact</label>
            <input
              type="text"
              value={secondaryContact}
              onChange={(e) => setSecondaryContact(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <textarea
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Pet Photo */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Pet Photo</h2>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {photoBase64 && (
            <div className="mt-4">
              <img src={photoBase64} alt="Pet" className="w-32 h-32 object-cover rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* Vaccinations */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Vaccinations</h2>
        {vaccinations.map((vax, index) => (
          <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  value={vax.vaccinationType}
                  onChange={(e) => updateVaccination(index, 'vaccinationType', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="Rabies">Rabies</option>
                  <option value="Parvo">Parvo</option>
                  <option value="Distemper">Distemper</option>
                  <option value="FVRCP">FVRCP</option>
                  <option value="Bordetella">Bordetella</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  value={vax.vaccinationDate}
                  onChange={(e) => updateVaccination(index, 'vaccinationDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Next Due Date</label>
                <input
                  type="date"
                  value={vax.nextDueDate || ''}
                  onChange={(e) => updateVaccination(index, 'nextDueDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                <input
                  type="text"
                  value={vax.batchNumber || ''}
                  onChange={(e) => updateVaccination(index, 'batchNumber', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={vax.notes || ''}
                onChange={(e) => updateVaccination(index, 'notes', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            {vaccinations.length > 1 && (
              <button
                type="button"
                onClick={() => removeVaccination(index)}
                className="text-red-600 text-sm hover:text-red-700"
              >
                Remove Vaccination
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addVaccination}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          + Add Vaccination
        </button>
      </div>

      {/* Medical Information */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Allergies</label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chronic Conditions</label>
            <textarea
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Medications</label>
            <textarea
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
        >
          {loading ? 'Saving...' : existingProfile ? 'Update Profile' : 'Create Profile'}
        </button>
      </div>
    </form>
  )
}

