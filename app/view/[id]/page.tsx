import { db } from "@/lib/db";
import { petProfiles, petProfileVersions, vaccinations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import QRCode from "qrcode";

export default async function ViewPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await db
    .select()
    .from(petProfiles)
    .where(eq(petProfiles.id, parseInt(id)))
    .limit(1);

  if (profile.length === 0) {
    notFound();
  }

  const pet = profile[0];

  // Get latest version with vaccinations
  const latestVersion = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.profileId, pet.id))
    .orderBy(desc(petProfileVersions.versionNumber))
    .limit(1);

  let vaxRecords: any[] = [];
  if (latestVersion.length > 0) {
    vaxRecords = await db
      .select()
      .from(vaccinations)
      .where(eq(vaccinations.versionId, latestVersion[0].id));
  }

  // Generate QR code
  const qrCodeUrl = `${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/scan/${pet.qrCodeId}`;
  const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, { width: 200 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Pet Passport
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Pet Photo Header */}
          {pet.photoBase64 && (
            <div className="h-64 bg-gradient-to-br from-blue-400 to-purple-400 relative">
              <img
                src={pet.photoBase64}
                alt={pet.petName || "Pet"}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Pet Name */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {pet.petName}
              </h1>
              <p className="text-xl text-gray-600">
                {pet.species} {pet.breed && `• ${pet.breed}`}
              </p>
            </div>

            {/* Basic Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pet.age && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.age}
                    </p>
                  </div>
                )}
                {pet.gender && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.gender}
                    </p>
                  </div>
                )}
                {pet.color && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.color}
                    </p>
                  </div>
                )}
                {pet.microchipNumber && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Microchip</p>
                    <p className="text-lg font-semibold text-gray-900 font-mono">
                      {pet.microchipNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Owner Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Owner Information
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pet.ownerName && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerName}
                    </p>
                  </div>
                )}
                {pet.ownerPhone && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerPhone}
                    </p>
                  </div>
                )}
                {pet.ownerEmail && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerEmail}
                    </p>
                  </div>
                )}
                {pet.ownerAddress && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerAddress}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Vaccinations */}
            {vaxRecords.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Vaccination History
                </h2>
                <div className="space-y-3">
                  {vaxRecords.map((vax, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-200 p-4 rounded-lg"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">
                            {vax.vaccinationType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Administered: {vax.vaccinationDate}
                          </p>
                          {vax.nextDueDate && (
                            <p className="text-sm text-gray-600">
                              Next due: {vax.nextDueDate}
                            </p>
                          )}
                        </div>
                        {vax.nextDueDate &&
                          new Date(vax.nextDueDate) > new Date() && (
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                              Up to Date
                            </span>
                          )}
                      </div>
                      {vax.notes && (
                        <p className="text-sm text-gray-600 mt-2">
                          {vax.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Medical Info */}
            {(pet.allergies ||
              pet.chronicConditions ||
              pet.currentMedications) && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Medical Information
                </h2>
                <div className="space-y-4">
                  {pet.allergies && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">
                        Allergies
                      </p>
                      <p className="text-gray-700">{pet.allergies}</p>
                    </div>
                  )}
                  {pet.chronicConditions && (
                    <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">
                        Chronic Conditions
                      </p>
                      <p className="text-gray-700">{pet.chronicConditions}</p>
                    </div>
                  )}
                  {pet.currentMedications && (
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <p className="font-semibold text-gray-900 mb-1">
                        Current Medications
                      </p>
                      <p className="text-gray-700">{pet.currentMedications}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            {pet.additionalNotes && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                  Additional Notes
                </h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {pet.additionalNotes}
                  </p>
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                QR Code
              </h2>
              <div className="flex justify-center">
                <img src={qrCodeDataUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            </div>

            {/* Last Updated */}
            {pet.lastEditedByName && pet.lastEditedAt && (
              <div className="text-center text-sm text-gray-500 border-t pt-4">
                <p>
                  Last updated by{" "}
                  <span className="font-semibold">{pet.lastEditedByName}</span>{" "}
                  on {new Date(pet.lastEditedAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>&copy; 2025 Pet Passport System. All rights reserved.</p>
      </footer>
    </div>
  );
}
