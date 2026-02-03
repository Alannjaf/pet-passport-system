import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { eq } from "drizzle-orm";

// GET - Fetch single city
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
    }

    const [city] = await db
      .select()
      .from(cities)
      .where(eq(cities.id, cityId));

    if (!city) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json(city);
  } catch (error) {
    console.error("Error fetching city:", error);
    return NextResponse.json(
      { error: "Failed to fetch city" },
      { status: 500 }
    );
  }
}

// PUT - Update city (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
    }

    const body = await request.json();
    const { nameEn, nameKu, code, isActive } = body;

    if (!nameEn || !nameKu || !code) {
      return NextResponse.json(
        { error: "Name (English), Name (Kurdish), and code are required" },
        { status: 400 }
      );
    }

    // Validate code format
    const codeRegex = /^[A-Z]{2,5}$/;
    if (!codeRegex.test(code.toUpperCase())) {
      return NextResponse.json(
        { error: "Code must be 2-5 uppercase letters" },
        { status: 400 }
      );
    }

    const [updatedCity] = await db
      .update(cities)
      .set({
        nameEn,
        nameKu,
        code: code.toUpperCase(),
        isActive: isActive ?? true,
      })
      .where(eq(cities.id, cityId))
      .returning();

    if (!updatedCity) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json(updatedCity);
  } catch (error: unknown) {
    console.error("Error updating city:", error);
    
    if (error && typeof error === 'object' && 'code' in error && error.code === "23505") {
      return NextResponse.json(
        { error: "A city with this code already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to update city" },
      { status: 500 }
    );
  }
}

// DELETE - Delete city (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const cityId = parseInt(id);

    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
    }

    const [deletedCity] = await db
      .delete(cities)
      .where(eq(cities.id, cityId))
      .returning();

    if (!deletedCity) {
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "City deleted successfully" });
  } catch (error) {
    console.error("Error deleting city:", error);
    return NextResponse.json(
      { error: "Failed to delete city. It may be in use by applications or members." },
      { status: 500 }
    );
  }
}
