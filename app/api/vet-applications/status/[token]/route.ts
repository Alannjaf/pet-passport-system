import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetApplications, vetMembers, cities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET - Fetch application status by tracking token (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Get the application by tracking token
    const [application] = await db
      .select({
        id: vetApplications.id,
        trackingToken: vetApplications.trackingToken,
        fullNameKu: vetApplications.fullNameKu,
        fullNameEn: vetApplications.fullNameEn,
        emailAddress: vetApplications.emailAddress,
        phoneNumber: vetApplications.phoneNumber,
        cityId: vetApplications.cityId,
        status: vetApplications.status,
        rejectionReason: vetApplications.rejectionReason,
        createdAt: vetApplications.createdAt,
        reviewedAt: vetApplications.reviewedAt,
      })
      .from(vetApplications)
      .where(eq(vetApplications.trackingToken, token));

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Get city info
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, application.cityId));

    // If approved, get member info
    let member = null;
    if (application.status === "approved") {
      const [memberData] = await db
        .select({
          id: vetMembers.id,
          memberId: vetMembers.memberId,
          qrCodeId: vetMembers.qrCodeId,
          fullNameKu: vetMembers.fullNameKu,
          fullNameEn: vetMembers.fullNameEn,
          titleEn: vetMembers.titleEn,
          titleKu: vetMembers.titleKu,
          dateOfBirth: vetMembers.dateOfBirth,
          photoBase64: vetMembers.photoBase64,
          issueDate: vetMembers.issueDate,
          expiryDate: vetMembers.expiryDate,
          status: vetMembers.status,
        })
        .from(vetMembers)
        .where(eq(vetMembers.applicationId, application.id));

      member = memberData || null;
    }

    return NextResponse.json({
      application: {
        ...application,
        city,
      },
      member,
    });
  } catch (error) {
    console.error("Error fetching application status:", error);
    return NextResponse.json(
      { error: "Failed to fetch application status" },
      { status: 500 }
    );
  }
}
