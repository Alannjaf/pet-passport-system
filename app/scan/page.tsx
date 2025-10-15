"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import QRScanner from "@/components/QRScanner";

export default function ScanEntryPage() {
  const router = useRouter();
  const [qrInput, setQrInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  const handleQRScan = (decodedText: string) => {
    // Extract QR code ID from URL or use as-is
    let qrCodeId = decodedText.trim();

    // If it's a URL, extract the ID
    if (qrCodeId.includes("/scan/")) {
      const parts = qrCodeId.split("/scan/");
      qrCodeId = parts[1].split("?")[0];
    }

    router.push(`/scan/${qrCodeId}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qrInput.trim()) {
      handleQRScan(qrInput);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-blue-600">Pet Passport</h1>
          </Link>
          <p className="text-gray-600 mt-2">Scan QR Code</p>
        </div>

        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="mb-6 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Scan QR Code
            </h2>
            <p className="text-gray-600 text-sm">
              Use your camera to scan the pet passport QR code
            </p>
          </div>

          {!showManualInput ? (
            <>
              <QRScanner onScanSuccess={handleQRScan} />

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowManualInput(true)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  Or enter QR code manually →
                </button>
              </div>
            </>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    QR Code ID or URL
                  </label>
                  <input
                    type="text"
                    value={qrInput}
                    onChange={(e) => setQrInput(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter QR code or URL"
                    required
                    autoFocus
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Continue
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowManualInput(false)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  ← Back to camera scanner
                </button>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
