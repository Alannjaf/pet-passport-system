"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import SignatureCanvas from "@/components/SignatureCanvas";
import DatePicker from "@/components/DatePicker";

interface City {
  id: number;
  nameEn: string;
  nameKu: string;
  code: string;
}

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const MARRIAGE_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const EDUCATION_LEVELS = ["Bachelor's Degree", "Master's Degree", "PhD", "Diploma"];
const JOB_TYPES = ["Government", "Private Sector", "Self-employed", "Unemployed", "Student"];

export default function ApplyPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingToken, setTrackingToken] = useState("");
  const [error, setError] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    // Personal Info
    fullNameKu: "",
    fullNameEn: "",
    dateOfBirth: "",
    nationalIdNumber: "",
    nationalIdIssueDate: "",
    nationality: "Iraqi",
    marriageStatus: "",
    numberOfChildren: 0,
    bloodType: "",
    // Education & Work
    collegeFinishDate: "",
    educationLevel: "",
    yearsAsEmployee: 0,
    jobType: "",
    jobLocation: "",
    // Contact
    currentLocation: "",
    phoneNumber: "",
    emailAddress: "",
    cityId: "",
    // Files (base64)
    collegeCertificateBase64: "",
    photoBase64: "",
    // Verification
    signatureBase64: "",
    confirmationChecked: false,
  });

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
      console.error("Error fetching cities:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "photoBase64" | "collegeCertificateBase64"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = field === "photoBase64" 
      ? ["image/jpeg", "image/png", "image/jpg"]
      : ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    
    if (!allowedTypes.includes(file.type)) {
      setError(`Invalid file type. Allowed: ${field === "photoBase64" ? "JPG, PNG" : "JPG, PNG, PDF"}`);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File must be less than 5MB");
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        [field]: reader.result as string,
      }));
    };
    reader.readAsDataURL(file);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation
    if (!formData.confirmationChecked) {
      setError("You must confirm that all information is true and correct");
      setSubmitting(false);
      return;
    }

    if (!formData.signatureBase64) {
      setError("Please provide your digital signature");
      setSubmitting(false);
      return;
    }

    if (!formData.photoBase64) {
      setError("Please upload your ID photo");
      setSubmitting(false);
      return;
    }

    if (!formData.collegeCertificateBase64) {
      setError("Please upload your college certificate");
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/vet-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cityId: parseInt(formData.cityId),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit application");
      }

      const result = await response.json();
      setTrackingToken(result.trackingToken);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
            <p className="text-gray-600 mb-6">
              Your application has been submitted successfully. You will receive an email with a link to track your application status.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-500 mb-1">Your Tracking Token:</p>
              <p className="font-mono text-lg text-emerald-600 break-all">{trackingToken}</p>
            </div>
            <Link
              href={`/application-status/${trackingToken}`}
              className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
            >
              Check Application Status
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Veterinary Syndicate Membership Application
          </h1>
          <p className="text-gray-600">
            داواکاری ئەندامەتی سەندیکای پزیشکانی ئاژەڵان
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Personal Information / زانیاری کەسی
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (Kurdish - 4 names) * / ناوی تەواو بە کوردی
                </label>
                <input
                  type="text"
                  name="fullNameKu"
                  value={formData.fullNameKu}
                  onChange={handleChange}
                  required
                  dir="rtl"
                  placeholder="ناوی یەکەم، ناوی دووەم، ناوی سێیەم، ناوی چوارەم"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name (English - 4 names) * / ناوی تەواو بە ئینگلیزی
                </label>
                <input
                  type="text"
                  name="fullNameEn"
                  value={formData.fullNameEn}
                  onChange={handleChange}
                  required
                  placeholder="First Name, Second Name, Third Name, Fourth Name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth * / بەرواری لەدایکبوون
                </label>
                <DatePicker
                  value={formData.dateOfBirth}
                  onChange={(value) => setFormData((prev) => ({ ...prev, dateOfBirth: value }))}
                  placeholder="DD/MM/YYYY"
                  maxDate={new Date()}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID Number * / ژمارەی ناسنامە
                </label>
                <input
                  type="text"
                  name="nationalIdNumber"
                  value={formData.nationalIdNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 12345678901"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID Issue Date * / بەرواری دەرچوونی ناسنامە
                </label>
                <DatePicker
                  value={formData.nationalIdIssueDate}
                  onChange={(value) => setFormData((prev) => ({ ...prev, nationalIdIssueDate: value }))}
                  placeholder="DD/MM/YYYY"
                  maxDate={new Date()}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationality * / نەتەوە
                </label>
                <input
                  type="text"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marriage Status * / باری هاوسەرگیری
                </label>
                <select
                  name="marriageStatus"
                  value={formData.marriageStatus}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select status</option>
                  {MARRIAGE_STATUSES.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Children / ژمارەی منداڵ
                </label>
                <input
                  type="number"
                  name="numberOfChildren"
                  value={formData.numberOfChildren}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Type * / جۆری خوێن
                </label>
                <select
                  name="bloodType"
                  value={formData.bloodType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select blood type</option>
                  {BLOOD_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Education & Work */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Education & Work / خوێندن و کار
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Certificate * / بڕوانامەی کۆلێژ
                </label>
                <input
                  ref={certInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => handleFileChange(e, "collegeCertificateBase64")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700"
                />
                <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG, or PDF</p>
                {formData.collegeCertificateBase64 && (
                  <p className="text-xs text-emerald-600 mt-1">Certificate uploaded</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  College Finish Date * / بەرواری تەواوکردنی کۆلێژ
                </label>
                <DatePicker
                  value={formData.collegeFinishDate}
                  onChange={(value) => setFormData((prev) => ({ ...prev, collegeFinishDate: value }))}
                  placeholder="DD/MM/YYYY"
                  maxDate={new Date()}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education Level * / ئاستی خوێندن
                </label>
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select level</option>
                  {EDUCATION_LEVELS.map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Years as Employee / ساڵانی کارمەندی
                </label>
                <input
                  type="number"
                  name="yearsAsEmployee"
                  value={formData.yearsAsEmployee}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type of Job * / جۆری کار
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select job type</option>
                  {JOB_TYPES.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Location * / شوێنی کار
                </label>
                <input
                  type="text"
                  name="jobLocation"
                  value={formData.jobLocation}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Erbil Veterinary Hospital"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Contact Information / زانیاری پەیوەندی
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Location * / شوێنی ئێستا
                </label>
                <input
                  type="text"
                  name="currentLocation"
                  value={formData.currentLocation}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Erbil, Ankawa"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number * / ژمارەی مۆبایل
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  required
                  placeholder="e.g., 07501234567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address * / ئیمەیل
                </label>
                <input
                  type="email"
                  name="emailAddress"
                  value={formData.emailAddress}
                  onChange={handleChange}
                  required
                  placeholder="e.g., name@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City/Branch * / شار/لق
                </label>
                <select
                  name="cityId"
                  value={formData.cityId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">Select city</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.nameEn} - {city.nameKu}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              ID Photo / وێنەی ناسنامەیی
            </h2>
            <div className="flex items-start gap-6">
              <div className="w-32 h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                {formData.photoBase64 ? (
                  <img
                    src={formData.photoBase64}
                    alt="ID Photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, "photoBase64")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:bg-emerald-50 file:text-emerald-700"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Upload a passport-style photo. Max 5MB. JPG or PNG format.
                </p>
                {formData.photoBase64 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, photoBase64: "" }));
                      if (photoInputRef.current) photoInputRef.current.value = "";
                    }}
                    className="text-sm text-red-600 hover:text-red-700 mt-2"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Signature & Confirmation */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
              Declaration & Signature / ڕاگەیاندن و واژوو
            </h2>
            
            <div className="mb-6">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="confirmationChecked"
                  checked={formData.confirmationChecked}
                  onChange={handleChange}
                  className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 mt-0.5"
                />
                <span className="text-sm text-gray-700">
                  I confirm that all the information provided above is true and correct to the best of my knowledge. I understand that providing false information may result in rejection of my application or revocation of membership.
                  <br />
                  <span dir="rtl" className="block mt-2 text-right">
                    من پشتڕاست دەکەمەوە کە هەموو ئەو زانیاریانەی کە لە سەرەوە دابینم کراوە ڕاست و دروستن. من تێدەگەم کە پێدانی زانیاری هەڵە دەبێتە هۆی ڕەتکردنەوەی داواکاریەکەم یان هەڵوەشاندنەوەی ئەندامێتیم.
                  </span>
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Digital Signature * / واژووی دیجیتاڵی
              </label>
              <SignatureCanvas
                value={formData.signatureBase64}
                onChange={(signature) =>
                  setFormData((prev) => ({ ...prev, signatureBase64: signature }))
                }
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                "Submit Application / ناردنی داواکاری"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
