import { NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";

export async function GET() {
  try {
    bookingStore.releaseExpiredHolds();
    const property = bookingStore.getProperty();
    const allBookings = bookingStore.getAllBookings();
    const blockedDates = bookingStore.getBlockedDates();

    // Map confirmed / checked-in dates
    const confirmedRanges = allBookings
      .filter((b) => b.bookingStatus === "CONFIRMED" || b.bookingStatus === "CHECKED_IN")
      .map((b) => ({
        checkIn: b.checkInDate,
        checkOut: b.checkOutDate,
        nights: b.nights,
      }));

    const blockedRanges = blockedDates.map((b) => ({
      id: b.id,
      startDate: b.startDate,
      endDate: b.endDate,
      reason: b.reason,
    }));

    return NextResponse.json({
      property: {
        id: property.id,
        name: property.name,
        slug: property.slug,
        basePriceMinor: property.basePriceMinor,
        cleaningFeeMinor: property.cleaningFeeMinor,
        weekendSurchargeMinor: property.weekendSurchargeMinor,
        touristTaxRatePercent: property.touristTaxRatePercent,
        minStayNights: property.minStayNights,
        leadTimeHours: property.leadTimeHours,
        maxGuests: property.maxGuests,
        bedrooms: property.bedrooms,
        beds: property.beds,
        bathrooms: property.bathrooms,
        checkInTime: property.checkInTime,
        checkOutTime: property.checkOutTime,
      },
      confirmedRanges,
      blockedRanges,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to load availability" },
      { status: 500 }
    );
  }
}
