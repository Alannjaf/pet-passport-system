import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
  petProfiles,
  petProfileVersions,
  vaccinations,
  rabiesVaccinations,
  parasiteTreatments,
  otherTreatments,
  qrCodes,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { validateBase64Fields } from "@/lib/utils/validation";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      qrCodeId,
      // Section 1: Owner
      ownerName,
      ownerAddress,
      ownerCity,
      ownerCountry,
      ownerPhone,
      // Section 2: Animal
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
      // Photo and medical
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      // Treatment arrays
      rabiesVaccinations: rabiesData,
      parasiteTreatments: parasiteData,
      otherTreatments: otherData,
    } = body;

    const base64Error = validateBase64Fields(body, ['photoBase64'])
    if (base64Error) {
      return NextResponse.json({ error: base64Error }, { status: 400 })
    }

    // Check if all required passport sections are filled to lock them
    // Note: Marking (transponder/tattoo) is optional and not required for locking
    const hasOwnerDetails = ownerName && ownerAddress;
    const hasAnimalDescription = petName && species;
    const hasIssuingInfo = issuingVetName || issuingVetAddress;

    // Lock sections if clinic is creating and all required sections are filled
    const shouldLock =
      session.user.role === "clinic" &&
      hasOwnerDetails &&
      hasAnimalDescription &&
      hasIssuingInfo;

    // Create pet profile
    const newProfile = await db
      .insert(petProfiles)
      .values({
        qrCodeId,
        // Owner
        ownerName,
        ownerAddress,
        ownerCity,
        ownerCountry,
        ownerPhone,
        // Animal
        petName,
        species,
        breed,
        gender,
        dateOfBirth,
        color,
        notableFeatures,
        // Marking
        transponderCode,
        transponderAppliedDate,
        transponderLocation,
        tattooCode,
        tattooAppliedDate,
        tattooLocation,
        // Issuing Clinic
        issuingVetName,
        issuingVetAddress,
        issuingVetPostalCode,
        issuingVetCity,
        issuingVetCountry,
        issuingVetPhone,
        issuingVetEmail,
        // Other
        photoBase64,
        allergies,
        chronicConditions,
        currentMedications,
        lastEditedBy: session.user.id,
        lastEditedByName: session.user.name,
        lastEditedAt: new Date(),
        passportSectionsLocked: shouldLock ? "true" : "false",
      })
      .returning();

    const profileId = newProfile[0].id;

    // Create first version
    const petData = {
      ownerName,
      ownerAddress,
      ownerCity,
      ownerCountry,
      ownerPhone,
      petName,
      species,
      breed,
      gender,
      dateOfBirth,
      color,
      notableFeatures,
      transponderCode,
      transponderAppliedDate,
      transponderLocation,
      tattooCode,
      tattooAppliedDate,
      tattooLocation,
      issuingVetName,
      issuingVetAddress,
      issuingVetPostalCode,
      issuingVetCity,
      issuingVetCountry,
      issuingVetPhone,
      issuingVetEmail,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
    };

    const newVersion = await db
      .insert(petProfileVersions)
      .values({
        profileId,
        versionNumber: 1,
        editorId:
          session.user.role === "clinic" ? parseInt(session.user.id) : null,
        editorName: session.user.name || "Unknown",
        editorRole: session.user.role,
        petData,
        changeDescription: "Initial creation",
      })
      .returning();

    const versionId = newVersion[0].id;

    // Insert rabies vaccinations
    if (rabiesData && rabiesData.length > 0) {
      const rabiesRecords = rabiesData.map((r: any) => ({
        versionId,
        manufacturer: r.manufacturer || null,
        vaccineName: r.vaccineName || null,
        batchNumber: r.batchNumber || null,
        vaccinationDate: r.vaccinationDate || null,
        validFrom: r.validFrom || null,
        validUntil: r.validUntil || null,
        authorizedVeterinarian: r.authorizedVeterinarian || null,
        notes: r.notes || null,
      }));
      await db.insert(rabiesVaccinations).values(rabiesRecords);
    }

    // Insert parasite treatments
    if (parasiteData && parasiteData.length > 0) {
      const parasiteRecords = parasiteData.map((p: any) => ({
        versionId,
        manufacturer: p.manufacturer || null,
        productName: p.productName || null,
        treatmentDate: p.treatmentDate || null,
        validUntil: p.validUntil || null,
        authorizedVeterinarian: p.authorizedVeterinarian || null,
        notes: p.notes || null,
      }));
      await db.insert(parasiteTreatments).values(parasiteRecords);
    }

    // Insert other treatments
    if (otherData && otherData.length > 0) {
      const otherRecords = otherData.map((o: any) => ({
        versionId,
        manufacturer: o.manufacturer || null,
        vaccineName: o.vaccineName || null,
        batchNumber: o.batchNumber || null,
        vaccinationDate: o.vaccinationDate || null,
        validUntil: o.validUntil || null,
        authorizedVeterinarian: o.authorizedVeterinarian || null,
        notes: o.notes || null,
      }));
      await db.insert(otherTreatments).values(otherRecords);
    }

    // Update QR code status
    await db
      .update(qrCodes)
      .set({ status: "filled" })
      .where(eq(qrCodes.qrCodeId, qrCodeId));

    return NextResponse.json({ success: true, profileId });
  } catch (error) {
    console.error("Error creating pet profile:", error);
    return NextResponse.json(
      { error: "Failed to create pet profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      profileId,
      // Section 1: Owner
      ownerName,
      ownerAddress,
      ownerCity,
      ownerCountry,
      ownerPhone,
      // Section 2: Animal
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
      // Photo and medical
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
      // Treatment arrays
      rabiesVaccinations: rabiesData,
      parasiteTreatments: parasiteData,
      otherTreatments: otherData,
    } = body;

    // Get existing profile to check lock status
    const existingProfile = await db
      .select()
      .from(petProfiles)
      .where(eq(petProfiles.id, profileId))
      .limit(1);

    if (existingProfile.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const base64Error = validateBase64Fields(body, ['photoBase64'])
    if (base64Error) {
      return NextResponse.json({ error: base64Error }, { status: 400 })
    }

    const isLocked = existingProfile[0].passportSectionsLocked === "true";
    const isClinic = session.user.role === "clinic";

    // Prepare update data
    let updateData: any = {
      lastEditedBy: session.user.id,
      lastEditedByName: session.user.name,
      lastEditedAt: new Date(),
      updatedAt: new Date(),
    };

    // If locked and user is clinic, only allow non-locked fields to be updated
    if (isLocked && isClinic) {
      // Clinics can only edit medical data when locked (owner details are also locked)
      updateData = {
        ...updateData,
        // Medical info (always editable)
        photoBase64,
        allergies,
        chronicConditions,
        currentMedications,
      };
    } else {
      // Syndicate or unlocked: can edit everything
      updateData = {
        ...updateData,
        // Owner
        ownerName,
        ownerAddress,
        ownerCity,
        ownerCountry,
        ownerPhone,
        // Animal (locked for clinics after first submission)
        petName,
        species,
        breed,
        gender,
        dateOfBirth,
        color,
        notableFeatures,
        // Marking (locked for clinics after first submission)
        transponderCode,
        transponderAppliedDate,
        transponderLocation,
        tattooCode,
        tattooAppliedDate,
        tattooLocation,
        // Issuing Clinic (locked for clinics after first submission)
        issuingVetName,
        issuingVetAddress,
        issuingVetPostalCode,
        issuingVetCity,
        issuingVetCountry,
        issuingVetPhone,
        issuingVetEmail,
        // Other
        photoBase64,
        allergies,
        chronicConditions,
        currentMedications,
      };

      // If it's unlocked and clinic is updating with all required sections filled, lock it
      // Note: Marking (transponder/tattoo) is optional and not required for locking
      if (!isLocked && isClinic) {
        const hasOwnerDetails = ownerName && ownerAddress;
        const hasAnimalDescription = petName && species;
        const hasIssuingInfo = issuingVetName || issuingVetAddress;

        if (
          hasOwnerDetails &&
          hasAnimalDescription &&
          hasIssuingInfo
        ) {
          updateData.passportSectionsLocked = "true";
        }
      }
    }

    // Update pet profile
    await db
      .update(petProfiles)
      .set(updateData)
      .where(eq(petProfiles.id, profileId));

    // Get latest version number
    const latestVersion = await db
      .select()
      .from(petProfileVersions)
      .where(eq(petProfileVersions.profileId, profileId))
      .orderBy(desc(petProfileVersions.versionNumber))
      .limit(1);

    const newVersionNumber =
      latestVersion.length > 0 ? latestVersion[0].versionNumber + 1 : 1;

    // Create new version
    const petData = {
      ownerName,
      ownerAddress,
      ownerCity,
      ownerCountry,
      ownerPhone,
      petName,
      species,
      breed,
      gender,
      dateOfBirth,
      color,
      notableFeatures,
      transponderCode,
      transponderAppliedDate,
      transponderLocation,
      tattooCode,
      tattooAppliedDate,
      tattooLocation,
      issuingVetName,
      issuingVetAddress,
      issuingVetPostalCode,
      issuingVetCity,
      issuingVetCountry,
      issuingVetPhone,
      issuingVetEmail,
      photoBase64,
      allergies,
      chronicConditions,
      currentMedications,
    };

    const newVersion = await db
      .insert(petProfileVersions)
      .values({
        profileId,
        versionNumber: newVersionNumber,
        editorId:
          session.user.role === "clinic" ? parseInt(session.user.id) : null,
        editorName: session.user.name || "Unknown",
        editorRole: session.user.role,
        petData,
        changeDescription: `Updated by ${session.user.name}`,
      })
      .returning();

    const versionId = newVersion[0].id;

    // Insert rabies vaccinations
    if (rabiesData && rabiesData.length > 0) {
      const rabiesRecords = rabiesData.map((r: any) => ({
        versionId,
        manufacturer: r.manufacturer || null,
        vaccineName: r.vaccineName || null,
        batchNumber: r.batchNumber || null,
        vaccinationDate: r.vaccinationDate || null,
        validFrom: r.validFrom || null,
        validUntil: r.validUntil || null,
        authorizedVeterinarian: r.authorizedVeterinarian || null,
        notes: r.notes || null,
      }));
      await db.insert(rabiesVaccinations).values(rabiesRecords);
    }

    // Insert parasite treatments
    if (parasiteData && parasiteData.length > 0) {
      const parasiteRecords = parasiteData.map((p: any) => ({
        versionId,
        manufacturer: p.manufacturer || null,
        productName: p.productName || null,
        treatmentDate: p.treatmentDate || null,
        validUntil: p.validUntil || null,
        authorizedVeterinarian: p.authorizedVeterinarian || null,
        notes: p.notes || null,
      }));
      await db.insert(parasiteTreatments).values(parasiteRecords);
    }

    // Insert other treatments
    if (otherData && otherData.length > 0) {
      const otherRecords = otherData.map((o: any) => ({
        versionId,
        manufacturer: o.manufacturer || null,
        vaccineName: o.vaccineName || null,
        batchNumber: o.batchNumber || null,
        vaccinationDate: o.vaccinationDate || null,
        validUntil: o.validUntil || null,
        authorizedVeterinarian: o.authorizedVeterinarian || null,
        notes: o.notes || null,
      }));
      await db.insert(otherTreatments).values(otherRecords);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating pet profile:", error);
    return NextResponse.json(
      { error: "Failed to update pet profile" },
      { status: 500 }
    );
  }
}
