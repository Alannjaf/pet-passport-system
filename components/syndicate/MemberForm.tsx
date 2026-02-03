"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Member {
  id: number;
  nameEn: string;
  nameKu: string;
  titleEn: string;
  titleKu: string;
  photoBase64: string | null;
  parentId: number | null;
  displayOrder: number | null;
}

interface MemberFormProps {
  member?: Member;
  allMembers: Member[];
  isEdit?: boolean;
}

export default function MemberForm({
  member,
  allMembers,
  isEdit = false,
}: MemberFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    nameEn: member?.nameEn || "",
    nameKu: member?.nameKu || "",
    titleEn: member?.titleEn || "",
    titleKu: member?.titleKu || "",
    photoBase64: member?.photoBase64 || "",
    parentId: member?.parentId?.toString() || "",
    displayOrder: member?.displayOrder?.toString() || "0",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Filter out self from parent options (for edit mode)
  const parentOptions = allMembers.filter((m) => m.id !== member?.id);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        photoBase64: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData((prev) => ({ ...prev, photoBase64: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload = {
        nameEn: formData.nameEn,
        nameKu: formData.nameKu,
        titleEn: formData.titleEn,
        titleKu: formData.titleKu,
        photoBase64: formData.photoBase64 || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        displayOrder: parseInt(formData.displayOrder) || 0,
      };

      const url = isEdit
        ? `/api/syndicate-members/${member?.id}`
        : "/api/syndicate-members";

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save member");
      }

      router.push("/syndicate/members");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!member) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/syndicate-members/${member.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete member");
      }

      router.push("/syndicate/members");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Photo Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photo
        </label>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-full bg-emerald-100 flex items-center justify-center overflow-hidden border-2 border-emerald-200">
            {formData.photoBase64 ? (
              <img
                src={formData.photoBase64}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                className="w-12 h-12 text-emerald-400"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {formData.photoBase64 && (
              <button
                type="button"
                onClick={removePhoto}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remove photo
              </button>
            )}
            <p className="text-xs text-gray-500">Max 2MB. JPG, PNG, or GIF.</p>
          </div>
        </div>
      </div>

      {/* Names */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="nameEn"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Name (English) *
          </label>
          <input
            id="nameEn"
            name="nameEn"
            type="text"
            value={formData.nameEn}
            onChange={handleChange}
            required
            placeholder="e.g., Dr. John Smith"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="nameKu"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Name (Kurdish) *
          </label>
          <input
            id="nameKu"
            name="nameKu"
            type="text"
            value={formData.nameKu}
            onChange={handleChange}
            required
            dir="rtl"
            placeholder="ناوی کوردی"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Titles */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="titleEn"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title/Position (English) *
          </label>
          <input
            id="titleEn"
            name="titleEn"
            type="text"
            value={formData.titleEn}
            onChange={handleChange}
            required
            placeholder="e.g., President"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor="titleKu"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title/Position (Kurdish) *
          </label>
          <input
            id="titleKu"
            name="titleKu"
            type="text"
            value={formData.titleKu}
            onChange={handleChange}
            required
            dir="rtl"
            placeholder="پلەی کوردی"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Parent/Hierarchy */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="parentId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reports To (Parent)
          </label>
          <select
            id="parentId"
            name="parentId"
            value={formData.parentId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="">None (Top Level)</option>
            {parentOptions.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nameEn} - {m.titleEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="displayOrder"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Display Order
          </label>
          <input
            id="displayOrder"
            name="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={handleChange}
            min="0"
            placeholder="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            Lower numbers appear first among siblings
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div>
          {isEdit && (
            <>
              {deleteConfirm ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-red-600">Are you sure?</span>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Yes, Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteConfirm(false)}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 text-sm"
                >
                  Delete Member
                </button>
              )}
            </>
          )}
        </div>
        <div className="flex gap-3">
          <Link
            href="/syndicate/members"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : isEdit ? "Update Member" : "Add Member"}
          </button>
        </div>
      </div>
    </form>
  );
}

