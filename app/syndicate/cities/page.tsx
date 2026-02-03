"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  code: string;
  isActive: boolean;
  createdAt: string;
}

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [formData, setFormData] = useState({
    nameEn: "",
    nameKu: "",
    code: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await fetch("/api/cities");
      if (!response.ok) throw new Error("Failed to fetch cities");
      const data = await response.json();
      setCities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = editingCity
        ? `/api/cities/${editingCity.id}`
        : "/api/cities";
      const method = editingCity ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save city");
      }

      await fetchCities();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (city: City) => {
    setEditingCity(city);
    setFormData({
      nameEn: city.nameEn,
      nameKu: city.nameKu,
      code: city.code,
      isActive: city.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/cities/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete city");
      }

      await fetchCities();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  const resetForm = () => {
    setFormData({ nameEn: "", nameKu: "", code: "", isActive: true });
    setEditingCity(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cities / Branches</h1>
          <p className="text-gray-600 mt-1">
            Manage syndicate branch cities for membership applications
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add City
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError("")} className="float-right text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCity ? "Edit City" : "Add New City"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (English) *
                </label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  required
                  placeholder="e.g., Erbil"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name (Kurdish) *
                </label>
                <input
                  type="text"
                  value={formData.nameKu}
                  onChange={(e) => setFormData({ ...formData, nameKu: e.target.value })}
                  required
                  dir="rtl"
                  placeholder="هەولێر"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City Code * (2-5 uppercase letters)
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                required
                maxLength={5}
                placeholder="e.g., ERB"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Short abbreviation used for internal reference and reports
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <div className="flex gap-4">
                <label
                  className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                    formData.isActive
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={() => setFormData({ ...formData, isActive: true })}
                    className="w-4 h-4 text-emerald-600 border-gray-300 focus:ring-emerald-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Active</span>
                    <p className="text-xs text-gray-500">Visible in application form</p>
                  </div>
                </label>
                <label
                  className={`flex-1 flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition ${
                    !formData.isActive
                      ? "border-gray-500 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="isActive"
                    checked={!formData.isActive}
                    onChange={() => setFormData({ ...formData, isActive: false })}
                    className="w-4 h-4 text-gray-600 border-gray-300 focus:ring-gray-500"
                  />
                  <div>
                    <span className="font-medium text-gray-900">Inactive</span>
                    <p className="text-xs text-gray-500">Hidden from application form</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : editingCity ? "Update City" : "Add City"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cities Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name (English)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name (Kurdish)
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
            {cities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No cities added yet. Click &ldquo;Add City&rdquo; to create your first branch city.
                </td>
              </tr>
            ) : (
              cities.map((city) => (
                <tr key={city.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-mono text-sm">
                      {city.code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {city.nameEn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" dir="rtl">
                    {city.nameKu}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        city.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {city.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    {deleteConfirm === city.id ? (
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-red-600 text-xs">Delete?</span>
                        <button
                          onClick={() => handleDelete(city.id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(city)}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(city.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
