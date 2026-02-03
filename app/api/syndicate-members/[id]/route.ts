import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syndicateMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";
import { validateBase64Fields } from "@/lib/utils/validation";

// Helper function to check for circular references
async function wouldCreateCycle(memberId: number, newParentId: number): Promise<boolean> {
  const allMembers = await db.select().from(syndicateMembers);
  const memberMap = new Map(allMembers.map((m) => [m.id, m]));

  // Walk up the parent chain from newParentId
  let currentId: number | null = newParentId;
  const visited = new Set<number>();

  while (currentId !== null) {
    if (currentId === memberId) {
      // Found the member in its own ancestor chain - would create a cycle
      return true;
    }
    if (visited.has(currentId)) {
      // Already visited this node - existing cycle in data (shouldn't happen)
      break;
    }
    visited.add(currentId);
    const current = memberMap.get(currentId);
    currentId = current?.parentId ?? null;
  }

  return false;
}

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

    if (!nameEn || !nameKu || !titleEn || !titleKu) {
      return NextResponse.json(
        { error: "Name and title in both languages are required" },
        { status: 400 }
      );
    }

    const normalizedParentId = parentId || null;

    // Validate parentId exists if provided
    if (normalizedParentId !== null) {
      // Cannot set self as parent
      if (normalizedParentId === memberId) {
        return NextResponse.json(
          { error: "A member cannot be their own parent" },
          { status: 400 }
        );
      }

      const [parentMember] = await db
        .select({ id: syndicateMembers.id })
        .from(syndicateMembers)
        .where(eq(syndicateMembers.id, normalizedParentId));

      if (!parentMember) {
        return NextResponse.json(
          { error: "Parent member not found" },
          { status: 400 }
        );
      }

      // Check for circular reference
      const wouldCycle = await wouldCreateCycle(memberId, normalizedParentId);
      if (wouldCycle) {
        return NextResponse.json(
          { error: "This would create a circular reference in the hierarchy" },
          { status: 400 }
        );
      }
    }

    const base64Error = validateBase64Fields(body, ['photoBase64'])
    if (base64Error) {
      return NextResponse.json({ error: base64Error }, { status: 400 })
    }

    const [updatedMember] = await db
      .update(syndicateMembers)
      .set({
        nameEn,
        nameKu,
        titleEn,
        titleKu,
        photoBase64: photoBase64 || null,
        parentId: normalizedParentId,
        displayOrder: displayOrder || 0,
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

    // Use transaction to ensure atomicity
    const result = await db.transaction(async (tx) => {
      // First, update any children to have no parent
      await tx
        .update(syndicateMembers)
        .set({ parentId: null })
        .where(eq(syndicateMembers.parentId, memberId));

      // Then delete the member
      const [deletedMember] = await tx
        .delete(syndicateMembers)
        .where(eq(syndicateMembers.id, memberId))
        .returning();

      return deletedMember;
    });

    if (!result) {
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

