import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { checkInDate, checkOutDate, numberOfGuests, promoCode } = body;

    if (!checkInDate || !checkOutDate) {
      return NextResponse.json(
        { error: "checkInDate and checkOutDate are required." },
        { status: 400 }
      );
    }

    const { hold, priceBreakdown } = bookingStore.createHold({
      checkInDate,
      checkOutDate,
      numberOfGuests: numberOfGuests || 1,
      promoCode,
    });

    return NextResponse.json({
      success: true,
      holdToken: hold.holdToken,
      expiresAt: hold.expiresAt,
      checkInDate: hold.checkInDate,
      checkOutDate: hold.checkOutDate,
      priceBreakdown,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Could not reserve dates" },
      { status: 409 } // Conflict
    );
  }
}
