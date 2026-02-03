import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetMembers, cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, desc, inArray, and, or, ilike, sql, count } from "drizzle-orm";

// GET - Fetch members with pagination (branch/admin only, filtered by city for branch heads)
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25")));
    const offset = (page - 1) * limit;

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
        return NextResponse.json({ data: [], total: 0, page, limit });
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

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count and paginated data in parallel
    const [countResult, results] = await Promise.all([
      db.select({ total: count() }).from(vetMembers).where(whereClause),
      db
        .select({
          member: vetMembers,
          city: cities,
        })
        .from(vetMembers)
        .leftJoin(cities, eq(vetMembers.cityId, cities.id))
        .where(whereClause)
        .orderBy(desc(vetMembers.issueDate))
        .limit(limit)
        .offset(offset),
    ]);

    const total = countResult[0]?.total || 0;
    const membersWithCity = results.map(({ member, city }) => ({
      ...member,
      city: city || null,
    }));

    return NextResponse.json({ data: membersWithCity, total, page, limit });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
