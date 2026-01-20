import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

// POST - Suspend or unsuspend member
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
    const memberId = parseInt(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const body = await request.json();
    const { suspend, reason } = body;

    // Get existing member
    const [existingMember] = await db
      .select()
      .from(vetMembers)
      .where(eq(vetMembers.id, memberId));

    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if branch head has access
    if (session.user.role === "branch_head") {
      const assignedCityIds = session.user.assignedCityIds || [];
      if (!assignedCityIds.includes(existingMember.cityId)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    if (suspend) {
      // Suspend member
      if (!reason || reason.trim().length === 0) {
        return NextResponse.json(
          { error: "Suspension reason is required" },
          { status: 400 }
        );
      }

      await db
        .update(vetMembers)
        .set({
          status: "suspended",
          suspensionReason: reason.trim(),
          updatedAt: new Date(),
          updatedBy: parseInt(session.user.id) || null,
        })
        .where(eq(vetMembers.id, memberId));

      return NextResponse.json({ message: "Member suspended successfully" });
    } else {
      // Unsuspend (reactivate) member
      await db
        .update(vetMembers)
        .set({
          status: "active",
          suspensionReason: null,
          updatedAt: new Date(),
          updatedBy: parseInt(session.user.id) || null,
        })
        .where(eq(vetMembers.id, memberId));

      return NextResponse.json({ message: "Member reactivated successfully" });
    }
  } catch (error) {
    console.error("Error suspending/unsuspending member:", error);
    return NextResponse.json(
      { error: "Failed to update member status" },
      { status: 500 }
    );
  }
}
