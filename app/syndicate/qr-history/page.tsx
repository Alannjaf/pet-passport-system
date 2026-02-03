import { db } from "@/lib/db";
import { qrCodeBatches, qrCodes } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import QRHistoryTable from "@/components/syndicate/QRHistoryTable";

export default async function QRHistoryPage() {
  // Fetch all batches with counts of used/unused QR codes
  const batches = await db
    .select()
    .from(qrCodeBatches)
    .orderBy(desc(qrCodeBatches.generatedAt));

  // Fetch all QR codes to calculate used/unused
  const allQRCodes = await db.select().from(qrCodes);

  // Add usage stats to each batch
  const batchesWithStats = batches.map((batch) => {
    const batchCodes = allQRCodes.filter((code) => code.batchId === batch.id);
    const used = batchCodes.filter((code) => code.status === "filled").length;
    const unused = batchCodes.filter(
      (code) => code.status === "generated"
    ).length;

    return {
      ...batch,
      used,
      unused,
    };
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">QR Code History</h1>
        <p className="text-gray-600 mt-2">
          View and download previously generated QR code batches
        </p>
      </div>

      <QRHistoryTable batches={batchesWithStats} />
    </div>
  );
}
