import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetMembers, cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, desc, inArray, and, or, ilike } from "drizzle-orm";

// GET - Fetch all members (branch/admin only, filtered by city for branch heads)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["syndicate", "branch_head"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const cityId = searchParams.get("cityId");
    const search = searchParams.get("search");

    // Build query conditions
    let conditions = [];

    // Filter by status if provided
    if (status && ["active", "suspended", "expired"].includes(status)) {
      conditions.push(eq(vetMembers.status, status as "active" | "suspended" | "expired"));
    }

    // Filter by city
    if (session.user.role === "branch_head") {
      const assignedCityIds = session.user.assignedCityIds || [];
      if (assignedCityIds.length === 0) {
        return NextResponse.json([]); // No cities assigned
      }
      conditions.push(inArray(vetMembers.cityId, assignedCityIds));
    } else if (cityId) {
      conditions.push(eq(vetMembers.cityId, parseInt(cityId)));
    }

    // Search by name or member ID
    if (search) {
      conditions.push(
        or(
          ilike(vetMembers.fullNameEn, `%${search}%`),
          ilike(vetMembers.fullNameKu, `%${search}%`),
          ilike(vetMembers.memberId, `%${search}%`)
        )
      );
    }

    // Execute query
    const members = await db
      .select()
      .from(vetMembers)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(vetMembers.issueDate));

    // Get city info for each member
    const allCities = await db.select().from(cities);
    const citiesMap = new Map(allCities.map((c) => [c.id, c]));

    const membersWithCity = members.map((member) => ({
      ...member,
      city: citiesMap.get(member.cityId) || null,
    }));

    return NextResponse.json(membersWithCity);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
