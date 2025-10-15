"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PetProfile } from "@/lib/db/schema";

interface RabiesVaccination {
  manufacturer: string;
  vaccineName: string;
  batchNumber: string;
  vaccinationDate: string;
  validFrom: string;
  validUntil: string;
  authorizedVeterinarian: string;
  notes: string;
}

interface ParasiteTreatment {
  manufacturer: string;
  productName: string;
  treatmentDate: string;
  validUntil: string;
  authorizedVeterinarian: string;
  notes: string;
}

interface OtherTreatment {
  manufacturer: string;
  vaccineName: string;
  batchNumber: string;
  vaccinationDate: string;
  validUntil: string;
  authorizedVeterinarian: string;
  notes: string;
}

interface PetProfileFormProps {
  qrCodeId: string;
  existingProfile?: PetProfile;
  session: any;
}

export default function PetProfileForm({
  qrCodeId,
  existingProfile,
  session,
}: PetProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTattoo, setShowTattoo] = useState(!!existingProfile?.tattooCode);

  // Section 1: Details of Ownership
  const [ownerName, setOwnerName] = useState(existingProfile?.ownerName || "");
  const [ownerAddress, setOwnerAddress] = useState(
    existingProfile?.ownerAddress || ""
  );
  const [ownerCity, setOwnerCity] = useState(existingProfile?.ownerCity || "");
  const [ownerCountry, setOwnerCountry] = useState(
    existingProfile?.ownerCountry || ""
  );
  const [ownerPhone, setOwnerPhone] = useState(existingProfile?.ownerPhone || "");

  // Section 2: Description of Animal
  const [petName, setPetName] = useState(existingProfile?.petName || "");
  const [species, setSpecies] = useState(existingProfile?.species || "");
  const [breed, setBreed] = useState(existingProfile?.breed || "");
  const [gender, setGender] = useState(existingProfile?.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    existingProfile?.dateOfBirth || ""
  );
  const [color, setColor] = useState(existingProfile?.color || "");
  const [notableFeatures, setNotableFeatures] = useState(
    existingProfile?.notableFeatures || ""
  );

  // Section 3: Marking of Animal
  const [transponderCode, setTransponderCode] = useState(
    existingProfile?.transponderCode || ""
  );
  const [transponderAppliedDate, setTransponderAppliedDate] = useState(
    existingProfile?.transponderAppliedDate || ""
  );
  const [transponderLocation, setTransponderLocation] = useState(
    existingProfile?.transponderLocation || ""
  );
  const [tattooCode, setTattooCode] = useState(existingProfile?.tattooCode || "");
  const [tattooAppliedDate, setTattooAppliedDate] = useState(
    existingProfile?.tattooAppliedDate || ""
  );
  const [tattooLocation, setTattooLocation] = useState(
    existingProfile?.tattooLocation || ""
  );

  // Section 4: Issuing of the Passport
  const [issuingVetName, setIssuingVetName] = useState(
    existingProfile?.issuingVetName || session.user.name || ""
  );
  const [issuingVetAddress, setIssuingVetAddress] = useState(
    existingProfile?.issuingVetAddress || ""
  );
  const [issuingVetPostalCode, setIssuingVetPostalCode] = useState(
    existingProfile?.issuingVetPostalCode || ""
  );
  const [issuingVetCity, setIssuingVetCity] = useState(
    existingProfile?.issuingVetCity || ""
  );
  const [issuingVetCountry, setIssuingVetCountry] = useState(
    existingProfile?.issuingVetCountry || ""
  );
  const [issuingVetPhone, setIssuingVetPhone] = useState(
    existingProfile?.issuingVetPhone || session.user.contactInfo || ""
  );
  const [issuingVetEmail, setIssuingVetEmail] = useState(
    existingProfile?.issuingVetEmail || ""
  );

  // Section 5: Vaccination Against Rabies
  const [rabiesVaccinations, setRabiesVaccinations] = useState<
    RabiesVaccination[]
  >([
    {
      manufacturer: "",
      vaccineName: "",
      batchNumber: "",
      vaccinationDate: "",
      validFrom: "",
      validUntil: "",
      authorizedVeterinarian: "",
      notes: "",
    },
  ]);

  // Section 6: Parasites
  const [parasiteTreatments, setParasiteTreatments] = useState<
    ParasiteTreatment[]
  >([
    {
      manufacturer: "",
      productName: "",
      treatmentDate: "",
      validUntil: "",
      authorizedVeterinarian: "",
      notes: "",
    },
  ]);

  // Section 7: Other Treatments
  const [otherTreatments, setOtherTreatments] = useState<OtherTreatment[]>([
    {
      manufacturer: "",
      vaccineName: "",
      batchNumber: "",
      vaccinationDate: "",
      validUntil: "",
      authorizedVeterinarian: "",
      notes: "",
    },
  ]);

  // Pet Photo
  const [photoBase64, setPhotoBase64] = useState(
    existingProfile?.photoBase64 || ""
  );

  // Other medical info (keeping for backward compatibility)
  const [allergies, setAllergies] = useState(existingProfile?.allergies || "");
  const [chronicConditions, setChronicConditions] = useState(
    existingProfile?.chronicConditions || ""
  );
  const [currentMedications, setCurrentMedications] = useState(
    existingProfile?.currentMedications || ""
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Rabies vaccination handlers
  const addRabiesVaccination = () => {
    setRabiesVaccinations([
      ...rabiesVaccinations,
      {
        manufacturer: "",
        vaccineName: "",
        batchNumber: "",
        vaccinationDate: "",
        validFrom: "",
        validUntil: "",
        authorizedVeterinarian: "",
        notes: "",
      },
    ]);
  };

  const removeRabiesVaccination = (index: number) => {
    setRabiesVaccinations(rabiesVaccinations.filter((_, i) => i !== index));
  };

  const updateRabiesVaccination = (
    index: number,
    field: keyof RabiesVaccination,
    value: string
  ) => {
    const updated = [...rabiesVaccinations];
    updated[index] = { ...updated[index], [field]: value };
    setRabiesVaccinations(updated);
  };

  // Parasite treatment handlers
  const addParasiteTreatment = () => {
    setParasiteTreatments([
      ...parasiteTreatments,
      {
        manufacturer: "",
        productName: "",
        treatmentDate: "",
        validUntil: "",
        authorizedVeterinarian: "",
        notes: "",
      },
    ]);
  };

  const removeParasiteTreatment = (index: number) => {
    setParasiteTreatments(parasiteTreatments.filter((_, i) => i !== index));
  };

  const updateParasiteTreatment = (
    index: number,
    field: keyof ParasiteTreatment,
    value: string
  ) => {
    const updated = [...parasiteTreatments];
    updated[index] = { ...updated[index], [field]: value };
    setParasiteTreatments(updated);
  };

  // Other treatment handlers
  const addOtherTreatment = () => {
    setOtherTreatments([
      ...otherTreatments,
      {
        manufacturer: "",
        vaccineName: "",
        batchNumber: "",
        vaccinationDate: "",
        validUntil: "",
        authorizedVeterinarian: "",
        notes: "",
      },
    ]);
  };

  const removeOtherTreatment = (index: number) => {
    setOtherTreatments(otherTreatments.filter((_, i) => i !== index));
  };

  const updateOtherTreatment = (
    index: number,
    field: keyof OtherTreatment,
    value: string
  ) => {
    const updated = [...otherTreatments];
    updated[index] = { ...updated[index], [field]: value };
    setOtherTreatments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/pets", {
        method: existingProfile ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          qrCodeId,
          profileId: existingProfile?.id,
          // Section 1: Ownership
          ownerName,
          ownerAddress,
          ownerCity,
          ownerCountry,
          ownerPhone,
          // Section 2: Animal Description
          petName,
          species,
          breed,
          gender,
          dateOfBirth,
          color,
          notableFeatures,
          // Section 3: Marking
          transponderCode,
          transponderAppliedDate,
          transponderLocation,
          tattooCode,
          tattooAppliedDate,
          tattooLocation,
          // Section 4: Issuing Clinic
          issuingVetName,
          issuingVetAddress,
          issuingVetPostalCode,
          issuingVetCity,
          issuingVetCountry,
          issuingVetPhone,
          issuingVetEmail,
          // Photo
          photoBase64,
          // Medical info
          allergies,
          chronicConditions,
          currentMedications,
          // Treatment arrays (filter out empty ones)
          rabiesVaccinations: rabiesVaccinations.filter(
            (v) => v.manufacturer || v.vaccineName || v.vaccinationDate
          ),
          parasiteTreatments: parasiteTreatments.filter(
            (t) => t.manufacturer || t.productName || t.treatmentDate
          ),
          otherTreatments: otherTreatments.filter(
            (t) => t.manufacturer || t.vaccineName || t.vaccinationDate
          ),
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Pet profile saved successfully!");
        router.push(
          session.user.role === "clinic"
            ? "/clinic/dashboard"
            : "/syndicate/dashboard"
        );
      } else {
        alert("Failed to save pet profile");
      }
    } catch (error) {
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-6xl mx-auto"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pet Passport Form</h1>
        <p className="text-gray-600 mt-2">
          Complete all sections according to official passport requirements
        </p>
      </div>

      {/* Section 1: Details of Ownership */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            I
          </span>
          Details of Ownership
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={ownerCity}
              onChange={(e) => setOwnerCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={ownerCountry}
              onChange={(e) => setOwnerCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telephone Number *
            </label>
            <input
              type="tel"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
      </div>

      {/* Section 2: Description of Animal */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            II
          </span>
          Description of Animal
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Species *
            </label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select species</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Bird">Bird</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Ferret">Ferret</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Breed
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sex
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date of Birth
            </label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Colour
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notable or Distinguishing Features
            </label>
            <textarea
              value={notableFeatures}
              onChange={(e) => setNotableFeatures(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="Any distinguishing marks, scars, or features"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Marking of Animal */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            III
          </span>
          Marking of the Animal
        </h2>

        {/* Transponder (Microchip) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            A. Transponder / Microchip
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alphanumeric Code
              </label>
              <input
                type="text"
                value={transponderCode}
                onChange={(e) => setTransponderCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="15-digit code"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Application/Reading
              </label>
              <input
                type="date"
                value={transponderAppliedDate}
                onChange={(e) => setTransponderAppliedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location of Transponder
              </label>
              <input
                type="text"
                value={transponderLocation}
                onChange={(e) => setTransponderLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Left shoulder"
              />
            </div>
          </div>
        </div>

        {/* Tattoo (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">B. Tattoo (Optional)</h3>
            <button
              type="button"
              onClick={() => setShowTattoo(!showTattoo)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition"
            >
              {showTattoo ? "Hide" : "Show"} Tattoo Section
            </button>
          </div>
          {showTattoo && (
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alphanumeric Code
                </label>
                <input
                  type="text"
                  value={tattooCode}
                  onChange={(e) => setTattooCode(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Application/Reading
                </label>
                <input
                  type="date"
                  value={tattooAppliedDate}
                  onChange={(e) => setTattooAppliedDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location of Tattoo
                </label>
                <input
                  type="text"
                  value={tattooLocation}
                  onChange={(e) => setTattooLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Right ear"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Issuing of the Passport */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            IV
          </span>
          Issuing of the Passport
        </h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name of Authorized Veterinarian
            </label>
            <input
              type="text"
              value={issuingVetName}
              onChange={(e) => setIssuingVetName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={issuingVetAddress}
              onChange={(e) => setIssuingVetAddress(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Postal Code
            </label>
            <input
              type="text"
              value={issuingVetPostalCode}
              onChange={(e) => setIssuingVetPostalCode(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              City
            </label>
            <input
              type="text"
              value={issuingVetCity}
              onChange={(e) => setIssuingVetCity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <input
              type="text"
              value={issuingVetCountry}
              onChange={(e) => setIssuingVetCountry(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telephone Number
            </label>
            <input
              type="tel"
              value={issuingVetPhone}
              onChange={(e) => setIssuingVetPhone(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={issuingVetEmail}
              onChange={(e) => setIssuingVetEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Vaccination Against Rabies */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            V
          </span>
          Vaccination Against Rabies
        </h2>
        {rabiesVaccinations.map((vax, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={vax.manufacturer}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "manufacturer", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Vaccine
                </label>
                <input
                  type="text"
                  value={vax.vaccineName}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "vaccineName", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={vax.batchNumber}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "batchNumber", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaccination Date
                </label>
                <input
                  type="date"
                  value={vax.vaccinationDate}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "vaccinationDate", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid From
                </label>
                <input
                  type="date"
                  value={vax.validFrom}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "validFrom", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={vax.validUntil}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "validUntil", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authorized Veterinarian
                </label>
                <input
                  type="text"
                  value={vax.authorizedVeterinarian}
                  onChange={(e) =>
                    updateRabiesVaccination(
                      index,
                      "authorizedVeterinarian",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={vax.notes}
                  onChange={(e) =>
                    updateRabiesVaccination(index, "notes", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            {rabiesVaccinations.length > 1 && (
              <button
                type="button"
                onClick={() => removeRabiesVaccination(index)}
                className="text-red-600 text-sm hover:text-red-700 font-medium"
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRabiesVaccination}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Add Rabies Vaccination
        </button>
      </div>

      {/* Section 6: Parasites */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            VI
          </span>
          Anti-Echinococcus Treatment / Other Treatments Against Parasites
        </h2>
        {parasiteTreatments.map((treatment, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={treatment.manufacturer}
                  onChange={(e) =>
                    updateParasiteTreatment(index, "manufacturer", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  value={treatment.productName}
                  onChange={(e) =>
                    updateParasiteTreatment(index, "productName", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={treatment.treatmentDate}
                  onChange={(e) =>
                    updateParasiteTreatment(index, "treatmentDate", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={treatment.validUntil}
                  onChange={(e) =>
                    updateParasiteTreatment(index, "validUntil", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authorized Veterinarian
                </label>
                <input
                  type="text"
                  value={treatment.authorizedVeterinarian}
                  onChange={(e) =>
                    updateParasiteTreatment(
                      index,
                      "authorizedVeterinarian",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={treatment.notes}
                  onChange={(e) =>
                    updateParasiteTreatment(index, "notes", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            {parasiteTreatments.length > 1 && (
              <button
                type="button"
                onClick={() => removeParasiteTreatment(index)}
                className="text-red-600 text-sm hover:text-red-700 font-medium"
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addParasiteTreatment}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Add Parasite Treatment
        </button>
      </div>

      {/* Section 7: Other Treatments */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            VII
          </span>
          Other Vaccinations / Treatments
        </h2>
        {otherTreatments.map((treatment, index) => (
          <div
            key={index}
            className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <div className="grid md:grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={treatment.manufacturer}
                  onChange={(e) =>
                    updateOtherTreatment(index, "manufacturer", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name of Vaccine
                </label>
                <input
                  type="text"
                  value={treatment.vaccineName}
                  onChange={(e) =>
                    updateOtherTreatment(index, "vaccineName", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={treatment.batchNumber}
                  onChange={(e) =>
                    updateOtherTreatment(index, "batchNumber", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vaccination Date
                </label>
                <input
                  type="date"
                  value={treatment.vaccinationDate}
                  onChange={(e) =>
                    updateOtherTreatment(index, "vaccinationDate", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valid Until
                </label>
                <input
                  type="date"
                  value={treatment.validUntil}
                  onChange={(e) =>
                    updateOtherTreatment(index, "validUntil", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authorized Veterinarian
                </label>
                <input
                  type="text"
                  value={treatment.authorizedVeterinarian}
                  onChange={(e) =>
                    updateOtherTreatment(
                      index,
                      "authorizedVeterinarian",
                      e.target.value
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={treatment.notes}
                  onChange={(e) =>
                    updateOtherTreatment(index, "notes", e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            </div>
            {otherTreatments.length > 1 && (
              <button
                type="button"
                onClick={() => removeOtherTreatment(index)}
                className="text-red-600 text-sm hover:text-red-700 font-medium"
              >
                Remove Entry
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addOtherTreatment}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          + Add Other Treatment
        </button>
      </div>

      {/* Pet Photo Section */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Pet Photo</h2>
        <div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {photoBase64 && (
            <div className="mt-4">
              <img
                src={photoBase64}
                alt="Pet"
                className="w-48 h-48 object-cover rounded-lg border-2 border-gray-300"
              />
            </div>
          )}
        </div>
      </div>

      {/* Additional Medical Information */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Additional Medical Information
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allergies
            </label>
            <textarea
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chronic Conditions
            </label>
            <textarea
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Medications
            </label>
            <textarea
              value={currentMedications}
              onChange={(e) => setCurrentMedications(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={2}
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4 pt-6 border-t border-gray-300">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 flex-1"
        >
          {loading
            ? "Saving..."
            : existingProfile
            ? "Update Pet Passport"
            : "Create Pet Passport"}
        </button>
      </div>
    </form>
  );
}
