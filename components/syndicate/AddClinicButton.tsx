'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddClinicButton() {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [clinicName, setClinicName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [credentials, setCredentials] = useState<{ accountNumber: string; password: string; clinicName: string } | null>(null)

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

  const handleDownloadPDF = async () => {
    if (!credentials) return

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF()
    
    // Set font
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('Pet Passport System', 105, 20, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('Clinic Login Credentials', 105, 35, { align: 'center' })
    
    // Add horizontal line
    doc.setLineWidth(0.5)
    doc.line(20, 45, 190, 45)
    
    // Clinic information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Clinic Details:', 20, 60)
    
    doc.setFont('helvetica', 'bold')
    doc.text('Clinic Name:', 20, 75)
    
    // Clinic name (note: Arabic/Kurdish characters may not render correctly with helvetica)
    doc.setFont('helvetica', 'normal')
    doc.text(credentials.clinicName, 60, 75)
    
    // Account credentials box
    doc.setFillColor(240, 240, 240)
    doc.roundedRect(20, 90, 170, 50, 3, 3, 'F')
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Account Number:', 25, 105)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.text(credentials.accountNumber, 25, 115)
    
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('Password:', 25, 128)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.text(credentials.password, 25, 138)
    
    // Important notice
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(200, 0, 0)
    doc.text('IMPORTANT NOTICE:', 20, 160)
    
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    doc.text('• Keep these credentials secure and confidential', 20, 170)
    doc.text('• Share only with authorized clinic personnel', 20, 177)
    doc.text('• This information will not be shown again', 20, 184)
    doc.text('• Contact syndicate admin for password reset if needed', 20, 191)
    
    // Login URL
    doc.setFont('helvetica', 'bold')
    doc.text('Login URL:', 20, 205)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 255)
    const loginUrl = window.location.origin + '/login'
    doc.textWithLink(loginUrl, 50, 205, { url: loginUrl })
    
    // Footer
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(9)
    doc.text('Generated on: ' + new Date().toLocaleString(), 105, 280, { align: 'center' })
    doc.text('Pet Passport System - Syndicate Administration', 105, 287, { align: 'center' })
    
    // Save the PDF - sanitize filename while preserving Unicode characters
    // Only remove filesystem-unsafe characters (path separators, control chars, etc.)
    const sanitizedName = credentials.clinicName
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // Remove filesystem-unsafe characters
      .replace(/\s+/g, '_')                  // Replace spaces with underscores
      .replace(/_+/g, '_')                   // Collapse multiple underscores
      .replace(/^_|_$/g, '')                 // Trim underscores from start/end
      || 'clinic'                            // Fallback if name becomes empty
    
    doc.save(`${sanitizedName}_credentials.pdf`)
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
                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

