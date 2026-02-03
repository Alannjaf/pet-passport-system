import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetApplications, cities, branchAssignments, vetMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, and, inArray } from "drizzle-orm";

// GET - Fetch single application by ID (branch/admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["syndicate", "branch_head"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const [application] = await db
      .select()
      .from(vetApplications)
      .where(eq(vetApplications.id, applicationId));

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if branch head has access to this city
    if (session.user.role === "branch_head") {
      const assignedCityIds = session.user.assignedCityIds || [];
      if (!assignedCityIds.includes(application.cityId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Get city info
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, application.cityId));

    return NextResponse.json({
      ...application,
      city,
    });
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
      { status: 500 }
    );
  }
}

// PUT - Update application (syndicate/branch_head only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["syndicate", "branch_head"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(vetApplications)
      .where(eq(vetApplications.id, applicationId));

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if branch head has access to this city
    if (session.user.role === "branch_head") {
      const assignedCityIds = session.user.assignedCityIds || [];
      if (!assignedCityIds.includes(existing.cityId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();

    const [updated] = await db
      .update(vetApplications)
      .set({
        fullNameKu: body.fullNameKu,
        fullNameEn: body.fullNameEn,
        dateOfBirth: body.dateOfBirth,
        placeOfBirth: body.placeOfBirth || null,
        nationalIdNumber: body.nationalIdNumber,
        nationalIdDate: body.nationalIdDate || null,
        marriageStatus: body.marriageStatus,
        numberOfChildren: body.numberOfChildren || 0,
        bloodType: body.bloodType,
        universityDegrees: body.universityDegrees || null,
        scientificRank: body.scientificRank || null,
        collegeCertificateBase64: body.collegeCertificateBase64,
        jobLocation: body.jobLocation,
        yearOfEmployment: body.yearOfEmployment || null,
        privateWorkDetails: body.privateWorkDetails || null,
        currentLocation: body.currentLocation,
        phoneNumber: body.phoneNumber,
        emailAddress: body.emailAddress,
        cityId: body.cityId,
        nationalIdCardBase64: body.nationalIdCardBase64 || null,
        infoCardBase64: body.infoCardBase64 || null,
        recommendationLetterBase64: body.recommendationLetterBase64 || null,
        signatureBase64: body.signatureBase64,
        photoBase64: body.photoBase64,
      })
      .where(eq(vetApplications.id, applicationId))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
      { status: 500 }
    );
  }
}

// DELETE - Delete application (syndicate/branch_head only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || !["syndicate", "branch_head"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const applicationId = parseInt(id);

    if (isNaN(applicationId)) {
      return NextResponse.json({ error: "Invalid application ID" }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(vetApplications)
      .where(eq(vetApplications.id, applicationId));

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if branch head has access to this city
    if (session.user.role === "branch_head") {
      const assignedCityIds = session.user.assignedCityIds || [];
      if (!assignedCityIds.includes(existing.cityId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // If approved, also delete the associated vet member
    if (existing.status === "approved") {
      await db
        .delete(vetMembers)
        .where(eq(vetMembers.applicationId, applicationId));
    }

    await db
      .delete(vetApplications)
      .where(eq(vetApplications.id, applicationId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}
