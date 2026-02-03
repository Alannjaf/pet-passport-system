"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VetApplicationForm from "@/components/VetApplicationForm";

interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  code: string;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<{ trackingToken: string; applicationId: number } | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      if (response.ok) {
        const data = await response.json();
        // Admin sees all cities
        setCities(data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (trackingToken: string, applicationId: number) => {
    setSuccess({ trackingToken, applicationId });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Created!</h1>
          <p className="text-gray-600 mb-4">
            The application has been successfully created on behalf of the applicant.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-amber-800 mb-1">
              Please save this link to track the application:
            </p>
            <p dir="rtl" className="text-sm font-medium text-amber-800 mb-3">
              تکایە ئەم لینکە هەڵبگرە بۆ شوێنکەوتنی داواکاریەکە:
            </p>
            <div className="bg-white rounded border border-amber-200 p-3">
              <p className="font-mono text-sm text-emerald-600 break-all select-all">
                {typeof window !== "undefined" ? `${window.location.origin}/application-status/${success.trackingToken}` : `/application-status/${success.trackingToken}`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              href={`/application-status/${success.trackingToken}`}
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              View Application Status
            </Link>
            <button
              onClick={() => setSuccess(null)}
              className="inline-block px-6 py-3 border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition font-medium"
            >
              Create Another Application
            </button>
            <Link
              href="/syndicate/vet-applications"
              className="inline-block px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Back to Applications List
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cities.length === 0) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-8 rounded-xl text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-semibold mb-2">No Cities Available</h2>
          <p className="text-sm">Please add cities first before creating applications.</p>
          <Link
            href="/syndicate/cities"
            className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            Manage Cities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/syndicate/vet-applications" className="hover:text-emerald-600">
            Vet Applications
          </Link>
          <span>/</span>
          <span className="text-gray-900">New Application</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create New Application</h1>
        <p className="text-gray-600 mt-1">
          Fill out this form on behalf of a veterinary student who cannot register online.
        </p>
      </div>

      {/* Form */}
      <VetApplicationForm
        cities={cities}
        isAdminMode={true}
        onSuccess={handleSuccess}
        onCancel={() => router.push("/syndicate/vet-applications")}
      />
    </div>
  );
}
