"use client";

import { useState, useEffect } from "react";
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

export default function SyndicateApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [cityFilter, setCityFilter] = useState<string>("");

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [filter, cityFilter]);

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      if (response.ok) {
        const data = await response.json();
        setCities(data);
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let url = "/api/vet-applications";
      const params = new URLSearchParams();
      if (filter !== "all") params.append("status", filter);
      if (cityFilter) params.append("cityId", cityFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusColors = {
    pending: "bg-amber-100 text-amber-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vet Applications</h1>
          <p className="text-gray-600 mt-1">View all membership applications across all branches</p>
        </div>
        <Link
          href="/syndicate/vet-applications/new"
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Application
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200 w-fit">
          {(["all", "pending", "approved", "rejected"] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filter === status
                  ? "bg-emerald-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city.id} value={city.id}>
              {city.code} - {city.nameEn}
            </option>
          ))}
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No applications found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applicant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{app.fullNameEn}</p>
                      <p className="text-sm text-gray-500" dir="rtl">{app.fullNameKu}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="text-gray-900">{app.phoneNumber}</p>
                      <p className="text-gray-500">{app.emailAddress}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      {app.city?.code || "N/A"} - {app.city?.nameEn || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[app.status]}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(app.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Link
                      href={`/syndicate/vet-applications/${app.id}`}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                        app.status === "pending"
                          ? "bg-emerald-600 text-white hover:bg-emerald-700"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {app.status === "pending" ? "Review" : "View"}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
