"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import VetApplicationForm from "@/components/VetApplicationForm";

interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  code: string;
}

export default function EditApplicationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([fetchCities(), fetchApplication()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    }
  };

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/vet-applications/${id}`);
      if (!response.ok) throw new Error("Failed to fetch application");
      const data = await response.json();
      setApplication(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{error || "Application not found"}</p>
        <Link
          href="/syndicate/vet-applications"
          className="text-emerald-600 hover:underline mt-2 inline-block"
        >
          Back to Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link
            href="/syndicate/vet-applications"
            className="hover:text-emerald-600"
          >
            Vet Applications
          </Link>
          <span>/</span>
          <Link
            href={`/syndicate/vet-applications/${id}`}
            className="hover:text-emerald-600"
          >
            #{id}
          </Link>
          <span>/</span>
          <span className="text-gray-900">Edit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Application</h1>
        <p className="text-gray-600 mt-1">
          Update the application details for {application.fullNameEn}
        </p>
      </div>

      {/* Form */}
      <VetApplicationForm
        cities={cities}
        isAdminMode={true}
        initialData={application}
        onSuccess={() => router.push(`/syndicate/vet-applications/${id}`)}
        onCancel={() => router.push(`/syndicate/vet-applications/${id}`)}
      />
    </div>
  );
}
