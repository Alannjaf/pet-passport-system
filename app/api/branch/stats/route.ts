import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetApplications, vetMembers, renewalRequests } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq, and, inArray, count, gte, lte, sql } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !["syndicate", "branch_head"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const assignedCityIds = session.user.assignedCityIds || [];
    const isAdmin = session.user.role === "syndicate";

    // Build city filter condition
    const cityFilter = isAdmin
      ? undefined
      : assignedCityIds.length > 0
      ? inArray(vetApplications.cityId, assignedCityIds)
      : sql`1=0`; // No access

    const memberCityFilter = isAdmin
      ? undefined
      : assignedCityIds.length > 0
      ? inArray(vetMembers.cityId, assignedCityIds)
      : sql`1=0`;

    // Count pending applications
    const [pendingApps] = await db
      .select({ count: count() })
      .from(vetApplications)
      .where(
        cityFilter
          ? and(eq(vetApplications.status, "pending"), cityFilter)
          : eq(vetApplications.status, "pending")
      );

    // Count total and active members
    const [totalMembers] = await db
      .select({ count: count() })
      .from(vetMembers)
      .where(memberCityFilter);

    const [activeMembers] = await db
      .select({ count: count() })
      .from(vetMembers)
      .where(
        memberCityFilter
          ? and(eq(vetMembers.status, "active"), memberCityFilter)
          : eq(vetMembers.status, "active")
      );

    // Count members expiring within 30 days
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const now = new Date();

    const [expiringMembers] = await db
      .select({ count: count() })
      .from(vetMembers)
      .where(
        memberCityFilter
          ? and(
              eq(vetMembers.status, "active"),
              gte(vetMembers.expiryDate, now),
              lte(vetMembers.expiryDate, thirtyDaysFromNow),
              memberCityFilter
            )
          : and(
              eq(vetMembers.status, "active"),
              gte(vetMembers.expiryDate, now),
              lte(vetMembers.expiryDate, thirtyDaysFromNow)
            )
      );

    // Count pending renewal requests
    // First get member IDs for the cities
    let pendingRenewalsCount = 0;
    if (isAdmin) {
      const [renewals] = await db
        .select({ count: count() })
        .from(renewalRequests)
        .where(eq(renewalRequests.status, "pending"));
      pendingRenewalsCount = renewals?.count || 0;
    } else if (assignedCityIds.length > 0) {
      const memberIds = await db
        .select({ id: vetMembers.id })
        .from(vetMembers)
        .where(inArray(vetMembers.cityId, assignedCityIds));

      if (memberIds.length > 0) {
        const [renewals] = await db
          .select({ count: count() })
          .from(renewalRequests)
          .where(
            and(
              eq(renewalRequests.status, "pending"),
              inArray(
                renewalRequests.memberId,
                memberIds.map((m) => m.id)
              )
            )
          );
        pendingRenewalsCount = renewals?.count || 0;
      }
    }

    return NextResponse.json({
      pendingApplications: pendingApps?.count || 0,
      totalMembers: totalMembers?.count || 0,
      activeMembers: activeMembers?.count || 0,
      expiringMembers: expiringMembers?.count || 0,
      pendingRenewals: pendingRenewalsCount,
    });
  } catch (error) {
    console.error("Error fetching branch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
