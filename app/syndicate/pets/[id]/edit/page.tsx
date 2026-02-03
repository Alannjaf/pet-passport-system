import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import {
  petProfiles,
  petProfileVersions,
  rabiesVaccinations,
  parasiteTreatments,
  otherTreatments,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import PetProfileForm from "@/components/forms/PetProfileForm";

export default async function EditPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session || session.user.role !== "syndicate") {
    redirect("/login");
  }

  const { id } = await params;
  const profile = await db
    .select()
    .from(petProfiles)
    .where(eq(petProfiles.id, parseInt(id)))
    .limit(1);

  if (profile.length === 0) {
    redirect("/syndicate/dashboard");
  }

  // Get latest version to fetch existing treatments
  const latestVersion = await db
    .select()
    .from(petProfileVersions)
    .where(eq(petProfileVersions.profileId, profile[0].id))
    .orderBy(desc(petProfileVersions.versionNumber))
    .limit(1);

  let existingRabies: any[] = [];
  let existingParasite: any[] = [];
  let existingOther: any[] = [];

  if (latestVersion.length > 0) {
    const versionId = latestVersion[0].id;

    existingRabies = await db
      .select()
      .from(rabiesVaccinations)
      .where(eq(rabiesVaccinations.versionId, versionId));

    existingParasite = await db
      .select()
      .from(parasiteTreatments)
      .where(eq(parasiteTreatments.versionId, versionId));

    existingOther = await db
      .select()
      .from(otherTreatments)
      .where(eq(otherTreatments.versionId, versionId));
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Pet Profile</h1>
        <p className="text-gray-600 mt-2">Update the pet&apos;s information</p>
      </div>

      <PetProfileForm
        qrCodeId={profile[0].qrCodeId}
        existingProfile={profile[0]}
        existingRabiesVaccinations={existingRabies}
        existingParasiteTreatments={existingParasite}
        existingOtherTreatments={existingOther}
        session={session}
      />
    </div>
  );
}
