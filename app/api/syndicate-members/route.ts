import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { syndicateMembers } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { asc } from "drizzle-orm";

// GET - Fetch all members (public)
export async function GET() {
  try {
    const members = await db
      .select()
      .from(syndicateMembers)
      .orderBy(asc(syndicateMembers.displayOrder));

    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching syndicate members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

// POST - Create new member (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nameEn, nameKu, titleEn, titleKu, photoBase64, parentId, displayOrder } = body;

    if (!nameEn || !nameKu || !titleEn || !titleKu) {
      return NextResponse.json(
        { error: "Name and title in both languages are required" },
        { status: 400 }
      );
    }

    const [newMember] = await db
      .insert(syndicateMembers)
      .values({
        nameEn,
        nameKu,
        titleEn,
        titleKu,
        photoBase64: photoBase64 || null,
        parentId: parentId || null,
        displayOrder: displayOrder || 0,
      })
      .returning();

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error creating syndicate member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}

