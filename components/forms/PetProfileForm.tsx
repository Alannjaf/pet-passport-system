"use client";

import { useState, useEffect } from "react";
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
  existingRabiesVaccinations?: any[];
  existingParasiteTreatments?: any[];
  existingOtherTreatments?: any[];
  session: any;
}

export default function PetProfileForm({
  qrCodeId,
  existingProfile,
  existingRabiesVaccinations,
  existingParasiteTreatments,
  existingOtherTreatments,
  session,
}: PetProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showTattoo, setShowTattoo] = useState(!!existingProfile?.tattooCode);

  // Check if passport sections are locked
  const isLocked = existingProfile?.passportSectionsLocked === "true";
  const isClinic = session.user.role === "clinic";
  const areSectionsDisabled = isLocked && isClinic;

  // Track how many existing records there are (these are read-only for clinics)
  const [existingRabiesCount, setExistingRabiesCount] = useState(0);
  const [existingParasiteCount, setExistingParasiteCount] = useState(0);
  const [existingOtherCount, setExistingOtherCount] = useState(0);

  // Track which records are expanded (default: expand all)
  const [expandedRabies, setExpandedRabies] = useState<Set<number>>(new Set());
  const [expandedParasite, setExpandedParasite] = useState<Set<number>>(new Set());
  const [expandedOther, setExpandedOther] = useState<Set<number>>(new Set());

  const toggleRabiesExpanded = (index: number) => {
    const newExpanded = new Set(expandedRabies);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRabies(newExpanded);
  };

  const toggleParasiteExpanded = (index: number) => {
    const newExpanded = new Set(expandedParasite);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedParasite(newExpanded);
  };

  const toggleOtherExpanded = (index: number) => {
    const newExpanded = new Set(expandedOther);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedOther(newExpanded);
  };

  // Section 1: Details of Ownership
  const [ownerName, setOwnerName] = useState(existingProfile?.ownerName || "");
  const [ownerAddress, setOwnerAddress] = useState(
    existingProfile?.ownerAddress || ""
  );
  const [ownerCity, setOwnerCity] = useState(existingProfile?.ownerCity || "");
  const [ownerCountry, setOwnerCountry] = useState(
    existingProfile?.ownerCountry || ""
  );
  const [ownerPhone, setOwnerPhone] = useState(
    existingProfile?.ownerPhone || ""
  );

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
  const [tattooCode, setTattooCode] = useState(
    existingProfile?.tattooCode || ""
  );
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

  // Load existing treatments on component mount
  useEffect(() => {
    if (existingRabiesVaccinations && existingRabiesVaccinations.length > 0) {
      const loadedRabies = existingRabiesVaccinations.map((r) => ({
        manufacturer: r.manufacturer || "",
        vaccineName: r.vaccineName || "",
        batchNumber: r.batchNumber || "",
        vaccinationDate: r.vaccinationDate || "",
        validFrom: r.validFrom || "",
        validUntil: r.validUntil || "",
        authorizedVeterinarian: r.authorizedVeterinarian || "",
        notes: r.notes || "",
      }));
      setRabiesVaccinations(loadedRabies);
      setExistingRabiesCount(loadedRabies.length);
    }

    if (existingParasiteTreatments && existingParasiteTreatments.length > 0) {
      const loadedParasite = existingParasiteTreatments.map((p) => ({
        manufacturer: p.manufacturer || "",
        productName: p.productName || "",
        treatmentDate: p.treatmentDate || "",
        validUntil: p.validUntil || "",
        authorizedVeterinarian: p.authorizedVeterinarian || "",
        notes: p.notes || "",
      }));
      setParasiteTreatments(loadedParasite);
      setExistingParasiteCount(loadedParasite.length);
    }

    if (existingOtherTreatments && existingOtherTreatments.length > 0) {
      const loadedOther = existingOtherTreatments.map((o) => ({
        manufacturer: o.manufacturer || "",
        vaccineName: o.vaccineName || "",
        batchNumber: o.batchNumber || "",
        vaccinationDate: o.vaccinationDate || "",
        validUntil: o.validUntil || "",
        authorizedVeterinarian: o.authorizedVeterinarian || "",
        notes: o.notes || "",
      }));
      setOtherTreatments(loadedOther);
      setExistingOtherCount(loadedOther.length);
    }
  }, [
    existingRabiesVaccinations,
    existingParasiteTreatments,
    existingOtherTreatments,
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
        {areSectionsDisabled && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-amber-600 mt-0.5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="font-semibold text-amber-900">
                  Passport Sections Locked
                </h3>
                <p className="text-sm text-amber-800 mt-1">
                  The Owner Details, Description of Animal, Marking, and Issuing
                  of Passport sections are locked. Only the syndicate can modify
                  these fields. You can still edit medical information and add
                  new treatments/vaccinations.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Details of Ownership */}
      <div className="mb-8 pb-8 border-b border-gray-300">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
          <span className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 text-lg">
            I
          </span>
          Details of Ownership
          {areSectionsDisabled && (
            <span className="ml-3 text-sm font-normal text-amber-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Locked
            </span>
          )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              required
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              required
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              required
              disabled={areSectionsDisabled}
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
          {areSectionsDisabled && (
            <span className="ml-3 text-sm font-normal text-amber-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Locked
            </span>
          )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              required
              disabled={areSectionsDisabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Species *
            </label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              required
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sex
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notable or Distinguishing Features
            </label>
            <textarea
              value={notableFeatures}
              onChange={(e) => setNotableFeatures(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              rows={2}
              placeholder="Any distinguishing marks, scars, or features"
              disabled={areSectionsDisabled}
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
          {areSectionsDisabled && (
            <span className="ml-3 text-sm font-normal text-amber-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Locked
            </span>
          )}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                placeholder="15-digit code"
                disabled={areSectionsDisabled}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                disabled={areSectionsDisabled}
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                placeholder="e.g., Left shoulder"
                disabled={areSectionsDisabled}
              />
            </div>
          </div>
        </div>

        {/* Tattoo (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              B. Tattoo (Optional)
            </h3>
            <button
              type="button"
              onClick={() => setShowTattoo(!showTattoo)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                  disabled={areSectionsDisabled}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                  disabled={areSectionsDisabled}
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                  placeholder="e.g., Right ear"
                  disabled={areSectionsDisabled}
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
          {areSectionsDisabled && (
            <span className="ml-3 text-sm font-normal text-amber-600 flex items-center">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Locked
            </span>
          )}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
              disabled={areSectionsDisabled}
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
        {rabiesVaccinations.map((vax, index) => {
          const isExistingRecord = index < existingRabiesCount;
          const isRecordLocked = isExistingRecord && isClinic;
          const isExpanded = expandedRabies.has(index);

          return (
            <div
              key={index}
              className={`mb-4 border rounded-lg ${
                isRecordLocked
                  ? "border-amber-200 bg-amber-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Collapsible Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50"
                onClick={() => toggleRabiesExpanded(index)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRabiesExpanded(index);
                    }}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Rabies Vaccination #{index + 1}
                      {vax.vaccineName && ` - ${vax.vaccineName}`}
                    </div>
                    {!isExpanded && (
                      <div className="text-sm text-gray-600 mt-1">
                        {vax.vaccinationDate && `Date: ${vax.vaccinationDate}`}
                        {vax.validUntil && ` • Valid Until: ${vax.validUntil}`}
                        {!vax.vaccinationDate && !vax.validUntil && "Click to expand"}
                      </div>
                    )}
                  </div>
                  {isRecordLocked && (
                    <div className="flex items-center text-sm text-amber-700">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={vax.manufacturer}
                    onChange={(e) =>
                      updateRabiesVaccination(
                        index,
                        "manufacturer",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateRabiesVaccination(
                        index,
                        "vaccineName",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateRabiesVaccination(
                        index,
                        "batchNumber",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateRabiesVaccination(
                        index,
                        "vaccinationDate",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateRabiesVaccination(
                        index,
                        "validFrom",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateRabiesVaccination(
                        index,
                        "validUntil",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    rows={2}
                    disabled={isRecordLocked}
                  />
                </div>
                {rabiesVaccinations.length > 1 && !isRecordLocked && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeRabiesVaccination(index)}
                      className="text-red-600 text-sm hover:text-red-700 font-medium"
                    >
                      Remove Entry
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        );
      })}
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
        {parasiteTreatments.map((treatment, index) => {
          const isExistingRecord = index < existingParasiteCount;
          const isRecordLocked = isExistingRecord && isClinic;
          const isExpanded = expandedParasite.has(index);

          return (
            <div
              key={index}
              className={`mb-4 border rounded-lg ${
                isRecordLocked
                  ? "border-amber-200 bg-amber-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Collapsible Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50"
                onClick={() => toggleParasiteExpanded(index)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleParasiteExpanded(index);
                    }}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Parasite Treatment #{index + 1}
                      {treatment.productName && ` - ${treatment.productName}`}
                    </div>
                    {!isExpanded && (
                      <div className="text-sm text-gray-600 mt-1">
                        {treatment.treatmentDate && `Date: ${treatment.treatmentDate}`}
                        {treatment.validUntil && ` • Valid Until: ${treatment.validUntil}`}
                        {!treatment.treatmentDate && !treatment.validUntil && "Click to expand"}
                      </div>
                    )}
                  </div>
                  {isRecordLocked && (
                    <div className="flex items-center text-sm text-amber-700">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={treatment.manufacturer}
                    onChange={(e) =>
                      updateParasiteTreatment(
                        index,
                        "manufacturer",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateParasiteTreatment(
                        index,
                        "productName",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateParasiteTreatment(
                        index,
                        "treatmentDate",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateParasiteTreatment(
                        index,
                        "validUntil",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    rows={2}
                    disabled={isRecordLocked}
                  />
                </div>
                {parasiteTreatments.length > 1 && !isRecordLocked && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeParasiteTreatment(index)}
                      className="text-red-600 text-sm hover:text-red-700 font-medium"
                    >
                      Remove Entry
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        );
      })}
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
        {otherTreatments.map((treatment, index) => {
          const isExistingRecord = index < existingOtherCount;
          const isRecordLocked = isExistingRecord && isClinic;
          const isExpanded = expandedOther.has(index);

          return (
            <div
              key={index}
              className={`mb-4 border rounded-lg ${
                isRecordLocked
                  ? "border-amber-200 bg-amber-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Collapsible Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-100/50"
                onClick={() => toggleOtherExpanded(index)}
              >
                <div className="flex items-center gap-3 flex-1">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleOtherExpanded(index);
                    }}
                  >
                    <svg
                      className={`w-5 h-5 transform transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      Other Treatment #{index + 1}
                      {treatment.vaccineName && ` - ${treatment.vaccineName}`}
                    </div>
                    {!isExpanded && (
                      <div className="text-sm text-gray-600 mt-1">
                        {treatment.vaccinationDate && `Date: ${treatment.vaccinationDate}`}
                        {treatment.validUntil && ` • Valid Until: ${treatment.validUntil}`}
                        {!treatment.vaccinationDate && !treatment.validUntil && "Click to expand"}
                      </div>
                    )}
                  </div>
                  {isRecordLocked && (
                    <div className="flex items-center text-sm text-amber-700">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Locked
                    </div>
                  )}
                </div>
              </div>

              {/* Collapsible Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    value={treatment.manufacturer}
                    onChange={(e) =>
                      updateOtherTreatment(
                        index,
                        "manufacturer",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                      updateOtherTreatment(
                        index,
                        "vaccinationDate",
                        e.target.value
                      )
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    disabled={isRecordLocked}
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-600 disabled:cursor-not-allowed"
                    rows={2}
                    disabled={isRecordLocked}
                  />
                </div>
                {otherTreatments.length > 1 && !isRecordLocked && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => removeOtherTreatment(index)}
                      className="text-red-600 text-sm hover:text-red-700 font-medium"
                    >
                      Remove Entry
                    </button>
                  </div>
                )}
                </div>
              </div>
            )}
          </div>
        );
      })}
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
