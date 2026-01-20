"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils/date";

interface City {
  nameEn: string;
  nameKu: string;
  code: string;
}

interface MemberInfo {
  id: number;
  memberId: string;
  fullNameKu: string;
  fullNameEn: string;
  titleEn: string;
  titleKu: string;
  dateOfBirth: string;
  photoBase64: string;
  issueDate: string;
  expiryDate: string;
  status: "active" | "suspended" | "expired";
  city: City | null;
  suspended?: boolean;
  message?: string;
}

interface Session {
  user?: {
    role?: string;
  };
}

export default function VerifyMemberPage({
  params,
}: {
  params: Promise<{ qrCodeId: string }>;
}) {
  const { qrCodeId } = use(params);
  const [member, setMember] = useState<MemberInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    Promise.all([fetchMember(), fetchSession()]).finally(() => setLoading(false));
  }, [qrCodeId]);

  const fetchMember = async () => {
    try {
      const response = await fetch(`/api/vet-members/qr/${qrCodeId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Member not found or invalid QR code");
        }
        throw new Error("Failed to verify member");
      }
      const data = await response.json();
      setMember(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const fetchSession = async () => {
    try {
      const response = await fetch("/api/auth/session");
      if (response.ok) {
        const data = await response.json();
        setSession(data);
      }
    } catch (err) {
      // Not logged in, that's fine
    }
  };

  const isAdmin = session?.user?.role === "syndicate" || session?.user?.role === "branch_head";

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
          <h1 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  // Suspended member
  if (member?.suspended) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-red-600 mb-2">Member Suspended</h1>
          <p className="text-gray-600">{member.message}</p>
        </div>
      </div>
    );
  }

  if (!member) return null;

  const isExpired = member.status === "expired";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Verified Member</h1>
          <p className="text-gray-600 text-sm">Veterinary Syndicate</p>
        </div>

        {/* Member Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Status Banner */}
          <div
            className={`px-6 py-3 text-center ${
              isExpired ? "bg-red-500" : "bg-emerald-500"
            }`}
          >
            <span className="text-white font-semibold text-sm uppercase">
              {isExpired ? "Expired" : "Valid"} Membership
            </span>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Photo and Basic Info */}
            <div className="flex items-start gap-4 mb-6">
              <div className="w-24 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {member.photoBase64 ? (
                  <img
                    src={member.photoBase64}
                    alt=""
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
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900">{member.fullNameEn}</h2>
                <p className="text-gray-600" dir="rtl">{member.fullNameKu}</p>
                <p className="text-emerald-600 font-medium mt-1">{member.titleEn}</p>
                <p className="text-emerald-600 text-sm" dir="rtl">{member.titleKu}</p>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 border-t border-gray-200 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Member ID</span>
                <span className="font-mono font-bold text-emerald-600">{member.memberId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Date of Birth</span>
                <span className="text-gray-900">{member.dateOfBirth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Issue Date</span>
                <span className="text-gray-900">
                  {formatDate(member.issueDate)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Expiry Date</span>
                <span className={isExpired ? "text-red-600 font-medium" : "text-gray-900"}>
                  {formatDate(member.expiryDate)}
                  {isExpired && " (Expired)"}
                </span>
              </div>
              {member.city && (
                <div className="flex justify-between">
                  <span className="text-gray-500 text-sm">Branch</span>
                  <span className="text-gray-900">
                    {member.city.code} - {member.city.nameEn}
                  </span>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            {isAdmin && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href={`/branch/members/${member.id}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Member
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Verified by Veterinary Syndicate System
        </p>
      </div>
    </div>
  );
}
