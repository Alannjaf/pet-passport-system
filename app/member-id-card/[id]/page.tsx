"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";

interface MemberData {
  id: number;
  memberId: string;
  fullNameKu: string;
  fullNameEn: string;
  titleKu: string;
  titleEn: string;
  dateOfBirth: string;
  photoBase64: string | null;
  qrCodeId: string;
  issueDate: string;
  expiryDate: string;
  cityCode: string | null;
  qrDataUrl: string;
}

export default function MemberIdCardPage() {
  const params = useParams();
  const [member, setMember] = useState<MemberData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const backCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const response = await fetch(`/api/vet-members/${params.id}/id-card`);
        if (!response.ok) {
          throw new Error("Failed to fetch member data");
        }
        const data = await response.json();
        setMember(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMember();
    }
  }, [params.id]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const handleDownloadPDF = async () => {
    if (!frontCardRef.current || !backCardRef.current || !member) return;

    setDownloading(true);

    try {
      const scale = 2; // Higher quality - 2x pixel ratio
      
      // Capture front card using html-to-image
      const frontImage = await toPng(frontCardRef.current, {
        quality: 1,
        pixelRatio: scale,
        backgroundColor: '#1a365d',
        skipFonts: true, // Skip font embedding to avoid CORS issues with Google Fonts
      });

      // Capture back card using html-to-image
      const backImage = await toPng(backCardRef.current, {
        quality: 1,
        pixelRatio: scale,
        backgroundColor: '#1a365d',
        skipFonts: true, // Skip font embedding to avoid CORS issues with Google Fonts
      });

      // Create PDF with standard credit card dimensions
      const pdfWidth = 85.6; // Standard credit card width in mm
      const pdfHeight = 53.98; // Standard credit card height in mm
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      // Add front card image - fills the entire page
      pdf.addImage(frontImage, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Add back card on second page
      pdf.addPage();
      pdf.addImage(backImage, "PNG", 0, 0, pdfWidth, pdfHeight);

      pdf.save(`vet-id-card-${member.memberId}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading ID Card...</p>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <p className="text-gray-600">{error || "Member not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Kurdistan Veterinary Syndicate ID Card
          </h1>
          <p className="text-gray-600 mt-1">Member ID: {member.memberId}</p>
        </div>

        {/* Download Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating PDF...
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                Download PDF
              </>
            )}
          </button>
        </div>

        {/* Cards Container */}
        <div className="flex flex-col items-center gap-6">
          {/* Front Card - Exact credit card ratio (85.6:53.98 = 1.5858) */}
          <div
            ref={frontCardRef}
            id="front-card"
            className="rounded-xl shadow-2xl overflow-hidden"
            style={{ 
              fontFamily: "'Noto Naskh Arabic', Arial, sans-serif",
              backgroundColor: "#1a365d",
              width: "428px",
              height: "270px",
            }}
          >
            {/* Header with Logo */}
            <div className="flex items-center p-2 gap-2">
              {/* Logo - use explicit sizing without object-fit */}
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                backgroundColor: "white",
                padding: "4px",
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img
                  src="/Logo.svg"
                  alt="Logo"
                  style={{ width: "36px", height: "36px" }}
                />
              </div>
              
              {/* Header Text */}
              <div className="flex-1 text-right">
                <div className="text-white text-[13px] font-bold leading-tight" style={{ direction: "rtl" }}>
                  سەندیکای پزیشکانی ڤێتێرنەری کوردستان
                </div>
                <div className="text-white/90 text-[11px]" style={{ direction: "rtl" }}>
                  نقابة الاطباء البيطريين كوردستان
                </div>
                <div className="text-amber-400 text-[12px] font-semibold">
                  Kurdistan Veterinary Syndicate
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/20 mx-2"></div>

            {/* Content */}
            <div className="flex p-3 gap-3" style={{ height: "calc(100% - 58px)" }}>
              {/* Photo - use background-image for proper aspect ratio handling */}
              <div style={{
                width: "80px",
                height: "107px",
                backgroundColor: "#e5e7eb",
                border: "2px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                overflow: "hidden",
                flexShrink: 0,
                backgroundImage: member.photoBase64 ? `url(${member.photoBase64})` : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}>
                {!member.photoBase64 && (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between text-right py-1">
                {/* Name */}
                <div>
                  <div className="text-white text-[13px] font-bold leading-tight" style={{ direction: "rtl" }}>
                    {member.fullNameKu}
                  </div>
                  <div className="text-white/90 text-[12px]">
                    {member.fullNameEn}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <div className="text-amber-400 text-[9px]" style={{ direction: "rtl" }}>
                    نازناوی پیشە/العنوان الوضیفی/Title
                  </div>
                  <div className="text-white text-[11px]" style={{ direction: "rtl" }}>
                    {member.titleKu}
                  </div>
                  <div className="text-white/90 text-[10px]">
                    {member.titleEn}
                  </div>
                </div>

                {/* Date of Birth */}
                <div>
                  <div className="text-amber-400 text-[9px]" style={{ direction: "rtl" }}>
                    لەدایک بوون/تاریخ المیلاد/Date of Birth
                  </div>
                  <div className="text-white text-[12px] font-medium">
                    {member.dateOfBirth}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Card - Exact credit card ratio (85.6:53.98 = 1.5858) */}
          <div
            ref={backCardRef}
            id="back-card"
            className="rounded-xl shadow-2xl overflow-hidden"
            style={{ 
              fontFamily: "'Noto Naskh Arabic', Arial, sans-serif",
              backgroundColor: "#1a365d",
              width: "428px",
              height: "270px",
            }}
          >
            {/* Header with Logo */}
            <div className="flex items-center p-2 gap-2">
              {/* Logo - use explicit sizing without object-fit */}
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.3)",
                backgroundColor: "white",
                padding: "4px",
                flexShrink: 0,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <img
                  src="/Logo.svg"
                  alt="Logo"
                  style={{ width: "36px", height: "36px" }}
                />
              </div>
              
              {/* Header Text */}
              <div className="flex-1 text-right">
                <div className="text-white text-[13px] font-bold leading-tight" style={{ direction: "rtl" }}>
                  سەندیکای پزیشکانی ڤێتێرنەری کوردستان
                </div>
                <div className="text-white/90 text-[11px]" style={{ direction: "rtl" }}>
                  نقابة الاطباء البيطريين كوردستان
                </div>
                <div className="text-amber-400 text-[12px] font-semibold">
                  Kurdistan Veterinary Syndicate
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-[1px] bg-white/20 mx-2"></div>

            {/* Content */}
            <div className="flex p-3 gap-4" style={{ height: "calc(100% - 58px)" }}>
              {/* QR Code */}
              <div className="flex flex-col items-center flex-shrink-0">
                <div style={{
                  width: "95px",
                  height: "95px",
                  backgroundColor: "white",
                  borderRadius: "4px",
                  padding: "4px",
                }}>
                  <img
                    src={member.qrDataUrl}
                    alt="QR Code"
                    style={{ width: "100%", height: "100%", display: "block" }}
                  />
                </div>
                <div className="text-white/60 text-[7px] mt-1">Scan to verify</div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-between text-right py-1">
                {/* ID Number */}
                <div>
                  <div className="text-amber-400 text-[9px]" style={{ direction: "rtl" }}>
                    ژمارەی ناسنامە/رقم الهویة/ID. No.
                  </div>
                  <div className="text-white text-[20px] font-bold">
                    {member.memberId}
                  </div>
                </div>

                {/* Date of Issue */}
                <div>
                  <div className="text-amber-400 text-[9px]" style={{ direction: "rtl" }}>
                    ڕێکەوتی دەرچوون/تاریخ الاصدار/Date of Issue
                  </div>
                  <div className="text-white text-[12px] font-medium">
                    {formatDate(member.issueDate)}
                  </div>
                </div>

                {/* Date of Expiry */}
                <div>
                  <div className="text-amber-400 text-[9px]" style={{ direction: "rtl" }}>
                    ڕێکەوتی بەسەرچوون/تاریخ النفاذ/Date of Expiry
                  </div>
                  <div className="text-white text-[12px] font-medium">
                    {formatDate(member.expiryDate)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <polyline points="6 9 6 2 18 2 18 9"></polyline>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
              <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          button {
            display: none !important;
          }
          h1, p {
            display: none !important;
          }
          .max-w-lg {
            max-width: none !important;
          }
        }
      `}</style>
    </div>
  );
}
