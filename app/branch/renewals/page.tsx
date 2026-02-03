"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils/date";

interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  code: string;
}

interface Member {
  id: number;
  memberId: string;
  fullNameKu: string;
  fullNameEn: string;
  expiryDate: string;
  city: City | null;
}

interface RenewalRequest {
  id: number;
  memberId: number;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  processedAt: string | null;
  notes: string | null;
  member: Member | null;
}

export default function BranchRenewalsPage() {
  const [requests, setRequests] = useState<RenewalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const url = filter === "all"
        ? "/api/renewal-requests"
        : `/api/renewal-requests?status=${filter}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching renewal requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: RenewalRequest) => {
    if (!request.member) return;
    setProcessing(request.id);

    try {
      const response = await fetch(`/api/vet-members/${request.member.id}/renew`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ renewalRequestId: request.id }),
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error approving renewal:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (request: RenewalRequest) => {
    if (!request.member) return;
    setProcessing(request.id);

    try {
      const response = await fetch(`/api/renewal-requests/${request.id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Renewal request rejected by branch" }),
      });

      if (response.ok) {
        await fetchRequests();
      }
    } catch (error) {
      console.error("Error rejecting renewal:", error);
    } finally {
      setProcessing(null);
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
          <h1 className="text-2xl font-bold text-gray-900">Renewal Requests</h1>
          <p className="text-gray-600 mt-1">Process membership renewal requests</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200 w-fit">
        {(["pending", "approved", "rejected", "all"] as const).map((status) => (
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

      {/* Requests Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No {filter === "all" ? "" : filter} renewal requests found
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Expiry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requested
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{request.member?.fullNameEn || "N/A"}</p>
                      <p className="text-sm text-gray-500">{request.member?.city?.nameEn || ""}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-emerald-600 font-semibold">
                      {request.member?.memberId || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {request.member?.expiryDate
                      ? formatDate(request.member.expiryDate)
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(request.requestedAt)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${statusColors[request.status]}`}>
                      {request.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {request.status === "pending" ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleApprove(request)}
                          disabled={processing === request.id}
                          className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                        >
                          {processing === request.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => handleReject(request)}
                          disabled={processing === request.id}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {request.processedAt
                          ? `Processed ${formatDate(request.processedAt)}`
                          : "—"}
                      </span>
                    )}
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
