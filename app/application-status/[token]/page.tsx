"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

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
  emailAddress: string;
  phoneNumber: string;
  cityId: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  city: City | null;
}

interface Member {
  id: number;
  memberId: string;
  qrCodeId: string;
  fullNameKu: string;
  fullNameEn: string;
  titleEn: string;
  titleKu: string;
  dateOfBirth: string;
  photoBase64: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "suspended" | "expired";
}

interface StatusData {
  application: Application;
  member: Member | null;
}

export default function ApplicationStatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renewalRequested, setRenewalRequested] = useState(false);
  const [requestingRenewal, setRequestingRenewal] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [token]);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`/api/vet-applications/status/${token}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Application not found. Please check your tracking token.");
        }
        throw new Error("Failed to fetch application status");
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const requestRenewal = async () => {
    if (!data?.member) return;
    setRequestingRenewal(true);

    try {
      const response = await fetch("/api/renewal-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: data.member.id }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Failed to request renewal");
      }

      setRenewalRequested(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setRequestingRenewal(false);
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/apply"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Submit a new application
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { application, member } = data;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Application Status</h1>
          <p className="text-gray-600 mt-1">باری داواکاری</p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
          {/* Status Banner */}
          <div
            className={`px-6 py-4 ${
              application.status === "approved"
                ? "bg-emerald-500"
                : application.status === "rejected"
                ? "bg-red-500"
                : "bg-amber-500"
            }`}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                {application.status === "approved" ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : application.status === "rejected" ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <div>
                  <p className="font-semibold text-lg capitalize">{application.status}</p>
                  <p className="text-sm opacity-90">
                    {application.status === "approved"
                      ? "Your application has been approved"
                      : application.status === "rejected"
                      ? "Your application was not approved"
                      : "Your application is being reviewed"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Info */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Applicant Name</p>
                <p className="font-medium text-gray-900">{application.fullNameEn}</p>
                <p className="text-gray-600" dir="rtl">{application.fullNameKu}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Branch / City</p>
                <p className="font-medium text-gray-900">
                  {application.city?.nameEn || "N/A"}
                </p>
                <p className="text-gray-600" dir="rtl">
                  {application.city?.nameKu || ""}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Submitted On</p>
                <p className="font-medium text-gray-900">
                  {formatDate(application.createdAt)}
                </p>
              </div>
              {application.reviewedAt && (
                <div>
                  <p className="text-sm text-gray-500">Reviewed On</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(application.reviewedAt)}
                  </p>
                </div>
              )}
            </div>

            {/* Rejection Reason */}
            {application.status === "rejected" && application.rejectionReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-red-800 mb-1">Reason for Rejection:</p>
                <p className="text-red-700">{application.rejectionReason}</p>
              </div>
            )}

            {/* Tracking Token */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-500 mb-1">Tracking Token</p>
              <p className="font-mono text-sm text-gray-700 break-all">{application.trackingToken}</p>
            </div>
          </div>
        </div>

        {/* Member Card (if approved) */}
        {member && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="bg-emerald-600 px-6 py-4">
              <h2 className="text-white font-semibold text-lg">Membership Details</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-6">
                {/* Photo */}
                <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {member.photoBase64 ? (
                    <img
                      src={member.photoBase64}
                      alt="Member"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{member.fullNameEn}</h3>
                  <p className="text-gray-600" dir="rtl">{member.fullNameKu}</p>
                  <p className="text-emerald-600 font-medium">{member.titleEn}</p>

                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Member ID</p>
                      <p className="font-mono font-semibold text-emerald-600">{member.memberId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Status</p>
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full font-medium ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : member.status === "suspended"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Issue Date</p>
                      <p className="text-sm text-gray-900">
                        {formatDate(member.issueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                      <p className={`text-sm ${isExpired(member.expiryDate) ? "text-red-600 font-medium" : isExpiringSoon(member.expiryDate) ? "text-amber-600 font-medium" : "text-gray-900"}`}>
                        {formatDate(member.expiryDate)}
                        {isExpired(member.expiryDate) && " (Expired)"}
                        {isExpiringSoon(member.expiryDate) && " (Expiring Soon)"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Actions */}
              {((isExpiringSoon(member.expiryDate) || isExpired(member.expiryDate)) || renewalRequested) && (
              <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-3">
                {(isExpiringSoon(member.expiryDate) || isExpired(member.expiryDate)) && !renewalRequested && (
                  <button
                    onClick={requestRenewal}
                    disabled={requestingRenewal}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {requestingRenewal ? "Requesting..." : "Request Renewal"}
                  </button>
                )}

                {renewalRequested && (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Renewal Requested
                  </span>
                )}
              </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
