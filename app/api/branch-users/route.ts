import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { adminUsers, branchAssignments, cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// GET - Fetch all branch head users with their city assignments
export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all branch head users
    const branchHeads = await db
      .select({
        id: adminUsers.id,
        username: adminUsers.username,
        role: adminUsers.role,
        createdAt: adminUsers.createdAt,
      })
      .from(adminUsers)
      .where(eq(adminUsers.role, "branch_head"));

    // Get city assignments for each branch head
    const branchHeadsWithCities = await Promise.all(
      branchHeads.map(async (user) => {
        const assignments = await db
          .select({
            cityId: branchAssignments.cityId,
            cityNameEn: cities.nameEn,
            cityNameKu: cities.nameKu,
            cityCode: cities.code,
          })
          .from(branchAssignments)
          .innerJoin(cities, eq(branchAssignments.cityId, cities.id))
          .where(eq(branchAssignments.userId, user.id));

        return {
          ...user,
          assignedCities: assignments,
        };
      })
    );

    return NextResponse.json(branchHeadsWithCities);
  } catch (error) {
    console.error("Error fetching branch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch users" },
      { status: 500 }
    );
  }
}

// POST - Create new branch head user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { username, password, cityIds } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create branch head user
    const [newUser] = await db
      .insert(adminUsers)
      .values({
        username,
        password: hashedPassword,
        role: "branch_head",
      })
      .returning();

    // Assign cities if provided
    if (cityIds && Array.isArray(cityIds) && cityIds.length > 0) {
      await db.insert(branchAssignments).values(
        cityIds.map((cityId: number) => ({
          userId: newUser.id,
          cityId,
        }))
      );
    }

    // Return user without password
    return NextResponse.json(
      {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        createdAt: newUser.createdAt,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating branch user:", error);

    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json(
        { error: "A user with this username already exists" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create branch user" },
      { status: 500 }
    );
  }
}
