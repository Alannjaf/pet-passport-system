import { db } from "@/lib/db";
import {
  petProfiles,
  petProfileVersions,
  rabiesVaccinations,
  parasiteTreatments,
  otherTreatments,
} from "@/lib/db/schema";
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

  // Get latest version
  const latestVersion = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.profileId, pet.id))
    .orderBy(desc(petProfileVersions.versionNumber))
    .limit(1);

  let rabiesRecords: any[] = [];
  let parasiteRecords: any[] = [];
  let otherRecords: any[] = [];

  if (latestVersion.length > 0) {
    const versionId = latestVersion[0].id;

    rabiesRecords = await db
      .select()
      .from(rabiesVaccinations)
      .where(eq(rabiesVaccinations.versionId, versionId));

    parasiteRecords = await db
      .select()
      .from(parasiteTreatments)
      .where(eq(parasiteTreatments.versionId, versionId));

    otherRecords = await db
      .select()
      .from(otherTreatments)
      .where(eq(otherTreatments.versionId, versionId));
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
        <Link
          href="/scan"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Scan Another QR
        </Link>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">PET PASSPORT</h1>
            <p className="text-lg opacity-90">
              Official Pet Health &amp; Identification Document
            </p>
          </div>

          {/* Pet Photo */}
          {pet.photoBase64 && (
            <div className="flex justify-center py-6 border-b">
              <img
                src={pet.photoBase64}
                alt={pet.petName || "Pet"}
                className="w-48 h-48 object-cover rounded-lg border-4 border-gray-200 shadow-lg"
              />
            </div>
          )}

          <div className="p-8">
            {/* Section I: Details of Ownership */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                  I
                </span>
                Details of Ownership
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pet.ownerName && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerName}
                    </p>
                  </div>
                )}
                {pet.ownerAddress && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">Address</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerAddress}
                    </p>
                  </div>
                )}
                {pet.ownerCity && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">City</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerCity}
                    </p>
                  </div>
                )}
                {pet.ownerCountry && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Country</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerCountry}
                    </p>
                  </div>
                )}
                {pet.ownerPhone && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Telephone</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.ownerPhone}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Section II: Description of Animal */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                  II
                </span>
                Description of Animal
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {pet.petName && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Name</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.petName}
                    </p>
                  </div>
                )}
                {pet.species && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Species</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.species}
                    </p>
                  </div>
                )}
                {pet.breed && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Breed</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.breed}
                    </p>
                  </div>
                )}
                {pet.gender && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Sex</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.gender}
                    </p>
                  </div>
                )}
                {pet.dateOfBirth && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date of Birth</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(pet.dateOfBirth).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {pet.color && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Colour</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {pet.color}
                    </p>
                  </div>
                )}
                {pet.notableFeatures && (
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <p className="text-sm text-gray-600 mb-1">
                      Notable or Distinguishing Features
                    </p>
                    <p className="text-gray-900">{pet.notableFeatures}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Section III: Marking of the Animal */}
            <div className="mb-8 pb-8 border-b border-gray-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                  III
                </span>
                Marking of the Animal
              </h2>

              {/* Transponder */}
              {(pet.transponderCode ||
                pet.transponderAppliedDate ||
                pet.transponderLocation) && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    A. Transponder / Microchip
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {pet.transponderCode && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Alphanumeric Code
                        </p>
                        <p className="text-lg font-semibold text-gray-900 font-mono">
                          {pet.transponderCode}
                        </p>
                      </div>
                    )}
                    {pet.transponderAppliedDate && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Date of Application/Reading
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(pet.transponderAppliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {pet.transponderLocation && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {pet.transponderLocation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Tattoo */}
              {(pet.tattooCode || pet.tattooAppliedDate || pet.tattooLocation) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    B. Tattoo
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {pet.tattooCode && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Alphanumeric Code
                        </p>
                        <p className="text-lg font-semibold text-gray-900 font-mono">
                          {pet.tattooCode}
                        </p>
                      </div>
                    )}
                    {pet.tattooAppliedDate && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          Date of Application/Reading
                        </p>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(pet.tattooAppliedDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {pet.tattooLocation && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Location</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {pet.tattooLocation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Section IV: Issuing of the Passport */}
            {(pet.issuingVetName ||
              pet.issuingVetAddress ||
              pet.issuingVetCity ||
              pet.issuingVetCountry ||
              pet.issuingVetPhone ||
              pet.issuingVetEmail) && (
              <div className="mb-8 pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                    IV
                  </span>
                  Issuing of the Passport
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {pet.issuingVetName && (
                    <div className="bg-green-50 p-4 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">
                        Authorized Veterinarian
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {pet.issuingVetName}
                      </p>
                    </div>
                  )}
                  {pet.issuingVetAddress && (
                    <div className="bg-green-50 p-4 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="text-gray-900">{pet.issuingVetAddress}</p>
                    </div>
                  )}
                  {pet.issuingVetPostalCode && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Postal Code</p>
                      <p className="text-gray-900">{pet.issuingVetPostalCode}</p>
                    </div>
                  )}
                  {pet.issuingVetCity && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">City</p>
                      <p className="text-gray-900">{pet.issuingVetCity}</p>
                    </div>
                  )}
                  {pet.issuingVetCountry && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Country</p>
                      <p className="text-gray-900">{pet.issuingVetCountry}</p>
                    </div>
                  )}
                  {pet.issuingVetPhone && (
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Telephone</p>
                      <p className="text-gray-900">{pet.issuingVetPhone}</p>
                    </div>
                  )}
                  {pet.issuingVetEmail && (
                    <div className="bg-green-50 p-4 rounded-lg md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">E-mail</p>
                      <p className="text-gray-900">{pet.issuingVetEmail}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Section V: Vaccination Against Rabies */}
            {rabiesRecords.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                    V
                  </span>
                  Vaccination Against Rabies
                </h2>
                <div className="space-y-4">
                  {rabiesRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-red-50 border border-red-200 p-4 rounded-lg"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        {record.manufacturer && (
                          <div>
                            <p className="text-sm text-gray-600">Manufacturer</p>
                            <p className="font-semibold text-gray-900">
                              {record.manufacturer}
                            </p>
                          </div>
                        )}
                        {record.vaccineName && (
                          <div>
                            <p className="text-sm text-gray-600">Vaccine Name</p>
                            <p className="font-semibold text-gray-900">
                              {record.vaccineName}
                            </p>
                          </div>
                        )}
                        {record.batchNumber && (
                          <div>
                            <p className="text-sm text-gray-600">Batch Number</p>
                            <p className="font-semibold text-gray-900">
                              {record.batchNumber}
                            </p>
                          </div>
                        )}
                        {record.vaccinationDate && (
                          <div>
                            <p className="text-sm text-gray-600">Vaccination Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.vaccinationDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.validFrom && (
                          <div>
                            <p className="text-sm text-gray-600">Valid From</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.validFrom).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.validUntil && (
                          <div>
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.authorizedVeterinarian && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">
                              Authorized Veterinarian
                            </p>
                            <p className="font-semibold text-gray-900">
                              {record.authorizedVeterinarian}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-900">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section VI: Parasites */}
            {parasiteRecords.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                    VI
                  </span>
                  Anti-Echinococcus / Other Parasite Treatments
                </h2>
                <div className="space-y-4">
                  {parasiteRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-orange-50 border border-orange-200 p-4 rounded-lg"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        {record.manufacturer && (
                          <div>
                            <p className="text-sm text-gray-600">Manufacturer</p>
                            <p className="font-semibold text-gray-900">
                              {record.manufacturer}
                            </p>
                          </div>
                        )}
                        {record.productName && (
                          <div>
                            <p className="text-sm text-gray-600">Product Name</p>
                            <p className="font-semibold text-gray-900">
                              {record.productName}
                            </p>
                          </div>
                        )}
                        {record.treatmentDate && (
                          <div>
                            <p className="text-sm text-gray-600">Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.treatmentDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.validUntil && (
                          <div>
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.authorizedVeterinarian && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">
                              Authorized Veterinarian
                            </p>
                            <p className="font-semibold text-gray-900">
                              {record.authorizedVeterinarian}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-900">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section VII: Other Treatments */}
            {otherRecords.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
                    VII
                  </span>
                  Other Vaccinations / Treatments
                </h2>
                <div className="space-y-4">
                  {otherRecords.map((record, index) => (
                    <div
                      key={index}
                      className="bg-purple-50 border border-purple-200 p-4 rounded-lg"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        {record.manufacturer && (
                          <div>
                            <p className="text-sm text-gray-600">Manufacturer</p>
                            <p className="font-semibold text-gray-900">
                              {record.manufacturer}
                            </p>
                          </div>
                        )}
                        {record.vaccineName && (
                          <div>
                            <p className="text-sm text-gray-600">Vaccine Name</p>
                            <p className="font-semibold text-gray-900">
                              {record.vaccineName}
                            </p>
                          </div>
                        )}
                        {record.batchNumber && (
                          <div>
                            <p className="text-sm text-gray-600">Batch Number</p>
                            <p className="font-semibold text-gray-900">
                              {record.batchNumber}
                            </p>
                          </div>
                        )}
                        {record.vaccinationDate && (
                          <div>
                            <p className="text-sm text-gray-600">Vaccination Date</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.vaccinationDate).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.validUntil && (
                          <div>
                            <p className="text-sm text-gray-600">Valid Until</p>
                            <p className="font-semibold text-gray-900">
                              {new Date(record.validUntil).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                        {record.authorizedVeterinarian && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">
                              Authorized Veterinarian
                            </p>
                            <p className="font-semibold text-gray-900">
                              {record.authorizedVeterinarian}
                            </p>
                          </div>
                        )}
                        {record.notes && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">Notes</p>
                            <p className="text-gray-900">{record.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Medical Information */}
            {(pet.allergies ||
              pet.chronicConditions ||
              pet.currentMedications) && (
              <div className="mb-8 pb-8 border-b border-gray-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Additional Medical Information
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

            {/* QR Code */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                Digital QR Code
              </h2>
              <div className="flex justify-center">
                <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Scan to view this passport
                  </p>
                </div>
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
