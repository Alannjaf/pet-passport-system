import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renewalRequests, vetMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

// POST - Reject renewal request
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
    const requestId = parseInt(id);

    if (isNaN(requestId)) {
      return NextResponse.json({ error: "Invalid request ID" }, { status: 400 });
    }

    const body = await request.json();
    const { notes } = body;

    // Get the renewal request
    const [renewalRequest] = await db
      .select()
      .from(renewalRequests)
      .where(eq(renewalRequests.id, requestId));

    if (!renewalRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    if (renewalRequest.status !== "pending") {
      return NextResponse.json(
        { error: "Request has already been processed" },
        { status: 400 }
      );
    }

    // Check if branch head has access to this member
    if (session.user.role === "branch_head") {
      const [member] = await db
        .select()
        .from(vetMembers)
        .where(eq(vetMembers.id, renewalRequest.memberId));

      if (member) {
        const assignedCityIds = session.user.assignedCityIds || [];
        if (!assignedCityIds.includes(member.cityId)) {
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
      }
    }

    // Update the request
    await db
      .update(renewalRequests)
      .set({
        status: "rejected",
        processedBy: parseInt(session.user.id) || null,
        processedAt: new Date(),
        notes: notes || null,
      })
      .where(eq(renewalRequests.id, requestId));

    return NextResponse.json({ message: "Renewal request rejected" });
  } catch (error) {
    console.error("Error rejecting renewal request:", error);
    return NextResponse.json(
      { error: "Failed to reject renewal request" },
      { status: 500 }
    );
  }
}
