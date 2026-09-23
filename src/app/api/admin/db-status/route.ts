import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { getDatabaseUrl } from "@/db/connection";
import { ensureNeonTables } from "@/db/bootstrap";

export async function GET(req: NextRequest) {
  const url = getDatabaseUrl();
  const searchParams = req.nextUrl.searchParams;
  const shouldBootstrap = searchParams.get("bootstrap") === "true";
  const shouldCreateTestBooking = searchParams.get("test_booking") === "true";

  const detectedEnvVars = {
    DATABASE_URL: Boolean(process.env.DATABASE_URL),
    POSTGRES_URL: Boolean(process.env.POSTGRES_URL),
    POSTGRES_URL_NON_POOLING: Boolean(process.env.POSTGRES_URL_NON_POOLING),
    POSTGRES_PRISMA_URL: Boolean(process.env.POSTGRES_PRISMA_URL),
    NEON_DATABASE_URL: Boolean(process.env.NEON_DATABASE_URL),
  };

  if (!url) {
    return NextResponse.json({
      status: "NO_DATABASE_URL",
      message: "No PostgreSQL connection string found in environment variables.",
      detectedEnvVars,
      recommendation:
        "In Vercel Dashboard -> Settings -> Environment Variables, ensure that either POSTGRES_URL or DATABASE_URL is set for your connected Neon database.",
    });
  }

  // Masked URL for safe display (hides password)
  const maskedUrl = url.replace(/:([^:@]+)@/, ":****@");

  try {
    const sql = neon(url);

    // If requested, run bootstrap
    let bootstrapResult = null;
    if (shouldBootstrap || true) {
      bootstrapResult = await ensureNeonTables(true);
    }

    // Optional test booking insertion to verify write capability
    let testBookingResult = null;
    if (shouldCreateTestBooking) {
      const testRef = `LPG-TEST-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      await sql`
        INSERT INTO bookings (
          id, booking_reference, property_id, guest_name, guest_email, guest_phone,
          check_in_date, check_out_date, nights, number_of_guests, total_amount_minor,
          currency, booking_status, payment_status
        ) VALUES (
          gen_random_uuid(),
          ${testRef},
          '00000000-0000-0000-0000-000000000001'::uuid,
          'Neon Diagnostic Guest',
          'test@leipzigstay.de',
          '+49 341 000000',
          '2026-11-10'::date,
          '2026-11-13'::date,
          3,
          2,
          58500,
          'EUR',
          'CONFIRMED',
          'PAID'
        );
      `;
      testBookingResult = { createdRef: testRef };
    }

    // Query existing tables in Neon
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;

    // Query bookings in Neon
    let bookingsInNeon: unknown[] = [];
    try {
      bookingsInNeon = await sql`
        SELECT booking_reference, guest_name, guest_email, check_in_date, check_out_date, total_amount_minor, booking_status, created_at 
        FROM bookings 
        ORDER BY created_at DESC 
        LIMIT 20;
      `;
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      status: "CONNECTED",
      databaseHost: maskedUrl.split("@")[1]?.split("/")[0] || "connected",
      detectedEnvVars,
      bootstrapResult,
      testBookingResult,
      tablesInDatabase: tables.map((t) => t.table_name),
      bookingsCount: bookingsInNeon.length,
      bookingsInNeon,
    });
  } catch (error) {
    return NextResponse.json({
      status: "CONNECTION_ERROR",
      error: (error as Error).message,
      maskedUrl,
      detectedEnvVars,
    }, { status: 500 });
  }
}
