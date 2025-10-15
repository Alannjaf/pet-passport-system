import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { qrCodes, qrCodeBatches } from "@/lib/db/schema";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { quantity } = body;

    if (!quantity || quantity < 1 || quantity > 500) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    // Create batch record
    const batch = await db
      .insert(qrCodeBatches)
      .values({
        quantity,
        generatedBy: session.user.id,
        generatedByName: session.user.name || "Syndicate Admin",
      })
      .returning();

    const batchId = batch[0].id;

    // Generate QR codes
    const codes = [];
    for (let i = 0; i < quantity; i++) {
      const qrCodeId = randomUUID();
      codes.push({
        batchId,
        qrCodeId,
        status: "generated" as const,
        generatedBy: "syndicate",
      });
    }

    // Insert into database
    const inserted = await db.insert(qrCodes).values(codes).returning();

    return NextResponse.json({
      success: true,
      batchId,
      qrCodes: inserted,
    });
  } catch (error) {
    console.error("Error generating QR codes:", error);
    return NextResponse.json(
      { error: "Failed to generate QR codes" },
      { status: 500 }
    );
  }
}
