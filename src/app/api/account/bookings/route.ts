import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const { searchParams } = new URL(req.url);
    const emailParam = searchParams.get("email");

    // Allow authenticated user or specific email query
    const targetEmail = session?.email || emailParam;
    if (!targetEmail) {
      return NextResponse.json({ error: "Authentication or email required" }, { status: 401 });
    }

    // Ensure we have latest data synced from Neon
    await bookingStore.syncFromNeon();

    const bookings = bookingStore.getBookingsByEmail(targetEmail);

    return NextResponse.json({
      success: true,
      email: targetEmail,
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
