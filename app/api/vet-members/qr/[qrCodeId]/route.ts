import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetMembers, cities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";

// GET - Fetch member by QR code ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCodeId: string }> }
) {
  try {
    const { qrCodeId } = await params;

    if (!qrCodeId) {
      return NextResponse.json({ error: "QR code ID is required" }, { status: 400 });
    }

    // Get member by QR code ID
    const [member] = await db
      .select()
      .from(vetMembers)
      .where(eq(vetMembers.qrCodeId, qrCodeId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // If member is suspended, return minimal info
    if (member.status === "suspended") {
      return NextResponse.json({
        suspended: true,
        message: "This member is suspended",
      });
    }

    // Get city info
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, member.cityId));

    // Check if expired
    const isExpired = new Date(member.expiryDate) < new Date();

    const session = await auth()
    const isAdmin = session && ['syndicate', 'branch_head'].includes(session.user.role)

    // Return public info only
    return NextResponse.json({
      memberId: member.memberId,
      fullNameKu: member.fullNameKu,
      fullNameEn: member.fullNameEn,
      titleEn: member.titleEn,
      titleKu: member.titleKu,
      dateOfBirth: member.dateOfBirth,
      photoBase64: member.photoBase64,
      issueDate: member.issueDate,
      expiryDate: member.expiryDate,
      status: isExpired ? "expired" : member.status,
      city: city ? {
        nameEn: city.nameEn,
        nameKu: city.nameKu,
        code: city.code,
      } : null,
      ...(isAdmin ? { id: member.id } : {}),
    });
  } catch (error) {
    console.error("Error fetching member by QR code:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}
