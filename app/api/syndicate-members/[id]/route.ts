import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syndicateMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

// GET - Fetch single member
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const memberId = parseInt(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const [member] = await db
      .select()
      .from(syndicateMembers)
      .where(eq(syndicateMembers.id, memberId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching syndicate member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

// PUT - Update member (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    const body = await request.json();
    const { nameEn, nameKu, titleEn, titleKu, photoBase64, parentId, displayOrder } = body;

    const [updatedMember] = await db
      .update(syndicateMembers)
      .set({
        nameEn,
        nameKu,
        titleEn,
        titleKu,
        photoBase64,
        parentId,
        displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(syndicateMembers.id, memberId))
      .returning();

    if (!updatedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error("Error updating syndicate member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}

// DELETE - Delete member (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const memberId = parseInt(id);

    if (isNaN(memberId)) {
      return NextResponse.json({ error: "Invalid member ID" }, { status: 400 });
    }

    // First, update any children to have no parent (or you could prevent deletion if children exist)
    await db
      .update(syndicateMembers)
      .set({ parentId: null })
      .where(eq(syndicateMembers.parentId, memberId));

    const [deletedMember] = await db
      .delete(syndicateMembers)
      .where(eq(syndicateMembers.id, memberId))
      .returning();

    if (!deletedMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member deleted successfully" });
  } catch (error) {
    console.error("Error deleting syndicate member:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}

