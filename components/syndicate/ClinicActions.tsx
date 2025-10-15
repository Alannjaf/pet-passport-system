'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@/lib/db/schema'

export default function ClinicActions({ clinic }: { clinic: User }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [editClinicName, setEditClinicName] = useState(clinic.clinicName)
  const [editContactInfo, setEditContactInfo] = useState(clinic.contactInfo || '')

  const handleBlock = async () => {
    if (!confirm(`Are you sure you want to ${clinic.status === 'active' ? 'block' : 'unblock'} this clinic?`)) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clinics/${clinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: clinic.status === 'active' ? 'block' : 'unblock' }),
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to update clinic')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this clinic? This action cannot be undone.')) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clinics/${clinic.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        router.refresh()
      } else {
        alert('Failed to delete clinic')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/clinics/${clinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password' }),
      })

      const data = await response.json()

      if (data.success) {
        setNewPassword(data.newPassword)
        setShowPasswordModal(true)
      } else {
        alert('Failed to reset password')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/api/clinics/${clinic.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'edit',
          clinicName: editClinicName,
          contactInfo: editContactInfo
        }),
      })

      const data = await response.json()

      if (data.success) {
        setShowEditModal(false)
        router.refresh()
      } else {
        alert('Failed to update clinic')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <button
          onClick={() => setShowEditModal(true)}
          disabled={loading}
          className="px-3 py-1 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200 transition disabled:opacity-50"
        >
          Edit
        </button>
        <button
          onClick={handleBlock}
          disabled={loading}
          className={`px-3 py-1 rounded text-sm font-medium transition ${
            clinic.status === 'active'
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          } disabled:opacity-50`}
        >
          {clinic.status === 'active' ? 'Block' : 'Unblock'}
        </button>
        <button
          onClick={handleResetPassword}
          disabled={loading}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm font-medium hover:bg-blue-200 transition disabled:opacity-50"
        >
          Reset
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium hover:bg-gray-200 transition disabled:opacity-50"
        >
          Delete
        </button>
      </div>

      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">✓ Password Reset!</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-700 mb-3">
                New password for {clinic.clinicName}:
              </p>
              <div>
                <p className="text-xs text-gray-600">Password</p>
                <p className="font-mono font-bold text-gray-900 text-lg">{newPassword}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowPasswordModal(false)
                setNewPassword('')
              }}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Clinic</h2>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Clinic Name *
                </label>
                <input
                  type="text"
                  value={editClinicName}
                  onChange={(e) => setEditClinicName(e.target.value)}
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
                  value={editContactInfo}
                  onChange={(e) => setEditContactInfo(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Phone, email, etc."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false)
                    setEditClinicName(clinic.clinicName)
                    setEditContactInfo(clinic.contactInfo || '')
                  }}
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
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

