import { NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized admin access" }, { status: 403 });
    }

    await bookingStore.syncFromNeon();
    const allBookings = bookingStore.getAllBookings();
    const blockedDates = bookingStore.getBlockedDates();

    // Calculate revenue & occupancy metrics
    let totalRevenueMinor = 0;
    let confirmedBookingsCount = 0;
    let totalNightsBooked = 0;

    for (const b of allBookings) {
      if (b.bookingStatus === "CONFIRMED" || b.bookingStatus === "CHECKED_IN" || b.bookingStatus === "CHECKED_OUT") {
        totalRevenueMinor += b.totalAmountMinor;
        confirmedBookingsCount++;
        totalNightsBooked += b.nights;
      }
    }

    return NextResponse.json({
      bookings: allBookings,
      blockedDates,
      metrics: {
        totalRevenueMinor,
        confirmedBookingsCount,
        totalNightsBooked,
        totalBookingsRecorded: allBookings.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to fetch admin bookings" },
      { status: 500 }
    );
  }
}
