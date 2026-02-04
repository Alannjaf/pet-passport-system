import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cities } from "@/lib/db/schema";
import { auth } from "@/lib/auth/auth";
import { asc, eq } from "drizzle-orm";

// GET - Fetch all cities (public for application form, shows all for admin)
export async function GET() {
  try {
    const session = await auth();

    // If admin, show all cities; otherwise only active ones
    const isAdmin = session?.user?.role === "syndicate";

    const filteredCities = isAdmin
      ? await db.select().from(cities).orderBy(asc(cities.nameEn))
      : await db.select().from(cities).where(eq(cities.isActive, true)).orderBy(asc(cities.nameEn));

    return NextResponse.json(filteredCities);
  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities" },
      { status: 500 }
    );
  }
}

// POST - Create new city (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "syndicate") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { nameEn, nameKu, code, isActive = true } = body;

    if (!nameEn || !nameKu || !code) {
      return NextResponse.json(
        { error: "Name (English), Name (Kurdish), and code are required" },
        { status: 400 }
      );
    }

    // Validate code format (uppercase letters only, 2-5 chars)
    const codeRegex = /^[A-Z]{2,5}$/;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: "Code must be 2-5 uppercase letters" },
        { status: 400 }
      );
    }

    const [newCity] = await db
      .insert(cities)
      .values({
        nameEn,
        nameKu,
        code: code.toUpperCase(),
        isActive,
      })
      .returning();

    return NextResponse.json(newCity, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating city:", error);
    
    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === "23505") {
      return NextResponse.json(
        { error: "A city with this code already exists" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create city" },
      { status: 500 }
    );
  }
}
