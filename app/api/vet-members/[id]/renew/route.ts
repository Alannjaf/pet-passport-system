import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetMembers, renewalRequests } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { auditLog } from '@/lib/utils/audit';

// POST - Renew member's ID (extend expiry by 1 year)
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

    // Calculate new expiry date (1 year from now or from current expiry if not yet expired)
    const currentExpiry = new Date(existingMember.expiryDate);
    const now = new Date();
    const newIssueDate = now;
    const newExpiryDate = new Date();
    
    // If current expiry is in the future, extend from there; otherwise from today
    if (currentExpiry > now) {
      newExpiryDate.setTime(currentExpiry.getTime());
    }
    newExpiryDate.setFullYear(newExpiryDate.getFullYear() + 1);

    // Update member
    await db
      .update(vetMembers)
      .set({
        issueDate: newIssueDate,
        expiryDate: newExpiryDate,
        status: "active", // Reactivate if expired
        updatedAt: new Date(),
        updatedBy: parseInt(session.user.id) || null,
      })
      .where(eq(vetMembers.id, memberId));

    // If there's a pending renewal request, mark it as approved
    const body = await request.json().catch(() => ({}));
    if (body.renewalRequestId) {
      await db
        .update(renewalRequests)
        .set({
          status: "approved",
          processedBy: parseInt(session.user.id) || null,
          processedAt: new Date(),
        })
        .where(eq(renewalRequests.id, body.renewalRequestId));
    }

    auditLog({ action: 'member.renewed', actorId: session.user.id, actorRole: session.user.role, targetId: id, targetType: 'member' })

    return NextResponse.json({
      message: "Membership renewed successfully",
      newExpiryDate: newExpiryDate.toISOString(),
    });
  } catch (error) {
    console.error("Error renewing membership:", error);
    return NextResponse.json(
      { error: "Failed to renew membership" },
      { status: 500 }
    );
  }
}
