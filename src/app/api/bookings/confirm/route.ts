import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      holdToken,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests,
      promoCode,
      specialRequests,
      paymentId,
    } = body;

    if (!holdToken) {
      return NextResponse.json(
        { error: "Booking hold token is required." },
        { status: 400 }
      );
    }

    if (!guestName || !guestEmail || !guestPhone) {
      return NextResponse.json(
        { error: "Guest name, email, and phone number are required." },
        { status: 400 }
      );
    }

    const booking = await bookingStore.confirmBooking({
      holdToken,
      guestName,
      guestEmail,
      guestPhone,
      numberOfGuests: Number(numberOfGuests) || 1,
      promoCode,
      specialRequests,
      paymentId,
    });

    return NextResponse.json({
      success: true,
      bookingReference: booking.bookingReference,
      booking,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Booking confirmation failed" },
      { status: 400 }
    );
  }
}
