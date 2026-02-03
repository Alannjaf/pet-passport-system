import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { qrCodes, qrCodeBatches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const batchId = parseInt(id);

    // Fetch batch info
    const batch = await db
      .select()
      .from(qrCodeBatches)
      .where(eq(qrCodeBatches.id, batchId))
      .limit(1);

    if (batch.length === 0) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // Fetch QR codes for this batch
    const codes = await db
      .select()
      .from(qrCodes)
      .where(eq(qrCodes.batchId, batchId));

    return NextResponse.json({
      success: true,
      batch: batch[0],
      qrCodes: codes,
    });
  } catch (error) {
    console.error("Error fetching QR batch:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch" },
      { status: 500 }
    );
  }
}
