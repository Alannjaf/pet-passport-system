import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vetMembers, cities } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import QRCode from "qrcode";

// GET - Return member data for ID card generation
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

    // Get member
    const [member] = await db
      .select()
      .from(vetMembers)
      .where(eq(vetMembers.id, memberId));

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Get city
    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, member.cityId));

    // Generate QR code as data URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const verifyUrl = `${baseUrl}/verify/${member.qrCodeId}`;
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 200,
      margin: 1,
      errorCorrectionLevel: "M",
    });

    // Return JSON data for client-side rendering
    return NextResponse.json({
      id: member.id,
      memberId: member.memberId,
      fullNameKu: member.fullNameKu,
      fullNameEn: member.fullNameEn,
      titleKu: member.titleKu,
      titleEn: member.titleEn,
      dateOfBirth: member.dateOfBirth,
      photoBase64: member.photoBase64,
      qrCodeId: member.qrCodeId,
      issueDate: member.issueDate,
      expiryDate: member.expiryDate,
      cityCode: city?.code || null,
      qrDataUrl: qrDataUrl,
    });
  } catch (error) {
    console.error("Error fetching member data:", error);
    return NextResponse.json(
      { error: "Failed to fetch member data" },
      { status: 500 }
    );
  }
}
