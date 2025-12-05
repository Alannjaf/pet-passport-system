import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth/auth";
import LogoutButton from "@/components/LogoutButton";

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/Logo.svg" alt="Logo" width={50} height={50} />
          <span className="text-xl font-bold text-emerald-700 hidden sm:block">Veterinarians Syndicate</span>
        </Link>
        <div className="flex gap-4 items-center">
          {session ? (
            <>
              <Link
                href={
                  session.user.role === "syndicate"
                    ? "/syndicate/dashboard"
                    : "/clinic/dashboard"
                }
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
              >
                Go to Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Login
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Image src="/Logo.svg" alt="Veterinarians Syndicate Logo" width={150} height={150} />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Veterinarians Syndicate in Kurdistan Region of Iraq
        </h2>
        <p className="text-2xl text-emerald-600 font-semibold mb-4 max-w-2xl mx-auto">
          Healthy Animals. Safe Food. Stronger Communities
        </p>
        <p className="text-lg text-gray-500 mb-8 max-w-3xl mx-auto">
          A comprehensive platform for veterinary clinics and the syndicate to
          manage pet health records, vaccinations, and digital passports.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          {session ? (
            <Link
              href={
                session.user.role === "syndicate"
                  ? "/syndicate/dashboard"
                  : "/clinic/dashboard"
              }
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-lg font-semibold"
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition text-lg font-semibold"
            >
              Clinic Login
            </Link>
          )}
          <Link
            href="/scan"
            className="px-8 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-lg font-semibold"
          >
            Scan QR Code
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-800 to-teal-700">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              <div className="flex-shrink-0">
                <div className="w-32 h-32 md:w-40 md:h-40 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
                  <Image src="/Logo.svg" alt="Logo" width={96} height={96} className="w-20 h-20 md:w-24 md:h-24" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-3xl font-bold text-white mb-4">About Us</h3>
                <p className="text-lg text-emerald-100 leading-relaxed">
                  The <span className="font-semibold text-white">Veterinarians Syndicate in Kurdistan Region of Iraq</span>, 
                  founded in <span className="font-semibold text-amber-300">1992</span>, is the professional body representing 
                  veterinarians across the Kurdistan Region of Iraq. We advance animal health and welfare, safeguard public 
                  health through a <span className="italic text-white">One Health</span> approach, and uphold professional 
                  standards in veterinary practice, education, and ethics.
                </p>
                <p className="text-emerald-200 mt-4">
                  The Syndicate serves as a trusted partner to government, academia, and industry, supporting evidence-based 
                  policy, continuous professional development, and services that protect both animals and people.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Features
        </h3>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Syndicate Features */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-3">
              For Syndicate
            </h4>
            <p className="text-gray-600">
              Manage clinics, generate QR codes, view complete history
            </p>
          </div>

          {/* Clinic Features */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-3">
              For Clinics
            </h4>
            <p className="text-gray-600">
              Create and manage pet profiles, track vaccinations
            </p>
          </div>

          {/* Pet Owner Features */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <h4 className="text-2xl font-semibold text-gray-900 mb-3">
              For Pet Owners
            </h4>
            <p className="text-gray-600">
              View pet profiles, vaccination history, and health records
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <Image src="/Logo.svg" alt="Logo" width={60} height={60} className="opacity-80" />
          </div>
          <p className="text-emerald-400 font-semibold mb-2">Veterinarians Syndicate in Kurdistan Region of Iraq</p>
          <p className="text-gray-400 text-sm mb-4">Healthy Animals. Safe Food. Stronger Communities</p>
          <p className="text-gray-500 text-sm">&copy; 2025 Veterinarians Syndicate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
