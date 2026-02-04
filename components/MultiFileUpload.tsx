"use client";

import { useRef } from "react";

interface MultiFileUploadProps {
  value: string[];
  onChange: (files: string[]) => void;
  accept: string;
  maxFiles?: number;
  label: string;
  required?: boolean;
}

export default function MultiFileUpload({
  value,
  onChange,
  accept,
  maxFiles = 5,
  label,
  required = false,
}: MultiFileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remaining = maxFiles - value.length;
    if (remaining <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remaining);
    const newBase64s: string[] = [];

    for (const file of filesToProcess) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newBase64s.push(base64);
    }

    if (newBase64s.length > 0) {
      onChange([...value, ...newBase64s]);
    }

    // Reset input so the same file can be selected again
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const isPdf = (base64: string) => base64.startsWith("data:application/pdf");

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      {/* Thumbnail Grid */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {value.map((file, index) => (
            <div
              key={index}
              className="relative w-20 h-20 rounded-lg border border-gray-200 overflow-hidden group"
            >
              {isPdf(file) ? (
                <div className="w-full h-full bg-red-50 flex flex-col items-center justify-center">
                  <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z" />
                  </svg>
                  <span className="text-xs text-red-600 font-medium mt-1">PDF</span>
                </div>
              ) : (
                <img
                  src={file}
                  alt={`File ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File Input */}
      {value.length < maxFiles && (
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          onChange={handleFileChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700"
        />
      )}

      <p className="text-xs text-gray-500 mt-1">
        Max 5MB per file. JPG, PNG, or PDF. {value.length}/{maxFiles} files uploaded.
      </p>
    </div>
  );
}
