import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { calculateBookingPrice } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkInDate, checkOutDate, promoCode } = body;

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "Both checkInDate and checkOutDate are required" },
        { status: 400 }
      );
    }

    const prop = bookingStore.getProperty();

    // Verify minimum stay
    const breakdown = calculateBookingPrice({
      basePriceMinor: prop.basePriceMinor,
      cleaningFeeMinor: prop.cleaningFeeMinor,
      weekendSurchargeMinor: prop.weekendSurchargeMinor,
      touristTaxRatePercent: prop.touristTaxRatePercent,
      checkInDate,
      checkOutDate,
      promoCode,
    });

    if (breakdown.nightsCount < prop.minStayNights) {
      return NextResponse.json(
        { error: `Minimum stay requirement is ${prop.minStayNights} nights.` },
        { status: 400 }
      );
    }

    // Check conflict
    const conflict = bookingStore.checkDatesConflict(checkInDate, checkOutDate);

    return NextResponse.json({
      breakdown,
      isAvailable: !conflict.hasConflict,
      conflictReason: conflict.reason,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Failed to calculate price" },
      { status: 400 }
    );
  }
}
