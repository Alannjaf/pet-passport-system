import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetApplications } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { sendEmail, applicationRejectedEmail } from "@/lib/email/send";

// POST - Reject application
export async function POST(
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

    const body = await request.json();
    const { reason } = body;

    if (!reason || reason.trim().length === 0) {
      return NextResponse.json(
        { error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    // Get the application
    const [application] = await db
      .select()
      .from(vetApplications)
      .where(eq(vetApplications.id, applicationId));

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // Check if branch head has access
    if (session.user.role === "branch_head") {
      const assignedCityIds = session.user.assignedCityIds || [];
      if (!assignedCityIds.includes(application.cityId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Check if already processed
    if (application.status !== "pending") {
      return NextResponse.json(
        { error: "Application has already been processed" },
        { status: 400 }
      );
    }

    // Update application status
    await db
      .update(vetApplications)
      .set({
        status: "rejected",
        rejectionReason: reason.trim(),
        reviewedBy: parseInt(session.user.id) || null,
        reviewedAt: new Date(),
      })
      .where(eq(vetApplications.id, applicationId));

    // Send rejection email
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const emailContent = applicationRejectedEmail(
      application.fullNameEn,
      reason.trim(),
      application.trackingToken,
      baseUrl
    );
    await sendEmail({
      to: application.emailAddress,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return NextResponse.json({
      message: "Application rejected",
    });
  } catch (error) {
    console.error("Error rejecting application:", error);
    return NextResponse.json(
      { error: "Failed to reject application" },
      { status: 500 }
    );
  }
}
