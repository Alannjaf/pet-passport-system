import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { renewalRequests, vetMembers, cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, desc, inArray, and } from "drizzle-orm";

// GET - Fetch renewal requests (branch/admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || !["syndicate", "branch_head"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const assignedCityIds = session.user.assignedCityIds || [];
    const isAdmin = session.user.role === "syndicate";

    // Get member IDs for assigned cities
    let memberIds: number[] = [];
    if (!isAdmin && assignedCityIds.length > 0) {
      const members = await db
        .select({ id: vetMembers.id })
        .from(vetMembers)
        .where(inArray(vetMembers.cityId, assignedCityIds));
      memberIds = members.map((m) => m.id);

      if (memberIds.length === 0) {
        return NextResponse.json([]);
      }
    }

    // Build query conditions
    let conditions = [];
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      conditions.push(eq(renewalRequests.status, status as "pending" | "approved" | "rejected"));
    }
    if (!isAdmin && memberIds.length > 0) {
      conditions.push(inArray(renewalRequests.memberId, memberIds));
    }

    // Fetch renewal requests
    const requests = await db
      .select()
      .from(renewalRequests)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(renewalRequests.requestedAt));

    // Get member info for each request
    const allMembers = await db.select().from(vetMembers);
    const membersMap = new Map(allMembers.map((m) => [m.id, m]));

    // Get cities
    const allCities = await db.select().from(cities);
    const citiesMap = new Map(allCities.map((c) => [c.id, c]));

    const requestsWithMember = requests.map((req) => {
      const member = membersMap.get(req.memberId);
      return {
        ...req,
        member: member
          ? {
              ...member,
              city: citiesMap.get(member.cityId) || null,
            }
          : null,
      };
    });

    return NextResponse.json(requestsWithMember);
  } catch (error) {
    console.error("Error fetching renewal requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch renewal requests" },
      { status: 500 }
    );
  }
}

// POST - Create renewal request (public, for members via their status page)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId } = body;

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Verify member exists
    const [member] = await db
      .select()
      .from(vetMembers)
      .where(eq(vetMembers.id, memberId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Check if there's already a pending request
    const [existingRequest] = await db
      .select()
      .from(renewalRequests)
      .where(
        and(
          eq(renewalRequests.memberId, memberId),
          eq(renewalRequests.status, "pending")
        )
      );

    if (existingRequest) {
      return NextResponse.json(
        { error: "A renewal request is already pending" },
        { status: 400 }
      );
    }

    // Create renewal request
    const [newRequest] = await db
      .insert(renewalRequests)
      .values({
        memberId,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      {
        message: "Renewal request submitted successfully",
        id: newRequest.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating renewal request:", error);
    return NextResponse.json(
      { error: "Failed to create renewal request" },
      { status: 500 }
    );
  }
}
