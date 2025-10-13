'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddClinicButton() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [clinicName, setClinicName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ accountNumber: string; password: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicName, contactInfo }),
      })

      const data = await response.json()

      if (data.success) {
        setCredentials(data.credentials)
        setClinicName('')
        setContactInfo('')
      } else {
        alert('Failed to create clinic')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setCredentials(null)
    router.refresh()
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        + Add New Clinic
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            {!credentials ? (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Add New Clinic</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clinic Name *
                    </label>
                    <input
                      type="text"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Information
                    </label>
                    <input
                      type="text"
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Phone, email, etc."
                    />
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                      disabled={loading}
                    >
                      {loading ? 'Creating...' : 'Create Clinic'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-green-600 mb-4">✓ Clinic Created!</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-700 mb-3">
                    Please save these credentials. They will not be shown again.
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-600">Account Number</p>
                      <p className="font-mono font-bold text-gray-900">{credentials.accountNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Password</p>
                      <p className="font-mono font-bold text-gray-900">{credentials.password}</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

