"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  code: string;
}

interface Application {
  id: number;
  trackingToken: string;
  fullNameKu: string;
  fullNameEn: string;
  dateOfBirth: string;
  nationalIdNumber: string;
  nationalIdIssueDate: string;
  nationality: string;
  marriageStatus: string;
  numberOfChildren: number;
  bloodType: string;
  collegeCertificateBase64: string;
  collegeFinishDate: string;
  educationLevel: string;
  yearsAsEmployee: number;
  jobType: string;
  jobLocation: string;
  currentLocation: string;
  phoneNumber: string;
  emailAddress: string;
  cityId: number;
  confirmationChecked: boolean;
  signatureBase64: string;
  photoBase64: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  city: City | null;
}

export default function AdminApplicationReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [titleEn, setTitleEn] = useState("Veterinarian");
  const [titleKu, setTitleKu] = useState("پزیشکی ئاژەڵان");

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/vet-applications/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch application");
      }
      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!application) return;
    setProcessing(true);
    setError("");

    try {
      const response = await fetch(`/api/vet-applications/${id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleEn, titleKu }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to approve application");
      }

      router.push("/syndicate/vet-applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!application || !rejectionReason.trim()) return;
    setProcessing(true);
    setError("");

    try {
      const response = await fetch(`/api/vet-applications/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to reject application");
      }

      router.push("/syndicate/vet-applications");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadCertificate = () => {
    if (!application?.collegeCertificateBase64) return;
    
    // Extract the base64 data and mime type
    const matches = application.collegeCertificateBase64.match(/^data:(.+);base64,(.+)$/);
    if (!matches) return;
    
    const mimeType = matches[1];
    const base64Data = matches[2];
    
    // Convert base64 to blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${application.fullNameEn.replace(/\s+/g, '-')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Application not found</p>
        <Link href="/syndicate/vet-applications" className="text-emerald-600 hover:underline mt-2 inline-block">
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link
            href="/syndicate/vet-applications"
            className="text-emerald-600 hover:text-emerald-700 text-sm mb-2 inline-flex items-center gap-1"
          >
            ← Back to Applications
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Application Review</h1>
          <p className="text-gray-600 mt-1">
            Review application details and approve or reject
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            application.status === "pending"
              ? "bg-amber-100 text-amber-800"
              : application.status === "approved"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {application.status}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Personal Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name (English)</p>
                <p className="font-medium text-gray-900">{application.fullNameEn}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Full Name (Kurdish)</p>
                <p className="font-medium text-gray-900" dir="rtl">{application.fullNameKu}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Birth</p>
                <p className="font-medium text-gray-900">{application.dateOfBirth}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">National ID Number</p>
                <p className="font-medium text-gray-900">{application.nationalIdNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">National ID Issue Date</p>
                <p className="font-medium text-gray-900">{application.nationalIdIssueDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Nationality</p>
                <p className="font-medium text-gray-900">{application.nationality}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Marriage Status</p>
                <p className="font-medium text-gray-900">{application.marriageStatus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Number of Children</p>
                <p className="font-medium text-gray-900">{application.numberOfChildren}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Blood Type</p>
                <p className="font-medium text-gray-900">{application.bloodType}</p>
              </div>
            </div>
          </div>

          {/* Education & Work */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Education & Work
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Education Level</p>
                <p className="font-medium text-gray-900">{application.educationLevel}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">College Finish Date</p>
                <p className="font-medium text-gray-900">{application.collegeFinishDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Years as Employee</p>
                <p className="font-medium text-gray-900">{application.yearsAsEmployee}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Job Type</p>
                <p className="font-medium text-gray-900">{application.jobType}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Job Location</p>
                <p className="font-medium text-gray-900">{application.jobLocation}</p>
              </div>
            </div>
            {application.collegeCertificateBase64 && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">College Certificate</p>
                {application.collegeCertificateBase64.startsWith("data:image") ? (
                  <img
                    src={application.collegeCertificateBase64}
                    alt="College Certificate"
                    className="max-w-full h-auto max-h-96 rounded-lg border border-gray-200"
                  />
                ) : (
                  <button
                    onClick={handleDownloadCertificate}
                    className="text-emerald-600 hover:text-emerald-700 underline flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Certificate (PDF)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Contact Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Current Location</p>
                <p className="font-medium text-gray-900">{application.currentLocation}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">City/Branch</p>
                <p className="font-medium text-gray-900">
                  {application.city?.nameEn} ({application.city?.code})
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="font-medium text-gray-900">{application.phoneNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="font-medium text-gray-900">{application.emailAddress}</p>
              </div>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Digital Signature
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {application.signatureBase64 && (
                <img
                  src={application.signatureBase64}
                  alt="Digital Signature"
                  className="max-h-24"
                />
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              <span className={application.confirmationChecked ? "text-green-600" : "text-red-600"}>
                {application.confirmationChecked ? "✓" : "✗"}
              </span>{" "}
              Applicant has confirmed all information is true and correct
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Photo */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Applicant Photo
            </h2>
            <div className="aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              {application.photoBase64 ? (
                <img
                  src={application.photoBase64}
                  alt="Applicant"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Application Info */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Application Info
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="font-medium text-gray-900">
                  {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
              {application.reviewedAt && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed</p>
                  <p className="font-medium text-gray-900">
                    {new Date(application.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500">Tracking Token</p>
                <p className="font-mono text-xs text-gray-600 break-all">
                  {application.trackingToken}
                </p>
              </div>
            </div>
          </div>

          {/* Actions (only for pending) */}
          {application.status === "pending" && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Review Actions
              </h2>

              {/* Title fields for approval */}
              <div className="space-y-3 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (Kurdish)
                  </label>
                  <input
                    type="text"
                    value={titleKu}
                    onChange={(e) => setTitleKu(e.target.value)}
                    dir="rtl"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleApprove}
                  disabled={processing}
                  className="w-full px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
                >
                  {processing ? "Processing..." : "Approve Application"}
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={processing}
                  className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
                >
                  Reject Application
                </button>
              </div>
            </div>
          )}

          {/* Rejection reason (if rejected) */}
          {application.status === "rejected" && application.rejectionReason && (
            <div className="bg-red-50 rounded-xl p-6 border border-red-200">
              <h2 className="text-lg font-semibold text-red-800 mb-2">
                Rejection Reason
              </h2>
              <p className="text-red-700">{application.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Reject Application
            </h2>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this application. This will be sent to the applicant.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              placeholder="Enter rejection reason..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectionReason.trim() || processing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
