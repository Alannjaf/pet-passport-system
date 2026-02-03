'use client'

import { useState } from 'react'
import QRCode from 'qrcode'
import { jsPDF } from 'jspdf'

export default function QRGeneratorPage() {
  const [quantity, setQuantity] = useState(10)
  const [loading, setLoading] = useState(false)
  const [qrCodes, setQrCodes] = useState<Array<{ id: string; dataUrl: string }>>([])

  const generateQRCodes = async () => {
    setLoading(true)
    try {
      // Call API to create QR codes in database
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity }),
      })

      const data = await response.json()

      if (data.success) {
        // Generate QR code images
        const codes = await Promise.all(
          data.qrCodes.map(async (qr: { qrCodeId: string }) => {
            const url = `${window.location.origin}/scan/${qr.qrCodeId}`
            const dataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 })
            return { id: qr.qrCodeId, dataUrl }
          })
        )
        setQrCodes(codes)
      } else {
        alert('Failed to generate QR codes')
      }
    } catch (error) {
      alert('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const qrSize = 50
    const cols = 3
    const rows = 4
    const marginX = (pageWidth - cols * qrSize) / (cols + 1)
    const marginY = 20

    qrCodes.forEach((qr, index) => {
      if (index > 0 && index % (cols * rows) === 0) {
        pdf.addPage()
      }

      const pageIndex = Math.floor(index / (cols * rows))
      const indexOnPage = index - pageIndex * cols * rows
      const col = indexOnPage % cols
      const row = Math.floor(indexOnPage / cols)

      const x = marginX + col * (qrSize + marginX)
      const y = marginY + row * (qrSize + marginY / 2)

      pdf.addImage(qr.dataUrl, 'PNG', x, y, qrSize, qrSize)
      pdf.setFontSize(8)
      pdf.text(qr.id.substring(0, 12), x + qrSize / 2, y + qrSize + 4, { align: 'center' })
    })

    pdf.save('pet-passport-qr-codes.pdf')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Code Generator</h1>
        <p className="text-gray-600 mt-2">Generate bulk QR codes for pet passports</p>
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="max-w-md">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of QR Codes
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(500, parseInt(e.target.value) || 1)))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            min="1"
            max="500"
          />
          <button
            onClick={generateQRCodes}
            disabled={loading}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate QR Codes'}
          </button>
        </div>
      </div>

      {/* Results */}
      {qrCodes.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Generated {qrCodes.length} QR Codes
            </h2>
            <button
              onClick={downloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Download PDF
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {qrCodes.map((qr) => (
              <div key={qr.id} className="border border-gray-200 rounded-lg p-3">
                <img src={qr.dataUrl} alt={qr.id} className="w-full" />
                <p className="text-xs text-gray-500 text-center mt-2 truncate">{qr.id}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

