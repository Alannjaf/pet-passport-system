import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, branchAssignments, cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// GET - Fetch single branch head user with assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const [user] = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        role: adminUsers.role,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .where(and(eq(adminUsers.id, userId), eq(adminUsers.role, "branch_head")));

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get city assignments
    const assignments = await db
      .select({
        cityId: branchAssignments.cityId,
        cityNameEn: cities.nameEn,
        cityNameKu: cities.nameKu,
        cityCode: cities.code,
      })
      .from(branchAssignments)
      .innerJoin(cities, eq(branchAssignments.cityId, cities.id))
      .where(eq(branchAssignments.userId, userId));

    return NextResponse.json({
      ...user,
      assignedCities: assignments,
    });
  } catch (error) {
    console.error("Error fetching branch user:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch user" },
      { status: 500 }
    );
  }
}

// PUT - Update branch head user
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
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await request.json();
    const { username, password, cityIds } = body;

    // Verify user exists and is branch_head
    const [existingUser] = await db
      .select()
      .from(adminUsers)
      .where(and(eq(adminUsers.id, userId), eq(adminUsers.role, "branch_head")));

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user details
    const updateData: { username?: string; password?: string } = {};
    if (username) updateData.username = username;
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: "Password must be at least 6 characters" },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(adminUsers)
        .set(updateData)
        .where(eq(adminUsers.id, userId));
    }

    // Update city assignments if provided
    if (cityIds !== undefined && Array.isArray(cityIds)) {
      // Remove all existing assignments
      await db
        .delete(branchAssignments)
        .where(eq(branchAssignments.userId, userId));

      // Add new assignments
      if (cityIds.length > 0) {
        await db.insert(branchAssignments).values(
          cityIds.map((cityId: number) => ({
            userId,
            cityId,
          }))
        );
      }
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: unknown) {
    console.error("Error updating branch user:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json(
        { error: "A user with this username already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update branch user" },
      { status: 500 }
    );
  }
}

// DELETE - Delete branch head user
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
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Delete city assignments first
    await db
      .delete(branchAssignments)
      .where(eq(branchAssignments.userId, userId));

    // Delete user
    const [deletedUser] = await db
      .delete(adminUsers)
      .where(and(eq(adminUsers.id, userId), eq(adminUsers.role, "branch_head")))
      .returning();

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting branch user:", error);
    return NextResponse.json(
      { error: "Failed to delete branch user" },
      { status: 500 }
    );
  }
}
