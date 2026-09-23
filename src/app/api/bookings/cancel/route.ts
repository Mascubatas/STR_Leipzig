import { NextRequest, NextResponse } from "next/server";
import { bookingStore } from "@/lib/booking-store";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { reference, reason, guestEmail } = body;

    if (!reference) {
      return NextResponse.json({ error: "Booking reference is required." }, { status: 400 });
    }

    const session = await getSession();
    const booking = bookingStore.getBookingByReference(reference);

    if (!booking) {
      return NextResponse.json({ error: "Booking not found." }, { status: 404 });
    }

    // Security check: must be owner of booking or admin
    const emailToVerify = session?.email || guestEmail;
    if (!emailToVerify || (booking.guestEmail.toLowerCase() !== emailToVerify.toLowerCase() && session?.role !== "ADMIN")) {
      return NextResponse.json(
        { error: "Unauthorized. You cannot cancel another guest's reservation." },
        { status: 403 }
      );
    }

    const result = bookingStore.cancelBooking(
      reference,
      reason || "Cancelled by guest",
      emailToVerify
    );

    return NextResponse.json({
      success: true,
      booking: result.booking,
      refundAmountMinor: result.refundAmountMinor,
      policyMessage: result.policyMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message || "Cancellation failed" },
      { status: 400 }
    );
  }
}
